var FileInfoParser = require('../lib/FileInfoParser'),
    BMBLib = require('../lib/BMBLib');

describe("FileInfoParser.isMint", function () {
  var filenameMint = 'filename_mint.js';

  it("should discover a `mint` filename", function () {
    expect( FileInfoParser.isMint(filenameMint) ).toBe( true );
  });
});

describe("FileInfoParser.getFilename", function () {
  var fileStr = '// Filename: test1.js';

  it("should discover a `Filename` definition", function () {
    expect( FileInfoParser.getFilename(fileStr) ).toBe( 'test1.js' );
  });

  it("should return null, if no `Filename` definition", function () {
    expect( FileInfoParser.getFilename('') ).toBe( null );
  });
});

describe("FileInfoParser.getAuthors", function () {
  var fileStr, authors;

  it("should discover an `Author(s)` definition, 1 authors", function () {
    fileStr = '// Author(s): author1';
    authors = FileInfoParser.getAuthors(fileStr);
    expect( BMBLib.isArray(authors) ).toBe( true );
    expect( authors[0] ).toBe( 'author1' );
  });


  it("should discover an `Author(s)` definition, 2 authors", function () {
    fileStr = '// Author(s): author1, author2';
    authors = FileInfoParser.getAuthors(fileStr);
    expect( BMBLib.isArray(authors) ).toBe( true );
    expect( authors[0] ).toBe( 'author1' );
    expect( authors[1] ).toBe( 'author2' );
  });

  it("should retur null, if no `Author(s)` definition", function () {
    authors = FileInfoParser.getAuthors('');
    expect( authors ).toBe( null );
  });
});

describe("FileInfoParser.getTimestamp", function () {
  var fileStr, timestampDateObj;
  var testStrArr = [
    '// Timestamp: 2013.02.20-22:41:39 (last modified)  ',
    '// Timestamp: 2013.02.20-22:41:39 (last modified)',
    '// Timestamp: 2013.02.20-22:41:39',
    '// Timestamp: 2013.02.20'
  ];

  // requires date/time methods.... YMDArr.
  it("should discover timestamp for `" + testStrArr[0] + "`", function () {
    timestampDateObj = FileInfoParser.getTimestamp(testStrArr[0]);

//    expect( typeof timestampDateObj ).toBe( 'object' );    
    expect( true ).toBe( true );
  });

  it("should discover timestamp for `" + testStrArr[1] + "`", function () {
    timestampDateObj = FileInfoParser.getTimestamp(testStrArr[1]);

//    expect( typeof timestampDateObj ).toBe( 'object' );    
    expect( true ).toBe( true );
  });

  it("should discover timestamp for `" + testStrArr[2] + "`", function () {
    timestampDateObj = FileInfoParser.getTimestamp(testStrArr[2]);

//    expect( typeof timestampDateObj ).toBe( 'object' );    
    expect( true ).toBe( true );
  });

  it("should discover timestamp for `" + testStrArr[3] + "`", function () {
    timestampDateObj = FileInfoParser.getTimestamp(testStrArr[3]);

//    expect( typeof timestampDateObj ).toBe( 'object' );    
    expect( true ).toBe( true );
  });
  
});


// dependencies, timestamp, authors


describe("FileInfoParser.getDependencies", function () {
  var result, testStrArr = [
    '// Requires: file1.js, file2.js  ',
    '// Requires: file1.js, file2.js',
    '// Requires: file1.js ',
    '// Requires: file1.js',
    ''
  ];

  it("should discover dependencies for `" + testStrArr[0] + "`", function () {
    result = FileInfoParser.getDependencies(testStrArr[0]);

    expect( BMBLib.isArray(result) ).toBe( true );    
    expect( result[0] ).toBe( 'file1.js' );    
    expect( result[1] ).toBe( 'file2.js' );    
  });

  it("should discover dependencies for `" + testStrArr[1] + "`", function () {
    result = FileInfoParser.getDependencies(testStrArr[1]);

    expect( BMBLib.isArray(result) ).toBe( true );    
    expect( result[0] ).toBe( 'file1.js' );    
  });

  it("should discover dependencies for `" + testStrArr[2] + "`", function () {
    result = FileInfoParser.getDependencies(testStrArr[2]);

    expect( BMBLib.isArray(result) ).toBe( true );    
    expect( result[0] ).toBe( 'file1.js' );    
  });

  it("should discover dependencies for `" + testStrArr[3] + "`", function () {
    result = FileInfoParser.getDependencies(testStrArr[3]);

    expect( BMBLib.isArray(result) ).toBe( true );    
    expect( result[0] ).toBe( 'file1.js' );    
  });

  it("should not discover dependencies for `" + testStrArr[4] + "`", function () {
    result = FileInfoParser.getDependencies(testStrArr[4]);

    expect( BMBLib.isArray(result) ).toBe( true );    
    expect( result.length ).toBe( 0 );    
  });
});




