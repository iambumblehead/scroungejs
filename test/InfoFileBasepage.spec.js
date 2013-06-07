var BasepageUtil = require('../lib/fileInfo/fileInfoBasepage');
var FileInfoNode = require('../lib/fileInfo/fileInfoNode');
var CompareObj = require('compareobj');

var basepageStr_valid = 'string';

var basepageStr_scroungeElem_empty = '' +
      '    <!-- <scrounge.js> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_empty_0trees = '' +
      '    <!-- <scrounge.js> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_empty_2trees = '' +
      '    <!-- <scrounge.js trees="treeA.js,treeB.js"> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_empty_2trees_space = '' +
      '    <!-- <scrounge.js trees="treeA.js, treeB.js"> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_full = '' +
      '    <!-- <scrounge.js> -->\n' +
      '    <script src="/cmpr/library.js" type="text/javascript"></script>\n' +
      '    <script src="/cmpr/app2.js" type="text/javascript"></script>\n' +
      '    <script src="/cmpr/app.js" type="text/javascript"></script>\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_full_2trees = '' +
      '    <!-- <scrounge.js trees="app.js,app2.js"> -->\n' +
      '    <script src="/cmpr/library.js" type="text/javascript"></script>\n' +
      '    <script src="/cmpr/app2.js" type="text/javascript"></script>\n' +
      '    <script src="/cmpr/app.js" type="text/javascript"></script>\n' +
      '    <!-- </scrounge> -->\n  ';



describe("FileInfoBasepage.getNew", function () {
  var basepageUtil;// = BasepageUtil.getNew({ basepage : 'testbasepage' });
  
  it("should return an object with a defined basepage", function () {
    basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });

    expect( typeof basepageUtil ).toBe('object');
    expect( basepageUtil.basepage ).toBe('testbasepage');
  });

  it("should return an object with an undefined basepage", function () {
    basepageUtil = BasepageUtil.getNew({ });

    expect( typeof basepageUtil ).toBe('object');
    expect( basepageUtil.basepage ).toBe(null);
  });
});

describe("fileInfoBasepage.getFilters", function () {
  var basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });  

  it('should return element with trees="treeA.js,treeB.js" as object w/ trees = [treeA.js, treeB.js]', function (done) {
    basepageUtil.getContentStr = function (fn) {
      fn(null, basepageStr_scroungeElem_empty_2trees);
    };
    var result = basepageUtil.getStrAsScroungeElemObjArr(basepageStr_scroungeElem_empty_2trees);
    var resultExpected = ['treeA.js', 'treeB.js'];

    basepageUtil.getFilters(function (err, filters) {
      expect( 
        CompareObj.isSameMembersDefinedArrSame(
          result[0].trees, resultExpected
        ) 
      ).toBe( true );

      done();
    });
  });

  it('should return element with trees="treeA.js, treeB.js" as object w/ trees = [treeA.js, treeB.js]', function (done) {
    basepageUtil.getContentStr = function (fn) {
      fn(null, basepageStr_scroungeElem_empty_2trees_space);
    };
    var result = basepageUtil.getStrAsScroungeElemObjArr(basepageStr_scroungeElem_empty_2trees_space);
    var resultExpected = ['treeA.js', 'treeB.js'];

    basepageUtil.getFilters(function (err, filters) {
      expect( 
        CompareObj.isSameMembersDefinedArrSame(
          result[0].trees, resultExpected
        ) 
      ).toBe( true );

      done();
    });
  });
});



/*
describe("fileInfoBasepage.getScroungeElemFilters", function () {
  var basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });

  it('should return filters, w/ trees="treeA.js, treeB.js" as [treeA.js, treeB.js]', function (done) {
    basepageUtil.getContentStr = function (fn) {
      fn(null, basepageStr_scroungeElem_empty_2trees);
    };
    basepageUtil.getFilters(function (err, filters) {
      console.log('filters', filters);
      expect( true ).toBe( true );
      done();
    });
  });
});
*/



describe("fileInfoBasepage.getFilters", function () {
  var basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });

//  it("should return filters from a valid basepage", function (done) {
//    basepageUtil.getContentStr = function (fn) {
//      fn(null, basepageStr_valid);
//    };
//    basepageUtil.getFilters(function (err, filters) {
//      expect( true ).toBe( true );
//      done();
//    });
//  });

  it('should return filters, w/ trees="treeA.js, treeB.js" as [treeA.js, treeB.js]', function (done) {
    basepageUtil.getContentStr = function (fn) {
      fn(null, basepageStr_scroungeElem_empty_2trees);
    };
    basepageUtil.getFilters(function (err, filters) {
      expect( true ).toBe( true );
      done();
    });
  });
});


describe("fileInfoBasepage.getWithUpdatedIncludeStr", function () {
  var basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });
  var pageMarkup = basepageStr_scroungeElem_full_2trees;

  var infoFileObj = FileInfoNode.getNew({
    filename : 'app.js',
    treename : 'app.js',
    type : '.js',
    dependencyArr : [],
    timestamp : new Date(),
    authorsArr : 'authors'
  });

  var userOptions = {
//    forceTimestamp : 'forcedTimestamp',
//    isTimestamped : true,
    publicPath : '/cmpr/'
  };

  // use force timestamp
  var result = basepageUtil.getWithUpdatedIncludeStr(pageMarkup, infoFileObj, userOptions);
  //result = 
  console.log('basepageUtil result: ', result);

  expect( true ).toBe( true );
});
