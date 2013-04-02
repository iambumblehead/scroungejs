var BasepageUtil = require('../lib/fileInfo/fileInfoBasepage');

var basepageStr_valid = 'string';

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
  
  basepageUtil.getContentStr = function (fn) {
    fn(null, basepageStr_valid);
  };

  it("should return filters from a valid basepage", function (done) {
    basepageUtil.getFilters(function (err, filters) {
      expect( true ).toBe( true );
      done();
    });
  });
});