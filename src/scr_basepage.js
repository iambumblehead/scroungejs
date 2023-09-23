import scr_node from './scr_node.js'
import scr_elem from './scr_elem.js'
import scr_file from './scr_file.js'

// each scrounge element may define _array_ of rootname
// removes duplicates. flattens array. unoptimised.
const scr_basepage_getcontentrootnamearr = content => (
  scr_elem.getelemarr(content)
    .reduce((prev, cur) => prev.concat(scr_elem.getrootarr(cur)), [])
    .sort()
    .filter((val, i, arr) => arr.slice(i + 1).indexOf(val) === -1))

const scr_basepage_getrootnamearr = async (opts, filepath) => {
  const content = await scr_file.read(opts, filepath)

  return scr_basepage_getcontentrootnamearr(content)
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
const scr_basepage_writecontentelemone = (opts, content, node) => {
  const scriptpath = scr_file
    .setpublicoutputpath(opts, node.get('filepath'), node.get('uid'))
  const scriptsre = new RegExp(
    `${scriptpath.replace(/\.[^.]*$/, '')}.*(ts=[0-9]*)`, 'g')

  return content.replace(scriptsre, (a, b) => (
    a.replace(b, `ts=${opts.buildts}`)))
}

// read basepage and udpdate single elem timestampe only
const scr_basepage_writeelemone = async (opts, filepath, node) => {
  const contentstr = await scr_file.read(opts, filepath)
  const content = scr_basepage_writecontentelemone(opts, contentstr, node)

  return scr_file.write(opts, filepath, content)
}

const scr_basepage_writeelemarr = async (opts, filepath, elemarr, nodearr) => {
  const contentsrc = await scr_file.read(opts, filepath)

  const content = scr_elem.getelemarr(contentsrc).reduce((accum, elem) => {
    let indent = scr_elem.getindentation(elem)

    return accum.replace(elem, scr_elem.getpopulated(
      elem, scr_elem.getrootarr(elem).filter(root => (
        // only operate on rootnames with an associated nodearr
        nodearr[root] && nodearr[root].length
      )).map(root => (
        // each node in the array returns ordered listing of elements
        scr_node.arrgetincludetagarr(opts, nodearr[root], root)
          .map(elem => indent + elem).join('\n')
      )).join('\n')
    ))
  }, contentsrc)

  // if :scrounge.version appears in the template anywhere,
  // replace w/ optional 'version' definition
  const contentfin = content.replace(/:scrounge.version/gi, opts.version)

  return scr_file.write(opts, filepath, contentfin)
}

export {
  scr_basepage_getcontentrootnamearr,
  scr_basepage_getrootnamearr,
  scr_basepage_writecontentelemone,
  scr_basepage_writeelemone,
  scr_basepage_writeelemarr
}
