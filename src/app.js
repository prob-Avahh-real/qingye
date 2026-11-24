import { fetchPage } from './fetch-page.js';
import { extractArticle } from './extract.js';
import { loadDocs, saveDocs, createDoc, upsertDoc, removeDoc } from './store.js';
import { createWearableInput } from './wearable-input.js';
import { buildBrief, answerQuestion } from './studio/brief.js';
import { playDialogue, stopSpeech, estimateDialogueSeconds } from './studio/tts.js';
import { synthesizePodcast } from './studio/cloud-tts.js';
import { renderVideoOverview, downloadBlob, extForMime } from './studio/video.js';
import {
  loadSettings,
  saveSettings,
  resolveTtsProvider,
  cloudTtsReady,
  OPENAI_VOICES,
  maskSecret,
} from './settings.js';

const $ = (sel, root = document) => root.querySelector(sel);

let docs = [];
let current = null;
let focusIndex = -1;
let busy = false;
let brief = null;
let audioPlaying = false;
let stopAudio = false;
/** @type {{ kind: 'audio'|'video', blob: Blob, mime: string } | null} */
let lastMedia = null;
let settings = loadSettings();

const els = {};

async function haptic(style = 'Light') {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] || ImpactStyle.Light });
  } catch {
    /* browser */
  }
}

function toast(msg) {
  const t = els.toast;
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function persist() {
  docs = saveDocs(docs);
  renderList();
}

function ensureBrief() {
  if (!current) return null;
  if (!brief || brief._docId !== current.id) {
    brief = { ...buildBrief(current), _docId: current.id };
  }
  return brief;
}

function setStudioEnabled(on) {
  for (const btn of [els.btnAudio, els.btnVideo, els.btnBrief, els.btnFaq]) {
    if (btn) btn.disabled = !on;
  }
  els.studioSourceLabel.textContent = on
    ? (current.title || '当前来源').slice(0, 28)
    : '未选来源';
}

function switchTab(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.panel')) {
    panel.classList.toggle('active', panel.id === `panel-${name}`);
  }
}

function bind() {
  els.url = $('#url');
  els.clipBtn = $('#clip-btn');
  els.pasteBtn = $('#paste-btn');
  els.pasteArea = $('#paste-area');
  els.pastePanel = $('#paste-panel');
  els.pasteClip = $('#paste-clip');
  els.quickAudio = $('#quick-audio');
  els.quickVideo = $('#quick-video');
  els.sourceCard = $('#source-card');
  els.previewMeta = $('#preview-meta');
  els.previewBody = $('#preview-body');
  els.saveBtn = $('#save-btn');
  els.shareBtn = $('#share-btn');
  els.copyBtn = $('#copy-btn');
  els.format = $('#format');
  els.list = $('#doc-list');
  els.empty = $('#empty');
  els.count = $('#count');
  els.toast = $('#toast');
  els.wearBtn = $('#wear-btn');
  els.settingsBtn = $('#settings-btn');
  els.settingsPanel = $('#settings-panel');
  els.settingsSave = $('#settings-save');
  els.settingsClose = $('#settings-close');
  els.settingsStatus = $('#settings-status');
  els.setProvider = $('#set-provider');
  els.setOpenai = $('#set-openai');
  els.setEleven = $('#set-eleven');
  els.statsLine = $('#stats-line');
  els.studioSourceLabel = $('#studio-source-label');
  els.btnAudio = $('#btn-audio');
  els.btnVideo = $('#btn-video');
  els.btnBrief = $('#btn-brief');
  els.btnFaq = $('#btn-faq');
  els.studioOut = $('#studio-out');
  els.studioOutTitle = $('#studio-out-title');
  els.studioOutBody = $('#studio-out-body');
  els.studioCloud = $('#studio-cloud');
  els.studioPlay = $('#studio-play');
  els.studioStop = $('#studio-stop');
  els.studioCopy = $('#studio-copy');
  els.studioDownload = $('#studio-download');
  els.audioPreview = $('#audio-preview');
  els.videoPreview = $('#video-preview');
  els.genProgress = $('#gen-progress');
  els.askInput = $('#ask-input');
  els.askBtn = $('#ask-btn');
  els.askAnswer = $('#ask-answer');

  fillVoiceSelects();
  loadSettingsIntoForm();

  els.clipBtn.addEventListener('click', () => clipFromUrl());
  els.pasteBtn.addEventListener('click', () => els.pastePanel.classList.toggle('open'));
  els.pasteClip.addEventListener('click', () => clipFromPaste());
  els.quickAudio.addEventListener('click', () => quickMedia('audio'));
  els.quickVideo.addEventListener('click', () => quickMedia('video'));
  els.saveBtn.addEventListener('click', () => saveCurrent());
  els.copyBtn.addEventListener('click', () => copyCurrent());
  els.shareBtn.addEventListener('click', () => shareCurrent());
  els.format.addEventListener('change', () => renderPreview());
  els.url.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') clipFromUrl();
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  els.settingsBtn.addEventListener('click', () => {
    els.settingsPanel.hidden = !els.settingsPanel.hidden;
    if (!els.settingsPanel.hidden) loadSettingsIntoForm();
  });
  els.settingsClose.addEventListener('click', () => {
    els.settingsPanel.hidden = true;
  });
  els.settingsSave.addEventListener('click', () => saveSettingsFromForm());
  els.setProvider.addEventListener('change', () => toggleProviderFields());

  els.btnAudio.addEventListener('click', () => showAudioOverview());
  els.btnVideo.addEventListener('click', () => generateVideo());
  els.btnBrief.addEventListener('click', () => showBrief());
  els.btnFaq.addEventListener('click', () => showFaq());
  els.studioCloud.addEventListener('click', () => generateCloudPodcast());
  els.studioPlay.addEventListener('click', () => playAudioOverview());
  els.studioStop.addEventListener('click', () => {
    stopAudio = true;
    stopSpeech();
    try {
      els.audioPreview.pause();
    } catch {
      /* */
    }
    audioPlaying = false;
    toast('已停止');
  });
  els.studioCopy.addEventListener('click', () => copyStudioOut());
  els.studioDownload.addEventListener('click', () => {
    if (!lastMedia) return;
    const ext = lastMedia.kind === 'audio' ? 'mp3' : extForMime(lastMedia.mime);
    const name = `${(current?.title || 'qingye').slice(0, 40)}-${lastMedia.kind}.${ext}`;
    downloadBlob(lastMedia.blob, name.replace(/[\\/:*?"<>|]/g, '_'));
    toast('已开始下载');
  });

  els.askBtn.addEventListener('click', () => doAsk());
  els.askInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doAsk();
  });

  els.wearBtn.addEventListener('click', async () => {
    const ok = await wear.requestPermission();
    if (ok === false) {
      toast('传感器权限未授予');
      return;
    }
    wear.start();
    els.wearBtn.classList.add('on');
    toast('穿戴手势已开启');
  });
}

async function ensureSourceFromUrl() {
  if (current?.text) return true;
  const url = els.url.value.trim();
  if (!url) {
    toast('先粘贴网址或选择来源');
    return false;
  }
  await clipFromUrl();
  return Boolean(current?.text);
}

async function quickMedia(kind) {
  const ok = await ensureSourceFromUrl();
  if (!ok) return;
  if (!docs.find((d) => d.id === current.id)) {
    docs = upsertDoc(docs, current);
    persist();
  }
  switchTab('studio');
  if (kind === 'audio') await showAudioOverview(true);
  else await generateVideo();
}

async function clipFromUrl() {
  if (busy) return;
  const url = els.url.value.trim();
  if (!url) {
    toast('先粘贴网址');
    els.url.focus();
    return;
  }
  busy = true;
  els.clipBtn.disabled = true;
  els.clipBtn.textContent = '清洗中…';
  try {
    const { url: finalUrl, html, via } = await fetchPage(url);
    const article = extractArticle(html, { url: finalUrl });
    current = createDoc({
      title: article.title,
      url: article.url,
      byline: article.byline,
      markdown: article.markdown,
      text: article.text,
      html: article.html,
      stats: { ...article.stats, via },
    });
    brief = null;
    lastMedia = null;
    renderPreview();
    setStudioEnabled(true);
    await haptic('Medium');
    const s = article.stats;
    toast(`已净：去图 ${s.imagesRemoved} · 去噪 ${s.nodesRemoved + s.junkLines}`);
  } catch (e) {
    toast(e.message || '转存失败');
  } finally {
    busy = false;
    els.clipBtn.disabled = false;
    els.clipBtn.textContent = '添加来源';
  }
}

function clipFromPaste() {
  const html = els.pasteArea.value.trim();
  if (!html) {
    toast('粘贴网页 HTML 或正文');
    return;
  }
  const wrapped = /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html)
    ? html
    : `<!DOCTYPE html><html><body>${html}</body></html>`;
  const article = extractArticle(wrapped, { url: els.url.value.trim() || '' });
  current = createDoc({
    title: article.title || '粘贴文档',
    url: article.url,
    byline: article.byline,
    markdown: article.markdown,
    text: article.text,
    html: article.html,
    stats: article.stats,
  });
  brief = null;
  lastMedia = null;
  els.pastePanel.classList.remove('open');
  renderPreview();
  setStudioEnabled(true);
  haptic('Medium');
  toast('已从粘贴内容清洗');
}

function contentForFormat() {
  if (!current) return '';
  const fmt = els.format.value;
  if (fmt === 'text') return current.text;
  if (fmt === 'html') {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${escapeHtml(current.title)}</title></head>
<body>
<article>
<h1>${escapeHtml(current.title)}</h1>
${current.byline ? `<p>${escapeHtml(current.byline)}</p>` : ''}
${current.html}
</article>
</body>
</html>`;
  }
  return current.markdown;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPreview() {
  if (!current) {
    els.sourceCard.classList.add('hidden');
    setStudioEnabled(false);
    return;
  }
  els.sourceCard.classList.remove('hidden');
  els.previewMeta.textContent = [
    current.title,
    current.byline,
    current.url ? shortUrl(current.url) : '',
  ].filter(Boolean).join(' · ');

  const body = contentForFormat();
  els.previewBody.textContent = body.slice(0, 12000) + (body.length > 12000 ? '\n\n…' : '');

  const s = current.stats || {};
  els.statsLine.textContent = [
    s.imagesRemoved != null ? `无效图 ${s.imagesRemoved}` : '',
    s.nodesRemoved != null ? `无效块 ${s.nodesRemoved}` : '',
    s.junkLines != null ? `无效行 ${s.junkLines}` : '',
    s.via ? `via ${s.via}` : '',
  ].filter(Boolean).join(' · ');

  setStudioEnabled(true);
}

function shortUrl(u) {
  try {
    const x = new URL(u);
    return x.hostname + (x.pathname.length > 24 ? `${x.pathname.slice(0, 24)}…` : x.pathname);
  } catch {
    return u.slice(0, 40);
  }
}

function saveCurrent() {
  if (!current) {
    toast('先添加来源');
    return;
  }
  docs = upsertDoc(docs, current);
  persist();
  haptic('Light');
  toast('已收入来源库');
  focusIndex = 0;
  highlightFocus();
}

async function copyCurrent() {
  if (!current) return;
  try {
    await navigator.clipboard.writeText(contentForFormat());
    toast('已复制');
    await haptic('Light');
  } catch {
    toast('复制失败');
  }
}

async function shareCurrent() {
  if (!current) return;
  const text = contentForFormat();
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title: current.title, text, dialogTitle: '分享净文档' });
  } catch {
    try {
      if (navigator.share) await navigator.share({ title: current.title, text });
      else await copyCurrent();
    } catch {
      /* cancelled */
    }
  }
}

function showStudioShell(title, { play = false, download = false, cloud = false } = {}) {
  els.studioOut.hidden = false;
  els.studioOutTitle.textContent = title;
  els.studioPlay.hidden = !play;
  els.studioStop.hidden = !play;
  els.studioCloud.hidden = !cloud;
  els.studioDownload.hidden = !download;
  if (!download || lastMedia?.kind !== 'video') {
    els.videoPreview.removeAttribute('src');
    els.videoPreview.load?.();
  }
  if (!download || lastMedia?.kind !== 'audio') {
    els.audioPreview.removeAttribute('src');
    els.audioPreview.style.display = 'none';
  }
}

function fillVoiceSelects() {
  for (const sel of [$('#set-openai-voice-a'), $('#set-openai-voice-b')]) {
    if (!sel) continue;
    sel.innerHTML = OPENAI_VOICES.map((v) => `<option value="${v}">${v}</option>`).join('');
  }
}

function toggleProviderFields() {
  const p = els.setProvider.value;
  els.setOpenai.hidden = p !== 'openai';
  els.setEleven.hidden = p !== 'elevenlabs';
}

function loadSettingsIntoForm() {
  settings = loadSettings();
  els.setProvider.value = settings.ttsProvider || 'device';
  $('#set-openai-key').value = settings.openaiApiKey || '';
  $('#set-openai-base').value = settings.openaiBaseUrl || '';
  $('#set-openai-model').value = settings.openaiModel || 'tts-1-hd';
  $('#set-openai-voice-a').value = settings.openaiVoiceA || 'nova';
  $('#set-openai-voice-b').value = settings.openaiVoiceB || 'onyx';
  $('#set-eleven-key').value = settings.elevenApiKey || '';
  $('#set-eleven-base').value = settings.elevenBaseUrl || '';
  $('#set-eleven-model').value = settings.elevenModel || 'eleven_multilingual_v2';
  $('#set-eleven-voice-a').value = settings.elevenVoiceA || '';
  $('#set-eleven-voice-b').value = settings.elevenVoiceB || '';
  toggleProviderFields();
  updateSettingsStatus();
}

function saveSettingsFromForm() {
  settings = saveSettings({
    ttsProvider: els.setProvider.value,
    openaiApiKey: $('#set-openai-key').value.trim(),
    openaiBaseUrl: $('#set-openai-base').value.trim() || 'https://api.openai.com/v1',
    openaiModel: $('#set-openai-model').value,
    openaiVoiceA: $('#set-openai-voice-a').value,
    openaiVoiceB: $('#set-openai-voice-b').value,
    elevenApiKey: $('#set-eleven-key').value.trim(),
    elevenBaseUrl: $('#set-eleven-base').value.trim() || 'https://api.elevenlabs.io/v1',
    elevenModel: $('#set-eleven-model').value,
    elevenVoiceA: $('#set-eleven-voice-a').value.trim(),
    elevenVoiceB: $('#set-eleven-voice-b').value.trim(),
  });
  updateSettingsStatus();
  toast('TTS 设置已保存');
  haptic('Light');
}

function updateSettingsStatus() {
  const p = resolveTtsProvider(settings);
  if (p === 'openai') {
    els.settingsStatus.textContent = `OpenAI · ${maskSecret(settings.openaiApiKey)} · ${settings.openaiModel}`;
  } else if (p === 'elevenlabs') {
    els.settingsStatus.textContent = `ElevenLabs · ${maskSecret(settings.elevenApiKey)}`;
  } else if (settings.ttsProvider !== 'device' && !cloudTtsReady(settings)) {
    els.settingsStatus.textContent = '已选云端但缺少 API Key';
  } else {
    els.settingsStatus.textContent = '当前：设备朗读';
  }
  els.settingsBtn.textContent = p === 'device' ? 'TTS 设置' : `TTS · ${p === 'openai' ? 'OpenAI' : '11Labs'}`;
}

function showBrief() {
  const b = ensureBrief();
  if (!b) return;
  showStudioShell('简报');
  const md = [`${b.summary}`, '', '要点：', ...b.bullets.map((x, i) => `${i + 1}. ${x}`)].join('\n');
  els.studioOutBody.textContent = md;
  els.studioOutBody.dataset.copy = md;
  switchTab('studio');
  haptic('Light');
}

function showFaq() {
  const b = ensureBrief();
  if (!b) return;
  showStudioShell('常见问题');
  const md = b.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
  els.studioOutBody.textContent = md;
  els.studioOutBody.dataset.copy = md;
  switchTab('studio');
  haptic('Light');
}

async function showAudioOverview(autoPlay = false) {
  const b = ensureBrief();
  if (!b) return;
  settings = loadSettings();
  const provider = resolveTtsProvider(settings);
  const cloud = provider !== 'device';
  showStudioShell('音频概览', { play: true, cloud: true, download: Boolean(lastMedia?.kind === 'audio') });
  const sec = estimateDialogueSeconds(b.dialogue);
  els.studioOutBody.innerHTML = '';
  const transcript = b.dialogue.map((l) => `${l.speaker === 'A' ? '主持A' : '主持B'}：${l.text}`).join('\n\n');
  els.studioOutBody.dataset.copy = transcript;

  b.dialogue.forEach((line, i) => {
    const div = document.createElement('div');
    div.className = 'dialogue-line';
    div.dataset.i = String(i);
    div.innerHTML = `<div class="who">${line.speaker === 'A' ? 'HOST A' : 'HOST B'}</div><div class="say"></div>`;
    div.querySelector('.say').textContent = line.text;
    els.studioOutBody.appendChild(div);
  });

  const note = document.createElement('p');
  note.style.cssText = 'margin-top:12px;font-size:0.72rem;color:var(--ink-soft);font-family:var(--font-ui)';
  note.id = 'audio-mode-note';
  note.textContent = cloud
    ? `约 ${sec} 秒脚本 · 已配置 ${provider === 'openai' ? 'OpenAI tts-1-hd' : 'ElevenLabs'}，点「生成云端播客」合成可下载 MP3`
    : `约 ${sec} 秒 · 当前为设备朗读。打开「TTS 设置」可切换 OpenAI / ElevenLabs 高音质`;
  els.studioOutBody.appendChild(note);

  switchTab('studio');
  await haptic('Medium');
  toast(cloud ? '脚本已就绪，可生成云端播客' : '音频概览已生成');
  if (autoPlay) {
    if (cloud) await generateCloudPodcast();
    else playAudioOverview();
  }
}

async function generateCloudPodcast() {
  const b = ensureBrief();
  if (!b || busy) return;
  settings = loadSettings();
  if (resolveTtsProvider(settings) === 'device') {
    els.settingsPanel.hidden = false;
    loadSettingsIntoForm();
    toast('请先配置云端 TTS API Key');
    return;
  }

  busy = true;
  stopAudio = false;
  els.studioCloud.disabled = true;
  els.genProgress.classList.add('show');
  const bar = els.genProgress.querySelector('i');
  const note = $('#audio-mode-note');
  if (note) note.textContent = '正在调用云端 TTS 合成双人播客…';

  try {
    const { blob, mime } = await synthesizePodcast(b.dialogue, {
      settings,
      shouldStop: () => stopAudio,
      onProgress: (r, label) => {
        bar.style.width = `${Math.round(r * 100)}%`;
        if (note) note.textContent = `${label} · ${Math.round(r * 100)}%`;
      },
    });
    lastMedia = { kind: 'audio', blob, mime };
    const url = URL.createObjectURL(blob);
    els.audioPreview.src = url;
    els.audioPreview.style.display = 'block';
    els.studioDownload.hidden = false;
    if (note) {
      note.textContent = `云端播客已合成（${(blob.size / 1024).toFixed(0)} KB MP3）· 可播放或下载`;
    }
    toast('云端播客已就绪');
    await haptic('Medium');
    await els.audioPreview.play().catch(() => {});
  } catch (e) {
    if (e.name !== 'AbortError') toast(e.message || '云端合成失败');
  } finally {
    busy = false;
    els.studioCloud.disabled = false;
    els.genProgress.classList.remove('show');
    bar.style.width = '0%';
  }
}

async function playAudioOverview() {
  const b = ensureBrief();
  if (!b || audioPlaying) return;
  audioPlaying = true;
  stopAudio = false;

  try {
    if (lastMedia?.kind === 'audio') {
      toast('播放云端播客…');
      els.audioPreview.style.display = 'block';
      if (!els.audioPreview.src) {
        els.audioPreview.src = URL.createObjectURL(lastMedia.blob);
      }
      await new Promise((resolve, reject) => {
        const a = els.audioPreview;
        const onEnd = () => { cleanup(); resolve(); };
        const onErr = () => { cleanup(); reject(new Error('音频播放失败')); };
        const watch = setInterval(() => {
          if (stopAudio) {
            a.pause();
            cleanup();
            resolve();
          }
        }, 200);
        const cleanup = () => {
          clearInterval(watch);
          a.removeEventListener('ended', onEnd);
          a.removeEventListener('error', onErr);
        };
        a.addEventListener('ended', onEnd);
        a.addEventListener('error', onErr);
        a.currentTime = 0;
        a.play().catch((e) => { cleanup(); reject(e); });
      });
    } else {
      toast('设备朗读中…（可在设置切换云端高音质）');
      await playDialogue(b.dialogue, {
        shouldStop: () => stopAudio,
        onLine: (i) => {
          els.studioOutBody.querySelectorAll('.dialogue-line').forEach((el) => {
            el.classList.toggle('active', el.dataset.i === String(i));
          });
        },
      });
    }
    if (!stopAudio) toast('播放完毕');
  } catch (e) {
    toast(e.message || '播放失败');
  } finally {
    audioPlaying = false;
  }
}

async function generateVideo() {
  const b = ensureBrief();
  if (!b || busy) return;
  busy = true;
  showStudioShell('视频概览', { download: true });
  els.studioOutBody.textContent = '正在渲染幻灯片视频…';
  els.studioOutBody.dataset.copy = b.slides.map((s) => `${s.title}\n${s.body}`).join('\n\n');
  els.genProgress.classList.add('show');
  const bar = els.genProgress.querySelector('i');
  switchTab('studio');

  try {
    const { blob, mime } = await renderVideoOverview({
      slides: b.slides,
      title: current.title,
      secondsPerSlide: 3.0,
      onProgress: (r, label) => {
        bar.style.width = `${Math.round(r * 100)}%`;
        els.studioOutBody.textContent = `渲染中 ${Math.round(r * 100)}% · ${label}`;
      },
    });
    lastMedia = { kind: 'video', blob, mime };
    const url = URL.createObjectURL(blob);
    els.videoPreview.src = url;
    els.videoPreview.style.display = 'block';
    els.studioOutBody.textContent = `视频已生成（${(blob.size / 1024).toFixed(0)} KB）。可预览或下载分享。`;
    els.studioDownload.hidden = false;
    toast('视频概览已就绪');
    await haptic('Medium');
  } catch (e) {
    if (e.name !== 'AbortError') toast(e.message || '视频生成失败');
  } finally {
    busy = false;
    els.genProgress.classList.remove('show');
    bar.style.width = '0%';
  }
}

async function copyStudioOut() {
  const text = els.studioOutBody.dataset.copy || els.studioOutBody.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制 Studio 输出');
  } catch {
    toast('复制失败');
  }
}

function doAsk() {
  if (!current) {
    toast('先添加或选择来源');
    return;
  }
  const q = els.askInput.value.trim();
  const a = answerQuestion(q, current);
  els.askAnswer.textContent = a;
}

function renderList() {
  els.count.textContent = String(docs.length);
  els.list.innerHTML = '';
  if (!docs.length) {
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;
  docs.forEach((d, i) => {
    const li = document.createElement('li');
    li.className = 'doc-item';
    li.innerHTML = `
      <button type="button" class="doc-open">
        <span class="doc-title"></span>
        <span class="doc-sub"></span>
      </button>
      <button type="button" class="doc-del" aria-label="删除">×</button>
    `;
    li.querySelector('.doc-title').textContent = d.title || '未命名';
    li.querySelector('.doc-sub').textContent = [
      d.url ? shortUrl(d.url) : '本地粘贴',
      new Date(d.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    ].join(' · ');
    li.querySelector('.doc-open').addEventListener('click', () => {
      current = d;
      brief = null;
      lastMedia = null;
      if (d.url) els.url.value = d.url;
      focusIndex = i;
      renderPreview();
      highlightFocus();
      switchTab('sources');
    });
    li.querySelector('.doc-del').addEventListener('click', (e) => {
      e.stopPropagation();
      docs = removeDoc(docs, d.id);
      if (current?.id === d.id) {
        current = null;
        brief = null;
        renderPreview();
      }
      persist();
      toast('已删除');
    });
    els.list.appendChild(li);
  });
  highlightFocus();
}

function highlightFocus() {
  [...els.list.children].forEach((li, i) => {
    li.classList.toggle('focus', i === focusIndex);
  });
}

function moveFocus(delta) {
  if (!docs.length) return;
  focusIndex = (focusIndex + delta + docs.length) % docs.length;
  highlightFocus();
  const d = docs[focusIndex];
  if (d) {
    current = d;
    brief = null;
    if (d.url) els.url.value = d.url;
    renderPreview();
  }
}

const wear = createWearableInput({
  onRingShake: () => quickMedia('audio'),
  onCaneTap: () => quickMedia('video'),
  onRingTiltUp: () => moveFocus(-1),
  onRingTiltDown: () => moveFocus(1),
  onCaneSwingLeft: () => moveFocus(-1),
  onCaneSwingRight: () => moveFocus(1),
});

function init() {
  bind();
  docs = loadDocs();
  renderList();
  renderPreview();
  requestAnimationFrame(() => document.body.classList.add('ready'));

  try {
    const q = new URLSearchParams(location.search).get('url');
    if (q) {
      els.url.value = q;
      clipFromUrl();
    }
  } catch {
    /* ignore */
  }
}

init();
