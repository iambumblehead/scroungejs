// Filename: scrounge_node.spec.js
// Timestamp: 2018.04.08-13:52:24 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const depgraph = require('depgraph'),

      scrounge_node = require('../src/scrounge_node'),
      scrounge_opts = require('../src/scrounge_opts');

describe('scrounge_node.getoutputpathpublic', () => {
  it('should return public output path', () => {
    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.js',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.js'
    ), 'rootname.js'))
      .toBe('package_100_the_nodefile.js');

    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.js'
    ), 'rootname.css'))
      .toBe('package_100_the_nodefile.css');
  });

  it('should return root-uid-generated public output path, when isconcat', () => {
    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : true
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('rootname.css');
  });

  it('should return coorect public output path, given different path options', () => {
    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : '/final/output/path',
      publicpath : 'output',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('output/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : './output/path',
      publicpath : 'output',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('output/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : './output/path',
      publicpath : '/path',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathpublic(scrounge_opts({
      outputpath : './output/path',
      publicpath : '/path',
      isconcat : true
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('/path/rootname.css');
  });
});

describe('scrounge_node.getoutputpathreal', () => {
  it('should return public output path', () => {
    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.js',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.js'
    ), 'rootname.js'))
      .toBe('package_100_the_nodefile.js');

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.js'
    ), 'rootname.css'))
      .toBe('package_100_the_nodefile.css');
  });

  it('should return root-uid-generated public output path, when isconcat', () => {
    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : '',
      publicpath : '',
      isconcat : true
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('rootname.css');
  });

  it('should return coorect public output path, given different path options', () => {

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : '/final/output/path',
      publicpath : 'output',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('/final/output/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : './output/path',
      publicpath : 'output',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('output/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : './output/path',
      publicpath : '/path',
      isconcat : false
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('output/path/package_100_the_nodefile.css');

    expect(scrounge_node.getoutputpathreal(scrounge_opts({
      outputpath : './output/path',
      publicpath : '/path',
      isconcat : true
    }), depgraph.node.get(
      '/path/to/the/nodefile.less',
      'console.log("hi")',
      'package-1.0.0:~/the/nodefile.mjs'
    ), 'rootname.css'))
      .toBe('output/path/rootname.css');
  });
});
