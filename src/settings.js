/**
 * Cloud TTS settings (device-local).
 */

const KEY = 'qingye.settings.v1';

export const TTS_PROVIDERS = [
  { id: 'device', label: '设备朗读', blurb: '免费，音质一般' },
  { id: 'openai', label: 'OpenAI TTS', blurb: 'tts-1-hd，双人播客' },
  { id: 'elevenlabs', label: 'ElevenLabs', blurb: '更接近真人播客' },
];

/** OpenAI built-in voices suitable for A/B hosts */
export const OPENAI_VOICES = [
  'alloy', 'ash', 'ballad', 'coral', 'echo',
  'fable', 'nova', 'onyx', 'sage', 'shimmer',
];

const DEFAULTS = {
  ttsProvider: 'device',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'tts-1-hd',
  openaiVoiceA: 'nova',
  openaiVoiceB: 'onyx',
  elevenApiKey: '',
  elevenBaseUrl: 'https://api.elevenlabs.io/v1',
  elevenModel: 'eleven_multilingual_v2',
  /** Default public multilingual-ish voices; override in settings */
  elevenVoiceA: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  elevenVoiceB: 'JBFqnCBsd6RMkjVDRZzb', // George
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function cloudTtsReady(settings = loadSettings()) {
  const p = settings.ttsProvider || 'device';
  if (p === 'openai') return Boolean(settings.openaiApiKey?.trim());
  if (p === 'elevenlabs') return Boolean(settings.elevenApiKey?.trim());
  return false;
}

export function resolveTtsProvider(settings = loadSettings()) {
  const p = settings.ttsProvider || 'device';
  if (p !== 'device' && cloudTtsReady(settings)) return p;
  return 'device';
}

export function maskSecret(s) {
  if (!s) return '';
  if (s.length <= 8) return '••••';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}
