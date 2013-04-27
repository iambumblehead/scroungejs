var FileUtil = require('../lib/FileUtil');

describe("FileUtil.isPassingFilename", function () {
  var filenameMint = 'filename_mint.js';

  it("should pass a filename when no options are given", function () {
    expect( FileUtil.isPassingFilename(filenameMint, {}) ).toBe( true );
  });
});

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
});
