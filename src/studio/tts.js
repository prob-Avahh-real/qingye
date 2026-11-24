/**
 * Dual-voice TTS for Audio Overview (NotebookLM-style).
 */

/** @returns {SpeechSynthesisVoice[]} */
export function listVoices() {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function pickVoices() {
  const voices = listVoices();
  const zh = voices.filter((v) => /zh|chinese|中文|普通话|国语/i.test(`${v.lang} ${v.name}`));
  const pool = zh.length >= 2 ? zh : voices;
  const a = pool[0] || null;
  let b = pool.find((v) => v !== a) || pool[1] || a;
  // Prefer different gender/name if possible
  if (pool.length > 2) {
    const alt = pool.find((v) => v !== a && /female|male|婷|晓|云|楠|宇/i.test(v.name));
    if (alt) b = alt;
  }
  return { voiceA: a, voiceB: b };
}

/**
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, lang?: string, voice?: SpeechSynthesisVoice | null }} [opts]
 */
export function speakLine(text, opts = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('当前环境不支持语音合成'));
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 1.02;
    u.pitch = opts.pitch ?? 1;
    u.lang = opts.lang ?? 'zh-CN';
    if (opts.voice) u.voice = opts.voice;
    u.onend = () => resolve();
    u.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') resolve();
      else reject(new Error(e.error || '朗读失败'));
    };
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/**
 * Play dialogue with two host voices.
 * @param {{ speaker: string, text: string }[]} dialogue
 * @param {{ onLine?: (i: number, line: object) => void, shouldStop?: () => boolean }} [opts]
 */
export async function playDialogue(dialogue, opts = {}) {
  stopSpeech();
  // Voices may load async
  await waitVoices();
  const { voiceA, voiceB } = pickVoices();

  for (let i = 0; i < dialogue.length; i++) {
    if (opts.shouldStop?.()) break;
    const line = dialogue[i];
    opts.onLine?.(i, line);
    const isA = line.speaker === 'A';
    await speakLine(line.text, {
      voice: isA ? voiceA : voiceB,
      pitch: isA ? 1.05 : 0.92,
      rate: isA ? 1.05 : 1.0,
    });
    await sleep(180);
  }
}

function waitVoices() {
  return new Promise((resolve) => {
    const ready = listVoices();
    if (ready.length) {
      resolve();
      return;
    }
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const t = setTimeout(() => resolve(), 800);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(t);
      resolve();
    };
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Estimate audio overview duration in seconds */
export function estimateDialogueSeconds(dialogue) {
  const chars = dialogue.reduce((n, l) => n + (l.text || '').replace(/\s+/g, '').length, 0);
  return Math.max(8, Math.round(chars / 4.2));
}
