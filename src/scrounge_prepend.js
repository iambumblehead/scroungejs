// Filename: scrounge_prepend.js  
// Timestamp: 2016.04.14-14:15:33 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var depgraph = require('depgraph');

var scrounge_prepend = module.exports = (function (o) {

  o.getprependobjtree = function (prependarr, treename) {
    var x, tree = null;
    
    for (x = prependarr.length; x--;) {
      if (prependarr[x].treename === treename) {
        tree = prependarr[x]; break;
      }
    }

    return tree;
  };
  
  o.getprenodearr = function (opts, rootname, fn) {
    var prependobj = o.getprependobjtree(opts.prependarr, rootname),
        content = null;

    if (!prependobj) return fn(null, content);

    depgraph.node.get_arrfromfilepathrel(prependobj.sourcearr, opts, fn);
  };

  return o;

}({}));










