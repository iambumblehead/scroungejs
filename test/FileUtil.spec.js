var FileUtil = require('../lib/FileUtil'),
    path = require('path');

/*
describe("FileUtil.isPassingFilename", function () {
  var filenameMint = 'filename_mint.js';

  it("should pass a filename when no options are given", function () {
    expect( FileUtil.isPassingFilename(filenameMint, {}) ).toBe( true );
  });
});
*/

describe("FileUtil.getTreeFiles", function () {

  it("should return an array of files found in a specified directory", function (done) {  
    var testPath1 = path.join(__dirname, './testfiles');

    FileUtil.getTreeFiles({
      extnType : '.js',
      isRecursive : true,
      inputPathArr : [
        testPath1
      ]
    }, function (err, fileArr) {
    
          var result = fileArr.indexOf(path.join(testPath1, 'fileB.js')) !== -1 &&
                       fileArr.indexOf(path.join(testPath1, 'fileA.js')) !== -1 &&
                       fileArr.indexOf(path.join(testPath1, 'subdirB/subdirBfileB.js')) !== -1 &&
                       fileArr.indexOf(path.join(testPath1, 'subdirA/subdirAfileA.js')) !== -1 &&
                       fileArr.indexOf(path.join(testPath1, 'fileSingle.js')) !== -1;

      expect( result ).toBe( true );
      
      done();
    });
  });

  it("should return an array of files found in multiple specified directory", function (done) {  
    var testPath1 = path.join(__dirname, './testfiles/subdirB');
    var testPath2 = path.join(__dirname, './testfiles/subdirA');

    FileUtil.getTreeFiles({
      extnType : '.js',
      isRecursive : true,
      inputPathArr : [
        testPath1,
        testPath2
      ]
    }, function (err, fileArr) {


      var result = fileArr.indexOf(path.join(testPath1, 'subdirBfileB.js')) !== -1 &&
                   fileArr.indexOf(path.join(testPath2, 'subdirAfileA.js')) !== -1;

      expect( result ).toBe( true );
      
      done();
    });
  });

  it("should return an error when opts.inputPathArr is not defined as an array", function (done) {  

    FileUtil.getTreeFiles({
      extnType : '.js',
      isRecursive : true
    }, function (err, fileArr) {
      var result = typeof err === 'object';
      expect( result ).toBe( true );
      
      done();
    });
  });

});

/*
describe("FileUtil.getPublicPath", function () {
  //var filenameMint = 'filename_mint.js';

  it("should return a syspath on given public path", function () {
    var sysPath = "/Users/chrisdep/Software/foxsportscms/trunk/fscom/src/main/webapp/js/janrain/JRLFBundle/PkTime.js";
    var pubPath = "/js";
    
    expect( FileUtil.getPublicPath(sysPath, pubPath) ).toBe( "/js/janrain/JRLFBundle/PkTime.js" );
  });

  it("should return a syspath on given public path, even when public path has parent dirs not found on syspath", function () {
    var sysPath = "/Users/chrisdep/Software/foxsportscms/trunk/fscom/src/main/webapp/js/janrain/JRLFBundle/PkTime.js";
    var pubPath = "/fe/js";
    
    expect( FileUtil.getPublicPath(sysPath, pubPath) ).toBe( "/fe/js/janrain/JRLFBundle/PkTime.js" );
  });

  it("should return a syspath on given public path, even when public path is on an fqdn", function () {
    var sysPath = "/Users/chrisdep/Software/foxsportscms/trunk/fscom/src/main/webapp/js/janrain/JRLFBundle/PkTime.js";
    var pubPath = "https://www.google.com/fe/js";
    
    expect( FileUtil.getPublicPath(sysPath, pubPath) ).toBe( "https://www.google.com/fe/js/janrain/JRLFBundle/PkTime.js" );
  });
});
*/
