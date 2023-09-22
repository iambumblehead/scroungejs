// Filename: scrounge_cache.js
// Timestamp: 2018.04.07-18:52:37 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import path from 'path'
import depgraph from 'depgraph'

import scrounge_uid from './scrounge_uid.js'
import scrounge_file from './scrounge_file.js'

const recoverrootcachemapnode = async (opts, rootname, node) => {
  const nodeuid = scrounge_uid.sanitised(node.get('uid'))
  const cachepath = path.join('./.scrounge', rootname, nodeuid)
  const cachenode = await scrounge_file.read(opts, cachepath)

  return depgraph.node.get_fromjs(
    JSON.parse(cachenode)).set('content', node.get('content'))
}

const recoverrootarrcachemapnode = async (opts, rootnamearr, node) => {
  let rootobjarr = {};

  (async function next (rootarr, x = rootarr.length) {
    if (!x--) return rootobjarr

    const cachenode = await recoverrootcachemapnode(opts, rootarr[x], node)
      .catch(() => null)

    if (cachenode)
      rootobjarr[rootarr[x]] = [ cachenode ]

    next(rootarr, x)
  }(rootnamearr))
}

const persistrootcachemapfile = async (opts, rootname, node, fn) => {
  const nodeuid = scrounge_uid.sanitised(node.get('uid'))
  const nodejson = JSON.stringify(node.delete('content').toJS(), null, '  ')
  const cachepath = path.join('./.scrounge', nodeuid, rootname)

  await scrounge_file.mkdirp(path.join('./.scrounge', nodeuid))
  const res = await scrounge_file.writesilent(opts, cachepath, nodejson)

  fn(null, res)
}

const buildrootcachemap = (opts, rootname, rootarr, fn) => {
  (function next (rootarr, x = rootarr.length) {
    if (!x--) return fn(null, 'done')

    persistrootcachemapfile(opts, rootname, rootarr[x], err => {
      if (err) return fn(err)

      next(rootarr, x)
    })
  }(rootarr))
}

const buildrootobjcachemap = (opts, rootobj, fn) => {
  (function next (rootnamearr, x = rootnamearr.length) {
    if (!x--) return fn(null, 'done')

    buildrootcachemap(opts, rootnamearr[x], rootobj[rootnamearr[x]], err => {
      if (err) return fn(err)

      next(rootnamearr, x)
    })
  }(Object.keys(rootobj)))
}

const buildmaps = (opts, rootsarr, rootobj, fn = () => {}) => (
  buildrootobjcachemap(opts, rootobj, fn))

export default {
  recoverrootcachemapnode,
  recoverrootarrcachemapnode,
  persistrootcachemapfile,
  buildrootcachemap,
  buildrootobjcachemap,
  buildmaps
}
