/**
 * 
 */

// class Crawler {
//   constructor(option) {
//     this.siteMap = [];

//   }

//   fetch() {

//   }
//   parse() {

//   }
// };






function Crawler() {

  // 爬虫用例中间件
  this.middlewares = []
}

Crawler.prototype.loadMiddleware = function () {
  const config = this.config;
  if (config.middleware === '*') {
  }
};



module.exports = Crawler;
