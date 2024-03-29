import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'

import scr_file from '../src/scr_file.js'
import scr_opts from '../src/scr_opts.js'

test('return lead on outputpath "/path/to/file.js" as "./hey/file.js"', () => {
  assert.strictEqual(
    scr_file.setoutputpath(({//scr_opts({
      metaurl: import.meta.url,
      outputpath: './hey'
    }), '/path/to/file.js')
    , './hey/file.js')
})

test('should return smart public paths', () => {
  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: './public'
    }), '/path/to/public/type/file.js')
    , './public/type/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: '/public/'
    }), '/path/to/public/type/file.js')
    , '/public/type/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: 'public/'
    }), '/path/to/public/type/file.js')
    , 'public/type/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: '/'
    }), '/path/to/public/type/file.js')
    , '/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: '/blic/'
    }), '/path/to/public/type/file.js')
    , '/blic/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: 'blic/'
    }), '/path/to/public/type/file.js')
    , 'blic/file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: ''
    }), '/path/to/public/type/file.js')
    , 'file.js')

  assert.strictEqual(
    scr_file.setpublicpath(scr_opts({
      metaurl: import.meta.url,
      publicpath: 'glob'
    }), '/path/to/public/type/file.js')
    , 'glob/file.js')
})

test('should return unconcatenated paths, with uid', () => {
  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: false,
      publicpath: './public',
      outputpath: 'to/public/dir'
    }), '/path/to/file.js', 'uid')
    , './public/dir/uid.js')
})

test('should return concatenated paths, without uid', () => {
  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: './public',
      outputpath: 'to/public/dir'
    }), '/path/to/file.js', 'uid')
    , './public/dir/file.js')
})

test('should return smart public paths', () => {
  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: './public',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , './public/dir/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: '/public/',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , '/public/dir/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: 'public/',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , 'public/dir/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: '/',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , '/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: '/blic/',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , '/blic/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: 'blic/',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , 'blic/file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: '',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , 'file.js')

  assert.strictEqual(
    scr_file.setpublicoutputpath(scr_opts({
      metaurl: import.meta.url,
      isconcat: true,
      publicpath: 'glob',
      outputpath: 'to/public/dir'
    }), '/path/to/public/type/file.js', 'uid')
    , 'glob/file.js')
})

test('should return inputpath-removed path', () => {
  assert.strictEqual(
    scr_file.rminputpath(({
      // metaurl: import.meta.url,
      inputpath: './path'
    }), path.resolve('./path/to/file.js'))
    , 'to/file.js')

  assert.strictEqual(
    scr_file.rminputpath(({
      // metaurl: import.meta.url,
      inputpath: './path/'
    }), path.resolve('./path/to/file.js'))
    , 'to/file.js')
})
