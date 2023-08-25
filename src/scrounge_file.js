// Filename: scrounge_file.js
// Timestamp: 2018.04.08-13:12:03 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import fs from 'fs'
import path from 'path'
import pathpublic from 'pathpublic'
import scrounge_uid from './scrounge_uid.js'
import scrounge_log from './scrounge_log.js'

const setextn = (filename, extn) => path.join(
  path.dirname(filename),
  path.basename(filename, path.extname(filename)) + extn)

const setbasename = (filepath, uid) => path.join(
  path.dirname(filepath),
  scrounge_uid.sanitised(uid) + path.extname(filepath))

const setpublicpath = (opts, filepath) => {
  // if publicpath not found in filepath, returns null
  let publicpath = pathpublic.get(filepath, opts.publicpath)

  return publicpath && publicpath.startsWith(opts.publicpath)
    ? publicpath
    : setpath(opts.publicpath, path.basename(filepath))
}

//
// the final output path combined w/ public path to generate final path
// replace windows-style '\' w/ posix style '/'
//
const setpublicoutputpath = (opts, filepath, uid) => setpublicpath(
  opts, setoutputpathreal(opts, filepath, uid)).replace(/\\/g, '/')

//
// 'real' outputpath, because this is the systempath
// to which the file is saved
//
const setoutputpathreal = ({ outputpath, isconcat }, filepath, uid) => {
  if (!isconcat)
    filepath = setbasename(filepath, uid)

  return path.join(outputpath, path.basename(filepath))
}

//
// path.join, but don't lose relative './' if present
//
const setpath = (newpath, filepath) => (/^\.\//.test(newpath) ? './' : '') +
      path.join(newpath, path.basename(filepath))

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
    return fs.statSync(filepath).isFile()
  } catch (err) { /* */ }

  return false
}

const read = (opts, filepath, fn) => (
  fs.readFile(path.resolve(filepath), 'utf-8', fn))

const mkdirpSync = dir => fs.mkdirSync(dir, { recursive: true })

const writesilent = async (opts, filepath, content, fn) => {
  fs.writeFile(path.resolve(filepath), content, fn)
}

const write = (opts, filepath, content, fn, isfilesize = false) => {
  scrounge_log.write(opts, filepath, isfilesize && Buffer.byteLength(content))

  writesilent(opts, filepath, content, fn)
}

const copy = (opts, filepathin, filepathout, fn) => (
  read(opts, filepathin, (err, res) => {
    if (err) return fn(err)

    write(opts, filepathout, res, fn)
  }))

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
  mkdirpSync,
  writesilent,
  write,
  copy
}
