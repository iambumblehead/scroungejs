// Filename: scrounge_root.js
// Timestamp: 2018.04.09-21:49:20 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import path from 'path'
import depgraph from 'depgraph'

import scrounge_log from './scrounge_log.js'
import scrounge_file from './scrounge_file.js'
import scrounge_opts from './scrounge_opts.js'
import scrounge_node from './scrounge_node.js'
import scrounge_adapt from './scrounge_adapt.js'
import scrounge_prepend from './scrounge_prepend.js'

export default (o => {
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
  o.getasgraph = (opts, rootpath, fn) =>
    depgraph.graph.getfromseedfile(rootpath, opts, fn);

  o.getfilenameasnode = (opts, rootname, fn) => {
    const filepath = o.getrootnameaspathextn(opts, rootname);

    if (filepath)
      depgraph.node.get_fromfilepath(filepath, fn);
    else
      scrounge_log.rootfilenotfound(opts, filepath);
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
      return fn(scrounge_log.rootfilenotfound(opts, rootname));
    }

    o.getasgraph(opts, rootpath, (err, graph) => {
      if (err) return fn(err);

      if (opts.treetype !== 'none')
        scrounge_log.printroot(
          opts, rootname, opts.treetype === 'small'
            ? depgraph.tree.getfromgraphsmall(graph)
            : depgraph.tree.getfromgraph(graph));

      fn(null, depgraph.graph.getdeparr(graph).reverse());
    });
  };

  //
  // returns a map object { treename : dependencyarr }
  //
  o.getrootarrasdeparr = (opts, rootarr, fn) => {
    let graphnamearr = o.getnamearrastype(opts, rootarr, '.js');

    (function nextgraph (graphnamearr, x, graphsobj) {
      if (!x--) return fn(null, graphsobj);

      o.getasdeparr(opts, graphnamearr[x], (err, deparr) => {
        if (err) return fn(err);

        scrounge_prepend.getprenodearr(opts, graphnamearr[x], (err, prenodearr) => {
          if (err) return fn(err);

          graphsobj[graphnamearr[x]] = prenodearr
            ? deparr.concat(prenodearr)
            : deparr;

          nextgraph(graphnamearr, x, graphsobj);
        });
      });
    }(graphnamearr, graphnamearr.length, {}));
  };

  //
  // obtains the map object created from 'js' roots
  // constructs non-js root definitions derived from js roots
  //
  o.getrootarrasobj = (opts, rootarr, fn) => {
    o.getrootarrasdeparr(opts, rootarr, (err, jsdeparrobj) => {
      if (err) return fn(err);

      (function next (rootarr, x, len, jsdeparrobj, deparrobj) {
        if (x >= len) return fn(null, deparrobj);

        let rootname = rootarr[x],
            rootextn = path.extname(rootname),
            jsdeparr = jsdeparrobj[scrounge_file.setextn(rootname, '.js')];

        if (rootextn === '.js') {
          deparrobj[rootname] = jsdeparrobj[rootname];

          next(rootarr, ++x, len, jsdeparrobj, deparrobj);
        } else if (rootextn === '.css') {
          scrounge_node.getarrastypearr(jsdeparr, opts.cssextnarr, (err, deparr) => {
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
    let rootextn = path.extname(rootname),
        graphname = scrounge_file.setextn(rootname, '.js'),
        deparr = graphobj[rootname],

        nodewrite = (opts, node, rootname, content, fn) => {
          let filepath = scrounge_node.getoutputpathreal(opts, node, rootname),
              rootextn = path.extname(rootname),
              fileextn =
                opts.jsextnarr.find(extn => extn === rootextn) ||
                opts.cssextnarr.find(extn => extn === rootextn) ||
                rootextn;

          filepath = scrounge_file.setextn(filepath, fileextn);

          if (fileextn === '.js' && opts.issourcemap) {
            scrounge_adapt.js({
              ...opts,
              sourcemap : true,
              sourceFileName : path.basename(filepath),
              iscompress : true,
              test : true
            }, node, content, (err, contenta, map) => {
              scrounge_file.write(opts, `${filepath}.map`, JSON.stringify(map, null, '  '), () => {
                content = `//# sourceMappingURL=${path.basename(filepath)}.map\n${content}`;
                scrounge_file.write(opts, filepath, content, fn, true);
              });
            });
          } else {
            scrounge_file.write(opts, filepath, content, fn, true);
          }
        };

    if (opts.isconcat) {
      (function nextdep (dep, x, contentarr) {
        if (!x--) return nodewrite(opts, dep[0], rootname, contentarr.join('\n'), fn);

        let adaptopts = {
          ...opts,
          issourcemap : false,
          iscompress : opts.issourcemap === false && opts.iscompress
        };

        scrounge_adapt(adaptopts, dep[x], (err, res) => {
          if (err) return fn(err);

          scrounge_log.rootjoinfile(
            adaptopts, graphname, rootextn, dep[x].get('filepath'), x, deparr.length
          );

          contentarr.push(res);
          nextdep(deparr, x, contentarr);
        });
      }(deparr, deparr.length, []));
    } else {
      (function nextdep (dep, x) {
        if (!x--) return fn(null, 'success');

        scrounge_adapt(opts, dep[x], (err, res) => {
          if (err) return fn(err);

          nodewrite(opts, dep[x], rootname, res, err => {
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
        o.write(opts, rootnamearr[0], graphobj, err => {
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
