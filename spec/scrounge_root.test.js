// Filename: scrounge_root.spec.js
// Timestamp: 2018.04.09-21:52:01 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import url from 'url'
import path from 'path'

import scrounge_root from '../src/scrounge_root.js'
import scrounge_opts from '../src/scrounge_opts.js'

const __filename = new url.URL('', import.meta.url).pathname
const __dirname = __filename.replace(/[/\\][^/\\]*?$/, '')

test('should return an error if no root file found', async () => {
  let opts = scrounge_opts({
    issilent : true,
    inputpath : './src',
    treearr : [ 'app.js' ],
    treetype : 'none'
  })

  scrounge_root.getrootarrasobj(opts, [
    'app.js'
  ], err => {
    assert.strictEqual(Boolean(err), true)
  })
})

test('should return an object mapping of { treename : dependencyarr }, for ["app.js"]', async () => {
  let opts = scrounge_opts({
    inputpath : path.join(__dirname, '/../test/src/'),
    treearr : [ 'app.js' ],
    treetype : 'none'
  })

  scrounge_root.getrootarrasobj(opts, [
    'app.js'
  ], (err, obj) => {
    assert.strictEqual(Object.keys(obj).join(''), 'app.js')
  })
})

test('should return an object mapping of { treename : dependencyarr }, for ["app.js", "app.css"]', async () => {
  let opts = scrounge_opts({
    inputpath : path.join(__dirname, '/../test/src/'),
    treearr : [ 'app.js', 'app.css' ],
    treetype : 'none'
  })

  scrounge_root.getrootarrasobj(opts, [
    'app.js', 'app.css'
  ], (err, obj) => {
    assert.strictEqual(Object.keys(obj).join(','), 'app.js,app.css')
  })
})
