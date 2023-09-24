import umd from 'umd'
import path from 'path'
import moduletype from 'moduletype'
import replacerequires from 'replace-requires'
import replaceimports from 'replace-imports'

import {
  scr_util_uidflat
} from './scr_util.js'

import {
  scr_err_umdformatnotsupported
} from './scr_err.js'

const NODE_ENVre = /process\.env\.NODE_ENV/g
const NODE_ENVstr = `'${process.env.NODE_ENV}'`

const scr_adaptjs = async (opts, node, srcstr) => {
  const filepath = node.get('filepath')
  const nodeuid = node.get('uid')
  const extname = path.extname(filepath)
  const modname = scr_util_uidflat(nodeuid)
  const [ outstr, map ] = await opts
    .hooktransform(srcstr, node, extname, filepath, opts)
  const iscjs = moduletype.cjs(outstr)
  const isesm = moduletype.esm(outstr)

  if (moduletype.umd(outstr))
    throw scr_err_umdformatnotsupported()

  if (!iscjs && !isesm)
    return [ outstr, map ]

  let str = (iscjs && !isesm && opts.isbrowser)
    ? umd(modname, outstr, { commonJS: true })
    : outstr

  // build import and require replacement mappings
  const replace = node.get('outarr').reduce((prev, cur) => {
    const refname = cur.get('refname')
    const depname = opts.isuidfilenames
      ? scr_util_uidflat(cur.get('uid'))
      : path.parse(cur.get('uid')).name

    // alias allows build to map customm paths values
    // to the require/import value
    // aliasarr scenario needs tests
    opts.aliasarr.map(([ matchname, newname ]) => (
      newname === refname && (
        prev[1][matchname] = depname,
        prev[0][matchname] = `/${depname}.js`)))

    prev[1][refname] = depname
    prev[0][refname] = `./${depname}.js`

    return prev
  }, [ {}, {} ])

  if (iscjs && !/export default/g.test(str))
    str = replacerequires(str, replace[1])

  if (isesm)
    str = replaceimports(str, replace[0])

  // found in some sources, such as inferno. discussion,
  //   https://github.com/rollup/rollup/issues/208
  str = str.replace(NODE_ENVre, NODE_ENVstr)

  return [ str, map ]
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
