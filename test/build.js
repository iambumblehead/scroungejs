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
const app = express();

(async () => {
  await scroungejs.build({
    inputpath: './src',
    outputpath: './out',
    publicpath: './out/',
    basepagein: './index.tpl.html',
    basepage: './index.html',
    iscompress: false,
    isconcat: false,
    treearr: [ 'app.js', 'app.css' ],
    deploytype: 'module'
  })

  app.use('/', express.static(path.join(__dirname, '')))

  if (process.env.service)
    http.createServer(app).listen(port)

  console.log(`[...] localhost:${port}/`)
})()
