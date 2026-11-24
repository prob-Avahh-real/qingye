/**
 * Article extraction + HTML→Markdown with chrome stripping.
 * Works with browser DOM or jsdom Document.
 */

import { stripInvalidImages, absolutizeImages } from './image-filter.js';
import { cleanText, cleanMarkdown } from './text-clean.js';

const REMOVE_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'APPLET',
  'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'SOURCE', 'TRACK', 'TEMPLATE',
  'FORM', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL',
  'NAV', 'FOOTER', 'ASIDE', 'HEADER', 'MENU', 'DIALOG',
]);

const NOISE_ATTR =
  /\b(ad|ads|advert|banner|sidebar|comment|comments|related|recommend|share|social|cookie|popup|modal|newsletter|subscribe|promo|sponsor|widget|toolbar|breadcrumb|pagination|tag-list|toc|nav|menu|footer|header|aside|login|signup|paywall|reward|hot-list|hotlist|guess|like-box)\b/i;

const CONTENT_HINT =
  /\b(article|post|entry|content|markdown-body|article-body|post-content|entry-content|article-content|main-content|rich-text|news-content|detail|story|read|body-text)\b/i;

/**
 * @param {string} html
 * @param {{ url?: string, document?: Document }} [opts]
 */
export function extractArticle(html, opts = {}) {
  const doc = opts.document || parseHtml(html);
  const url = opts.url || '';

  const title = pickTitle(doc);
  const byline = pickByline(doc);

  // Strip obvious chrome before scoring
  stripChrome(doc);

  const candidate = pickContentRoot(doc);
  if (!candidate) {
    const { text } = cleanText(doc.body?.textContent || '');
    return {
      title,
      byline,
      url,
      html: '',
      markdown: title ? `# ${title}\n\n${text}` : text,
      text,
      stats: { imagesRemoved: 0, nodesRemoved: 0, junkLines: 0 },
    };
  }

  // Deep clean candidate
  let nodesRemoved = 0;
  nodesRemoved += pruneNoise(candidate);
  const imagesRemoved = stripInvalidImages(candidate);
  absolutizeImages(candidate, url);
  unwrapKeep(candidate);

  const cleanHtml = serializeInner(candidate);
  let markdown = htmlToMarkdown(candidate);
  if (title && !markdown.startsWith('#')) {
    markdown = `# ${title}\n\n${markdown}`;
  }
  if (byline) {
    markdown = markdown.replace(/^(# .+)\n\n/, `$1\n\n*${byline}*\n\n`);
  }
  if (url) {
    markdown += `\n\n---\n来源：${url}\n`;
  }

  const mdClean = cleanMarkdown(markdown);
  const textClean = cleanText(candidate.textContent || '');

  return {
    title,
    byline,
    url,
    html: cleanHtml,
    markdown: mdClean.text,
    text: textClean.text,
    stats: {
      imagesRemoved,
      nodesRemoved,
      junkLines: mdClean.removed.junkLines + textClean.removed.junkLines,
      zeroWidth: mdClean.removed.zeroWidth,
      control: mdClean.removed.control,
    },
  };
}

function parseHtml(html) {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  throw new Error('DOMParser unavailable — pass opts.document (jsdom)');
}

function pickTitle(doc) {
  const og = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (og?.trim()) return cleanText(og).text;
  const h1 = doc.querySelector('h1')?.textContent;
  if (h1?.trim()) return cleanText(h1).text;
  return cleanText(doc.title || '').text;
}

function pickByline(doc) {
  const selectors = [
    'meta[name="author"]',
    'meta[property="article:author"]',
    '[rel="author"]',
    '.author',
    '.byline',
    '.article-author',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (!el) continue;
    const v = el.getAttribute?.('content') || el.textContent;
    if (v?.trim()) return cleanText(v).text.slice(0, 120);
  }
  return '';
}

function stripChrome(doc) {
  for (const tag of REMOVE_TAGS) {
    for (const el of [...doc.querySelectorAll(tag)]) {
      // Keep header if it only wraps the title H1 inside article later — remove site chrome headers
      if (tag === 'HEADER' && el.querySelector('h1') && el.closest('article')) continue;
      el.remove();
    }
  }
  for (const el of [...doc.querySelectorAll('[hidden], [aria-hidden="true"]')]) {
    el.remove();
  }
}

function pickContentRoot(doc) {
  const preferred = [
    'article',
    '[role="main"] article',
    'main article',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.article-body',
    '.markdown-body',
    '#content',
    'main',
    '[role="main"]',
  ];
  for (const sel of preferred) {
    const el = doc.querySelector(sel);
    if (el && scoreNode(el) > 40) return el.cloneNode(true);
  }

  // Score all block candidates
  const blocks = [...doc.querySelectorAll('div, section, article, main')];
  let best = null;
  let bestScore = 0;
  for (const el of blocks) {
    const s = scoreNode(el);
    if (s > bestScore) {
      bestScore = s;
      best = el;
    }
  }
  if (best && bestScore >= 25) return best.cloneNode(true);
  return doc.body ? doc.body.cloneNode(true) : null;
}

function scoreNode(el) {
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text.length < 80) return 0;

  let score = Math.min(text.length / 40, 80);
  const pCount = el.querySelectorAll('p').length;
  score += pCount * 8;

  const idClass = `${el.id || ''} ${el.className || ''}`;
  if (CONTENT_HINT.test(idClass)) score += 40;
  if (NOISE_ATTR.test(idClass)) score -= 50;
  if (el.tagName === 'ARTICLE') score += 30;
  if (el.tagName === 'MAIN') score += 20;

  // Penalize link density (nav-like)
  const links = [...el.querySelectorAll('a')];
  const linkLen = links.reduce((n, a) => n + (a.textContent || '').length, 0);
  const density = linkLen / Math.max(text.length, 1);
  if (density > 0.45) score -= 40;
  if (density > 0.65) score -= 40;

  // Penalize short list-of-links
  if (el.querySelectorAll('li a').length > 8 && pCount < 3) score -= 30;

  return score;
}

function pruneNoise(root) {
  let removed = 0;
  const all = [...root.querySelectorAll('*')];
  for (const el of all) {
    if (!el.parentNode) continue;
    const idClass = `${el.id || ''} ${typeof el.className === 'string' ? el.className : ''}`;
    if (NOISE_ATTR.test(idClass) && !CONTENT_HINT.test(idClass)) {
      // Keep if it holds the majority of text
      const parentText = (root.textContent || '').length;
      const elText = (el.textContent || '').length;
      if (elText < parentText * 0.55) {
        el.remove();
        removed++;
        continue;
      }
    }
    if (REMOVE_TAGS.has(el.tagName) && el.tagName !== 'HEADER') {
      el.remove();
      removed++;
    }
  }
  return removed;
}

function unwrapKeep(root) {
  // Remove empty elements
  for (const el of [...root.querySelectorAll('div, span, p, section')]) {
    if (!el.parentNode) continue;
    if (!(el.textContent || '').trim() && !el.querySelector('img, picture, br, hr')) {
      el.remove();
    }
  }
}

function serializeInner(el) {
  return el.innerHTML || '';
}

/**
 * Minimal HTML → Markdown for article bodies.
 * @param {Element} root
 */
export function htmlToMarkdown(root) {
  const parts = [];

  function walk(node) {
    if (node.nodeType === 3) {
      const t = node.textContent || '';
      if (t) parts.push(t);
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName;
    const block = isBlock(tag);

    if (tag === 'BR') {
      parts.push('\n');
      return;
    }
    if (tag === 'HR') {
      parts.push('\n\n---\n\n');
      return;
    }
    if (tag === 'IMG') {
      const src = node.getAttribute('src') || '';
      const alt = (node.getAttribute('alt') || '').trim() || 'image';
      if (src) parts.push(`\n\n![${alt}](${src})\n\n`);
      return;
    }
    if (tag === 'A') {
      const href = node.getAttribute('href') || '';
      const before = parts.length;
      for (const c of node.childNodes) walk(c);
      const inner = parts.splice(before).join('').trim();
      if (!inner) return;
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        parts.push(`[${inner}](${href})`);
      } else {
        parts.push(inner);
      }
      return;
    }
    if (/^H[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      parts.push(`\n\n${'#'.repeat(level)} `);
      for (const c of node.childNodes) walk(c);
      parts.push('\n\n');
      return;
    }
    if (tag === 'LI') {
      parts.push('\n- ');
      for (const c of node.childNodes) walk(c);
      return;
    }
    if (tag === 'BLOCKQUOTE') {
      parts.push('\n\n');
      const before = parts.length;
      for (const c of node.childNodes) walk(c);
      const inner = parts.splice(before).join('').trim().split('\n').map((l) => `> ${l}`).join('\n');
      parts.push(inner + '\n\n');
      return;
    }
    if (tag === 'PRE' || tag === 'CODE') {
      const code = (node.textContent || '').replace(/\n$/, '');
      if (tag === 'PRE' || (node.parentElement && node.parentElement.tagName === 'PRE')) {
        if (tag === 'PRE') parts.push(`\n\n\`\`\`\n${code}\n\`\`\`\n\n`);
        else parts.push(code);
      } else {
        parts.push(`\`${code}\``);
      }
      return;
    }
    if (tag === 'STRONG' || tag === 'B') {
      parts.push('**');
      for (const c of node.childNodes) walk(c);
      parts.push('**');
      return;
    }
    if (tag === 'EM' || tag === 'I') {
      parts.push('*');
      for (const c of node.childNodes) walk(c);
      parts.push('*');
      return;
    }

    if (block) parts.push('\n\n');
    for (const c of node.childNodes) walk(c);
    if (block) parts.push('\n\n');
  }

  walk(root);
  return parts.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function isBlock(tag) {
  return /^(P|DIV|SECTION|ARTICLE|MAIN|UL|OL|TABLE|TR|FIGURE|FIGCAPTION|H[1-6]|BLOCKQUOTE|PRE)$/.test(tag);
}

/**
 * Clip from raw HTML string (browser or test).
 */
export function clipHtml(html, url = '') {
  return extractArticle(html, { url });
}
