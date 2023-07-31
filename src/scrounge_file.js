// Filename: scrounge_file.js
// Timestamp: 2018.04.08-13:12:03 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import fs from 'fs'
import path from 'path'
import pathpublic from 'pathpublic'
import scrounge_uid from './scrounge_uid.js'
import scrounge_log from './scrounge_log.js'

export default (o => {
  o.setextn = (filename, extn) => path.join(
    path.dirname(filename),
    path.basename(filename, path.extname(filename)) + extn)

  o.setbasename = (filepath, uid) => path.join(
    path.dirname(filepath),
    scrounge_uid.sanitised(uid) + path.extname(filepath))

  o.setpublicpath = (opts, filepath) => {
    // if publicpath not found in filepath, returns null
    let publicpath = pathpublic.get(filepath, opts.publicpath)

    return publicpath && publicpath.startsWith(opts.publicpath)
      ? publicpath
      : o.setpath(opts.publicpath, path.basename(filepath))
  }

  //
  // the final output path combined w/ public path to generate final path
  // replace windows-style '\' w/ posix style '/'
  //
  o.setpublicoutputpath = (opts, filepath, uid) => o.setpublicpath(
    opts, o.setoutputpathreal(opts, filepath, uid)).replace(/\\/g, '/')

  //
  // 'real' outputpath, because this is the systempath
  // to which the file is saved
  //
  o.setoutputpathreal = ({ outputpath, isconcat }, filepath, uid) => {
    if (!isconcat)
      filepath = o.setbasename(filepath, uid)

    return path.join(outputpath, path.basename(filepath))
  }

  //
  // path.join, but don't lose relative './' if present
  //
  o.setpath = (newpath, filepath) => (/^\.\//.test(newpath) ? './' : '') +
    path.join(newpath, path.basename(filepath))

  // ({ outputpath: './hey' }, '/path/to/file.js')
  //
  // return './hey/file.js'
  //
  o.setoutputpath = ({ outputpath }, filepath) =>
    o.setpath(outputpath, path.basename(filepath))

  // ({ inputpath: './path/' }, 'a/wonderful/path/to/file.js')
  //
  // return 'to/file.js'
  //
  o.rminputpath = ({ inputpath }, filepath) =>
    path.resolve(filepath).replace(path.resolve(inputpath) + path.sep, '')

  o.isexist = filepath => {
    try {
      return fs.statSync(filepath).isFile()
    } catch (err) { /* */ }

    return false
  }

  o.read = (opts, filepath, fn) =>
    fs.readFile(path.resolve(filepath), 'utf-8', fn)

  o.writesilent = async (opts, filepath, content, fn) => {
    fs.mkdir(path, { recursive:true })

    fs.writeFile(path.resolve(filepath), content, fn)
  }

  o.write = (opts, filepath, content, fn, isfilesize = false) => {
    scrounge_log.write(opts, filepath, isfilesize && Buffer.byteLength(content))

    o.writesilent(opts, filepath, content, fn)
  }

  o.copy = (opts, filepathin, filepathout, fn) =>
    o.read(opts, filepathin, (err, res) => {
      if (err) return fn(err)

      o.write(opts, filepathout, res, fn)
    })

  return o
})({})
