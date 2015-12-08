// Filename: scrounge_elem.spec.js  
// Timestamp: 2015.12.08-00:17:55 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var scrounge_elem = require('../src/scrounge_elem');


var scroungeelem_treesNone_typeJS_valid = [
  '   <!-- <scrounge type=".js"> -->',
  '   <!-- </scrounge> -->'
].join('\n');

var scroungeelem_treesTwo_typeJS_valid = [
  '   <!-- <scrounge type=".js" trees="one,two"> -->',
  '   <!-- </scrounge> -->'
].join('\n');

var scroungeelem_treesTwo_typeJS_valid_space = [
  '   <!-- <scrounge type=".js" trees="one, two"> -->',
  '   <!-- </scrounge> -->'
].join('\n');

var scroungeelem_treesNone_typeCSS_valid = [
  '   <!-- <scrounge type=".css"> -->',
  '   <!-- </scrounge> -->'
].join('\n');


/*
describe("scrounge_elem.getelemobjarr", function () {
  it("should return elemobjarr from treesnone_typejs_valid str", function () {
    var elemstr = scroungeelem_treesNone_typeJS_valid,
        elemobj = scrounge_elem.getelemobjarr(elemstr)[0];

    expect( elemobj.elem ).toBe( elemstr );
    expect( Array.isArray(elemobj.trees) ).toBe( true );
    expect( elemobj.trees.length ).toBe( 0 );
    expect( elemobj.type ).toBe( '.js' );        
  });

  it("should return elemobjarr from treestwo_typejs_valid str", function () {
    var elemstr = scroungeelem_treesTwo_typeJS_valid,
        elemobj = scrounge_elem.getelemobjarr(elemstr)[0];

    expect( elemobj.elem ).toBe( elemstr );
    expect( Array.isArray(elemobj.trees) ).toBe( true );
    expect( elemobj.trees.length ).toBe( 2 );
    expect( elemobj.type ).toBe( '.js' );        
  });

  it("should return elemobjarr from treestwo_typejs_valid_space str", function () {
    var elemstr = scroungeelem_treesTwo_typeJS_valid_space,
        elemobj = scrounge_elem.getelemobjarr(elemstr)[0];

    expect( elemobj.elem ).toBe( elemstr );
    expect( Array.isArray(elemobj.trees) ).toBe( true );
    expect( elemobj.trees.length ).toBe( 2 );
    expect( elemobj.type ).toBe( '.js' );        
  });

  it("should return elemobjarr from treesnone_typecss_valid str", function () {
    var elemstr = scroungeelem_treesNone_typeCSS_valid,
        elemobj = scrounge_elem.getelemobjarr(elemstr)[0];

    expect( elemobj.elem ).toBe( elemstr );
    expect( Array.isArray(elemobj.trees) ).toBe( true );
    expect( elemobj.trees.length ).toBe( 0 );
    expect( elemobj.type ).toBe( '.css' );        
  });    
});
*/

describe("scrounge_elem.getindentation", function () {
  it("should return carriage-return indentation", function () {
    expect(scrounge_elem.getindentation(
      '	   <!-- <scrounge.js> -->'
    )).toBe(
      '	   '
    );
  });

  it("should return whitespace indentation", function () {
    expect(scrounge_elem.getindentation(
      '   <!-- <scrounge.js> -->'      
    )).toBe(
      '   '
    );
  });

  it("should return empty indentation", function () {
    expect(scrounge_elem.getindentation(
      '<!-- <scrounge.js> -->'      
    )).toBe(
      ''
    );
  });  
});
