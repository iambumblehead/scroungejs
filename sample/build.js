import babel from '@babel/core'
import babelpresetenv from '@babel/preset-env'
import Cleancss from 'clean-css'

import express from 'express'
import http from 'http'
import url from 'url'
import path from 'path'

import scroungejs from '../src/scr.js'

const __filename = new url.URL('', import.meta.url).pathname
const __dirname = __filename.replace(/[/\\][^/\\]*?$/, '')

const port = 3456
const app = express()

;(async () => {
  await scroungejs({
    inputpath: './src',
    outputpath: './out',
    publicpath: './out/',
    basepagein: './index.tpl.html',
    basepage: './index.html',
    isuidfilenames: true,
    iscompress: false,
    isconcat: false,
    iswatch: false,
    treearr: ['app.js', 'app.css'],
    deploytype: 'module',

    hooktransform: async (srcstr, node, srctype, srcpath, opts) => {
      // for ts...
      // let tsconfig = opts.tsconfig || {},
      // jsstr = typescript.transpileModule(str, tsconfig).outputText
      if (/m?js/.test(srctype) && opts.iscompress) {
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

      if (srctype === '.css') {
        return [
          opts.iscompress
            ? new Cleancss().minify(srcstr).styles
            : srcstr
        ]
      }

      return [srcstr]
    }
  })

  app.use('/', express.static(path.join(__dirname, '')))

  if (process.env.service)
    http.createServer(app).listen(port)

  console.log(`[...] localhost:${port}/`)
})()
