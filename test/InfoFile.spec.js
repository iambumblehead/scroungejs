var InfoFile = require('../lib/InfoFile'),
    PkLib = require('../lib/BMBLib');

describe("InfoFile.getNew", function () {
  var infoFileObj;

  it("should construct an object with params, all", function () {
    infoFileObj = InfoFile.getNew({
      filename : 'filename',
      treename : 'treename',
      type : 'type',
      dependencyArr : ['one', 'two'],
      timestamp : new Date(),
      authors : 'authors'
    });

    expect( typeof infoFileObj ).toBe( 'object' );
    expect( infoFileObj.filename ).toBe( 'filename' );
    expect( infoFileObj.treename ).toBe( 'treename' );
    expect( infoFileObj.type ).toBe( 'type' );
    expect( PkLib.isArray(infoFileObj.dependencyArr) ).toBe( true );
    expect( infoFileObj.dependencyArr[0] ).toBe( 'one' );
    expect( infoFileObj.dependencyArr[1] ).toBe( 'two' );
    expect( typeof infoFileObj.timestamp ).toBe( 'object' );
    expect( infoFileObj.authors ).toBe( 'authors' );
  });

  it("should construct an object with params, none", function () {
    infoFileObj = InfoFile.getNew({});

    expect( typeof infoFileObj ).toBe( 'object' );
    expect( infoFileObj.filename ).toBe( null );
    expect( infoFileObj.treename ).toBe( null );
    expect( infoFileObj.type ).toBe( null );
    expect( PkLib.isArray(infoFileObj.dependencyArr) ).toBe( true );
    expect( infoFileObj.dependencyArr.length ).toBe( 0 );
    expect( typeof infoFileObj.timestamp ).toBe( 'object' );
    expect( infoFileObj.authors ).toBe( null );
  });

});

describe("InfoFile.getFromFile", function () {  
  // clone info file to allow safe definition of `readFile` used by this method
  var cInfoFile = Object.create(InfoFile),
      filePath = '/test/FilePath.js';

  var files = {
    '/test/allPropsDefined.js' : '' +
      '// Filename: Session.js  \n' +
      '// Timestamp: 2013.02.20-22:41:39 (last modified)  \n' +
      '// Author(s): Bumblehead (www.bumblehead.com)  \n' +
      '// Requires: PkLib.js, User.js, ScreenLayer.js, ViewCanvas.js, Crypto.js,' +
      '// Cookie.js, ViewNavTop.js'
  };


  cInfoFile.readFile = function (filename, fn) {
    fn(null, files[filename]);
  };

  it("should construct an object with file-given params, all", function (done) {  
    cInfoFile.getFromFile('/test/allPropsDefined.js', function (err, res) {
      expect( typeof res ).toBe( 'object' );      
      expect( res.filename ).toBe( '/test/allPropsDefined.js' );
      expect( res.treename ).toBe( 'Session.js' );
      expect( res.type ).toBe( '.js' );
      expect( PkLib.isArray( res.dependencyArr) ).toBe( true );
      expect( res.dependencyArr[0] ).toBe( 'PkLib.js' );
      console.log(res.dependencyArr);
      expect( res.dependencyArr[6] ).toBe( 'ViewNavTop.js' );
      expect( typeof res.timestamp ).toBe( 'object' );
      expect( res.authors[0] ).toBe( 'Bumblehead (www.bumblehead.com)' );

      done();
    });
  });
  
});


describe("infoFileObj.getBasenameStr", function () {  
  
  it("should return the basename of the file", function (done) {  
    expect( true ).toBe( true );
  });
});


//describe("infoFile.getMintFilename", function () {
//});
