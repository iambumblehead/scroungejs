var UtilityJS = require('../lib/UtilityJS');

describe("UtilityJS.rmRequires", function () {
  var infoFile, str, result;
  it("should return a string w/ lines of requires calls removed", function () {  
    str = '  var req = require("done") \nvanilla';
    result = UtilityJS.rmRequires(str);
    expect( result ).toBe( '\nvanilla' );
  });
});


describe("UtilityJS.rmConsole", function () {
  var infoFile, str, result;

  it("should return a string w/ console calls replaced, 1 console.log", function () {  
    str = '  var req = 4; \n console.log( "x: " + x + ""); \nvanilla';
    result = UtilityJS.rmConsole(str);
    expect( result ).toBe( '  var req = 4; \n "0"; \nvanilla' );
  });


  it("should return a string w/ console calls replaced, 2 console.log", function () {  
    str = '  var req = 4; \n console.log( "x: " + x + ""); \nvanilla(); console.log(x)';
    result = UtilityJS.rmConsole(str);
    expect( result ).toBe( '  var req = 4; \n "0"; \nvanilla(); "0"' );
  });

  it("should return a string w/ console calls replaced, 1 multiline console.log", function () {  
    str = '  var req = 4; \n console.log( "x: " + x + ""); \nvanilla(); console.log("x: " +\n x)';
    result = UtilityJS.rmConsole(str);
    expect( result ).toBe( '  var req = 4; \n "0"; \nvanilla(); "0"' );
  });

});


/*
describe("UtilityJS.getHeadText", function () {
  var result, resultExpected;

  it("should return the full head text str, when all options are provided", function () {  
    // need PkTime script to test
    UtilityJS.getHeadText({
    });
  });

});
*/
