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
