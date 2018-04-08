// Filename: scrounge_basepage.spec.js
// Timestamp: 2018.04.08-02:51:03 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const depgraph = require('depgraph'),

      scrounge_basepage = require('../src/scrounge_basepage');

describe('scrounge_basepage.getcontentrootnamearr', () => {
  it('should return rootnames', () => {
    expect(
      scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root="app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <!-- </scrounge> -->
        </head>
      `).join(',')
    ).toBe('app.css,app.js');
  });

  it('should return comma-separated rootnames', () => {
    expect(
      scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root="app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="crypto.js,app.js"> -->
          <!-- </scrounge> -->
        </head>
      `).join(',')
    ).toBe('app.css,app.js,crypto.js');
  });

  it('should be robust and handle/strip whitespace', () => {
    expect(
      scrounge_basepage.getcontentrootnamearr(`
        <head>
          <!-- <scrounge root=" app.css"> -->
          <!-- </scrounge> -->
          <!-- <scrounge root="crypto.js , app.js "> -->
          <!-- </scrounge> -->
        </head>
      `).join(',')
    ).toBe('app.css,app.js,crypto.js');
  });
});

describe('scrounge_basepage.writecontentelemone', () => {
  it('should return new content, with updated node-corresponding element', () => {
    let cjsnode = depgraph.node.get('./cjs_root.js', 'console.log("hi")', 'cjsnode');

    expect(scrounge_basepage.writecontentelemone({
      isconcat : false,
      publicpath : './public',
      outputpath : 'to/public/dir',
      buildts : 55555
    }, `<head>
          <!-- <scrounge root="app.css"> -->
          <link href="./public/dir/ojsnode.css?ts=12345" rel="stylesheet" type="text/css">
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <script src="./public/dir/ajsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/cjsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/ejsnode.js?ts=12345" type="text/javascript"></script>
          <!-- </scrounge> -->
        </head>`, cjsnode)).toBe(
      `<head>
          <!-- <scrounge root="app.css"> -->
          <link href="./public/dir/ojsnode.css?ts=12345" rel="stylesheet" type="text/css">
          <!-- </scrounge> -->
          <!-- <scrounge root="app.js"> -->
          <script src="./public/dir/ajsnode.js?ts=12345" type="text/javascript"></script>
          <script src="./public/dir/cjsnode.js?ts=55555" type="text/javascript"></script>
          <script src="./public/dir/ejsnode.js?ts=12345" type="text/javascript"></script>
          <!-- </scrounge> -->
        </head>`);
  });
});
