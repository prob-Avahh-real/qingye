/**
 * Strip invalid / noisy characters from extracted text.
 */

const ZERO_WIDTH =
  /[\u200B-\u200D\u2060\uFEFF\u00AD\u180E\u034F\u061C\u115F\u1160\u17B4\u17B5\u3164\uFFA0]/g;

const CONTROL =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

const PRIVATE_USE =
  /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu;

const REPLACEMENT = /\uFFFD+/g;

/** Decorative symbol runs (box drawing, block elements, excess punctuation) */
const SYMBOL_RUN =
  /[\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]{3,}/g;

const PUNCT_SPAM = /([·•▪▫◦‣⁃※★☆◆◇■□▲△▼▽●○◎⊙])\1{2,}/g;

const MULTI_SPACE = /[^\S\n]{2,}/g;
const MULTI_NL = /\n{3,}/g;
const SPACE_BEFORE_NL = /[^\S\n]+\n/g;
const SPACE_AFTER_NL = /\n[^\S\n]+/g;

/** Common boilerplate / CTA noise lines (standalone) */
const JUNK_LINE =
  /^(分享到|分享至|点击查看|点击阅读|阅读原文|关注我们|扫码关注|广告|推广|相关推荐|猜你喜欢|热门评论|打开APP|打开App|下载APP|下载App|展开全部|收起|查看更多|更多精彩|版权声明|免责声明|原文链接|转载请注明|未经授权|责任编辑|来源：|作者：\s*$|标签：|关键词：|上一篇|下一篇|返回首页|首页\s*[>|›]|评论\s*\d*\s*$|点赞\s*\d*\s*$|收藏\s*\d*\s*$|举报|Subscribe|Share this|Follow us|Advertisement|Sponsored|Read more|Sign up|Newsletter|Cookie\s*Policy|Accept\s*cookies)$/i;

/**
 * Clean a text blob: invalid chars, symbol spam, junk lines, whitespace.
 * @param {string} input
 * @returns {{ text: string, removed: { zeroWidth: number, control: number, junkLines: number } }}
 */
export function cleanText(input) {
  const stats = { zeroWidth: 0, control: 0, junkLines: 0 };
  if (!input) return { text: '', removed: stats };

  let s = String(input);

  const zw = s.match(ZERO_WIDTH);
  stats.zeroWidth = zw ? zw.length : 0;
  s = s.replace(ZERO_WIDTH, '');

  const ctl = s.match(CONTROL);
  stats.control = ctl ? ctl.length : 0;
  s = s.replace(CONTROL, '');

  s = s.replace(PRIVATE_USE, '');
  s = s.replace(REPLACEMENT, '');
  s = s.replace(SYMBOL_RUN, '');
  s = s.replace(PUNCT_SPAM, '$1');

  // Normalize exotic spaces to regular space
  s = s.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

  const lines = s.split(/\r\n|\r|\n/);
  const kept = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      kept.push('');
      continue;
    }
    if (JUNK_LINE.test(trimmed)) {
      stats.junkLines++;
      continue;
    }
    // Drop lines that are mostly non-word symbols
    const letters = trimmed.replace(/[\s\d\p{P}\p{S}]/gu, '');
    if (trimmed.length >= 4 && letters.length / trimmed.length < 0.15) {
      stats.junkLines++;
      continue;
    }
    kept.push(trimmed);
  }

  s = kept.join('\n');
  s = s.replace(SPACE_BEFORE_NL, '\n');
  s = s.replace(SPACE_AFTER_NL, '\n');
  s = s.replace(MULTI_SPACE, ' ');
  s = s.replace(MULTI_NL, '\n\n');
  s = s.trim();

  return { text: s, removed: stats };
}

/**
 * Soften markdown while keeping structure.
 * @param {string} md
 */
export function cleanMarkdown(md) {
  const { text, removed } = cleanText(md);
  // Collapse empty image / link leftovers
  let s = text
    .replace(/!\[[^\]]*]\(\s*\)/g, '')
    .replace(/\[[^\]]*]\(\s*\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: s, removed };
}
