// Filename: scrounge_root.js  
// Timestamp: 2017.07.29-19:19:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),
      depgraph = require('depgraph'),

      scrounge_log = require('./scrounge_log'),
      scrounge_file = require('./scrounge_file'),
      scrounge_opts = require('./scrounge_opts'),
      scrounge_prepend = require('./scrounge_prepend'),
      scrounge_depnode = require('./scrounge_depnode');

module.exports = (o => {

  // converts rootname array to one of the specified type
  // filters the result so that all values are unique
  //
  o.getnamearrastype = (opts, rootnamearr, type) => 
    rootnamearr.map(root => 
      scrounge_file.setextn(root, type)
    ).sort().filter((root, index, arr) => 
      index < 1 || root !== arr[index - 1]
    );

  // return rootname as a graph
  o.getasgraph = (opts, rootpath, fn) => {
    depgraph.graph.getfromseedfile(rootpath, opts, fn);
  };
  
  o.getfilenameasnode = (opts, rootname, fn) => {
    const filepath = o.getrootnameaspathextn(opts, rootname);

    if (!filepath) {
      console.error(rootname, opts.inputpath);
      throw new Error('rootname not found ' + filepath);
    }
    
    depgraph.node.get_fromfilepath(filepath, fn);
  };

  o.getrootnameaspath = (opts, rootname) => 
    opts.jsextnarr.map(extn => (
      scrounge_file.setextn(path.join(opts.inputpath, rootname), extn)
    )).find(scrounge_file.isexist);

  // returns extn-sensitive rootname (less or css)
  o.getrootnameaspathextn = (opts, rootname) => {
    const extnarr = scrounge_opts.filenamesupportedcss(opts, rootname)
          ? opts.cssextnarr
          : opts.jsextnarr;

    return extnarr.map(extn => (
      scrounge_file.setextn(path.join(opts.inputpath, rootname), extn)
    )).find(scrounge_file.isexist);
  };

  // return rootname as a graph deparr
  o.getasdeparr = (opts, rootname, fn) => {
    if (!/.js/.test(path.extname(rootname))) {
      throw new Error('.js file required for deparr');
    }

    let rootpath = o.getrootnameaspath(opts, rootname);
    if (!rootpath) {
      return scrounge_log.rootfilenotfound(opts,rootname);
    }
    
    o.getasgraph(opts, rootpath, (err, graph) => {
      if (err) return fn(err);
      
      scrounge_log.printroot(
        opts, rootname, opts.treetype === 'small' ?
          depgraph.tree.getfromgraphsmall(graph):
          depgraph.tree.getfromgraph(graph));
      
      fn(null, depgraph.graph.getdeparr(graph).reverse());
    });
  };
  
  o.getrootarrasdeparr = (opts, rootarr, fn) => {
    let graphnamearr = o.getnamearrastype(opts, rootarr, '.js');
    
    (function nextgraph (graphnamearr, x, graphsobj) {
      if (!x--) return fn(null, graphsobj);

      o.getasdeparr(opts, graphnamearr[x], (err, deparr) => {
        if (err) return fn(err);

        graphsobj[graphnamearr[x]] = deparr;

        scrounge_prepend.getprenodearr(opts, graphnamearr[x], (err, prenodearr) => {
          if (err) return fn(err);

          if (prenodearr) {
            graphsobj[graphnamearr[x]] = deparr.concat(prenodearr);
          }
          
          nextgraph(graphnamearr, x, graphsobj);
        });
      });
    }(graphnamearr, graphnamearr.length, {}));
  };

  // all root objects are created from a 'js' root equivalent
  o.getrootarrasobj = (opts, rootarr, fn) => {
    o.getrootarrasdeparr(opts, rootarr, (err, jsdeparrobj) => {
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
          scrounge_depnode.getarrastypearr(jsdeparr, opts.cssextnarr, (err, deparr) => {
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
  o.write = (opts, rootname, graphobj, fn) => {
    var rootextn = path.extname(rootname),
        graphname = scrounge_file.setextn(rootname, '.js'),
        deparr = graphobj[rootname];

    var nodewrite = (opts, node, rootname, content, fn) => {
      var filepath = scrounge_depnode.setpublicoutputpathreal(opts, node, rootname),
          rootextn = path.extname(rootname),
          fileextn =
            opts.jsextnarr.find(extn => extn === rootextn) ||
            opts.cssextnarr.find(extn => extn === rootextn) ||
            rootextn;
      
      filepath = scrounge_file.setextn(filepath, fileextn);
      scrounge_file.write(opts, filepath, content, fn);
    };    
        
    if (opts.isconcat) {
      (function nextdep (dep, x, contentarr) {
        if (!x--) return nodewrite(opts, dep[0], rootname, contentarr.join('\n'), fn);       

        scrounge_depnode.getcontentadapted(opts, dep[x], (err, res) => {
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

        scrounge_depnode.getcontentadapted(opts, dep[x], (err, res) => {
          if (err) return fn(err);

          nodewrite(opts, dep[x], rootname, res, (err, res) => {
            if (err) return fn(err);

            nextdep(dep, x);
          });
        });
      }(deparr, deparr.length));
    }
  };

  o.writearr = (opts, rootnamearr, graphobj, fn) => {
    if (rootnamearr.length) {
      if (graphobj[rootnamearr[0]] && graphobj[rootnamearr[0]].length) {
        o.write(opts, rootnamearr[0], graphobj, (err, res) => {
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
  
})({});
