'use strict';

const request = require('request');

const sleep = function (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

async function rp(options) {
  let uri;
  let method = 'GET';
  let params = {};
  let json = false;
  let headers = {};
  if (typeof options === 'string') {
    uri = options;
  } else {
    if (!options || !options.uri) throw new Error('请传入uri');
    uri = options.uri;
    method = options.method || 'GET';
    params = options.params || {};
    json = options.json || false;
    headers = options.headers || {};
  }

  if (method === 'GET' && params && Object.keys(params).length > 0) {
    const arr = Object.keys(params).reduce((a, key) => {
      a.push(`${key}=${params[key]}`);
      return a;
    }, []);
    const query = arr.join('&');
    uri = `${uri}?${query}`;
  }

  let body = {};
  if (params && Object.keys(params).length) {
    body = params;
  }

  const reqObj = {
    uri,
    method,
    headers
  };
  if (json) reqObj.json = json;
  if (method !== 'GET') reqObj.body = body;

  return await new Promise((resolve, reject) => {
    request(reqObj, (err, res, body) => {
      if (err) return reject(err);
      resolve(body);
    });
  });
}

module.exports = {
  rp,
  sleep,
};
