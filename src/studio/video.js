/**
 * Generate a NotebookLM-style Video Overview (canvas slides + captions).
 * Exports WebM/MP4 via MediaRecorder. Captions carry the narration so the
 * file is useful without mic-capture of speechSynthesis.
 */

/**
 * @param {{
 *   slides: { title: string, body: string }[],
 *   title?: string,
 *   onProgress?: (ratio: number, label: string) => void,
 *   secondsPerSlide?: number,
 *   signal?: AbortSignal,
 * }} opts
 * @returns {Promise<{ blob: Blob, mime: string }>}
 */
export async function renderVideoOverview(opts) {
  const slides = opts.slides?.length
    ? opts.slides
    : [{ title: '清页', body: opts.title || '空来源' }];
  const sec = opts.secondsPerSlide ?? 3.2;
  const w = 1280;
  const h = 720;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;
  if (audioCtx?.state === 'suspended') await audioCtx.resume();

  const dest = audioCtx?.createMediaStreamDestination?.() ?? null;
  const canvasStream = canvas.captureStream(fps);
  const tracks = [...canvasStream.getVideoTracks()];
  if (dest) tracks.push(...dest.stream.getAudioTracks());
  const combined = new MediaStream(tracks);

  const mime = pickMime();
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('当前环境不支持录制视频');
  }
  const recorder = new MediaRecorder(
    combined,
    mime ? { mimeType: mime, videoBitsPerSecond: 3_500_000 } : { videoBitsPerSecond: 3_500_000 },
  );
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data?.size) chunks.push(e.data);
  };

  const done = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mime || 'video/webm' }));
    recorder.onerror = () => reject(new Error('录制失败'));
  });

  recorder.start(200);
  const totalMs = slides.length * sec * 1000;
  const start = performance.now();
  let slideIndex = 0;

  // Soft slide-change chime via WebAudio (so exported file has light audio track)
  const ding = () => {
    if (!audioCtx || !dest) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 523.25;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(dest);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    o.stop(audioCtx.currentTime + 0.28);
  };

  ding();

  await new Promise((resolve, reject) => {
    const tick = () => {
      if (opts.signal?.aborted) {
        try {
          recorder.stop();
        } catch {
          /* */
        }
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const elapsed = performance.now() - start;
      slideIndex = Math.min(slides.length - 1, Math.floor(elapsed / (sec * 1000)));
      const localT = (elapsed % (sec * 1000)) / (sec * 1000);
      paintSlide(ctx, w, h, slides[slideIndex], slideIndex, slides.length, localT);
      opts.onProgress?.(Math.min(1, elapsed / totalMs), `幻灯 ${slideIndex + 1}/${slides.length}`);

      // chime on slide change
      const nextIdx = Math.min(slides.length - 1, Math.floor(elapsed / (sec * 1000)));
      if (nextIdx !== tick._last && nextIdx > 0) {
        tick._last = nextIdx;
        ding();
      }
      tick._last = tick._last ?? 0;

      if (elapsed >= totalMs) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  if (recorder.state !== 'inactive') recorder.stop();
  const blob = await done;

  try {
    await audioCtx?.close?.();
  } catch {
    /* */
  }

  opts.onProgress?.(1, '完成');
  return { blob, mime: blob.type || mime || 'video/webm' };
}

/**
 * Paint one overview slide.
 */
export function paintSlide(ctx, w, h, slide, index, total, t) {
  // Atmosphere — cool teal wash, not purple
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0f2a2a');
  g.addColorStop(0.55, '#163d3d');
  g.addColorStop(1, '#1a4a3a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft orb
  const orb = ctx.createRadialGradient(w * 0.8, h * 0.2, 20, w * 0.8, h * 0.2, w * 0.45);
  orb.addColorStop(0, 'rgba(196, 120, 42, 0.22)');
  orb.addColorStop(1, 'transparent');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, w, h);

  // Progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(64, h - 48, w - 128, 6);
  ctx.fillStyle = '#3ecfbf';
  ctx.fillRect(64, h - 48, (w - 128) * ((index + t) / total), 6);

  // Brand
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 28px Syne, sans-serif';
  ctx.fillText('清页 · Studio', 72, 72);

  // Slide title
  const fade = Math.min(1, t * 3);
  ctx.globalAlpha = fade;
  ctx.fillStyle = '#f4fbfa';
  ctx.font = '700 64px Syne, sans-serif';
  wrapText(ctx, slide.title || '', 72, 200, w - 144, 72);

  // Body
  ctx.fillStyle = 'rgba(244, 251, 250, 0.9)';
  ctx.font = '500 40px Literata, Songti SC, serif';
  wrapText(ctx, slide.body || '', 72, 320, w - 144, 56);
  ctx.globalAlpha = 1;

  // Index
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '600 22px Syne, sans-serif';
  ctx.fillText(`${index + 1} / ${total}`, w - 140, h - 64);
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const chars = String(text);
  let line = '';
  let yy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineH;
      if (yy > y + lineH * 5) {
        ctx.fillText(`${line}…`, x, yy);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

function pickMime() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(m)) return m;
  }
  return '';
}

/**
 * Trigger download of a blob.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function extForMime(mime) {
  if (/mp4/i.test(mime || '')) return 'mp4';
  return 'webm';
}
