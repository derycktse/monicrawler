const Crawler = require('./crawler');



const c = new Crawler({
  entry: 'https://www.mi.com',
  middlewareNames: 'index'
});


c.crawl()