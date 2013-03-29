
var ScroungeElement = require('../lib/ScroungeElement'),
    BMBLib = require('../lib/BMBLib');

var markupStr_scroungeElements_treesNone_typeJS_valid = '' +
  '   <!-- <scrounge.js> -->' + 
  '\n   <!-- </scrounge> -->';

var markupStr_scroungeElements_treesTwo_typeJS_valid = '' +
  '   <!-- <scrounge.js trees="one,two"> -->' + 
  '\n   <!-- </scrounge> -->';

var markupStr_scroungeElements_treesNone_typeCSS_valid = '' +
  '   <!-- <scrounge.css> -->' + 
  '\n   <!-- </scrounge> -->';

describe("ScroungeElement.getFromMarkup", function () {
  
  it("should return objArr from scroungeElements_treesNone_typeJS_valid", function () {
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


  it("should return objArr from scroungeElements_treesTwo_typeJS_valid", function () {
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


describe("getElemIndentation", function () {
  it("should return whitespace indentation", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          elem : '   <!-- <scrounge.js> -->'
        });

    expect( scroungeElemObj.getElemIndentation() ).toBe( '   ' );
  });

  it("should return whitespace indentation", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          elem : '<!-- <scrounge.js> -->'
        });

    expect( scroungeElemObj.getElemIndentation() ).toBe( '' );
  });
});

describe("getElemIncludeTplStr", function () {

  it("should return correct script include element, js", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          type : 'js'
        }),
        includeTplStr = scroungeElemObj.getElemIncludeTplStr(),
        includeTplStrJS = '<script src="$" type="text/javascript"></script>';
    
    expect( includeTplStr ).toBe( includeTplStrJS );
  });

  it("should return correct script include element, css", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          type : 'css'
        }),
        includeTplStr = scroungeElemObj.getElemIncludeTplStr(),
        includeTplStrCSS = '<link href="$" rel="stylesheet" type="text/css">';
    
    expect( includeTplStr ).toBe( includeTplStrCSS );
  });

});


describe("getElemScroungeTplStr", function () {

  it("should return correct scrounge element, js", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          type : 'js'
        }),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '<!-- <scrounge.js$tree> -->',
        isElemFin = scroungeElemTplStr.indexOf(scroungeElemTplStrFin) !== -1;

    expect( isElemFin ).toBe( true );    
  });

  it("should return correct scrounge element, css", function () {
    var str = markupStr_scroungeElements_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElement.getNew({
          type : 'css'
        }),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '<!-- <scrounge.css$tree> -->',
        isElemFin = scroungeElemTplStr.indexOf(scroungeElemTplStrFin) !== -1;

    expect( isElemFin ).toBe( true );    
  });


  it("should return correctly indented scrounge element", function () {
    var scroungeElemObj = ScroungeElement.getFromStrScroungeElemObj('   <!-- <scrounge.js> --->'),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '' +
          '   <!-- <scrounge.js$tree> -->' +
          '\n$tags\n' +
          '   <!-- </scrounge> -->';

    expect( scroungeElemTplStr ).toBe( scroungeElemTplStrFin );    

    scroungeElemObj = ScroungeElement.getFromStrScroungeElemObj(' <!-- <scrounge.js> --->');
    scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr();
    scroungeElemTplStrFin = '' +
      ' <!-- <scrounge.js$tree> -->' +
      '\n$tags\n' +
      ' <!-- </scrounge> -->';

    expect( scroungeElemTplStr ).toBe( scroungeElemTplStrFin );    
  });


});


describe("getFromStrTreesArr", function () {

  var strTrees_attrNone_treeNone = '' +
    '   <!-- <scrounge.js> -->\n' +
    '   <!-- </scrounge> -->',
      strTrees_attrOne_treeNone = '' + 
    '   <!-- <scrounge.js trees=""> -->\n' +
    '   <!-- </scrounge> -->',
      strTrees_attrOne_treeOne = '' + 
    '   <!-- <scrounge.js trees="one"> -->\n' +
    '   <!-- </scrounge> -->',
      strTrees_attrOne_treetwo = '' + 
    '   <!-- <scrounge.js trees="one,two"> -->\n' +
    '   <!-- </scrounge> -->',
      strTrees_attrTwo_treeTwo = '' + 
    '   <!-- <scrounge.js trees="one"> -->\n' +
    '   <!-- </scrounge> -->\n' +
    '   <!-- <scrounge.js trees="two"> -->\n' +
    '   <!-- </scrounge> -->',
      treeArr;

  it("should return trees from string with one scrounge element", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrOne_treeOne);
    expect( treeArr[0] === 'one').toBe(true);
  });

  it("should return trees from string with two scrounge elements", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrTwo_treeTwo);
    expect( treeArr[0] === 'one' && treeArr[1] === 'two').toBe(true);
  });

  it("should return no trees from string with two scrounge elements and no trees", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrOne_treeNone);
    expect( treeArr.length === 0 ).toBe(true);
  });



});