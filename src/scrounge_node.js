// Filename: scrounge_node.js
// Timestamp: 2018.04.08-13:52:41 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// node : { moduletype, filepath, content }

import fs from 'node:fs/promises'
import path from 'path'

import scrounge_file from './scrounge_file.js'
import scrounge_elem from './scrounge_elem.js'

export default (o => {
  // for a node with filepath ~/software/node.js
  // return a 'css' type node if type is 'css' and
  // corresponding css file exists (~/software/node.css)
  o.getastype = async (node, type) => {
    const filepath = scrounge_file.setextn(node.get('filepath'), type)
    const filepathfull = path.resolve(filepath)
    const content = await fs
      .readFile(filepathfull,  { encoding: 'utf8' })
      .catch(() => null)

    return content && node
      .set('module', 'css')
      .set('filepath', filepath)
      .set('content', content)
  }

  o.getastypearr = async (node, typearr, x = typearr.length) => {
    if (!x--) throw new Error(`type not found ${typearr}`)

    return await o.getastype(node, typearr[x])
      || o.getastypearr(node, typearr, x)
  }
  //  return new Promise((resolve, error) => {
  o.getarrastypearr = (deparr, typearr, fn) => {
    (async function next (deparr, x, finarr) {
      if (!x--) return fn(null, finarr)

      const node = await o.getastypearr(deparr[x], typearr)
        .catch(() => null)

      if (node)
        finarr.push(node)

      return next(deparr, x, finarr)
    }(deparr, deparr.length, []))
  }

  // if basename has extension '.less',
  // extension returned would be '.css'
  o.setpublicextn = (opts, filepath, rootextn) => scrounge_file.setextn(
    filepath, (
      opts.jsextnarr.find(extn => extn === rootextn) ||
      opts.cssextnarr.find(extn => extn === rootextn) || rootextn))

  o.setoutputname = (opts, filepath, rootname) => o.setpublicextn(opts, (
    opts.isconcat
      ? scrounge_file.setbasename(filepath, rootname)
      : filepath), path.extname(rootname))

  //
  // return 'public' output path of node, path given to browser
  //
  o.getoutputpathpublic = (opts, node, rootname) => o.setoutputname(
    opts, scrounge_file.setpublicoutputpath(
      opts, node.get('filepath'), node.get('uid')), rootname)

  //
  // return final real system output path of node
  //
  o.getoutputpathreal = (opts, node, rootname) => o.setoutputname(
    opts, scrounge_file.setoutputpathreal(
      opts, node.get('filepath'), node.get('uid')), rootname)

  // for each node in the array build ordered listing of elements
  o.arrgetincludetagarr = (opts, nodearr, rootname) => (
    (opts.isconcat || opts.deploytype === 'module')
      ? [ scrounge_elem.getincludetag(
        opts, o.getoutputpathpublic(opts, nodearr[0], rootname),
        nodearr[0].get('module')) ]
      : nodearr.map(node => (
        scrounge_elem.getincludetag(
          opts, o.getoutputpathpublic(opts, node, rootname),
          node.get('module')
        ))).reverse())

  return o
})({})
