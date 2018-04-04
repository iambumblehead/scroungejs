// Filename: build.js
// Timestamp: 2018.04.03-23:12:20 (last modified)
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
  iscompressed : true,
  isconcatenated : true,
  roots : 'app.js',
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
