// Filename: build.js
// Timestamp: 2018.04.09-22:14:04 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scroungejs = require('../'),
      express = require('express'),
      http = require('http'),
      path = require('path'),
      port = 3456,
      app = express();

scroungejs.build({
  inputpath : './src',
  outputpath : './out',
  publicpath : './out/',
  basepage : './index.html',
  iscompress : false,
  isconcat : false,
  treearr : [ 'app.js', 'app.css' ],
  deploytype : 'module'
}, err => {
  if (err)
    console.log(err);
  else {
    app.use('/', express.static(path.join(__dirname, '')));

    http.createServer(app).listen(port);

    console.log(`[...] localhost:${port}/`);
  }
});
