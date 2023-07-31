// Filename: build.js
// Timestamp: 2018.04.09-22:14:04 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import scroungejs from '../src/scrounge.js'
import express from 'express'
import http from 'http'
import url from 'url'
import path from 'path'

const __filename = new url.URL('', import.meta.url).pathname
const __dirname = __filename.replace(/[/\\][^/\\]*?$/, '')

const port = 3456
const app = express()

scroungejs.build({
  inputpath : './test/src',
  outputpath : './test/out',
  publicpath : './test/out/',
  basepagein : './test/index.tpl.html',
  // basepagein : __dirname + '/index.tpl.html',
  basepage : './test/index.html',
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
