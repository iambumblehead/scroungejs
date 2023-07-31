// Filename: scrounge_basepage.spec.js
// Timestamp: 2018.04.08-02:51:03 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import depgraph from 'depgraph'

import scrounge_basepage from '../src/scrounge_basepage.js'

test('should return rootnames', () => {
  assert.strictEqual(
    scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root="app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <!-- </scrounge> -->
        </head>
      `).join(','), 'app.css,app.js')
})

test('should return comma-separated rootnames', () => {
  assert.strictEqual(
    scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root="app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="crypto.js,app.js"> -->
          <!-- </scrounge> -->
        </head>
      `).join(','), 'app.css,app.js,crypto.js')
})

test('should be robust and handle/strip whitespace', () => {
  assert.strictEqual(
    scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root=" app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="crypto.js , app.js "> -->
          <!-- </scrounge> -->
        </head>
      `).join(','), 'app.css,app.js,crypto.js')
})

test('should return new content, with updated node-corresponding element', () => {
  let cjsnode = depgraph.node.get('./cjs_root.js', 'console.log("hi")', 'cjsnode')

  assert.strictEqual(scrounge_basepage.writecontentelemone({
    isconcat : false,
    publicpath : './public',
    outputpath : 'to/public/dir',
    buildts : 55555
  }, (
    `<head>
          <!-- <scrounge root="app.css"> -->
          <link href="./public/dir/ojsnode.css?ts=12345" rel="stylesheet" type="text/css">
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <script src="./public/dir/ajsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/cjsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/ejsnode.js?ts=12345" type="text/javascript"></script>
          <!-- </scrounge> -->
        </head>`
  ), cjsnode), (
    `<head>
          <!-- <scrounge root="app.css"> -->
          <link href="./public/dir/ojsnode.css?ts=12345" rel="stylesheet" type="text/css">
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <script src="./public/dir/ajsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/cjsnode.js?ts=55555" type="text/javascript"></script>
          <script src="./public/dir/ejsnode.js?ts=12345" type="text/javascript"></script>
          <!-- </scrounge> -->
        </head>`
  ))
})
