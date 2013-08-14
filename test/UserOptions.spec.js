var UserOptions = require('../lib/UserOptions'),
    compareobj = require('compareobj');

/*
describe("FileUtil.isPassingFilename", function () {
  var filenameMint = 'filename_mint.js';

  it("should pass a filename when no options are given", function () {
    expect( FileUtil.isPassingFilename(filenameMint, {}) ).toBe( true );
  });
});
*/

describe('UserOptions.optConvert.isTrue', function () {

  it("should return true for `'true'`", function () {
    expect( UserOptions.optConvert.isTrue('true') ).toBe( true );
  });

  it("should return true for `true`", function () {
    expect( UserOptions.optConvert.isTrue(true) ).toBe( true );
  });

  it("should return false for `null`", function () {
    expect( UserOptions.optConvert.isTrue(null) ).toBe( false );
  });

  it("should return false for `false`", function () {
    expect( UserOptions.optConvert.isTrue(false) ).toBe( false );
  });

  it("should return false for `'false'`", function () {
    expect( UserOptions.optConvert.isTrue('false') ).toBe( false );
  });

  it("should return false for `''`", function () {
    expect( UserOptions.optConvert.isTrue('') ).toBe( false );
  });

});


describe('UserOptions.optConvert.isFalse', function () {

  it("should return true for `'false'`", function () {
    expect( UserOptions.optConvert.isFalse('false') ).toBe( true );
  });

  it("should return true for `false`", function () {
    expect( UserOptions.optConvert.isFalse(false) ).toBe( true );
  });

  it("should return false for `null`", function () {
    expect( UserOptions.optConvert.isFalse(null) ).toBe( false );
  });

  it("should return false for `true`", function () {
    expect( UserOptions.optConvert.isFalse(true) ).toBe( false );
  });

  it("should return false for `'true'`", function () {
    expect( UserOptions.optConvert.isFalse('true') ).toBe( false );
  });

  it("should return false for `''`", function () {
    expect( UserOptions.optConvert.isFalse('') ).toBe( false );
  });

});


describe('UserOptions.optConvert.getAsBoolOrArr', function () {

  it("should return false for `'false'`", function () {
    expect( UserOptions.optConvert.getAsBoolOrArr('false') ).toBe( false );
  });

  it("should return false for `false`", function () {
    expect( UserOptions.optConvert.getAsBoolOrArr(false) ).toBe( false );
  });

  it("should return true for `'true'`", function () {
    expect( UserOptions.optConvert.getAsBoolOrArr('true') ).toBe( true );
  });

  it("should return true for `true`", function () {
    expect( UserOptions.optConvert.getAsBoolOrArr(true) ).toBe( true );
  });

  it("should return ['f'] for `f`", function () {
    var result = compareobj.isSameMembersDefined(UserOptions.optConvert.getAsBoolOrArr('f'), ['f']);
    expect( result ).toBe( true );
  });

  it("should return ['tree1', 'tree2'] for `'tree1,tree2`", function () {
    var result = compareobj.isSameMembersDefined(UserOptions.optConvert.getAsBoolOrArr('tree1,tree2'), ['tree1', 'tree2']);
    expect( result ).toBe( true );
  });

});