// Filename: scrounge_elem.js
// Timestamp: 2018.04.08-06:10:37 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import path from 'path'
import addquery from 'addquery'

// include tags for css and js
//
// type="text/javascript"
// type="module"
const includejstpl = '<script src="$" type=":type"></script>'
const includecsstpl = '<link href="$" rel="stylesheet" type="text/css">'

const elemre = / *<!-- <scrounge([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi
const elemrootre = /root="([\s\S]*?)"/
const elemtypere = /type="(\.[cj]ss?)?"/

// moduletype definion 'css', 'cjs', 'esm' becomes
//
//   'text/css', 'text/javascript', or 'module'
//
const getincludetag = (opts, filepath, moduletype) => {
  let extn = path.extname(filepath),
      include

  if (opts.cssextnarr.includes(extn))
    include = includecsstpl
  else if (opts.jsextnarr.includes(extn))
    include = includejstpl
  else
    throw new Error(`Invalid type, ${extn}`)

  if (opts.version)
    filepath = addquery(filepath, `v=${opts.version}`)

  if (opts.istimestamp)
    filepath = addquery(filepath, `ts=${opts.buildts}`)

  if (moduletype === 'css')
    moduletype = 'test/css'
  else if (opts.deploytype === 'module' && moduletype === 'esm')
    moduletype = 'module'
  else
    moduletype = 'text/javascript'

  return include
    .replace(/\$/, filepath)
    .replace(/:type/, moduletype)
}

const getrootarr = str => {
  let rootmatch = str.match(elemrootre)

  return (rootmatch && rootmatch[1])
    ? rootmatch[1].split(/,/).map(root => root.trim())
    : []
}

// return the indentation behind the scounge tag
// scroung tag: '   <!-- <scrounge.js> -->'
// indentation: '   '
const getindentation = elemstr => {
  let m = elemstr.match(/^\s*/)

  return Array.isArray(m) ? m[0] : ''
}

const gettype = str => {
  let typematch = str.match(elemtypere)

  return typematch && typematch[1]
}

const getelemarr = content => content
  .match(elemre) || []

// (re)populate scrounge 'elem' body with 'body'
//
// elem,
//
//   <!-- <scrounge root="app.css"> -->
//   <!-- </scrounge> -->
//
// body,
//
//   <link href="./out/viewa.css?ts=152" rel="stylesheet" type="text/css">
//   <link href="./out/viewb.css?ts=152" rel="stylesheet" type="text/css">
//
// return,
//
//   <!-- <scrounge root="app.css"> -->
//   <link href="./out/viewa.css?ts=123" rel="stylesheet" type="text/css">
//   <link href="./out/viewb.css?ts=123" rel="stylesheet" type="text/css">
//   <!-- </scrounge> -->
//
const getpopulated = (elem, body) => elem.replace(
  elem.replace(elemre, '$2'), `\n${body}\n${getindentation(elem)}`)

export default {
  getincludetag,
  getrootarr,
  getindentation,
  gettype,
  getelemarr,
  getpopulated
}
