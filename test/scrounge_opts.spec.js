// Filename: scrounge_opts.spec.js  
// Timestamp: 2015.11.25-22:35:50 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var scrounge_opts = require('../src/scrounge_opts');

describe("scrounge_opts.getassuffixed", function () {
  it("should return `path/to/index.html`, `tpl` as `path/to/index.tpl.html`", function () {
    
    expect(
      scrounge_opts.getassuffixed('path/to/index.html', 'tpl')
    ).toBe(
      'path/to/index.tpl.html'
    );
  });
});
