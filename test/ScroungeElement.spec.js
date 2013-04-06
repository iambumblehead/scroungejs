var ScroungeElem = require('../lib/ScroungeElem'),
    FileInfoTree = require('../lib/fileInfo/fileInfoTree'),
    FileInfoNode = require('../lib/fileInfo/fileInfoNode'),
    UserOptions = require('../lib/UserOptions'),
    BMBLib = require('../lib/BMBLib');

var markupStr_scroungeElems_treesNone_typeJS_valid = '' +
  '   <!-- <scrounge.js> -->' + 
  '\n   <!-- </scrounge> -->';

var markupStr_scroungeElems_treesTwo_typeJS_valid = '' +
  '   <!-- <scrounge.js trees="one,two"> -->' + 
  '\n   <!-- </scrounge> -->';

var markupStr_scroungeElems_treesNone_typeCSS_valid = '' +
  '   <!-- <scrounge.css> -->' + 
  '\n   <!-- </scrounge> -->';

describe("ScroungeElem.getFromMarkup", function () {
  
  it("should return objArr from scroungeElems_treesNone_typeJS_valid", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObjArr = ScroungeElem.getFromStrScroungeElemObjArr(str),
        scroungeElemObj;

    expect( BMBLib.isArray(scroungeElemObjArr) ).toBe( true );

    scroungeElemObj = scroungeElemObjArr[0];

    expect( typeof scroungeElemObj ).toBe( 'object' );
    expect( scroungeElemObj.elem ).toBe( str );
    expect( BMBLib.isArray(scroungeElemObj.trees) ).toBe( true );
    expect( scroungeElemObj.trees.length ).toBe( 0 );
    expect( scroungeElemObj.type ).toBe( '.js' );
  });


  it("should return objArr from scroungeElems_treesTwo_typeJS_valid", function () {
    var str = markupStr_scroungeElems_treesTwo_typeJS_valid,
        scroungeElemObjArr = ScroungeElem.getFromStrScroungeElemObjArr(str),
        scroungeElemObj;

    expect( BMBLib.isArray(scroungeElemObjArr) ).toBe( true );

    scroungeElemObj = scroungeElemObjArr[0];
    
    expect( typeof scroungeElemObj ).toBe( 'object' );
    expect( scroungeElemObj.elem ).toBe( str );
    expect( BMBLib.isArray(scroungeElemObj.trees) ).toBe( true );
    expect( scroungeElemObj.trees.length ).toBe( 2 );
    expect( scroungeElemObj.type ).toBe( '.js' );
  });
});


describe("scroungeElem.getElemIndentation", function () {
  it("should return whitespace indentation", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          elem : '   <!-- <scrounge.js> -->'
        });

    expect( scroungeElemObj.getElemIndentation() ).toBe( '   ' );
  });

  it("should return whitespace indentation", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          elem : '<!-- <scrounge.js> -->'
        });

    expect( scroungeElemObj.getElemIndentation() ).toBe( '' );
  });
});

describe("scroungeElem.getElemIncludeTplStr", function () {

  it("should return correct script include element, js", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          type : '.js'
        }),
        includeTplStr = scroungeElemObj.getElemIncludeTplStr(),
        includeTplStrJS = '<script src="$" type="text/javascript"></script>';
    
    expect( includeTplStr ).toBe( includeTplStrJS );
  });

  it("should return correct script include element, css", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          type : '.css'
        }),
        includeTplStr = scroungeElemObj.getElemIncludeTplStr(),
        includeTplStrCSS = '<link href="$" rel="stylesheet" type="text/css">';
    
    expect( includeTplStr ).toBe( includeTplStrCSS );
  });

});


describe("scroungeElem.getScroungeElemTplStr", function () {

  it("should return correct scrounge element, js", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          type : '.js'
        }),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '<!-- <scrounge.js$tree> -->',
        isElemFin = scroungeElemTplStr.indexOf(scroungeElemTplStrFin) !== -1;

    expect( isElemFin ).toBe( true );    
  });

  it("should return correct scrounge element, css", function () {
    var str = markupStr_scroungeElems_treesNone_typeJS_valid,
        scroungeElemObj = ScroungeElem.getNew({
          type : '.css'
        }),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '<!-- <scrounge.css$tree> -->',
        isElemFin = scroungeElemTplStr.indexOf(scroungeElemTplStrFin) !== -1;

    expect( isElemFin ).toBe( true );    
  });


  it("should return correctly indented scrounge element", function () {
    var scroungeElemObj = ScroungeElem.getFromStrScroungeElemObj('   <!-- <scrounge.js> --->'),
        scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr(),
        scroungeElemTplStrFin = '' +
          '   <!-- <scrounge.js$tree> -->' +
          '\n$tags\n' +
          '   <!-- </scrounge> -->';

    expect( scroungeElemTplStr ).toBe( scroungeElemTplStrFin );    

    scroungeElemObj = ScroungeElem.getFromStrScroungeElemObj(' <!-- <scrounge.js> --->');
    scroungeElemTplStr = scroungeElemObj.getScroungeElemTplStr();
    scroungeElemTplStrFin = '' +
      ' <!-- <scrounge.js$tree> -->' +
      '\n$tags\n' +
      ' <!-- </scrounge> -->';

    expect( scroungeElemTplStr ).toBe( scroungeElemTplStrFin );    
  });


});


describe("ScroungeElem.getFromStrTreesArr", function () {

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
    treeArr = ScroungeElem.getFromStrTreesArr(strTrees_attrOne_treeOne);
    expect( treeArr[0] === 'one').toBe(true);
  });

  it("should return 2 trees from string with 2 scrounge elements, 2 trees", function () {
    treeArr = ScroungeElem.getFromStrTreesArr(strTrees_attrTwo_treeTwo);
    expect( treeArr.indexOf('one') !== -1 && 
            treeArr.indexOf('two') !== -1);
  });

  it("should return 0 trees from string with 2 scrounge elements, 0 trees", function () {
    treeArr = ScroungeElem.getFromStrTreesArr(strTrees_attrOne_treeNone);
    expect( treeArr.length === 0 ).toBe(true);
  });

  it("should return 0 trees from string with 1 scrounge elements, 0 trees", function () {
    treeArr = ScroungeElem.getFromStrTreesArr(strTrees_attrOne_treeNone);
    expect( treeArr.length === 0 ).toBe(true);
  });

});


describe("scroungeElem.isTreeMatch", function () {
  var scroungeElemObj, treeObj;
  
  scroungeElemObj = ScroungeElem.getNew({
    trees : ['treeOne', 'treeTwo'],
    type : '.css'
  });

  it("should return false when treename not defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeThree',
      type : '.css'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(false);
  });


  it("should return true when treename is defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeTwo',
      type : '.css'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(true);
  });

  it("should return false when type is not defined in scroungeElem", function () {
    treeObj = {
      treename : 'treeTwo',
      type : '.js'
    };

    expect( scroungeElemObj.isTreeMatch(treeObj) ).toBe(false);
  });
});

describe("scroungeElem.getTreeAttributeStr", function () {
  var scroungeElemObj, treeAttr;

  it("should return a correct treeAttribute for 2 trees", function () {
    scroungeElemObj = ScroungeElem.getNew({
      trees : ['treeOne', 'treeTwo']
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( ' trees="treeOne,treeTwo"' );
  });

  it("should return a correct treeAttribute for 1 trees", function () {
    scroungeElemObj = ScroungeElem.getNew({
      trees : ['treeOne']
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( ' trees="treeOne"' );
  });

  it("should return a correct treeAttribute for 0 trees", function () {
    scroungeElemObj = ScroungeElem.getNew({
      trees : []
    });  

    treeAttr = scroungeElemObj.getTreeAttributeStr();

    expect( treeAttr ).toBe( '' );
  });

});

describe("scroungeElem.getScroungeElemStr", function () {
  var scroungeElemObj, scroungeElemStr, finStr;
  it("should return a correct element with includeElemsStr", function () {
    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    scroungeElemStr = scroungeElemObj.getScroungeElemStr('__str__');
    finStr = '' +
      '<!-- <scrounge.js> -->' +
      '\n__str__\n' + 
      '<!-- </scrounge> -->';      

    expect( scroungeElemStr ).toBe( finStr );
  });


  it("should return a correct element without includeElemsStr", function () {
    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    scroungeElemStr = scroungeElemObj.getScroungeElemStr('');
    finStr = '' +
      '<!-- <scrounge.js> -->' +
      '\n\n' + 
      '<!-- </scrounge> -->';      

    expect( scroungeElemStr ).toBe( finStr );
  });

});

describe("scroungeElem.getIncludeTag", function () {
  var fileInfoNode, scroungeElemObj, result, resultExpected;
  
  it("should return a correctly formatted js include element", function () {
    fileInfoNode = FileInfoNode.getNew({
      filename: 'sources/appSrc/Main.js',
      treename: 'Main.js',
      type: '.js',
      dependencyArr: [],
      timestamp: Date.now(),
      authorsArr: ['author1']      
    });
    
    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    result = scroungeElemObj.getIncludeTag(fileInfoNode, {});
    resultExpected =
      '<script src="Main.js" type="text/javascript"></script>';
    
    expect( result ).toBe( resultExpected );
  });

  it("should return a correctly formatted css include element", function () {
    fileInfoNode = FileInfoNode.getNew({
      filename: 'sources/appSrc/Main.css',
      treename: 'Main.css',
      type: '.css',
      dependencyArr: [],
      timestamp: Date.now(),
      authorsArr: ['author1']      
    });
    
    scroungeElemObj = ScroungeElem.getNew({
      type : '.css'
    });

    result = scroungeElemObj.getIncludeTag(fileInfoNode, {});
    resultExpected =
      '<link href="Main.css" rel="stylesheet" type="text/css">';
    
    expect( result ).toBe( resultExpected );
  });

});


describe("scroungeElem.getIncludeTagArr", function () {
  var fileInfoTree, fileInfoNode, scroungeElemObj, result, resultExpected, opts;

  it("should return an array of js include elements, unconcatenated", function () {
    fileInfoTree = FileInfoTree.getNew({
      fileInfoObj : FileInfoNode.getNew({
        filename: 'sources/appSrc/dep1.js',
        treename: 'Main.js',
        type: '.js',
        dependencyArr : [],
        timestamp: Date.now(),
        authorsArr: ['author1']
      }),
      fileObjArr : [
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep1.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        }),
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep2.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        })
      ]
    });
    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    opts = UserOptions.getNew({});
    result = scroungeElemObj.getIncludeTagArr([fileInfoTree], opts);
    resultExpected = [
      '<script src="cmpr/dep1.js" type="text/javascript"></script>',
      '<script src="cmpr/dep2.js" type="text/javascript"></script>'
    ];

    expect( result[0] ).toBe( resultExpected[0] );
    expect( result[1] ).toBe( resultExpected[1] );
  });


  it("should return an array of js include elements, concatenated", function () {
    fileInfoTree = FileInfoTree.getNew({
      fileInfoObj : FileInfoNode.getNew({
        filename: 'sources/appSrc/dep1.js',
        treename: 'Main.js',
        type: '.js',
        dependencyArr : [],
        timestamp: Date.now(),
        authorsArr: ['author1']
      }),
      fileObjArr : [
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep1.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        }),
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep2.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        })
      ]
    });
    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    opts = UserOptions.getNew({ isConcatenation : true });
    result = scroungeElemObj.getIncludeTagArr([fileInfoTree], opts);
    resultExpected = [
      '<script src="cmpr/dep1.js" type="text/javascript"></script>'
    ];

    expect( result[0] ).toBe( resultExpected[0] );
    expect( result[1] ).toBe( resultExpected[1] );
  });

});

describe("scroungeElem.getTreeArrAsScroungeElemStr", function () {
  var fileInfoTree, fileInfoNode, scroungeElemObj, result, resultExpected, opts;


  it("should return a correctly formatted scrounge element", function () {

    fileInfoTree = FileInfoTree.getNew({
      fileInfoObj : FileInfoNode.getNew({
        filename: 'sources/appSrc/dep1.js',
        treename: 'dep1.js',
        type: '.js',
        dependencyArr : [],
        timestamp: Date.now(),
        authorsArr: ['author1']
      }),
      fileObjArr : [
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep1.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        }),
        FileInfoNode.getNew({
          filename: 'sources/appSrc/dep2.js',
          treename: 'Main.js',
          type: '.js',
          dependencyArr: [],
          timestamp: Date.now(),
          authorsArr: ['author1']      
        })
      ]
    });

    scroungeElemObj = ScroungeElem.getNew({
      type : '.js'
    });

    opts = UserOptions.getNew({ isConcatenation : true });
    result = scroungeElemObj.getTreeArrAsScroungeElemStr([fileInfoTree], opts);
    resultExpected =
      '<!-- <scrounge.js> -->\n' + 
      '<script src="cmpr/dep1.js" type="text/javascript"></script>\n' + 
      '<!-- </scrounge> -->';

    expect( result ).toBe( resultExpected );

  });
});

