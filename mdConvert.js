'use strict';

const blockElements = [
  'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
  'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

const elementsConverter = {
  h1(text) {
    return `# ${text}`;
  },
  h2(text) {
    return `## ${text}`;
  },
  h3(text) {
    return `### ${text}`;
  },
  h4(text) {
    return `#### ${text}`;
  },
  h5(text) {
    return `##### ${text}`;
  },
  h6(text) {
    return `###### ${text}`;
  },
  blockquote(text) {
    return `> ${text}`;
  },
  img(text, node) {
    const attr = node.attr;
    const alt = attr.alt || '';
    const src = attr.src || '';
    const title = attr.title || '';
    const titlePart = title ? ' "' + title + '"' : '';
    return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : '';
  },
  strong(text) {
    text = text.trim();
    if (!text) return text;
    // 去除嵌套的strong
    if (/^\s*\*\*.*\*\*\s*$/.test(text)) return text;
    return `**${text}**`;
  },
  b(text) {
    text = text.trim();
    if (!text) return text;
    // 去除嵌套的strong
    if (/^\s*\*\*.*\*\*\s*$/.test(text)) return text;
    return `**${text}**`;
  },
  li(text) {
    return `- ${text}`;
  },
  // 替换多余的换行
  ul(text) {
    text = text.replace(/\n-/g, '-');
    return text;
  },
  // 替换多余的换行
  ol(text) {
    text = text.replace(/\n-/g, '-');
    return text;
  },
};
const elementsConverterArray = Object.keys(elementsConverter);

/**
 *
 * @param {Object} node
 * @param {String} node.name
 * @param {Object} node.attr
 * @param {Array} node.res
 * @returns {String} text
 */
function mdConvert(node) {
  // console.log(node);
  let res = node.res.join('');

  // console.log('=============');
  // console.log(node);
  // console.log('=============');
  // console.log();

  // 如果为空字符串，直接返回
  if (!res && node.name !== 'img') {
    return res;
  }

  // 针对不同元素的处理逻辑
  if (~elementsConverterArray.indexOf(node.name)) {
    res = elementsConverter[node.name](res, node);
  }

  // 如果为空字符串，直接返回
  if (!res) return res;

  // 换行元素
  if (~blockElements.indexOf(node.name)) {
    if (!/\n+$/.test(res)) {
      res = res + '\n\n';
    }
  } else {
    // 行内元素
    if (!/\s+$/.test(res)) {
      res = res + ' ';
    }
  }
  return res;
}

module.exports = mdConvert;
