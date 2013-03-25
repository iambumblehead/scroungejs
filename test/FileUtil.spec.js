var FileUtil = require('../lib/FileUtil');

describe("FileUtil", function () {
  var filenameMint = 'filename_mint.js';

  it("isPassingFilename should pass a filename when no options are given", function () {
    expect( FileUtil.isPassingFilename(filenameMint, {}) ).toBe( true );
  });
});
