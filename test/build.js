// Filename: build.js
// Timestamp: 2018.04.09-22:14:04 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import scroungejs from '../src/scrounge.js'
import express from 'express'
import http from 'http'
import path from 'path'

const port = 3456
const app = express()

scroungejs.build({
  inputpath : './src',
  outputpath : './out',
  publicpath : './out/',
  basepagein : './index.tpl.html',
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
