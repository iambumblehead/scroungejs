
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


describe("getScroungeElemTplStr", function () {

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

  it("should return 1 trees from string with 1 scrounge elements, 1 trees", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrOne_treeOne);
    expect( treeArr[0] === 'one').toBe(true);
  });

  it("should return 2 trees from string with 2 scrounge elements, 2 trees", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrTwo_treeTwo);
    expect( treeArr[0] === 'one' && treeArr[1] === 'two').toBe(true);
  });

  it("should return 0 trees from string with 2 scrounge elements, 0 trees", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrOne_treeNone);
    expect( treeArr.length === 0 ).toBe(true);
  });

  it("should return 0 trees from string with 1 scrounge elements, 0 trees", function () {
    treeArr = ScroungeElement.getFromStrTreesArr(strTrees_attrOne_treeNone);
    expect( treeArr.length === 0 ).toBe(true);
  });

});


describe("isTreeMatch", function () {
  var scroungeElemObj, treeObj;
  
  scroungeElemObj = ScroungeElement.getNew({
    trees : ['treeOne', 'treeTwo'],
    type : 'css'
  });

  it("should return false when treename not defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeThree',
      type : 'css'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(false);
  });


  it("should return true when treename is defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeTwo',
      type : 'css'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(true);
  });

  it("should return false when type is not defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeTwo',
      type : 'js'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(false);
  });
});

describe("getTreeAttributeStr", function () {
  var scroungeElemObj, treeAttr;

  it("should return a correct treeAttribute for 2 trees", function () {
    scroungeElemObj = ScroungeElement.getNew({
      trees : ['treeOne', 'treeTwo']
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( ' trees="treeOne,treeTwo"' );
  });

  it("should return a correct treeAttribute for 1 trees", function () {
    scroungeElemObj = ScroungeElement.getNew({
      trees : ['treeOne']
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( ' trees="treeOne"' );
  });

  it("should return a correct treeAttribute for 0 trees", function () {
    scroungeElemObj = ScroungeElement.getNew({
      trees : []
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( '' );
  });

});

describe("getScroungeElemStr", function () {
  var scroungeElemObj, scroungeElemStr, finStr;
  it("should return a correct element with includeElemsStr", function () {
    scroungeElemObj = ScroungeElement.getNew({
      type : 'js'
    });

    scroungeElemStr = scroungeElemObj.getScroungeElemStr('__str__');
    finStr = '' +
      '<!-- <scrounge.js> -->' +
      '\n__str__\n' + 
      '<!-- </scrounge> -->';      

    expect( scroungeElemStr ).toBe( finStr );
  });


  it("should return a correct element without includeElemsStr", function () {
    scroungeElemObj = ScroungeElement.getNew({
      type : 'js'
    });

    scroungeElemStr = scroungeElemObj.getScroungeElemStr('');
    finStr = '' +
      '<!-- <scrounge.js> -->' +
      '\n\n' + 
      '<!-- </scrounge> -->';      

    expect( scroungeElemStr ).toBe( finStr );
  });

});


