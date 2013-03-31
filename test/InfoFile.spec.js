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
      expect( res.dependencyArr[6] ).toBe( 'ViewNavTop.js' );
      expect( typeof res.timestamp ).toBe( 'object' );
      expect( res.authors[0] ).toBe( 'Bumblehead (www.bumblehead.com)' );

      done();
    });
  });
  
});


describe("infoFileObj.getBasenameStr", function () {  
  var infoFile;

  it("should return the basename of the file", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    expect( infoFile.getBaseNameStr() ).toBe( "script.js" );
  });
  
  it("should return the basename of the file, w/out `_mint` affix", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script_mint.js" });
    expect( infoFile.getBaseNameStr() ).toBe( "script.js" );
  });

  it("should return the basename of the file, w/out `_cmpr` affix", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script_mint.js" });
    expect( infoFile.getBaseNameStr() ).toBe( "script.js" );
  });

});

describe("infoFile.getMintNameStr", function () {
  var infoFile;
  it("should return the `_mint` affixed name of the file", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    expect( infoFile.getMintNameStr() ).toBe( "script_mint.js" );
  });
});

describe("infoFile.getCmprNameStr", function () {
  var infoFile, params, isTimestamped, result,
      dateRe = new RegExp('\\d{4}\\.\\\d{2}\\.\\d{2}'),
      timeRe = new RegExp('\\d{2}:\\d{2}:\\d{2}');

  it("should return the vanilla filename of the file, if no timestamp", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = {};
    expect( infoFile.getCmprNameStr(params) ).toBe( "script.js" );
  });

  it("should return the timestamp filename of the file, if timestamp", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = { 
      isTimestamped : true 
    };
    result = infoFile.getCmprNameStr(params);
    isTimestamped = result.match(dateRe) && 
                    result.match(timeRe) ? true : false;

    expect( isTimestamped ).toBe( true );
  });

  it("should return the timestamp filename of the file, if timestamp is forced", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = { 
      isTimestamped : true,
      forceTimestamp : 'forced' 
    };
    result = infoFile.getCmprNameStr(params);
    expect( result ).toBe( "script_forced.js" );
  });
});

describe("infoFile.getPublicPathStr", function () {
  var infoFile, params, result;

  it("should return path of file, when public path is undefined", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = {};
    result = infoFile.getPublicPathStr(params);
    expect( result ).toBe( "script.js" );
  });

  it("should return path of file, when public path is defined", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = { outputPath : '/output/path'};
    result = infoFile.getPublicPathStr(params);
    expect( result ).toBe( "/output/path/script.js" );
  });
});


describe("infoFile.getFilenameRe", function () {
  var infoFile, params, result;

  it("should return a RE for matching filename", function () {  
    infoFile = InfoFile.getNew({ filename : "/path/to/script.js" });
    params = { forceTimestamp : 'FORCE'};
    result = infoFile.getFilenameRe(params);
//    console.log('our re ', result);
//    expect( result ).toBe( "/output/path/script.js" );
  });
});

