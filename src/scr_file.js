import fs from 'node:fs/promises'
import url from 'node:url'
import { statSync } from 'fs'
import path from 'path'
import pathpublic from 'pathpublic'

import {
  scr_logwrite
} from './scr_log.js'

import {
  scr_util_uidflat
} from './scr_util.js'

const setextn = (filename, extn) => path.join(
  path.dirname(filename),
  path.basename(filename, path.extname(filename)) + extn)

const setbasename = (filepath, uid) => path.join(
  path.dirname(filepath),
  scr_util_uidflat(uid) + path.extname(filepath))

//
// path.join, but don't lose relative './' if present
//
const setpath = (newpath, filepath) => (/^\.\//.test(newpath) ? './' : '') +
  path.join(newpath, path.basename(filepath))

const setpublicpath = (opts, filepath) => {
  const metapath = url.fileURLToPath(opts.metaurl)
  const filepathrel = filepath.replace(metapath, '')
  // where file path includes public path in project root path
  //  * publicpath: '/project.name/'
  //  * filepath: '/path/to/project.name/build/project.name/'
  //
  // public filepath should begin from from the build directory
  // remove metaurl from filepath to avoid getting wrong publicpath match
  const publicpath = pathpublic.get(filepathrel, opts.publicpath)

  return publicpath && publicpath.startsWith(opts.publicpath)
    ? publicpath
    : setpath(opts.publicpath, path.basename(filepath))
}

//
// 'real' outputpath, because this is the systempath
// to which the file is saved
//
const setoutputpathreal = (opts, filepath, uid) => {
  if (!opts.isconcat && opts.isuidfilenames)
    filepath = setbasename(filepath, uid)

  return path.join(opts.outputpath, path.basename(filepath))
}

//
// the final output path combined w/ public path to generate final path
// replace windows-style '\' w/ posix style '/'
//
const setpublicoutputpath = (opts, filepath, uid) => setpublicpath(
  opts, setoutputpathreal(opts, filepath, uid)).replace(/\\/g, '/')

// ({ outputpath: './hey' }, '/path/to/file.js')
//
// return './hey/file.js'
//
const setoutputpath = ({ outputpath }, filepath) => (
  setpath(outputpath, path.basename(filepath)))

// ({ inputpath: './path/' }, 'a/wonderful/path/to/file.js')
//
// return 'to/file.js'
//
const rminputpath = ({ inputpath }, filepath) => (
  path.resolve(filepath).replace(path.resolve(inputpath) + path.sep, ''))

const isexist = filepath => {
  try {
    return statSync(filepath).isFile()
  } catch { /* */ }

  return false
}

const read = (opts, filepath) => (
  fs.readFile(path.resolve(filepath), { encoding: 'utf8' }))

const mkdirp = async dir => fs.mkdir(dir, { recursive: true })

const writesilent = async (opts, filepath, content) => (
  fs.writeFile(path.resolve(filepath), content))

const write = async (opts, filepath, content, isfilesize = false) => (
  scr_logwrite(opts, filepath, isfilesize && Buffer.byteLength(content)),
  writesilent(opts, filepath, content))

const copy = async (opts, filepathin, filepathout) => (
  write(opts, filepathout, await read(opts, filepathin)))

export default {
  setextn,
  setbasename,
  setpublicpath,
  setpublicoutputpath,
  setoutputpathreal,
  setpath,
  setoutputpath,
  rminputpath,
  isexist,
  read,
  mkdirp,
  writesilent,
  write,
  copy
}
