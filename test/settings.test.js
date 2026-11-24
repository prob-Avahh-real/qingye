import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { concatMp3 } from '../src/studio/cloud-tts.js';

// Minimal localStorage for Node
beforeEach(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
});

describe('settings cloud TTS', () => {
  it('resolves device without key', async () => {
    const { saveSettings, resolveTtsProvider, cloudTtsReady } = await import('../src/settings.js');
    saveSettings({ ttsProvider: 'openai', openaiApiKey: '' });
    assert.equal(cloudTtsReady(), false);
    assert.equal(resolveTtsProvider(), 'device');
  });

  it('resolves openai when key present', async () => {
    const { saveSettings, resolveTtsProvider, cloudTtsReady } = await import('../src/settings.js');
    saveSettings({ ttsProvider: 'openai', openaiApiKey: 'sk-test-key' });
    assert.equal(cloudTtsReady(), true);
    assert.equal(resolveTtsProvider(), 'openai');
  });

  it('masks secrets', async () => {
    const { maskSecret } = await import('../src/settings.js');
    assert.equal(maskSecret('sk-abcdefghijklmnop'), 'sk-a…mnop');
  });
});

describe('concatMp3', () => {
  it('joins buffers', () => {
    const a = new Uint8Array([1, 2, 3]).buffer;
    const b = new Uint8Array([4, 5]).buffer;
    const blob = concatMp3([a, b]);
    assert.equal(blob.type, 'audio/mpeg');
    assert.equal(blob.size, 5);
  });
});
