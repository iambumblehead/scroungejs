// Filename: scrounge_prepend.js
// Timestamp: 2018.04.09-22:14:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const depgraph = require('depgraph');

module.exports = (o => {
  o.getprenodearr = (opts, rootname, fn) => {
    let prependobj = opts.prependarr.find(prepend => (
      prepend.treename === rootname));

    return prependobj
      ? depgraph.node.get_arrfromfilepathrel(prependobj.sourcearr, opts, fn)
      : fn(null, null);
  };

  return o;
})({});
