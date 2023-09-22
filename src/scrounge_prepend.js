// Filename: scrounge_prepend.js
// Timestamp: 2018.04.09-22:14:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import depgraph from 'depgraph'

const getprenodearr = async (opts, rootname) => {
  const prependobj = opts.prependarr
    .find(prepend => prepend.treename === rootname)

  return prependobj
    ? depgraph.node.get_arrfromfilepathrel(prependobj.sourcearr, opts)
    : null
}

export default {
  getprenodearr
}
