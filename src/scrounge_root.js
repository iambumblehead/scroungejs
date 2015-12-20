// Filename: scrounge_root.js  
// Timestamp: 2015.12.19-20:26:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var path = require('path'),
    depgraph = require('depgraph'),

    scrounge_log = require('./scrounge_log'),
    scrounge_file = require('./scrounge_file'),
    scrounge_depnode = require('./scrounge_depnode');

var scrounge_root = module.exports = (function (o) {

  // converts rootname array to one of the specified type
  // filters the result so that all values are unique
  //
  o.getnamearrastype = function (opts, rootnamearr, type) {
    return rootnamearr.map(function (root) {
      return scrounge_file.setextn(root, type);
    }).sort().filter(function (root, index, arr) {
      return index < 1 || root !== arr[index - 1];
    });
  };

  // return rootname as a graph
  o.getasgraph = function (opts, rootname, fn) {
    if (!/.js/.test(path.extname(rootname))) {
      throw new Error('.js file required for deparr');
    }

    depgraph.graph.getfromseedfile(
      path.join(opts.inputpath, rootname), opts, fn);
  };

  // return rootname as a graph deparr
  o.getasdeparr = function (opts, rootname, fn) {
    o.getasgraph(opts, rootname, function (err, graph) {      
      if (err) return fn(err);
      
      scrounge_log.printroot(
        opts, rootname, opts.treetype === 'small' ?
          depgraph.tree.getfromgraphsmall(graph):
          depgraph.tree.getfromgraph(graph));
      
      fn(null, depgraph.graph.getdeparr(graph).reverse());
    });
  };
  
  o.getrootarrasdeparr = function (opts, rootarr, fn) {
    var graphnamearr = o.getnamearrastype(opts, rootarr, '.js');
    
    (function nextgraph (graphnamearr, x, graphsobj) {
      if (!x--) return fn(null, graphsobj);

      o.getasdeparr(opts, graphnamearr[x], function (err, deparr) {
        if (err) return fn(err);

        graphsobj[graphnamearr[x]] = deparr;
        
        return nextgraph(graphnamearr, x, graphsobj);        
      });
    }(graphnamearr, graphnamearr.length, {}));
  };

  // all root objects are created from a 'js' root equivalent
  o.getrootarrasobj = function (opts, rootarr, fn) {
    o.getrootarrasdeparr(opts, rootarr, function (err, jsdeparrobj) {
      if (err) return fn(err);

      (function next (rootarr, x, len, jsdeparrobj, deparrobj) {
        if (x >= len) return fn(null, deparrobj);

        var rootname = rootarr[x],
            rootextn = path.extname(rootname),
            jsdeparr = jsdeparrobj[scrounge_file.setextn(rootname, '.js')];
        
        if (rootextn === '.js') {
          deparrobj[rootname] = jsdeparrobj[rootname];
          next(rootarr, ++x, len, jsdeparrobj, deparrobj);
        } else if (rootextn === '.css') {
          scrounge_depnode.getarrastypearr(jsdeparr, opts.cssextnarr, function (err, deparr) {
            if (err) return fn(err);

            deparrobj[rootname] = deparr;
            next(rootarr, ++x, len, jsdeparrobj, deparrobj);
          });
        }
      }(rootarr, 0, rootarr.length, jsdeparrobj, {}));
    });
  };

  // matches should be build and constructed ahead of this point,
  // to be reused for write at basepage
  o.write = function (opts, rootname, graphobj, fn) {
    var rootextn = path.extname(rootname),
        graphname = scrounge_file.setextn(rootname, '.js'),
        deparr = graphobj[rootname];

    var nodewrite = function (opts, node, rootname, content, fn) {
      var filepath = scrounge_depnode.setpublicoutputpathreal(opts, node, rootname),
          rootextn = path.extname(rootname),
          fileextn = opts.jsextnarr.find(function (extn) {
            return extn === rootextn;
          }) || opts.cssextnarr.find(function (extn) {
            return extn === rootextn;
          });

      filepath = scrounge_file.setextn(filepath, fileextn);

      scrounge_file.write(opts, filepath, content, fn);
    };    


    if (opts.isconcat) {
      (function nextdep (dep, x, contentarr) {
        if (!x--) return nodewrite(opts, dep[0], rootname, contentarr.join('\n'), fn);       

        scrounge_depnode.getcontentadapted(opts, dep[x], function (err, res) {
          if (err) return fn(err);          

          scrounge_log.rootjoinfile(
            opts, graphname, rootextn, dep[x].get('filepath'), x, deparr.length
          );
          
          contentarr.push(res);
          nextdep(deparr, x, contentarr);
        });
      }(deparr, deparr.length, []));
    } else {
      (function nextdep (dep, x) {
        if (!x--) return fn(null, 'success');

        scrounge_depnode.getcontentadapted(opts, dep[x], function (err, res) {
          if (err) return fn(err);

          nodewrite(opts, dep[x], rootname, res, function (err, res) {          
            if (err) return fn(err);

            nextdep(dep, x);
          });
        });
      }(deparr, deparr.length));
    }
  };

  o.writearr = function (opts, rootnamearr, graphobj, fn) {
    if (rootnamearr.length) {
      if (graphobj[rootnamearr[0]].length) {
        o.write(opts, rootnamearr[0], graphobj, function (err, res) {
          if (err) return fn(err);
          
          o.writearr(opts, rootnamearr.slice(1), graphobj, fn);
        });
      } else {
        o.writearr(opts, rootnamearr.slice(1), graphobj, fn);
      }
    } else {
      fn(null);
    }
  };

  return o;
  
}({}));
