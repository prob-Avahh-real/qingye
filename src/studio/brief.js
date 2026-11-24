/**
 * Local NotebookLM-style briefing from cleaned article text.
 * Extractive — no cloud LLM required.
 */

/**
 * @typedef {{ speaker: 'A'|'B', text: string }} DialogueLine
 * @typedef {{
 *   summary: string,
 *   bullets: string[],
 *   faq: { q: string, a: string }[],
 *   dialogue: DialogueLine[],
 *   slides: { title: string, body: string }[],
 * }} StudioBrief
 */

/**
 * @param {{ title?: string, text?: string, byline?: string, url?: string }} doc
 * @returns {StudioBrief}
 */
export function buildBrief(doc) {
  const title = (doc.title || '未命名').trim();
  const sentences = splitSentences(doc.text || '');
  const scored = rankSentences(sentences);
  const top = scored.slice(0, 8).map((s) => s.text);
  const bullets = scored.slice(0, 5).map((s) => trimLen(s.text, 90));
  const summary = buildSummary(title, top);
  const faq = buildFaq(title, scored);
  const dialogue = buildDialogue(title, bullets, top);
  const slides = buildSlides(title, bullets, summary);

  return { summary, bullets, faq, dialogue, slides };
}

/** @param {string} text */
export function splitSentences(text) {
  const raw = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return [];
  return raw
    .split(/(?<=[。！？.!?;；])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8 && s.length <= 220);
}

function rankSentences(sentences) {
  if (!sentences.length) return [];
  const freq = new Map();
  for (const s of sentences) {
    for (const t of tokens(s)) freq.set(t, (freq.get(t) || 0) + 1);
  }
  return sentences
    .map((text, i) => {
      const toks = tokens(text);
      let score = 0;
      for (const t of toks) score += freq.get(t) || 0;
      score = score / Math.max(1, Math.sqrt(toks.length));
      // Prefer earlier + mid article slightly
      score *= 1 + Math.max(0, 1 - i / Math.max(1, sentences.length)) * 0.15;
      if (/[：:]/.test(text)) score *= 1.05;
      return { text, score };
    })
    .sort((a, b) => b.score - a.score);
}

function tokens(s) {
  // CJK bigrams + latin words
  const out = [];
  const latin = s.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  out.push(...latin);
  const cjk = s.replace(/[^\u4e00-\u9fff]/g, '');
  for (let i = 0; i < cjk.length - 1; i++) out.push(cjk.slice(i, i + 2));
  return out;
}

function buildSummary(title, top) {
  if (!top.length) return `《${title}》暂无足够正文可生成简报。`;
  const lead = top.slice(0, 3).join('');
  return `关于「${title}」：${trimLen(lead, 280)}`;
}

function buildFaq(title, scored) {
  const picks = scored.slice(0, 4);
  if (!picks.length) {
    return [{ q: `这篇文章在讲什么？`, a: `《${title}》正文过短，无法提炼问答。` }];
  }
  const faq = [
    {
      q: `《${title}》的核心观点是什么？`,
      a: trimLen(picks[0].text, 160),
    },
  ];
  if (picks[1]) {
    faq.push({
      q: '有哪些值得记住的细节？',
      a: trimLen(picks.slice(1, 3).map((p) => p.text).join(' '), 180),
    });
  }
  if (picks[3]) {
    faq.push({
      q: '如果只看一句话，该带走什么？',
      a: trimLen(picks[3].text, 120),
    });
  }
  faq.push({
    q: '适合什么场景阅读？',
    a: `当你需要快速理解「${title}」的要点、并转成音频或视频概览时。`,
  });
  return faq;
}

/**
 * NotebookLM-style two-host audio overview script.
 * @param {string} title
 * @param {string[]} bullets
 * @param {string[]} top
 * @returns {DialogueLine[]}
 */
export function buildDialogue(title, bullets, top) {
  const points = bullets.length ? bullets : top.slice(0, 4).map((t) => trimLen(t, 80));
  /** @type {DialogueLine[]} */
  const lines = [
    { speaker: 'A', text: `嗨，今天我们来聊一篇网页：《${title}》。` },
    { speaker: 'B', text: '好啊。你先给个全景，这篇文章大概在讲什么？' },
    {
      speaker: 'A',
      text: points[0]
        ? `开篇最重要的一点是：${ensurePeriod(points[0])}`
        : `它围绕「${title}」展开，信息量不算少。`,
    },
  ];

  for (let i = 1; i < Math.min(points.length, 4); i++) {
    if (i % 2 === 1) {
      lines.push({ speaker: 'B', text: `等等，所以也就是说——${ensurePeriod(points[i])}` });
      lines.push({ speaker: 'A', text: '对，你可以这么理解。还有下一层。' });
    } else {
      lines.push({ speaker: 'A', text: `另外一点：${ensurePeriod(points[i])}` });
      lines.push({ speaker: 'B', text: '明白了，这个细节挺关键。' });
    }
  }

  lines.push({
    speaker: 'B',
    text: '如果听众只记住一件事，你希望是什么？',
  });
  lines.push({
    speaker: 'A',
    text: points[0]
      ? `记住这个：${ensurePeriod(points[0])} 其余都是展开。`
      : `记住标题本身：《${title}》，然后按需回看原文。`,
  });
  lines.push({ speaker: 'B', text: '很好。今天的音频概览就到这里，去清页文库里还能生成视频版。' });
  lines.push({ speaker: 'A', text: '下期见。' });

  return lines;
}

function buildSlides(title, bullets, summary) {
  const slides = [
    { title: '清页 · 视频概览', body: title },
    { title: '一句话简报', body: trimLen(summary.replace(/^关于「[^」]+」：/, ''), 140) },
  ];
  bullets.slice(0, 4).forEach((b, i) => {
    slides.push({ title: `要点 ${i + 1}`, body: b });
  });
  slides.push({ title: '带走一句', body: bullets[0] || title });
  return slides;
}

function trimLen(s, n) {
  const t = String(s || '').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

function ensurePeriod(s) {
  const t = String(s || '').trim();
  if (!t) return t;
  return /[。！？.!?]$/.test(t) ? t : `${t}。`;
}

/**
 * Naive grounded Q&A over source text.
 * @param {string} question
 * @param {{ text?: string, title?: string }} doc
 */
export function answerQuestion(question, doc) {
  const q = String(question || '').trim();
  if (!q) return '先问一个问题。';
  const sentences = splitSentences(doc.text || '');
  if (!sentences.length) return '当前来源没有足够正文。';

  const qTokens = new Set(tokens(q));
  let best = sentences[0];
  let bestScore = -1;
  for (const s of sentences) {
    const st = tokens(s);
    let score = 0;
    for (const t of st) if (qTokens.has(t)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  if (bestScore <= 0) {
    return `我在《${doc.title || '来源'}》里没找到直接对应句。你可以换个问法，或先看 Studio 简报。`;
  }
  return best;
}
