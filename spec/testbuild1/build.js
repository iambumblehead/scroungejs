// Filename: build.js
// Timestamp: 2018.03.29-00:38:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scroungejs = require('../../'),
      express = require('express'),
      http = require('http'),
      path = require('path'),
      port = 3456,
      app = express();

scroungejs.build({
  inputpath : './spec/testbuild1/testbuildSrc',
  outputpath : './spec/testbuild1/testbuildFin',
  publicpath : './testbuildFin',
  basepage : './spec/testbuild1/index.html',
  iscompressed : false,
  isconcatenated : false,
  roots : 'app.js'
}, err => {
  if (err)
    console.log(err);
  else {
    // app.use('/', express.static(path.join(__dirname, 'testbuildFin')));
    app.use('/', express.static(path.join(__dirname, '')));

    http.createServer(app).listen(port);

    // use /etc/hosts to use a test domain
    console.log(`[...] localhost:${port}/`);
  }
});
