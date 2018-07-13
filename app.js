const Crawler = require('./crawler');



const c = new Crawler({
  entry: 'https://www.mi.com',
  middlewareNames: ['index', 'index2', 'index3'],
  headers: {
    cookie: 'country=CN; lang=zh-CN;'
  }
});


c.crawl()