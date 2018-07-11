const fs = require('fs');
const path = require('path')
const url = require('url')
const axios = require('axios')
const cheerio = require('cheerio')
const isRelativeUrl = require('is-relative-url');
const validUrl = require('valid-url');

function Crawler(config) {

  this.config = config || {};

  this.init();
  // 爬虫用例中间件
  this.middlewares = []
  this.loadMiddleware();

  // 对入口url进行解析
  this.parsedEntry = url.parse(this.config.entry);

}

Crawler.prototype.init = function () {
  const config = this.config;

  // 已经访问的url
  this.viewedMap = {};

  // 准备访问的列表
  this.viewList = [];
  this.viewList.push(config.entry);


  // 同时访问多少条链接
  config['asyncCount'] = config['asyncCount'] || 5;



}

Crawler.prototype.loadMiddleware = function () {
  const config = this.config;
  this.middlewares = loadFile(config.middlewareNames)
};

Crawler.prototype.crawl = async function () {
  const config = this.config;
  const viewList = this.viewList;
  const viewedMap = this.viewedMap;
  const headers = config.headers || {};
  const self = this;


  let list = viewList.splice(0, config.asyncCount);

  let promArr = list.map((url) => {

    // 已经访问的标记
    viewedMap[url] = true;


    const promise = new Promise((resolve, reject) => {
      console.log(url)
      axios.get(url, {
        headers
      }).then(function (res) {

        // 遍历相关的爬虫用例
        

        // 解析html
        const $ = cheerio.load(res.data)


        // 获取页面所有可点击链接
        $('body a').each((idx, element) => {
          var $element = $(element);
          var link = $element.attr('href');

          if (!link) return;
          if (/^\/\//.test(link)) {
            link = 'https:' + link
          }
          // 如果是相对链接, 则补上
          if (isRelativeUrl(link) && validUrl.isUri(link)) {
            link = self.entry + (/^\//.test(link) ? '' : '/') + link
          }

          if (self.isTargetUrl(link)) {
            viewList.push(link);
          }
        })

        resolve();
      }).catch((err) => {
        // console.log(`fetch error at : ${url}`)
        reject(err)
      })
    })
    return promise;
  });

  try {

    await Promise.all(promArr);
  } catch (ex) {

  }

  if (viewList.length === 0) {
    return true
  }
  else {
    return this.crawl()
  }

}


// 是不是需要访问的目标链接
Crawler.prototype.isTargetUrl = function (link) {
  const viewedMap = this.viewedMap

  if (!link) return false;

  let isValid = true;

  const parsed = url.parse(link);

  let key = link.replace(parsed.search, '');

  // 去掉哈希
  key = key.replace(/#.*/, '');

  // 如果最后的是一个 /. 其实没必要
  key = key.replace(/\/$/, '');

  const regex = new RegExp(this.parsedEntry.host, 'i')
  if (!regex.test(key)) {
    isValid = false;
  }

  if (viewedMap[key]) {
    isValid = false;
  }

  if (isValid) {
    viewedMap[key] = true;
  }

  return isValid;
}




function loadFile(middlewareNames) {
  const middlewares = [];

  if (!middlewareNames) {
    middlewareNames = '*';
  }
  if (typeof middlewareNames === 'string') {
    middlewareNames = [middlewareNames];
  }

  middlewareNames.forEach((name) => {
    const location = path.resolve(process.cwd(), './middleware/', name);

    console.log(location);
    const fun = require(location);
    middlewares.push(fun)
  })

  return middlewares;
}


module.exports = Crawler;
