// Filename: scrounge_basepage.js
// Timestamp: 2018.04.08-02:55:33 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import scrounge_node from './scrounge_node.js'
import scrounge_elem from './scrounge_elem.js'
import scrounge_file from './scrounge_file.js'

// each scrounge element may define _array_ of rootname
// removes duplicates. flattens array. unoptimised.
const getcontentrootnamearr = content => (
  scrounge_elem.getelemarr(content).reduce((prev, cur) => (
    prev.concat(scrounge_elem.getrootarr(cur))
  ), []).sort().filter((val, i, arr) => (
    arr.slice(i + 1).indexOf(val) === -1)))

const getrootnamearr = async (opts, filepath) => {
  const content = await scrounge_file.read(opts, filepath)

  return getcontentrootnamearr(content)
}

// updates a single element in the content, usually a timestamp.
// used when a file is updated, scrounge will process the file
// and update the timestamp forcing browser to load new script
//
// this
//     <script src="./cjsnode.js?ts=12345" type="text/javascript"></script>
//
// becomes this
//     <script src="./cjsnode.js?ts=45678" type="text/javascript"></script>
//
const writecontentelemone = (opts, content, node) => {
  const scriptpath = scrounge_file
    .setpublicoutputpath(opts, node.get('filepath'), node.get('uid'))
  const scriptsre = new RegExp(
    `${scriptpath.replace(/\.[^.]*$/, '')}.*(ts=[0-9]*)`, 'g')

  return content.replace(scriptsre, (a, b) => (
    a.replace(b, `ts=${opts.buildts}`)))
}

// read basepage and udpdate single elem timestampe only
const writeelemone = async (opts, filepath, node, fn) => {
  const contentstr = await scrounge_file.read(opts, filepath)
  const content = writecontentelemone(opts, contentstr, node)
  const res = await scrounge_file.write(opts, filepath, content)

  fn(null, res)
}

const writeelemarr = async (opts, filepath, elemarr, nodearrobj) => {
  const contentsrc = await scrounge_file.read(opts, filepath)

  const content = scrounge_elem.getelemarr(contentsrc).reduce((accum, elem) => {
    let indent = scrounge_elem.getindentation(elem)

    return accum.replace(elem, scrounge_elem.getpopulated(
      elem, scrounge_elem.getrootarr(elem).filter(root => (
        // only operate on rootnames with an associated nodearr
        nodearrobj[root] && nodearrobj[root].length
      )).map(root => (
        // each node in the array returns ordered listing of elements
        scrounge_node.arrgetincludetagarr(opts, nodearrobj[root], root)
          .map(elem => indent + elem).join('\n')
      )).join('\n')
    ))
  }, contentsrc)

  // if :scrounge.version appears in the template anywhere,
  // replace w/ optional 'version' definition
  const contentfin = content.replace(/:scrounge.version/gi, opts.version)

  return scrounge_file.write(opts, filepath, contentfin)
}

export default {
  getcontentrootnamearr,
  getrootnamearr,
  writecontentelemone,
  writeelemone,
  writeelemarr
}
