// Filename: scrounge.spec.js  
// Timestamp: 2015.12.08-00:14:42 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const scrounge = require('../src/scrounge');

describe("scrounge()", function () {
  it("should do nothing when called with no parameters", function () {
    
    expect( scrounge.build() ).toBe( undefined );
  });
});
