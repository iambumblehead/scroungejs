import url from 'node:url'
import path from 'path'
import depgraph from 'depgraph'

import scr_file from './scr_file.js'

import {
  scr_util_uidflat
} from './scr_util.js'

const getcachepathurl = opts =>
  new url.URL('./.scrounge/', opts.metaurl)

const getcachepathfrom = (opts, cachepath) =>
  String(new url.URL(cachepath, getcachepathurl(opts)))
    .replace(/^file:\/\//, '')

const recoverrootcachemapnode = async (opts, rootname, node) => {
  const nodeuid = scr_util_uidflat(node.get('uid'))
  const cachepath = getcachepathfrom(opts, path.join(nodeuid, rootname))
  const cachenode = await scr_file.read(opts, cachepath)

  return depgraph.node.get_fromjs(
    JSON.parse(cachenode)).set('content', node.get('content'))
}

const recoverrootarrcachemapnode = async (opts, rootnamearr, node) => {
  let rootobjarr = {}

  return (async function next (rootarr, x = rootarr.length) {
    if (!x--) return rootobjarr

    const cachenode = await recoverrootcachemapnode(opts, rootarr[x], node)
      .catch(e => console.log(e))

    if (cachenode) {
      rootobjarr[rootarr[x]] = [cachenode]
    }

    return next(rootarr, x)
  }(rootnamearr))
}

const persistrootcachemapfile = async (opts, rootname, node) => {
  const nodeuid = scr_util_uidflat(node.get('uid'))
  const nodejson = JSON.stringify(node.delete('content').toJS(), null, '  ')
  const cachepath = getcachepathfrom(opts, path.join(nodeuid, rootname))

  await scr_file.mkdirp(getcachepathfrom(opts, nodeuid))

  return scr_file.writesilent(opts, cachepath, nodejson)
}

const buildrootcachemap = async (opts, rootname, rootarr) => {
  return (async function next (rootarr, x = rootarr.length) {
    if (!x--) return true

    await persistrootcachemapfile(opts, rootname, rootarr[x])

    return next(rootarr, x)
  }(rootarr))
}

const buildrootobjcachemap = async (opts, rootobj) => {
  return (async function next (rootnamearr, x = rootnamearr.length) {
    if (!x--) return true

    await buildrootcachemap(opts, rootnamearr[x], rootobj[rootnamearr[x]])

    return next(rootnamearr, x)
  }(Object.keys(rootobj)))
}

const buildmaps = async (opts, rootsarr, rootobj) => (
  buildrootobjcachemap(opts, rootobj))

export default {
  recoverrootcachemapnode,
  recoverrootarrcachemapnode,
  persistrootcachemapfile,
  buildrootcachemap,
  buildrootobjcachemap,
  buildmaps
}
