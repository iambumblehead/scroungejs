import umd from 'umd'
import path from 'path'
import moduletype from 'moduletype'
import replacerequires from 'replace-requires'

import {
  scr_util_uidflat
} from './scr_util.js'

import {
  scr_err_umdformatnotsupported
} from './scr_err.js'

const NODE_ENVre = /process\.env\.NODE_ENV/g
const NODE_ENVstr = `'${process.env.NODE_ENV}'`

// typescript projects such as path-to-regexp define this,
// ```
// Object.defineProperty(exports, "__esModule", { value: true })
// ```
//
// fully transform these files to esm by adding
//  * exports definition, and export
const typescriptCJSesModuleRe = /Object\.defineProperty\(exports, "__esModule"/
const typescriptCJSesModuleToESM = srccjs => {
  const exportMatches = srccjs.match(/exports\.(\w*)/g)
    .filter((e, i, matches) => matches.indexOf(e) === i)
  const exportMatchFlat = lookup => lookup.replaceAll('.', '')
  const exportESM = exportMatches.reduce((str, r) => [
    `const ${exportMatchFlat(r)} = ${r};`,
    str,
    `export{${exportMatchFlat(r)} as ${r.replace('exports.', '')}};`
  ].join('\n'), '\n')

  return [
    'const exports = {}',
    srccjs,
    exportESM
  ].join('\n')
}

const pretransform = src => typescriptCJSesModuleRe.test(src)
  ? typescriptCJSesModuleToESM(src)
  : src

const buildImportReplaceRe = key => (
  key = key.replace('/', '\\/').replace('.', '\\.'),
  // '$' dollar sign used in immutable.js import variable name :(
  // '/' comment slash used in comments inside import expression
  new RegExp(
    '(import|export)' + // dollar sign used in immutable.js
      `(?:[\\s.*]([\\w*{}\n\r\t, /$]+)[\\s*]from)?[\\s*](?:(["']${key}["']))`,
    'gm'))

const scr_adaptjs = async (opts, node, srcstr) => {
  const filepath = node.get('filepath')
  const nodeuid = node.get('uid')
  const extname = path.extname(filepath)
  const modname = scr_util_uidflat(nodeuid)
  const [outstr, map] = await opts
    .hooktransform(pretransform(srcstr), node, extname, filepath, opts)
  const iscjs = moduletype.cjs(outstr)
  const isesm = moduletype.esm(outstr)

  // umd test is not fully accurate/reliable.
  // esm test is more reliable, so assume esm if esm test true
  if (moduletype.umd(outstr) && !isesm)
    throw scr_err_umdformatnotsupported(filepath)

  if (!iscjs && !isesm)
    return [outstr, map]

  let str = (iscjs && !isesm && opts.isbrowser && opts.deploytype !== 'module')
    ? umd(modname, outstr, { commonJS: true })
    : outstr.replace(/\/\/.*sourceMappingURL=[^\n]*/, '// sourceMapRemoved')

  // build import and require replacement mappings
  const replace = node.get('outarr').reduce((prev, cur) => {
    const refname = cur.get('refname')
    const depname = opts.isuidfilenames
      ? scr_util_uidflat(cur.get('uid'))
      : path.parse(cur.get('uid')).name

    // alias allows build to map customm paths values
    // to the require/import value
    // aliasarr scenario needs tests
    opts.aliasarr.map(([matchname, newname]) => (
      newname === refname && (
        prev[1][matchname] = depname,
        prev[0][matchname] = `/${depname}.js`)))

    prev[1][refname] = depname
    prev[0][refname] = `./${depname}.js`

    return prev
  }, [{}, {}])

  if (iscjs && !/export default/g.test(str))
    str = replacerequires(str, replace[1])

  if (isesm) {
    // replace import and export filepaths
    str = Object.keys(replace[0]).reduce((str, key) => {
      const re = buildImportReplaceRe(key)

      return str.replace(re, (match, g1, g2, g4) => (
        match.replace(g4, `'${replace[0][key]}'`)))
    }, str)
  }

  // found in some sources, such as inferno. discussion,
  //   https://github.com/rollup/rollup/issues/208
  str = str.replace(NODE_ENVre, NODE_ENVstr)

  return [str, map]
}

const adapt = async (opts, node, src) => {
  const uid = node.get('uid')
  const filepath = node.get('filepath')
  const content = node.get('content')
  const extname = path.extname(filepath)
  const embedarr = opts.embedarr.filter(e => ~filepath.indexOf(e.filepath))
  const globalarr = opts.globalarr.filter(e => ~filepath.indexOf(e.filepath))

  src = embedarr.reduce((accum, embed) => embed.content + accum, content)
  src = globalarr.reduce((accum, global) => (
    accum + '\nif (typeof window === "object") window.:NAME = :UID;'
      .replace(/:NAME/g, global.name)
      .replace(/:UID/g, scr_util_uidflat(uid))), src)

  return opts.jsextnre.test(extname)
    ? scr_adaptjs(opts, node, src)
    : opts.hooktransform(src, node, extname, filepath, opts)
}

export default Object.assign(adapt, { js: scr_adaptjs })
