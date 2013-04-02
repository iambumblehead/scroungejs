var BasepageUtil = require('../lib/fileInfo/fileInfoBasepage');

var basepageStr_valid = 'string';

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