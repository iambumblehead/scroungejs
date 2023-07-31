// Filename: scrounge_node.spec.js
// Timestamp: 2018.04.08-13:52:24 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import depgraph from 'depgraph'

import scrounge_node from '../src/scrounge_node.js'
import scrounge_opts from '../src/scrounge_opts.js'

test('should return public output path', () => {
  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.js',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.js'), 'package_100_the_nodefile.js');

  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.css'), 'package_100_the_nodefile.css');
});

test('should return root-uid-generated public output path, when isconcat', () => {
  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'rootname.css');
});

test('should return coorect public output path, given different path options', () => {
  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : '/final/output/path',
    publicpath : 'output',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : './output/path',
    publicpath : 'output',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : './output/path',
    publicpath : '/path',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathpublic(scrounge_opts({
    outputpath : './output/path',
    publicpath : '/path',
    isconcat : true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/path/rootname.css');
});

test('should return public output path', () => {
  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.js',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.js'), 'package_100_the_nodefile.js');

  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.js'
  ), 'rootname.css'), 'package_100_the_nodefile.css');
});

test('should return root-uid-generated public output path, when isconcat', () => {
  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : '',
    publicpath : '',
    isconcat : true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'rootname.css');
});

test('should return coorect public output path, given different path options', () => {
  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : '/final/output/path',
    publicpath : 'output',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), '/final/output/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : './output/path',
    publicpath : 'output',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : './output/path',
    publicpath : '/path',
    isconcat : false
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/package_100_the_nodefile.css');

  assert.strictEqual(scrounge_node.getoutputpathreal(scrounge_opts({
    outputpath : './output/path',
    publicpath : '/path',
    isconcat : true
  }), depgraph.node.get(
    '/path/to/the/nodefile.less',
    'console.log("hi")',
    'package-1.0.0:~/the/nodefile.mjs'
  ), 'rootname.css'), 'output/path/rootname.css');
});
