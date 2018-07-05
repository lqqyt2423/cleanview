'use strict';

const htmlparser = require('htmlparser2');
const { rp } = require('./utils');
const mdConvert = require('./mdConvert');

// 忽略的html元素
const voidElements = ['head', 'meta', 'link', 'area', 'base', 'br', 'col', 'command', 'embed', 'input', 'keygen', 'param', 'source', 'track', 'wbr', 'script', 'title', 'style'];

/**
 *
 * @param {string|object} options html|uri|object
 * @param {string} options.uri
 * @param {string} options.html
 * @param {string} options.target
 * @param {object} options.overides options.overides.img(node)
 * @return {string} res
 */
async function cleanView(options) {
  let html;

  // 页面抓取的正文目标
  let target;

  if (typeof options === 'string') {
    if (/^https?:\/\//.test(options)) {
      html = await rp(options);
    } else {
      html = options;
    }
  } else if (typeof options === 'object' && (options.uri || options.html)) {
    if (options.html) {
      html = options.html;
    }
    if (!html && options.uri) {
      html = await rp(options.uri);
    }

    target = options.target;
    if (typeof target === 'string') {
      const regexp = /^(\w+)([#.])(\w+)$/;
      if (regexp.test(target)) {
        const res = target.match(regexp);
        if (res) {
          const [node, tag, attr] = [res[1], res[2], res[3]];
          if (tag === '.') {
            target = {
              node: node,
              type: 'class',
              class: attr,
            };
          } else if (tag === '#') {
            target = {
              node: node,
              type: 'id',
              id: attr,
            };
          }
        }
      }
    }

    options.overides = options.overides || {};
  } else {
    throw new Error('无效的参数');
  }

  // console.log(html);

  // console.log('target', target);


  // 忽略的html元素
  const voidElementsObj = voidElements.reduce((obj, key) => {
    obj[key] = false;
    return obj;
  }, {});

  // display: none
  let isHide = false;
  // 隐藏后的计数，当再次为0时，隐藏标签结束
  let hideCount = 0;

  const hideRegex = /display:\s*?none/;


  let isMeetTarget = false;
  let targetCount = 0;


  // 最终的数组
  let res = [];
  let nodeBuffer = [];


  /**
   * 转换函数
   * @param {Object} node
   * @returns {String} html|text
   */
  const convert = function(node) {
    let res = mdConvert(node);
    if (typeof options.overides[node.name] === 'function') {
      res = options.overides[node.name](node) || res;
    }
    return res;
  };

  const parser = new htmlparser.Parser({
    onopentag(name, attr) {
      if (~voidElements.indexOf(name)) {
        voidElementsObj[name] = true;
        return;
      }

      if (isHide) {
        hideCount++;
        return;
      }

      if (attr.style) {
        if (hideRegex.test(attr.style)) {
          isHide = true;
          hideCount++;
          return;
        }
      }

      // 目标节点相关逻辑
      if (isMeetTarget) {
        targetCount++;
      }
      if (target && target.node === name && target[target.type] === attr[target.type]) {
        isMeetTarget = true;
        targetCount++;
        res = [];
        nodeBuffer = [];
      }

      nodeBuffer.push({
        name,
        attr,
        res: [],
      });
    },

    onclosetag(name) {
      if (~voidElements.indexOf(name)) {
        voidElementsObj[name] = false;
        return;
      }

      if (isHide) {
        hideCount--;
        if (hideCount === 0) {
          isHide = false;
        }
        return;
      }

      // 目标节点相关逻辑
      if (isMeetTarget) {
        targetCount--;
      }

      const last = nodeBuffer.pop();
      const text = convert(last);
      if (!text) return;

      if (nodeBuffer.length) {
        nodeBuffer[nodeBuffer.length - 1].res.push(text);
      } else {
        res.push(text);
      }

      // 目标节点相关逻辑
      if (isMeetTarget && targetCount === 0) {
        endParse();
      }
    },

    ontext(text) {
      if (voidElements.some(tag => voidElementsObj[tag])) return;
      if (isHide) return;

      const t = text.trim();
      if (!t) return;

      // 修改当前标签的属性
      if (nodeBuffer.length) {
        nodeBuffer[nodeBuffer.length - 1].res.push(t);
      } else {
        res.push(t);
      }
    }
  }, { decodeEntities: false });

  // 主动结束html解析
  const endParse = () => {
    parser.parseComplete();
  };

  parser.end(html);

  return res.join('');
}

module.exports = cleanView;
