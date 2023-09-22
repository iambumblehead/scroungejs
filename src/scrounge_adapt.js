// Filename: scrounge_adapt.js
// Timestamp: 2019.07.11-10:15:48 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import umd from 'umd'
import path from 'path'
import babel from '@babel/core'
import babelpresetenv from '@babel/preset-env'
import Cleancss from 'clean-css'
import moduletype from 'moduletype'
import typescript from 'typescript'
import replacerequires from 'replace-requires'
import replaceimports from 'replace-imports'

import scrounge_uid from './scrounge_uid.js'

const adapt = (opts, node, fn) => {
  let filepath = node.get('filepath'),
      extname = path.extname(filepath).slice(1),
      str = node.get('content')

  opts.embedarr.map(embed => {
    if (~filepath.indexOf(embed.filepath)) {
      str = embed.content + str
    }
  })

  opts.globalarr.map(global => {
    // module namespace defined on user-given name
    if (~filepath.indexOf(global.filepath)) {
      str += '\nif (typeof window === "object") window.:NAME = :UID;'
        .replace(/:NAME/g, global.name)
        .replace(/:UID/g, scrounge_uid.sanitised(node.get('uid')))
    }
  })

  if (extname && typeof adapt[extname] === 'function') {
    adapt[extname](opts, node, str, fn)
  } else {
    fn(null, str)
  }
}

// found in some sources, such as inferno :( discussion,
//
//   https://github.com/rollup/rollup/issues/208
//
const rmNODE_ENV = (() => {
  let NODE_ENVre = /process\.env\.NODE_ENV/g,
      NODE_ENV = `'${process.env.NODE_ENV}'`

  return str => NODE_ENVre.test(str)
    ? str.replace(NODE_ENVre, NODE_ENV)
    : str
})()

const js = (opts, node, str, fn) => {
  let filepath = node.get('filepath'),
      modname = scrounge_uid.sanitised(node.get('uid')),
      skip = opts.skippatharr.some(path => ~filepath.indexOf(path)),
      iscjs,
      isesm

  if (skip)
    return fn(null, str)

  babel.transform(str, {
    compact: opts.iscompress && !skip,
    plugins: opts.babelpluginarr || [],
    sourceMaps: opts.sourcemap,
    sourceFileName: opts.sourceFileName,
    presets: [
      //
      // rather than try to manage many presets and plugins,
      // this single preset trys to deliver working output for the
      // given module definition
      //
      // do not convert umd or module-deployed esm
      //
      [ babelpresetenv, {
        modules: (
          node.get('module') === 'umd' || (
            node.get('module') === 'esm' && opts.deploytype === 'module'))
          ? false
          : 'commonjs'
      } ]
    ]
  }, (err, res) => {
    if (err) {
      fn(new Error(`[!!!] parse error ${filepath}`))
    }

    str = res.code

    iscjs = moduletype.cjs(str)
    isesm = moduletype.esm(str)

    if (moduletype.umd(str)) {
      throw new Error('[!!!] umd format no-longer supported')
    } else if (iscjs || isesm) {
      if (iscjs && !isesm)
        str = umd(modname, str, { commonJS: true })

      // build import and require replacement mappings
      let replace = node.get('outarr').reduce((prev, cur) => {
        let refname = cur.get('refname'),
            depname = scrounge_uid.sanitised(cur.get('uid'))

        // alias allows build to map customm paths values
        // to the require/import value
        // aliasarr scenario needs tests
        opts.aliasarr.map(([ matchname, newname ]) => (
          newname === refname && (
            prev.require[matchname] = depname,
            prev.import[matchname] = `/${depname}.js`)))

        prev.require[refname] = depname
        prev.import[refname] = `./${depname}.js`

        return prev
      }, {
        require : {},
        import : {}
      })

      if (iscjs && !/export default/g.test(str))
        str = replacerequires(str, replace.require)

      if (isesm)
        str = replaceimports(str, replace.import)

      str = rmNODE_ENV(str)
    }

    fn(null, str, res.map)
  })
}

const ts = (opts, node, str, fn) => {
  let tsconfig = opts.tsconfig || {},
      jsstr = typescript.transpileModule(str, tsconfig).outputText

  js(opts, node, jsstr, fn)
}

const css = (opts, node, str, fn) => {
  fn(null, opts.iscompress ?
    new Cleancss().minify(str).styles : str)
}

export default Object.assign(adapt, {
  rmNODE_ENV,
  js,
  mjs: js,
  ts,
  tsx: ts,
  css
})
