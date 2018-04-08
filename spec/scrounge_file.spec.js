// Filename: scrounge_file.spec.js
// Timestamp: 2018.04.08-01:41:53 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),

      scrounge_file = require('../src/scrounge_file');

describe('scrounge_file.setoutputpath', () => {
  it('should return `{ outputpath: "./hey" }`, "/path/to/file.js" as "./hey/file.js"', () => {
    expect(
      scrounge_file.setoutputpath({
        outputpath : './hey'
      }, '/path/to/file.js')
    ).toBe('./hey/file.js');
  });
});

describe('scrounge_file.setpublicpath', () => {
  it('should return smart public paths', () => {
    expect(
      scrounge_file.setpublicpath({
        publicpath : './public'
      }, '/path/to/public/type/file.js')
    ).toBe('./public/type/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : '/public/'
      }, '/path/to/public/type/file.js')
    ).toBe('/public/type/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : 'public/'
      }, '/path/to/public/type/file.js')
    ).toBe('public/type/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : '/'
      }, '/path/to/public/type/file.js')
    ).toBe('/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : '/blic/'
      }, '/path/to/public/type/file.js')
    ).toBe('/blic/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : 'blic/'
      }, '/path/to/public/type/file.js')
    ).toBe('blic/file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : ''
      }, '/path/to/public/type/file.js')
    ).toBe('file.js');

    expect(
      scrounge_file.setpublicpath({
        publicpath : 'glob'
      }, '/path/to/public/type/file.js')
    ).toBe('glob/file.js');
  });
});

describe('scrounge_file.setpublicoutputpath', () => {
  it('should return unconcatenated paths, with uid"', () => {
    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : false,
        publicpath : './public',
        outputpath : 'to/public/dir'
      }, '/path/to/file.js', 'uid')
    ).toBe('./public/dir/uid.js');
  });

  it('should return concatenated paths, without uid"', () => {
    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : './public',
        outputpath : 'to/public/dir'
      }, '/path/to/file.js', 'uid')
    ).toBe('./public/dir/file.js');
  });

  it('should return smart public paths', () => {
    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : './public',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('./public/dir/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : '/public/',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('/public/dir/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : 'public/',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('public/dir/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : '/',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : '/blic/',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('/blic/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : 'blic/',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('blic/file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : '',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('file.js');

    expect(
      scrounge_file.setpublicoutputpath({
        isconcat : true,
        publicpath : 'glob',
        outputpath : 'to/public/dir'
      }, '/path/to/public/type/file.js', 'uid')
    ).toBe('glob/file.js');
  });
});

describe('scrounge_file.rminputpath', () => {
  it('should return inputpath-removed path"', () => {
    expect(
      scrounge_file.rminputpath({
        inputpath : './path'
      }, path.resolve('./path/to/file.js'))
    ).toBe('to/file.js');

    expect(
      scrounge_file.rminputpath({
        inputpath : './path/'
      }, path.resolve('./path/to/file.js'))
    ).toBe('to/file.js');
  });
});
