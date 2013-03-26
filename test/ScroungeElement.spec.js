
var ScroungeElement = require('../lib/ScroungeElement'),
    BMBLib = require('../lib/BMBLib');

var markupStr_scroungeElements_treesNone_typeJS_valid = '' +
  '   <!-- <scrounge.js> -->' + 
  '\n   <!-- </scrounge> -->';

var markupStr_scroungeElements_treesTwo_typeJS_valid = '' +
  '   <!-- <scrounge.js trees="one,two"> -->' + 
  '\n   <!-- </scrounge> -->';

describe("ScroungeElement.getFromMarkup", function () {
  
  it("should return objArr from string w/ scroungeElements", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObjArr = ScroungeElement.getFromStrScroungeElemObjArr(str),
        scroungeElemObj;

    expect( BMBLib.isArray(scroungeElemObjArr) ).toBe( true );

    scroungeElemObj = scroungeElemObjArr[0];

    expect( typeof scroungeElemObj ).toBe( 'object' );
    expect( scroungeElemObj.elem ).toBe( str );
    expect( BMBLib.isArray(scroungeElemObj.trees) ).toBe( true );
    expect( scroungeElemObj.trees.length ).toBe( 0 );
    expect( scroungeElemObj.type ).toBe( 'js' );
  });


  it("should return objArr w/trees from string w/ scroungeElements w/trees", function () {
    var str = markupStr_scroungeElements_treesTwo_typeJS_valid,
        scroungeElemObjArr = ScroungeElement.getFromStrScroungeElemObjArr(str),
        scroungeElemObj;

    expect( BMBLib.isArray(scroungeElemObjArr) ).toBe( true );

    scroungeElemObj = scroungeElemObjArr[0];
    
    expect( typeof scroungeElemObj ).toBe( 'object' );
    expect( scroungeElemObj.elem ).toBe( str );
    expect( BMBLib.isArray(scroungeElemObj.trees) ).toBe( true );
    expect( scroungeElemObj.trees.length ).toBe( 2 );
    expect( scroungeElemObj.type ).toBe( 'js' );
  });

});