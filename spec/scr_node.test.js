import test from 'node:test'
import assert from 'node:assert/strict'
import depgraph from 'depgraph'

import scr_node from '../src/scr_node.js'
import scr_opts from '../src/scr_opts.js'

test('should return public output path', () => {
  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.js',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.js'), 'package_100_the_nodefile.js')

  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'package_100_the_nodefile.css')

  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.css'), 'package_100_the_nodefile.css')
})

test('should return root-uid-generated public output path, when isconcat', () => {
  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'rootname.css')
})

test('should return correct public output path, given varied path opts', () => {
  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: '/final/output/path',
    publicpath: 'output',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css')

  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: 'output',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css')

  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: '/path',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/path/package_100_the_nodefile.css')

  assert.strictEqual(scr_node.getoutputpathpublic(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: '/path',
    isconcat: true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/path/rootname.css')
})

test('should return public output path', () => {
  assert.strictEqual(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.js',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.js'), 'package_100_the_nodefile.js')

  assert.strictEqual(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'package_100_the_nodefile.css')

  assert.strictEqual(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.css'), 'package_100_the_nodefile.css')
})

test('return root-uid-generated public output path, when isconcat', () => {
  assert.strictEqual(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: '',
    publicpath: '',
    isconcat: true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'rootname.css')
})

test('return correct public output path, given different path options', () => {
  assert.strictEqual(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: '/final/output/path',
    publicpath: 'output',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/final/output/path/package_100_the_nodefile.css')

  // original test matched path exactly
  // did not return a full system path
  assert.ok(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: 'output',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css').endsWith('output/path/package_100_the_nodefile.css'))

  // original test matched path exactly
  // did not return a full system path
  assert.ok(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: '/path',
    isconcat: false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css').endsWith('output/path/package_100_the_nodefile.css'))

  // original test matched path exactly
  // did not return a full system path
  assert.ok(scr_node.getoutputpathreal(scr_opts({
    metaurl: import.meta.url,
    outputpath: './output/path',
    publicpath: '/path',
    isconcat: true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css').endsWith('output/path/rootname.css'))
})
