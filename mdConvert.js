'use strict';

const LI_HEADER = 'CLEAN_LI_HEADER'

const unescape = (function() {
  const escapeMap = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#x27;": "'",
    "&#x60;": "`",
    "&nbsp;": " ",
    "&#8202;": " "
  };

  const source = `(?:${Object.keys(escapeMap).join('|')})`;
  const testRegexp = RegExp(source);
  const replaceRegexp = RegExp(source, 'g');
  const escaper = function(match) {
    return escapeMap[match];
  }
  return function(string) {
    string = string || '';
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
})();

const blockElements = [
  'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
  'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

const strongHandler = (text) => {
  text = text.trim();
  if (!text) return text;

  // 去除嵌套的strong
  if (/^\s*\*\*.*\*\*\s*$/.test(text)) return text;

  return `**${text}**`;
};

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
    return strongHandler(text);
  },
  b(text) {
    return strongHandler(text);
  },
  em(text) {
    text = text.trim();
    if (!text) return text;
    return `_${text}_`;
  },
  li(text) {
    return `${LI_HEADER} ${text}`;
  },
  ul(text) {
    // 替换多余的换行
    text = text.replace(new RegExp(`\n${LI_HEADER}`, 'g'), LI_HEADER);

    text = text.replace(new RegExp(LI_HEADER, 'g'), '-');
    return text;
  },

  ol(text) {
    // 替换多余的换行
    text = text.replace(new RegExp(`\n${LI_HEADER}`, 'g'), LI_HEADER);

    let index = 1;
    text = text.replace(new RegExp(LI_HEADER, 'g'), () => {
      return `${index++}.`;
    });
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

    // 替换空格等字符
    res = unescape(res);

    // 去除一个段落中嵌套的 strong
    res = res.replace(/^(\s*\*\*)(.*[*]+.*)(\*\*\s*)$/, (m, a, b, c) => {
      b = b.replace(/\*{2,}/g, '');
      return `${a}${b}${c}`;
    });

  // 行内元素
  } else {

    // 为什么后面要加空格呢？
    // if (!/\s+$/.test(res)) {
    //   res = res + ' ';
    // }
  }

  return res;
}

module.exports = mdConvert;
