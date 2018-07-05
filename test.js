'use strict';

const cleanView = require('./');
const { rp } = require('./utils');

// const link = 'https://mp.weixin.qq.com/s/vK3wQBUU6b5wDtLqRgrhSw';
const link = 'https://www.jikeyuedu.com/blog/20170801-programming-specification-of-javascript.html';
// const link = 'https://mp.weixin.qq.com/s?__biz=MjM5NjI4MDU4NA==&mid=2651286992&idx=1&sn=45880f15d95c9dcc5b108abb980ca076&chksm=bd186db78a6fe4a1ed6bbd58895bd832fb19df587df590591cc0200319ca4d84f54fd81572ad&scene=38#wechat_redirect';

describe('返回干净的页面视图', function() {
  this.timeout(10000);

  // it('通过url调用', async function() {
  //   const res = await cleanView(link);
  //   console.log(res);
  // });

  // it('筛选目标元素', async function () {
  //   const res = await cleanView({ uri: link, target: 'div.article' });
  //   console.log(res);
  // });

  it('筛选目标元素，自定义替换逻辑', async function () {
    const html = await rp(link);
    const start = Date.now();
    const res = await cleanView({
      html,
      // target: 'div.article',
      target: 'div#page-content',
      overides: {
        img(node) {
          const attr = node.attr;
          const alt = attr.alt || '';
          let src = attr.src || attr['data-original-src'] || attr['data-src'] || '';
          const title = attr.title || '';
          const titlePart = title ? ' "' + title + '"' : '';
          if (/^\/\//.test(src)) {
            src = link.match(/^https?:/)[0] + src;
          }
          return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : '';
        },
      }
    });
    console.log(res);
    console.log('cost:', Date.now() - start, 'ms');
  });

  // it('通过html调用', async function() {
  //   const html = await rp('https://github.com/fb55/htmlparser2');
  //   const res = await cleanView(html);
  //   console.log(res);
  // });

  // it('一些额外设置', async function() {
  //   const res = await cleanView({
  //     uri: 'https://github.com/fb55/htmlparser2',
  //     target: '#readme'
  //   });
  //   console.log(res);
  // });
});
