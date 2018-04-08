// Filename: scrounge_adapt.spec.js  
// Timestamp: 2018.04.07-18:40:26 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const fs = require('fs'),
      umd = require('umd'),
      depgraph = require('depgraph'),
      
      babel = require('babel-core'),
      babelpresetenv = require('babel-preset-env'),
      
      scrounge_adapt = require('../src/scrounge_adapt'),
      scrounge_opts = require('../src/scrounge_opts'),
      test_cjs_root = fs.readFileSync(
        __dirname + '/testfiles/test_cjs_root.js', 'utf8'),
      test_mjs_root = fs.readFileSync(
        __dirname + '/testfiles/test_mjs_root.js', 'utf8'),
      test_global = fs.readFileSync(
        __dirname + '/testfiles/test_global.js', 'utf8'),
      test_amd = fs.readFileSync(
        __dirname + '/testfiles/test_amd.js', 'utf8'),
      test_umd = fs.readFileSync(
        __dirname + '/testfiles/test_umd.js', 'utf8'),
      test_malformed = fs.readFileSync(
        __dirname + '/testfiles/test_malformed.js', 'utf8');

describe("scrounge_adapt(opts, node, str, fn)", () => {
  let cjsnode = depgraph.node.get('./cjs_root.js', test_cjs_root, 'cjsnode'),
      mjsnode = depgraph.node.get('./mjs_root.js', test_mjs_root, 'mjsnode'),
      malnode = depgraph.node.get('./malformed.js', test_malformed, 'malnode'),
      amdnode = depgraph.node.get('./amd.js', test_amd, 'amdnode'),
      umdnode = depgraph.node.get('./umd.js', test_umd, 'umdnode'),
      globalnode = depgraph.node.get('./global.js', test_umd, 'globalnode');

  it("should convert content to umd by default", done => {
    let opts = scrounge_opts({
      iscompress: false
    });
    
    scrounge_adapt.js(opts, cjsnode, test_cjs_root, (err, res) => {
      expect(res).toBe(
        umd('cjsnode', babel.transform(test_cjs_root, {
          compact : false,
          plugins : opts.babelpluginarr
        }).code, { commonJS : true }));

      done();
    });
  });

  it("should throw an error for a malformed file", () => {
    expect(() => (
      scrounge_adapt.js(scrounge_opts({
        iscompress: true
      }), malnode, test_malformed, () => {}))
    ).toThrow( new Error('[!!!] parse error ./malformed.js') );
  });

  it("should compress content when `iscompress: true`", done => {
    let opts = scrounge_opts({
      iscompress: true
    });
    
    scrounge_adapt.js(opts, cjsnode, test_cjs_root, (err, res) => {
      expect(res).toBe(
        umd('cjsnode', babel.transform(test_cjs_root, {
          compact : true,
          plugins : opts.babelpluginarr
        }).code, { commonJS : true }));

      done();
    });
  });

  it("should skip content of 'skippatharr' nodes", done => {
    scrounge_adapt.js(scrounge_opts({
      skippatharr: [
        'cjs_root'
      ]
    }), cjsnode, test_cjs_root, (err, res) => {
      expect(res).toBe(test_cjs_root);
      done();
    });
  });

  it("should process scripts with no module format", done => {
    let opts = scrounge_opts({
      iscompress: false
    });
    
    scrounge_adapt.js(opts, globalnode, test_global, (err, res) => {
      expect(res).toBe(babel.transform(test_global, {
        compact : false,
        plugins : opts.babelpluginarr
      }).code);

      done();
    });
  });

  it("should convert mjs to cjs and then umd", done => {
    let opts = scrounge_opts({
      iscompress: false
    });
    
    scrounge_adapt.js(opts,  mjsnode, test_mjs_root, (err, res) => {
      expect(res).toBe(
        umd('mjsnode', babel.transform(test_mjs_root, {
          compact : false,
          plugins : opts.babelpluginarr
        }).code, {
          commonJS: true
        }));

      expect(/import/g.test(res)).toBe(false);
      
      done();
    });
  });

  it("should not convert mjs, when deploytype is 'module'", done => {
    let opts = scrounge_opts({
      iscompress: false,
      deploytype: 'module'
    });
    
    scrounge_adapt.js(opts,  mjsnode, test_mjs_root, (err, res) => {
      expect(res).toBe(babel.transform(test_mjs_root, {
        compact: false,
        plugins: opts.babelpluginarr
      }).code);

      expect(/import/g.test(res)).toBe(true);

      done();
    });
  });

  it("should replace require calls with node out-going edge names", done => {
    let opts = scrounge_opts({
      iscompress: false
    });

    let rootcjsnode = depgraph.node.setedgeout(
      cjsnode, 'testedge', './test_cjs_root_depa'),
        originalreq = /const depa = require\('.\/test_cjs_root_depa'\);/g,
        replacedreq = /const depa = testedge;/g;
    
    expect(originalreq.test(test_cjs_root)).toBe(true);

    scrounge_adapt.js(opts, rootcjsnode, test_cjs_root, (err, res) => {
      expect(replacedreq.test(res)).toBe(true);
      expect(originalreq.test(res)).toBe(false);

      done();
    });
  });

  it("should replace mjs import paths with node out-going edge name paths IF deploytype is 'module'", done => {
    let opts = scrounge_opts({
      iscompress: false,
      deploytype: 'module'
    });

    let rootmjsnode = depgraph.node.setedgeout(
      mjsnode, 'testedge', './test_mjs_root_depa'),
        originalimp = /import depa from '.\/test_mjs_root_depa';/g,
        replacedimp = /import depa from '.\/testedge.js';/g;
    
    expect(originalimp.test(test_mjs_root)).toBe(true);
    
    scrounge_adapt.js(opts, rootmjsnode, test_mjs_root, (err, res) => {
      expect(replacedimp.test(res)).toBe(true);
      expect(originalimp.test(res)).toBe(false);

      done();
    });
  });
  
  it("should replace mjs import paths with node out-going edge name IF deploytype is 'script' (default)", done => {
    let opts = scrounge_opts({
      iscompress: false,
      deploytype: 'script'
    });

    let rootmjsnode = depgraph.node.setedgeout(
      mjsnode, 'testedge', './test_mjs_root_depa'),
        originalimp = /import depa from '.\/test_mjs_root_depa';/g,
        replacedimp = /var _test_mjs_root_depa = testedge;/g;
    
    expect(originalimp.test(test_mjs_root)).toBe(true);
    
    scrounge_adapt.js(opts, rootmjsnode, test_mjs_root, (err, res) => {
      expect(replacedimp.test(res)).toBe(true);
      expect(originalimp.test(res)).toBe(false);

      done();
    });
  });    
  
});
