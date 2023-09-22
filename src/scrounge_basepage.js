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

const getrootnamearr = (opts, filepath, fn) => (
  scrounge_file.read(opts, filepath, (err, content) => (
    fn(err, err || getcontentrootnamearr(content)))))

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
const writeelemone = (opts, filepath, node, fn) => {
  scrounge_file.read(opts, filepath, (err, content) => {
    if (err) return fn(err)

    content = writecontentelemone(opts, content, node)

    scrounge_file.write(opts, filepath, content, fn)
  })
}

const writeelemarr = async (opts, filepath, elemarr, nodearrobj) => {
  return new Promise((resolve, error) => {
  scrounge_file.read(opts, filepath, (err, content) => {
    if (err) return error(err)

    let newcontent = scrounge_elem.getelemarr(content).reduce((content, elem) => {
      let indent = scrounge_elem.getindentation(elem)

      return content.replace(elem, scrounge_elem.getpopulated(
        elem, scrounge_elem.getrootarr(elem).filter(root => (
          // only operate on rootnames with an associated nodearr
          nodearrobj[root] && nodearrobj[root].length
        )).map(root => (
          // each node in the array returns ordered listing of elements
          scrounge_node.arrgetincludetagarr(opts, nodearrobj[root], root)
            .map(elem => indent + elem).join('\n')
        )).join('\n')
      ))
    }, content)

    // if :scrounge.version appears in the template anywhere,
    // replace w/ optional 'version' definition
    newcontent = newcontent.replace(/:scrounge.version/gi, opts.version)

    scrounge_file.write(opts, filepath, newcontent, (err, res) => {
      if (err) return error(err)

      resolve(res)
    })
  })
  })
}

export default {
  getcontentrootnamearr,
  getrootnamearr,
  writecontentelemone,
  writeelemone,
  writeelemarr
}
