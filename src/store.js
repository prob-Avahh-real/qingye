const KEY = 'qingye.docs.v1';

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   url: string,
 *   byline: string,
 *   markdown: string,
 *   text: string,
 *   html: string,
 *   createdAt: number,
 *   stats: object,
 * }} ClipDoc
 */

/** @returns {ClipDoc[]} */
export function loadDocs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** @param {ClipDoc[]} docs */
export function saveDocs(docs) {
  localStorage.setItem(KEY, JSON.stringify(docs.slice(0, 200)));
  return docs;
}

/** @param {Omit<ClipDoc, 'id'|'createdAt'> & { id?: string }} data */
export function createDoc(data) {
  return {
    id: data.id || `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: data.title || '未命名文档',
    url: data.url || '',
    byline: data.byline || '',
    markdown: data.markdown || '',
    text: data.text || '',
    html: data.html || '',
    createdAt: Date.now(),
    stats: data.stats || {},
  };
}

export function upsertDoc(docs, doc) {
  const i = docs.findIndex((d) => d.id === doc.id);
  if (i >= 0) {
    const next = [...docs];
    next[i] = doc;
    return next;
  }
  return [doc, ...docs];
}

export function removeDoc(docs, id) {
  return docs.filter((d) => d.id !== id);
}
