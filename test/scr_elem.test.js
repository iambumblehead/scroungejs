// Filename: scrounge_elem.spec.js
// Timestamp: 2018.04.08-11:59:51 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import scr_elem from '../src/scr_elem.js'
import scr_opts from '../src/scr_opts.js'

test('should return carriage-return indentation', () => {
  // may 'appear' the same as other tests, but some of the whitespace
  // below is different from normal whitespace
  assert.strictEqual(scr_elem.getindentation(
    '	   <!-- <scrounge.js> -->'
  ), '	   ')
})

test('should return whitespace indentation', () => {
  assert.strictEqual(scr_elem.getindentation(
    '   <!-- <scrounge.js> -->'
  ), '   ')
})

test('should return empty indentation', () => {
  assert.strictEqual(scr_elem.getindentation(
    '<!-- <scrounge.js> -->'
  ), '')
})

test('should populate a scrounge elem', () => {
  const elem = [
    ' <!-- <scrounge root="app.css"> -->',
    ' <!-- </scrounge> -->'
  ].join('\n')
  const body = [
    ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
    ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">'
  ].join('\n')

  assert.strictEqual(scr_elem.getpopulated(elem, body), [
    ' <!-- <scrounge root="app.css"> -->',
    ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
    ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">',
    ' <!-- </scrounge> -->' ].join('\n'))
})

test('should REpopulate a scrounge elem', () => {
  const elem = [
    ' <!-- <scrounge root="app.css"> -->',
    ' <link href="./out/viewa.css?ts=123" rel="stylesheet" type="text/css">',
    ' <link href="./out/viewb.css?ts=123" rel="stylesheet" type="text/css">',
    ' <!-- </scrounge> -->'
  ].join('\n')
  const body = [
    ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
    ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">'
  ].join('\n')

  assert.strictEqual(scr_elem.getpopulated(elem, body), [
    ' <!-- <scrounge root="app.css"> -->',
    ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
    ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">',
    ' <!-- </scrounge> -->' ].join('\n'))
})

test('should return javascript <script> element', () => {
  assert.strictEqual(scr_elem.getincludetag(scr_opts({
    metaurl: import.meta.url,
    version: 10,
    buildts: 10
  }), './out/view.js', 'cjs'), (
    '<script src="./out/view.js?v=10&ts=10" type="text/javascript"></script>'
  ))
})

test('return javascript <script> element, w/ module attribute for es6', () => {
  assert.strictEqual(scr_elem.getincludetag(scr_opts({
    metaurl: import.meta.url,
    deploytype: 'module',
    version: 10,
    buildts: 10
  }), './out/view.js', 'esm'), (
    '<script src="./out/view.js?v=10&ts=10" type="module"></script>'
  ))
})

test('should return stylesheet <link> element', () => {
  assert.strictEqual(scr_elem.getincludetag(scr_opts({
    metaurl: import.meta.url,
    version: 10,
    buildts: 10
  }), './out/view.css', 'css'), (
    '<link href="./out/view.css?v=10&ts=10" rel="stylesheet" type="text/css">'
  ))
})

test('should throw an error if file extn unsupported', async () => {
  await assert.rejects(async () => (
    scr_elem.getincludetag(
      scr_opts({
        metaurl: import.meta.url,
        version: 10,
        buildts: 10
      }),'./out/view.zs', 'css')
  ), {
    message: 'Invalid type, .zs'
  })
})

