// Filename: scrounge_elem.spec.js
// Timestamp: 2018.04.08-03:02:33 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scrounge_elem = require('../src/scrounge_elem');
/*
      scroungeelem_treesNone_typeJS_valid = [
        '   <!-- <scrounge type=".js"> -->',
        '   <!-- </scrounge> -->'
      ].join('\n'),

      scroungeelem_treesTwo_typeJS_valid = [
        '   <!-- <scrounge type=".js" trees="one,two"> -->',
        '   <!-- </scrounge> -->'
      ].join('\n'),

      scroungeelem_treesTwo_typeJS_valid_space = [
        '   <!-- <scrounge type=".js" trees="one, two"> -->',
        '   <!-- </scrounge> -->'
      ].join('\n'),

      scroungeelem_treesNone_typeCSS_valid = [
        '   <!-- <scrounge type=".css"> -->',
        '   <!-- </scrounge> -->'
      ].join('\n');
*/

describe('scrounge_elem.getindentation', () => {
  it('should return carriage-return indentation', () => {
    expect(scrounge_elem.getindentation(
      '	   <!-- <scrounge.js> -->'
    )).toBe(
      '	   '
    );
  });

  it('should return whitespace indentation', () => {
    expect(scrounge_elem.getindentation(
      '   <!-- <scrounge.js> -->'
    )).toBe(
      '   '
    );
  });

  it('should return empty indentation', () => {
    expect(scrounge_elem.getindentation(
      '<!-- <scrounge.js> -->'
    )).toBe(
      ''
    );
  });
});
