import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { cleanText } from '../src/text-clean.js';
import { isInvalidImage, stripInvalidImages } from '../src/image-filter.js';
import { extractArticle } from '../src/extract.js';

describe('cleanText', () => {
  it('strips zero-width and control chars', () => {
    const { text, removed } = cleanText('你好\u200B世\u0007界');
    assert.equal(text, '你好世界');
    assert.ok(removed.zeroWidth >= 1);
    assert.ok(removed.control >= 1);
  });

  it('drops junk CTA lines', () => {
    const { text, removed } = cleanText('正文第一段\n点击查看\n继续阅读');
    assert.match(text, /正文第一段/);
    assert.match(text, /继续阅读/);
    assert.ok(removed.junkLines >= 1);
    assert.doesNotMatch(text, /点击查看/);
  });

  it('removes symbol spam runs', () => {
    const { text } = cleanText('标题\n■■■■■■\n内容');
    assert.match(text, /标题/);
    assert.match(text, /内容/);
    assert.doesNotMatch(text, /■■/);
  });
});

describe('isInvalidImage', () => {
  function img(attrs) {
    const dom = new JSDOM('<!DOCTYPE html><img />');
    const el = dom.window.document.querySelector('img');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  it('rejects 1x1 trackers', () => {
    assert.equal(isInvalidImage(img({ src: 'https://x.com/p.gif', width: '1', height: '1' })).invalid, true);
  });

  it('rejects empty src', () => {
    assert.equal(isInvalidImage(img({})).invalid, true);
  });

  it('rejects tracker hosts', () => {
    assert.equal(
      isInvalidImage(img({ src: 'https://googleads.g.doubleclick.net/pagead/1.gif', width: '100', height: '100' })).invalid,
      true,
    );
  });

  it('keeps normal content images', () => {
    assert.equal(
      isInvalidImage(img({ src: 'https://cdn.example.com/photo.jpg', width: '640', height: '480', alt: '风景' })).invalid,
      false,
    );
  });
});

describe('extractArticle', () => {
  it('extracts main article and strips ads/nav', () => {
    const html = `<!DOCTYPE html><html><head><title>测试页</title>
      <meta property="og:title" content="一篇干净的文章" />
      </head><body>
      <nav class="site-nav"><a href="/">首页</a><a href="/hot">热门</a></nav>
      <article class="post-content">
        <h1>一篇干净的文章</h1>
        <p>这是正文第一段，讲述如何把网页转成文档。</p>
        <p>这是正文第二段，包含足够长度以便通过内容评分阈值筛选出来作为主内容区域。</p>
        <img src="https://cdn.example.com/a.jpg" width="600" height="400" alt="插图" />
        <img src="https://ads.doubleclick.net/pixel.gif" width="1" height="1" />
        <div class="share-buttons">分享到</div>
      </article>
      <aside class="related">相关推荐</aside>
      <footer>版权所有</footer>
      </body></html>`;

    const dom = new JSDOM(html);
    const result = extractArticle(html, {
      url: 'https://example.com/post/1',
      document: dom.window.document,
    });

    assert.equal(result.title, '一篇干净的文章');
    assert.match(result.markdown, /正文第一段/);
    assert.match(result.markdown, /正文第二段/);
    assert.match(result.markdown, /!\[插图]/);
    assert.ok(result.stats.imagesRemoved >= 1);
    assert.doesNotMatch(result.text, /相关推荐/);
  });

  it('stripInvalidImages removes spacers from DOM', () => {
    const dom = new JSDOM(`<div>
      <img src="spacer.gif" width="10" height="1" />
      <img src="https://cdn.example.com/ok.png" width="200" height="200" alt="ok" />
    </div>`);
    const root = dom.window.document.querySelector('div');
    const n = stripInvalidImages(root);
    assert.ok(n >= 1);
    assert.equal(root.querySelectorAll('img').length, 1);
  });
});
