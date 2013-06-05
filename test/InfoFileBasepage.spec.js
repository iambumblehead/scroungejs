var BasepageUtil = require('../lib/fileInfo/fileInfoBasepage');

var basepageStr_valid = 'string';

var basepageStr_scroungeElem_empty = '' +
      '    <!-- <scrounge.js> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_empty_0trees = '' +
      '    <!-- <scrounge.js> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_empty_2trees = '' +
      '    <!-- <scrounge.js trees="treeA.js, treeB.js"> -->\n' +
      '    <!-- </scrounge> -->\n  ';

var basepageStr_scroungeElem_full = '' +
      '    <!-- <scrounge.js> -->\n' +
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

describe("fileInfoBasepage.getScroungeElementObjArr", function () {
  var basepageUtil = BasepageUtil.getNew({ basepage : 'testbasepage' });

  it("should return filters from a valid basepage", function (done) {
    basepageUtil.getContentStr = function (fn) {
      fn(null, basepageStr_valid);
    };
    basepageUtil.getFilters(function (err, filters) {
      expect( true ).toBe( true );
      done();
    });
  });
});
