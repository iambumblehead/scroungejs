var FileInfoParser = require('../lib/FileInfoParser');

describe("FileInfoParser", function () {
  var filenameMint = 'filename_mint.js';

  it("should discover a `mint` filename", function () {
    expect( FileInfoParser.isMint(filenameMint) ).toBe( true );
  });
});





