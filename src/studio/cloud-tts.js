/**
 * Cloud high-quality TTS for podcast-style Audio Overview.
 * Providers: OpenAI tts-1-hd, ElevenLabs multilingual.
 */

import { httpRequest } from '../http.js';
import { loadSettings, resolveTtsProvider } from '../settings.js';

/**
 * Synthesize one line → audio ArrayBuffer (mp3/mpeg).
 * @param {string} text
 * @param {'A'|'B'|string} speaker
 * @param {ReturnType<typeof loadSettings>} [settings]
 */
export async function synthesizeLine(text, speaker, settings = loadSettings()) {
  const provider = resolveTtsProvider(settings);
  if (provider === 'openai') return openaiSpeech(text, speaker, settings);
  if (provider === 'elevenlabs') return elevenSpeech(text, speaker, settings);
  throw new Error('未配置云端 TTS，请在设置中填写 API Key');
}

async function openaiSpeech(text, speaker, settings) {
  const base = (settings.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  const voice = speaker === 'B'
    ? (settings.openaiVoiceB || 'onyx')
    : (settings.openaiVoiceA || 'nova');
  const key = settings.openaiApiKey.trim();
  if (!key) throw new Error('请填写 OpenAI API Key');

  const buf = await httpRequest({
    url: `${base}/audio/speech`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: settings.openaiModel || 'tts-1-hd',
      input: String(text).slice(0, 4096),
      voice,
      response_format: 'mp3',
    },
    responseType: 'arraybuffer',
  });
  return buf;
}

async function elevenSpeech(text, speaker, settings) {
  const base = (settings.elevenBaseUrl || 'https://api.elevenlabs.io/v1').replace(/\/$/, '');
  const voiceId = speaker === 'B'
    ? (settings.elevenVoiceB || '').trim()
    : (settings.elevenVoiceA || '').trim();
  const key = settings.elevenApiKey.trim();
  if (!key) throw new Error('请填写 ElevenLabs API Key');
  if (!voiceId) throw new Error('请填写 ElevenLabs Voice ID');

  const buf = await httpRequest({
    url: `${base}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: {
      text: String(text).slice(0, 5000),
      model_id: settings.elevenModel || 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
      },
    },
    responseType: 'arraybuffer',
  });
  return buf;
}

/**
 * Build a podcast MP3 from dialogue lines (binary concat of same-format mp3).
 * @param {{ speaker: string, text: string }[]} dialogue
 * @param {{
 *   settings?: ReturnType<typeof loadSettings>,
 *   onProgress?: (ratio: number, label: string) => void,
 *   shouldStop?: () => boolean,
 * }} [opts]
 * @returns {Promise<{ blob: Blob, mime: string, buffers: ArrayBuffer[] }>}
 */
export async function synthesizePodcast(dialogue, opts = {}) {
  const settings = opts.settings || loadSettings();
  const provider = resolveTtsProvider(settings);
  if (provider === 'device') {
    throw new Error('请先在设置中选择 OpenAI 或 ElevenLabs 并填写 Key');
  }

  const parts = [];
  const total = dialogue.length;
  for (let i = 0; i < total; i++) {
    if (opts.shouldStop?.()) throw new DOMException('Aborted', 'AbortError');
    const line = dialogue[i];
    opts.onProgress?.((i) / total, `合成 ${i + 1}/${total} · ${line.speaker}`);
    const buf = await synthesizeLine(line.text, line.speaker, settings);
    parts.push(buf);
    // Short pause between turns (tiny silent-ish gap via duplicate nothing —
    // players tolerate mp3 concat; optional 80ms silence skipped for simplicity)
  }
  opts.onProgress?.(1, '合并音轨');

  const blob = concatMp3(parts);
  return { blob, mime: 'audio/mpeg', buffers: parts };
}

/** Concatenate MP3 ArrayBuffers into one Blob (works for same encoder stream). */
export function concatMp3(buffers) {
  const arrays = buffers.map((b) => new Uint8Array(b));
  const len = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return new Blob([out], { type: 'audio/mpeg' });
}

/**
 * Play an audio Blob, resolving when ended or stopped.
 * @param {Blob} blob
 * @param {{ shouldStop?: () => boolean, audioEl?: HTMLAudioElement }} [opts]
 */
export function playAudioBlob(blob, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = opts.audioEl || new Audio();
    audio.src = url;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.onended = null;
      audio.onerror = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('音频播放失败'));
    };
    const watch = setInterval(() => {
      if (opts.shouldStop?.()) {
        clearInterval(watch);
        audio.pause();
        cleanup();
        resolve();
      }
    }, 200);
    audio.play().catch((e) => {
      clearInterval(watch);
      cleanup();
      reject(e);
    });
    audio.addEventListener('ended', () => clearInterval(watch), { once: true });
  });
}
