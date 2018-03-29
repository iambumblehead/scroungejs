// Filename: scrounge_prepend.js
// Timestamp: 2017.04.23-13:48:08 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const depgraph = require('depgraph');

module.exports = (o => {
  o.getprependobjtree = (prependarr, treename) => {
    let x,
        tree = null;

    for (x = prependarr.length; x--;) {
      if (prependarr[x].treename === treename) {
        tree = prependarr[x]; break;
      }
    }

    return tree;
  };

  o.getprenodearr = (opts, rootname, fn) => {
    let prependobj = o.getprependobjtree(opts.prependarr, rootname),
        content = null;

    if (!prependobj) return fn(null, content);

    depgraph.node.get_arrfromfilepathrel(prependobj.sourcearr, opts, fn);
  };

  return o;
})({});
