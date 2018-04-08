// Filename: scrounge_elem.spec.js
// Timestamp: 2018.04.08-11:59:51 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scrounge_elem = require('../src/scrounge_elem'),
      scrounge_opts = require('../src/scrounge_opts');

describe('scrounge_elem.getindentation', () => {
  it('should return carriage-return indentation', () => {
    // may 'appear' the same as other tests, but some of the whitespace
    // below is different from normal whitespace
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

describe('scrounge_elem.getpopulated', () => {
  it('should populate a scrounge elem', () => {
    let elem = [
          ' <!-- <scrounge root="app.css"> -->',
          ' <!-- </scrounge> -->' ].join('\n'),
        body = [
          ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
          ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">' ].join('\n');

    expect(scrounge_elem.getpopulated(elem, body))
      .toBe([
        ' <!-- <scrounge root="app.css"> -->',
        ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
        ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">',
        ' <!-- </scrounge> -->' ].join('\n'));
  });

  it('should REpopulate a scrounge elem', () => {
    let elem = [
          ' <!-- <scrounge root="app.css"> -->',
          ' <link href="./out/viewa.css?ts=123" rel="stylesheet" type="text/css">',
          ' <link href="./out/viewb.css?ts=123" rel="stylesheet" type="text/css">',
          ' <!-- </scrounge> -->' ].join('\n'),
        body = [
          ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
          ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">' ].join('\n');

    expect(scrounge_elem.getpopulated(elem, body))
      .toBe([
        ' <!-- <scrounge root="app.css"> -->',
        ' <link href="./out/viewa.css?ts=222" rel="stylesheet" type="text/css">',
        ' <link href="./out/viewb.css?ts=222" rel="stylesheet" type="text/css">',
        ' <!-- </scrounge> -->' ].join('\n'));
  });
});

describe('scrounge_elem.getincludetag', () => {
  it('should return javascript <script> element', () => {
    expect(scrounge_elem.getincludetag(scrounge_opts({
      version : 10,
      buildts : 10
    }), './out/view.js', 'text/javascript')).toBe(
      '<script src="./out/view.js?v=10&ts=10" type="text/javascript"></script>');
  });

  it('should return javascript <script> element, with module attribute for es6 modules', () => {
    expect(scrounge_elem.getincludetag(scrounge_opts({
      deploytype : 'module',
      version : 10,
      buildts : 10
    }), './out/view.js', 'module')).toBe(
      '<script src="./out/view.js?v=10&ts=10" type="module"></script>');
  });

  it('should return stylesheet <link> element', () => {
    expect(scrounge_elem.getincludetag(scrounge_opts({
      version : 10,
      buildts : 10
    }), './out/view.css', 'text/css')).toBe(
      '<link href="./out/view.css?v=10&ts=10" rel="stylesheet" type="text/css">');
  });

  it('should throw an error if file extn unsupported', () => {
    expect(() => (
      scrounge_elem.getincludetag(scrounge_opts({
        version : 10,
        buildts : 10
      }), './out/view.zs', 'text/css')
    )).toThrow(new Error('Invalid type, .zs'));
  });
});
