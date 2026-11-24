/**
 * HTTP helper — CapacitorHttp on native (bypass CORS), fetch elsewhere.
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

/**
 * @param {{
 *   url: string,
 *   method?: string,
 *   headers?: Record<string, string>,
 *   body?: string | object,
 *   responseType?: 'json' | 'text' | 'arraybuffer',
 * }} opts
 */
export async function httpRequest(opts) {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    responseType = 'json',
  } = opts;

  const Http = await getCapacitorHttp();
  if (Http) {
    const options = {
      url,
      method,
      headers,
      data: body,
      responseType: responseType === 'arraybuffer' ? 'arraybuffer' : responseType,
    };
    if (typeof body === 'string') options.data = body;
    const res = await Http.request(options);
    if (res.status < 200 || res.status >= 300) {
      const msg = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      throw new Error(parseApiError(msg, res.status));
    }
    if (responseType === 'arraybuffer') {
      return toArrayBuffer(res.data);
    }
    return res.data;
  }

  const init = { method, headers };
  if (body !== undefined && body !== null) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(parseApiError(text, res.status));
  }
  if (responseType === 'arraybuffer') return res.arrayBuffer();
  if (responseType === 'text') return res.text();
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

function toArrayBuffer(data) {
  if (data instanceof ArrayBuffer) return data;
  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }
  if (typeof data === 'string') {
    // Capacitor may return base64
    const bin = atob(data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }
  throw new Error('无法解析音频二进制响应');
}

function parseApiError(raw, status) {
  try {
    const j = JSON.parse(raw);
    const msg = j?.error?.message || j?.detail?.message || j?.message || j?.detail;
    if (msg) return String(msg).slice(0, 240);
  } catch {
    /* plain */
  }
  const t = String(raw || '').slice(0, 180);
  if (status === 401) return 'API Key 无效或未授权';
  if (status === 429) return '请求过于频繁或额度不足';
  return t || `HTTP ${status}`;
}
