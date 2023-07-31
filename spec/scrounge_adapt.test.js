// Filename: scrounge_adapt.spec.js
// Timestamp: 2018.04.08-02:42:19 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import umd from 'umd'
import url from 'url'
import util from 'util'
import depgraph from 'depgraph'

import babel from '@babel/core'
import babelpresetenv from '@babel/preset-env'

import scrounge_adapt from '../src/scrounge_adapt.js'
import scrounge_opts from '../src/scrounge_opts.js'

const __filename = new url.URL('', import.meta.url).pathname
const __dirname = __filename.replace(/[/\\][^/\\]*?$/, '')

const test_cjs_root = fs.readFileSync(
  `${__dirname}/testfiles/test_cjs_root.js`, 'utf8')
const test_mjs_root = fs.readFileSync(
  `${__dirname}/testfiles/test_mjs_root.js`, 'utf8')
const test_global = fs.readFileSync(
  `${__dirname}/testfiles/test_global.js`, 'utf8')
const test_umd = fs.readFileSync(
  `${__dirname}/testfiles/test_umd.js`, 'utf8')
const test_malformed = fs.readFileSync(
  `${__dirname}/testfiles/test_malformed.js`, 'utf8')


let cjsnode = depgraph.node.get('./cjs_root.js', test_cjs_root, 'cjsnode'),
    mjsnode = depgraph.node.get('./mjs_root.js', test_mjs_root, 'mjsnode'),
    malnode = depgraph.node.get('./malformed.js', test_malformed, 'malnode'),
    globalnode = depgraph.node.get('./global.js', test_umd, 'globalnode');

test('should convert content to umd by default', () => {
  let opts = scrounge_opts({
    iscompress : false
  });

  scrounge_adapt.js(opts, cjsnode, test_cjs_root, (err, res) => {
    assert.deepStrictEqual(res, umd('cjsnode', babel.transform(test_cjs_root, {
      compact : false,
      presets : [ [ babelpresetenv, {
        modules : 'commonjs'
      } ] ]
    }).code, { commonJS : true }));
  });
});

test('should throw an error for a malformed file', async () => {
  await assert.rejects(async () => (
    await util.promisify(fn => {
      scrounge_adapt.js(scrounge_opts({
        iscompress : true
      }), malnode, test_malformed, fn)
    })()
  ), {
    message: '[!!!] parse error ./malformed.js'
  });
});

test('should compress content when `iscompress: true`', () => {
  let opts = scrounge_opts({
    iscompress : true
  });

  scrounge_adapt.js(opts, cjsnode, test_cjs_root, (err, res) => {
    assert.deepStrictEqual(
      res,
      umd('cjsnode', babel.transform(test_cjs_root, {
        compact : true,
        presets : [ [ babelpresetenv, {
          modules : 'commonjs'
        } ] ]
      }).code, { commonJS : true }));
  });
});

test('should skip content of "skippatharr" nodes', () => {
  scrounge_adapt.js(scrounge_opts({
    skippatharr : [
      'cjs_root'
    ]
  }), cjsnode, test_cjs_root, (err, res) => {
    assert.strictEqual(res, test_cjs_root);
  });
});

test('should process scripts with no module format', () => {
  let opts = scrounge_opts({
    iscompress : false
  });

  scrounge_adapt.js(opts, globalnode, test_global, (err, res) => {

    assert.deepStrictEqual(res, babel.transform(test_global, {
      compact : false,
      presets : [ [ babelpresetenv, {
        modules : opts.deploytype === 'module'
      } ] ]
    }).code);
  });
});

test('should convert mjs to cjs and then umd', () => {
  scrounge_adapt.js(scrounge_opts({
    iscompress : false
  }), mjsnode, test_mjs_root, (err, res) => {
    assert.strictDeepEqual(res, umd('mjsnode', babel.transform(test_mjs_root, {
      compact : false,
      presets : [ [ babelpresetenv, {
        modules : 'commonjs'
      } ] ]
    }).code, {
      commonJS : true
    }));

    assert.strictEqual(/import/g.test(res), false);
  });
});

test('should not convert mjs, when deploytype is "module"', () => {
  scrounge_adapt.js(scrounge_opts({
    iscompress : false,
    deploytype : 'module'
  }), mjsnode, test_mjs_root, (err, res) => {
    assert.deepStrictEqual(res, babel.transform(test_mjs_root, {
      compact : false,
      presets : [ [ babelpresetenv, {
        modules : false
      } ] ]
    }).code);

    assert.strictEqual(/import/g.test(res), true);
  });
});

test('should replace require calls with node out-going edge names', () => {
  const rootcjsnode = depgraph.node.setedgeout(
    cjsnode, 'testedge', './test_cjs_root_depa')
  const originalreq = /depa = require\('.\/test_cjs_root_depa'\);/g
  const replacedreq = /depa = testedge;/g;

  assert.ok(originalreq.test(test_cjs_root))

  scrounge_adapt.js(scrounge_opts({
    iscompress : false
  }), rootcjsnode, test_cjs_root, (err, res) => {
    assert.strictEqual(replacedreq.test(res), true);
    assert.strictEqual(originalreq.test(res), false);
  });
});

test('should replace mjs import paths with node out-going edge name paths IF deploytype is "module"', () => {
  const rootmjsnode = depgraph.node.setedgeout(
    mjsnode, 'testedge', './test_mjs_root_depa')
  const originalimp = /import depa from '.\/test_mjs_root_depa';/g
  const replacedimp = /import depa from '.\/testedge.js';/g

  assert.strictEqual(originalimp.test(test_mjs_root), true);

  scrounge_adapt.js(scrounge_opts({
    iscompress : false,
    deploytype : 'module'
  }), rootmjsnode, test_mjs_root, (err, res) => {
    assert.strictEqual(replacedimp.test(res), true);
    assert.strictEqual(originalimp.test(res), false);
  });
});

test('should replace mjs import paths with node out-going edge name IF deploytype is "script" (default)', () => {
  const rootmjsnode = depgraph.node.setedgeout(
    mjsnode, 'testedge', './test_mjs_root_depa')
  const originalimp = /import depa from '.\/test_mjs_root_depa';/g
  const replacedimp = /var _test_mjs_root_depa = _interopRequireDefault\(testedge\);/g

  assert.strictEqual(originalimp.test(test_mjs_root), true);

  scrounge_adapt.js(scrounge_opts({
    iscompress : false,
    deploytype : 'script'
  }), rootmjsnode, test_mjs_root, (err, res) => {
    assert.strictEqual(replacedimp.test(res), true);
    assert.strictEqual(originalimp.test(res), false);
  });
});

test('should handle aliases', () => {
  let aliascjsnode = depgraph.node.setedgeout(
    depgraph.node.get('./cjs_alias.js', [
      'const inferno = require("inferno");'
    ].join(''), 'cjsnode'), 'infernoedge', 'inferno/dist/inferno');

  scrounge_adapt.js(scrounge_opts({
    iscompress : false,
    aliasarr : [ [
      'inferno',
      'inferno/dist/inferno'
    ] ]
  }), aliascjsnode, aliascjsnode.get('content'), (err, res) => {
    assert.strictEqual(/inferno = require\("inferno"\)/.test(res), false);
    assert.strictEqual(/inferno = infernoedge/.test(res), true);
  });
});

