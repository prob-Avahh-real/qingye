import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildBrief, splitSentences, answerQuestion, buildDialogue } from '../src/studio/brief.js';

const SAMPLE = {
  title: '深海探测的新进展',
  text: [
    '深海探测正在进入新阶段，无人潜水器可以抵达万米级海沟。',
    '研究人员发现热液喷口附近存在丰富的微生物群落。',
    '这些发现有助于理解地球早期生命起源的可能路径。',
    '同时，深海采矿的环境影响仍存在争议，需要更严格的评估。',
    '未来五年，更多国家将部署长期海底观测网。',
  ].join(''),
};

describe('splitSentences', () => {
  it('splits Chinese sentences', () => {
    const s = splitSentences(SAMPLE.text);
    assert.ok(s.length >= 4);
  });
});

describe('buildBrief', () => {
  it('builds summary, faq, dialogue, slides', () => {
    const b = buildBrief(SAMPLE);
    assert.match(b.summary, /深海探测/);
    assert.ok(b.bullets.length >= 3);
    assert.ok(b.faq.length >= 2);
    assert.ok(b.dialogue.length >= 6);
    assert.equal(b.dialogue[0].speaker, 'A');
    assert.ok(b.slides.length >= 3);
  });
});

describe('buildDialogue', () => {
  it('alternates hosts', () => {
    const d = buildDialogue('测试', ['要点一', '要点二', '要点三'], []);
    assert.ok(d.some((l) => l.speaker === 'B'));
    assert.match(d.map((l) => l.text).join(''), /要点一/);
  });
});

describe('answerQuestion', () => {
  it('returns grounded sentence', () => {
    const a = answerQuestion('微生物在哪里？', SAMPLE);
    assert.match(a, /微生物|热液/);
  });
});
