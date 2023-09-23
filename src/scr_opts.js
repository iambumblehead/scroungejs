import url from 'url'
import path from 'path'
import castas from 'castas'
import scr_file from './scr_file.js'

import {
  scr_err_basepageinnotfound
} from './scr_err.js'

const getassuffixed = pathval => {
  let extn = path.extname(pathval),
      base = path.basename(pathval, extn),
      dir = path.dirname(pathval) + path.sep

  return path.join(dir, `${base}.tpl${extn}`)
}

const filenamesupportedcss = (opts, filename, fileextn) => (
  fileextn = path.extname(filename),  
  opts.cssextnarr.find(extn => extn === fileextn))

const filenamesupportedjs = (opts, filename, fileextn) => (
  fileextn = path.extname(filename),
  opts.jsextnarr.find(extn => extn === fileextn))

const isfilenamesupportedtype = (opts, filename, fileextn) => (
  fileextn = path.extname(filename),
  filenamesupportedjs(opts, filename, fileextn) ||
    filenamesupportedcss(opts, filename, fileextn))

const issamesupportedtype = (opts, filenamea, filenameb) => {
  const supportedextna = isfilenamesupportedtype(opts, filenamea)
  const supportedextnb = isfilenamesupportedtype(opts, filenameb)

  return supportedextna === supportedextnb
}

const getfinalextn = (opts, filename, fileextn, extn = null) => {
  fileextn = path.extname(filename)  

  if (filenamesupportedjs(opts, filename, fileextn)) {
    extn = '.js'
  } else if (filenamesupportedcss(opts, filename, fileextn)) {
    extn = '.css'
  }

  return extn
}

const setfinalextn = (opts, filename) => (
  scr_file.setextn(filename, getfinalextn(opts, filename)))

const relPathAsFileUrl = (metaurl, p) => (
  (!p || /^(file:\/\/|\/)/.test(p))
    ? p
    : url.fileURLToPath(new url.URL(p, metaurl).href))

const relPathAsFileUrlFn = metaurl => p => (
  relPathAsFileUrl(metaurl, p))

const scr_opts = opt => {
  const finopt = {}
  const stackpathre = /^.*(\(|at )(.*):[\d]*:[\d]*.*$/
  const metaurl = opt.metaurl || (path.dirname(
    (new Error).stack.split('\n')[3].replace(stackpathre, '$2')) + '/')

  const asFileUrl = relPathAsFileUrlFn(metaurl)

  // all options optional
  opt = opt || {}
  finopt.metaurl = metaurl
  finopt.inputpath = asFileUrl(castas.str(opt.inputpath, './'))
  finopt.outputpath = asFileUrl(castas.str(opt.outputpath, './www'))
  finopt.publicpath = asFileUrl(castas.str(opt.publicpath, './'))

  // hooktransform(src, node, type, path, opts)
  finopt.hooktransform = opt.hooktransform || (src => src)
  

  // deploytype is 'script' or 'module'.
  //
  // If 'module' is used, ES6-style modules are deployed in 'module' format
  // and must be 'imported' (ES6) by other scripts and NOT 'required' (CJS)
  //
  // if 'script' is used, ES6-style modules are converted to UMD and may be
  // 'required' or 'imported' by any dpendant script
  finopt.deploytype = castas.str(opt.deploytype, 'module') // script|module
  finopt.version = castas.str(opt.version, '')

  finopt.tplextnarr = [ '.mustache' ]
  finopt.cssextnarr = [ '.css' ]
  finopt.jsextnarr = [ '.js', '.mjs', '.ts', '.tsx' ]
  finopt.jsextnre = /(js|mjs|ts|tsx)$/

  finopt.tsconfig = opt.tsconfig || {}
  finopt.typearr = castas.arr(opt.typearr, [])
  finopt.treearr = castas.arr(opt.treearr, [])

  // do not follow dependencies from files w/ filenames including
  // the given substring. more specific substring is recommended
  //
  // skipdeparr: [
  //   '/webvr-polyfill.js',
  //   '/amplitude.js'
  // ]
  //
  finopt.skipdeparr = castas.arr(opt.skipdeparr, []) // depgraph

  // change the appearance of the tree
  //
  finopt.treetype = [
    'full', // list each leaf one time only
    'small', // list full tree, same leaf may appear multipl times
    'none' //  do not render tree (use for unit-testing)
  ].find(t => t === String(opt.treetype).toLowerCase()) || 'small'

  finopt.embedarr = castas.arr(opt.embedarr, [])
  finopt.globalarr = castas.arr(opt.globalarr, [])

  // prepend a tree's sources with specific file contents
  // for example, loading three.js files before any 'app.js' tree file
  //
  // prependarr: [{
  //   treename: 'app.js',
  //   sourcearr: [
  //     './node_modules/three/build/three.js',
  //     './node_modules/three/examples/js/effects/VREffect.js'
  //   ]
  // }]
  //
  finopt.prependarr = castas.arr(opt.prependarr, [])

  // 'alias' a different name or path to an existing name
  // for example, some files might require 'inferno', but specifically
  // 'inferno/dist/inferno' is wanted instead
  //
  // aliasarr: [
  //   [ 'inferno', 'inferno/dist/inferno' ]
  // ]
  //
  finopt.aliasarr = castas.arr(opt.aliasarr, [])
  finopt.babelpluginarr = castas.arr(opt.babelpluginarr, [])

  finopt.iswatch = castas.bool(opt.iswatch, false)

  // keep processed copies of files in a cached directory to speed
  // subsequent rebuilds
  //
  finopt.iscachemap = castas.bool(opt.iscachemap, true)
  finopt.iscompress = castas.bool(opt.iscompress, false)
  finopt.isconcat = castas.bool(opt.isconcat, true)

  // sourcemap by default if iscompress is used
  //
  finopt.issourcemap = castas.bool(opt.issourcemap, opt.iscompress)
  finopt.issilent = castas.bool(opt.issilent, false)
  finopt.ises2015 = castas.bool(opt.ises2015, false)
  finopt.istpl = castas.bool(opt.istpl, false)

  finopt.browser = castas.bool(opt.isbrowser, true)
  finopt.iscircular = castas.bool(opt.iscircular, false)
  finopt.istimestamp = castas.bool(opt.istimestamp, true)

  finopt.buildts = castas.ts(opt.buildts, Date.now())
  finopt.basepage = castas.str(opt.basepage, '')
  finopt.basepagein = castas.str(opt.basepagein, finopt.basepage)

  if (finopt.basepage) {
    finopt.basepage = asFileUrl(finopt.basepage)
  }

  if (finopt.basepagein) {
    finopt.basepagein = asFileUrl(finopt.basepagein)

    if (scr_file.isexist(getassuffixed(finopt.basepage, 'tpl')))
      finopt.basepagein = getassuffixed(finopt.basepage, 'tpl')

    if (!scr_file.isexist(finopt.basepagein))
      throw scr_err_basepageinnotfound(finopt.basepagein)
  }

  return finopt
}

export default Object.assign(scr_opts, {
  setfinalextn,
  issamesupportedtype
})
