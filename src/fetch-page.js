/**
 * Fetch page HTML — CapacitorHttp on native (bypass CORS),
 * then direct fetch, then public CORS proxies as last resort.
 */

let capacitorHttp = null;

async function getCapacitorHttp() {
  if (capacitorHttp !== null) return capacitorHttp;
  try {
    const core = await import('@capacitor/core');
    if (core.Capacitor?.isNativePlatform?.() && core.CapacitorHttp) {
      capacitorHttp = core.CapacitorHttp;
      return capacitorHttp;
    }
  } catch {
    /* browser */
  }
  capacitorHttp = false;
  return false;
}

function normalizeUrl(input) {
  let u = String(input || '').trim();
  if (!u) throw new Error('请输入网址');
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  const parsed = new URL(u);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('仅支持 http/https 链接');
  }
  return parsed.href;
}

/**
 * @param {string} urlInput
 * @returns {Promise<{ url: string, html: string, via: string }>}
 */
export async function fetchPage(urlInput) {
  const url = normalizeUrl(urlInput);
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  };

  const Http = await getCapacitorHttp();
  if (Http) {
    const res = await Http.request({
      url,
      method: 'GET',
      headers,
      responseType: 'text',
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = typeof res.data === 'string' ? res.data : String(res.data ?? '');
    if (!html.trim()) throw new Error('页面内容为空');
    return { url, html, via: 'native' };
  }

  // Direct fetch (works same-origin / CORS-open pages)
  try {
    const res = await fetch(url, { headers, mode: 'cors', redirect: 'follow' });
    if (res.ok) {
      const html = await res.text();
      if (html.trim()) return { url: res.url || url, html, via: 'fetch' };
    }
  } catch {
    /* try proxy */
  }

  // CORS proxies for browser preview
  const proxies = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];
  let lastErr = null;
  for (const make of proxies) {
    try {
      const res = await fetch(make(url), { redirect: 'follow' });
      if (!res.ok) {
        lastErr = new Error(`代理 HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      if (html.trim()) return { url, html, via: 'proxy' };
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(
    lastErr?.message
      ? `无法抓取页面（${lastErr.message}）。可改用「粘贴 HTML」`
      : '无法抓取页面。可改用「粘贴 HTML」',
  );
}

export { normalizeUrl };
