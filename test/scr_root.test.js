import test from 'node:test'
import assert from 'node:assert/strict'
import url from 'url'
import path from 'path'

import {
  scr_root_rootsobj
} from '../src/scr_root.js'

import scr_opts from '../src/scr_opts.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

test('should return an error if no root file found', async () => {
  const inputpathfull = `${__dirname}src`
  const opts = scr_opts({
    metaurl: import.meta.url,
    issilent: true,
    inputpath: './src',
    treearr: [ 'june.js' ], // // was app.js in there...
    treetype: 'none'
  })
  
  await assert.rejects(async () => scr_root_rootsobj(opts, [ 'june.js' ]), {
    message: `root path not found: june.js, (inputpath: ${inputpathfull})`
    // message: `root path not found: june.js, (inputpath: ${inputpathfull})`
  })
})

test('return an object mapping for ["app.js"]', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    inputpath: path.join(__dirname, '/../sample/src/'),
    treearr: [ 'app.js' ],
    treetype: 'none'
  })

  const obj = await scr_root_rootsobj(opts, [ 'app.js' ])

  assert.strictEqual(Object.keys(obj).join(''), 'app.js')
})

test('return an object mapping for ["app.js", "app.css"]', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    inputpath: path.join(__dirname, '/../sample/src/'),
    treearr: [ 'app.js', 'app.css' ],
    treetype: 'none'
  })

  const obj = await scr_root_rootsobj(opts, [ 'app.js', 'app.css' ])
  
  assert.strictEqual(Object.keys(obj).join(','), 'app.js,app.css')
})

