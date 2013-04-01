var UtilityJS = require('../lib/UtilityJS');

describe("infoFile.rmRequires", function () {
  var infoFile, str, result;
  it("should return a string w/ lines of requires calls removed", function () {  
    str = '  var req = require("done") \nvanilla';
    result = UtilityJS.rmRequires(str);
    expect( result ).toBe( '\nvanilla' );
  });
});

// primitive -be careful
describe("infoFile.rmConsole", function () {
  var infoFile, str, result;
  it("should return a string w/ console calls replaced", function () {  
    str = '  var req = 4; \n console.log( "x: " + x + ""); \nvanilla';
    result = UtilityJS.rmConsole(str);
    expect( result ).toBe( '  var req = 4; \n console.log(""); \nvanilla' );
  });
});