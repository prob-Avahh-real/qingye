/**
 * Detect and drop invalid / tracking / decorative images.
 */

const TRACKER_HOST =
  /(?:googleads|doubleclick|googlesyndication|facebook\.com\/tr|analytics|pixel|beacon|tracking|scorecard|adservice|adnxs|adsrvr|moatads|taboola|outbrain|amazon-adsystem|baidu\.com\/hm|cnzz|umeng|hotjar|mixpanel)/i;

const SPACER_NAME =
  /(?:spacer|pixel|blank|transparent|1x1|clear\.gif|dot\.gif|tracking)/i;

const DATA_TINY = /^data:image\/[^;]+;base64,(.{0,200})$/i;

/**
 * @param {Element} img
 * @returns {{ invalid: boolean, reason?: string }}
 */
export function isInvalidImage(img) {
  if (!img || img.tagName !== 'IMG') {
    return { invalid: true, reason: 'not-img' };
  }

  const src = (img.getAttribute('src') || img.getAttribute('data-src') || '').trim();
  const srcset = (img.getAttribute('srcset') || '').trim();

  if (!src && !srcset) return { invalid: true, reason: 'empty-src' };
  if (/^javascript:/i.test(src)) return { invalid: true, reason: 'javascript-src' };
  if (/^about:blank/i.test(src)) return { invalid: true, reason: 'about-blank' };

  if (DATA_TINY.test(src)) return { invalid: true, reason: 'tiny-data-uri' };

  // 1x1 / tiny dimensions
  const w = parseDim(img.getAttribute('width') ?? img.width);
  const h = parseDim(img.getAttribute('height') ?? img.height);
  if (w != null && h != null && w <= 2 && h <= 2) {
    return { invalid: true, reason: '1x1' };
  }
  if ((w != null && w <= 2) || (h != null && h <= 2)) {
    return { invalid: true, reason: 'tiny-dim' };
  }

  // CSS-hidden micro images
  const style = (img.getAttribute('style') || '').toLowerCase();
  if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0/.test(style)) {
    return { invalid: true, reason: 'hidden' };
  }
  if (/width\s*:\s*[012](\.\d+)?px|height\s*:\s*[012](\.\d+)?px/.test(style)) {
    return { invalid: true, reason: 'css-tiny' };
  }

  if (SPACER_NAME.test(src) || SPACER_NAME.test(img.getAttribute('alt') || '')) {
    return { invalid: true, reason: 'spacer' };
  }

  try {
    const host = src.startsWith('data:') ? '' : new URL(src, 'https://example.com').hostname;
    if (host && TRACKER_HOST.test(host + src)) {
      return { invalid: true, reason: 'tracker' };
    }
  } catch {
    /* relative ok */
  }
  if (TRACKER_HOST.test(src)) return { invalid: true, reason: 'tracker-path' };

  // Icon / emoji / logo chrome often in headers — drop if class suggests so
  const cls = `${img.className || ''} ${img.id || ''}`.toLowerCase();
  if (/\b(icon|avatar|emoji|logo-sm|sprite|badge|qrcode|qr-code|wechat|wx-qr)\b/.test(cls)) {
    // Keep content figures; drop chrome icons under 80px
    if ((w != null && w < 80) || (h != null && h < 80)) {
      return { invalid: true, reason: 'chrome-icon' };
    }
  }

  // Empty / meaningless alt with no real content role and tiny
  const alt = (img.getAttribute('alt') || '').trim();
  if (!alt && w != null && w < 48 && h != null && h < 48) {
    return { invalid: true, reason: 'tiny-no-alt' };
  }

  return { invalid: false };
}

function parseDim(v) {
  if (v == null || v === '') return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Remove invalid images from a DOM subtree. Returns count removed.
 * @param {ParentNode} root
 */
export function stripInvalidImages(root) {
  let removed = 0;
  const imgs = [...root.querySelectorAll('img')];
  for (const img of imgs) {
    const { invalid } = isInvalidImage(img);
    if (invalid) {
      img.remove();
      removed++;
    }
  }

  // Drop empty figure wrappers
  for (const fig of [...root.querySelectorAll('figure')]) {
    if (!fig.querySelector('img, picture, svg, video') && !(fig.textContent || '').trim()) {
      fig.remove();
    }
  }

  // Drop picture without img
  for (const pic of [...root.querySelectorAll('picture')]) {
    if (!pic.querySelector('img')) pic.remove();
  }

  return removed;
}

/**
 * Resolve relative image URLs against page URL.
 * @param {ParentNode} root
 * @param {string} baseUrl
 */
export function absolutizeImages(root, baseUrl) {
  if (!baseUrl) return;
  for (const img of root.querySelectorAll('img')) {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (!src || src.startsWith('data:')) continue;
    try {
      img.setAttribute('src', new URL(src, baseUrl).href);
      img.removeAttribute('data-src');
    } catch {
      /* keep */
    }
  }
}
