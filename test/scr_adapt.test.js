// Filename: scrounge_adapt.spec.js
// Timestamp: 2018.04.08-02:42:19 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import fs from 'node:fs'
import url from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

import depgraph from 'depgraph'
import babel from '@babel/core'
import babelpresetenv from '@babel/preset-env'

import scr_adapt from '../src/scr_adapt.js'
import scr_opts from '../src/scr_opts.js'

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

const cjsnode = depgraph.node.get('./cjs_root.js', test_cjs_root, 'cjsnode')
const mjsnode = depgraph.node.get('./mjs_root.js', test_mjs_root, 'mjsnode')
const malnode = depgraph.node.get('./malformed.js', test_malformed, 'malnode')
const globalnode = depgraph.node.get('./global.js', test_umd, 'globalnode')

test('should convert content to umd by default', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    deploytype: 'script',
    hooktransform: () => ['minified']
  })

  assert.deepStrictEqual(
    await scr_adapt.js(opts, cjsnode, test_cjs_root),
    ['minified', undefined])
})

test('should throw an error for a malformed file', async () => {
  await assert.rejects(async () => (
    scr_adapt.js(scr_opts({
      metaurl: import.meta.url,
      iscompress: true,
      hooktransform: () => {
        throw new Error('[!!!] parse error ./malformed.js')
      }
    }), malnode, test_malformed)
  ), {
    message: '[!!!] parse error ./malformed.js'
  })
})

test('should skip content of "skippatharr" nodes', async () => {
  const [res] = await scr_adapt.js(scr_opts({
    metaurl: import.meta.url,
    isbrowser: false,
    skippatharr: [
      'cjs_root'
    ]
  }), cjsnode, test_cjs_root)

  assert.strictEqual(res, test_cjs_root)
})

test('should process scripts with no module format', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    isbrowser: false,
    hooktransform: src => [src + '_processed_']
  })

  const [res] = await scr_adapt.js(opts, globalnode, test_global)
  const matches = ((res || '').match(/_processed_/mgi) || []).length
  assert.strictEqual(matches, 1)
  assert.strictEqual(res.replace(/_processed_/mgi, ''), test_global)
})

test('should convert cjs to umd', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    isbrowser: true,
    hooktransform: () => [cjsnode]
  })

  const [res] = await scr_adapt.js(opts, mjsnode, test_mjs_root)

  assert.strictEqual(/import/g.test(res), false)
})

test('should not convert mjs, when deploytype is "module"', async () => {
  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    deploytype: 'module'
  })

  const [res] = await scr_adapt.js(opts, mjsnode, test_mjs_root)

  assert.strictEqual(/import/g.test(res), true)
})

test('should replace require calls w/ node out-going edge names', async () => {
  const rootcjsnode = depgraph.node.setedgeout(
    cjsnode, 'testedge', './test_cjs_root_depa')
  const originalreq = /depa = require\('.\/test_cjs_root_depa'\)/g
  const replacedreq = /depa = testedge/g

  assert.ok(originalreq.test(test_cjs_root))

  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false
  })

  const [res] = await scr_adapt.js(opts, rootcjsnode, test_cjs_root)

  assert.strictEqual(replacedreq.test(res), true)
  assert.strictEqual(originalreq.test(res), false)
})

test('replace mjs import paths w/ out-going edge IF "module"', async () => {
  const rootmjsnode = depgraph.node.setedgeout(
    mjsnode, 'testedge', './test_mjs_root_depa')
  const originalimp = /import depa from '.\/test_mjs_root_depa'/g
  const replacedimp = /import depa from '.\/testedge.js'/g

  assert.strictEqual(originalimp.test(test_mjs_root), true)

  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    deploytype: 'module'
  })
  const [res] = await scr_adapt.js(opts, rootmjsnode, test_mjs_root)

  assert.strictEqual(replacedimp.test(res), true)
  assert.strictEqual(originalimp.test(res), false)
})

test('replace mjs import paths w/ out-going edge IF "script"', async () => {
  const rootmjsnode = depgraph.node.setedgeout(
    mjsnode, 'edg', './test_mjs_root_depa')
  const originalimp = /import depa from '.\/test_mjs_root_depa'/g
  const replacedimp =
        /var _test_mjs_root_depa = _interopRequireDefault\(edg\)/mg

  assert.strictEqual(originalimp.test(test_mjs_root), true)

  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    deploytype: 'script',

    hooktransform: async (srcstr, node, srctype, srcpath, opts) => {
      if (/m?js/.test(srctype)) {
        const res = await babel.transformAsync(srcstr, {
          compact: opts.iscompress,
          plugins: opts.babelpluginarr || [],
          sourceMaps: opts.sourcemap,
          sourceFileName: opts.sourceFileName,
          presets: [
            // rather than try to manage many presets and plugins,
            // single preset trys to deliver working output for the
            // given module definition
            //
            // do not convert umd or module-deployed esm
            [babelpresetenv, {
              modules: (
                node.get('module') === 'umd' || (
                  node.get('module') === 'esm' && opts.deploytype === 'module'))
                ? false
                : 'commonjs'
            }]
          ]
        }).catch(() => {
          new Error(`[!!!] parse error ${srcpath}`)
        })

        return [res.code, res.map]
      }

      return [srcstr]
    }
  })

  const [res] = await scr_adapt.js(opts, rootmjsnode, test_mjs_root)

  assert.strictEqual(replacedimp.test(res), true)
  assert.strictEqual(originalimp.test(res), false)
})

test('should handle aliases', async () => {
  const aliascjsnode = depgraph.node.setedgeout(
    depgraph.node.get('./cjs_alias.js', [
      'const inferno = require("inferno");'
    ].join(''), 'cjsnode'), 'infernoedge', 'inferno/dist/inferno')

  const opts = scr_opts({
    metaurl: import.meta.url,
    iscompress: false,
    aliasarr: [[
      'inferno',
      'inferno/dist/inferno'
    ]]
  })

  const [res] = await scr_adapt
    .js(opts, aliascjsnode, aliascjsnode.get('content'))

  assert.strictEqual(/inferno = require\("inferno"\)/.test(res), false)
  assert.strictEqual(/inferno = infernoedge/.test(res), true)
})

