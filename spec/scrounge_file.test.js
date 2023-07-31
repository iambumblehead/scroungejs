// Filename: scrounge_file.spec.js
// Timestamp: 2018.04.08-02:01:29 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'

import scrounge_file from '../src/scrounge_file.js'

test('should return `{ outputpath: "./hey" }`, "/path/to/file.js" as "./hey/file.js"', () => {
  assert.strictEqual(
    scrounge_file.setoutputpath({
      outputpath : './hey'
    }, '/path/to/file.js')
    , './hey/file.js');
});

test('should return smart public paths', () => {
  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : './public'
    }, '/path/to/public/type/file.js')
    , './public/type/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : '/public/'
    }, '/path/to/public/type/file.js')
    , '/public/type/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : 'public/'
    }, '/path/to/public/type/file.js')
    , 'public/type/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : '/'
    }, '/path/to/public/type/file.js')
    , '/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : '/blic/'
    }, '/path/to/public/type/file.js')
    , '/blic/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : 'blic/'
    }, '/path/to/public/type/file.js')
    , 'blic/file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : ''
    }, '/path/to/public/type/file.js')
    , 'file.js');

  assert.strictEqual(
    scrounge_file.setpublicpath({
      publicpath : 'glob'
    }, '/path/to/public/type/file.js')
    , 'glob/file.js');
});

test('should return unconcatenated paths, with uid', () => {
  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : false,
      publicpath : './public',
      outputpath : 'to/public/dir'
    }, '/path/to/file.js', 'uid')
    , './public/dir/uid.js');
});

test('should return concatenated paths, without uid', () => {
  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : './public',
      outputpath : 'to/public/dir'
    }, '/path/to/file.js', 'uid')
    , './public/dir/file.js');
});

test('should return smart public paths', () => {
  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : './public',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , './public/dir/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : '/public/',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , '/public/dir/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : 'public/',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , 'public/dir/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : '/',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , '/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : '/blic/',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , '/blic/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : 'blic/',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , 'blic/file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : '',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , 'file.js');

  assert.strictEqual(
    scrounge_file.setpublicoutputpath({
      isconcat : true,
      publicpath : 'glob',
      outputpath : 'to/public/dir'
    }, '/path/to/public/type/file.js', 'uid')
    , 'glob/file.js');
});

test('should return inputpath-removed path', () => {
  assert.strictEqual(
    scrounge_file.rminputpath({
      inputpath : './path'
    }, path.resolve('./path/to/file.js'))
    , 'to/file.js');

  assert.strictEqual(
    scrounge_file.rminputpath({
      inputpath : './path/'
    }, path.resolve('./path/to/file.js'))
    , 'to/file.js');
});