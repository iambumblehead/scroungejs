// Filename: scrounge_root.spec.js
// Timestamp: 2018.04.09-21:52:01 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),

      scrounge_root = require('../src/scrounge_root'),
      scrounge_opts = require('../src/scrounge_opts');

describe('scrounge_basepage.getrootarrasobj', () => {
  it('should return an error if no root file found', done => {
    let opts = scrounge_opts({
      issilent : true,
      inputpath : './src',
      treearr : [ 'app.js' ],
      treetype : 'none'
    });

    scrounge_root.getrootarrasobj(opts, [
      'app.js'
    ], err => {
      expect(Boolean(err)).toBe(true);

      done();
    });
  });

  it('should return an object mapping of { treename : dependencyarr }, for ["app.js"]', done => {
    let opts = scrounge_opts({
      inputpath : path.join(__dirname, '/../test/src/'),
      treearr : [ 'app.js' ],
      treetype : 'none'
    });

    scrounge_root.getrootarrasobj(opts, [
      'app.js'
    ], (err, obj) => {
      expect(Object.keys(obj).join('')).toBe('app.js');

      done();
    });
  });

  it('should return an object mapping of { treename : dependencyarr }, for ["app.js", "app.css"]', done => {
    let opts = scrounge_opts({
      inputpath : path.join(__dirname, '/../test/src/'),
      treearr : [ 'app.js', 'app.css' ],
      treetype : 'none'
    });

    scrounge_root.getrootarrasobj(opts, [
      'app.js', 'app.css'
    ], (err, obj) => {
      expect(Object.keys(obj).join(',')).toBe('app.js,app.css');

      done();
    });
  });
});
