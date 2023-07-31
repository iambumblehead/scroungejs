// Filename: scrounge_cache.js
// Timestamp: 2018.04.07-18:52:37 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import path from 'path'
import optfn from 'optfn'
import depgraph from 'depgraph'

import scrounge_uid from './scrounge_uid.js'
import scrounge_file from './scrounge_file.js'

export default (o => {
  o.recoverrootcachemapnode = (opts, rootname, node, fn) => {
    const nodeuid = scrounge_uid.sanitised(node.get('uid')),
          cachepath = path.join('./.scrounge', rootname, nodeuid);

    scrounge_file.read(opts, cachepath, (err, res) => {
      if (err) return fn(err);

      fn(null, depgraph.node.get_fromjs(
        JSON.parse(res)).set('content', node.get('content')));
    });
  };

  o.recoverrootarrcachemapnode = (opts, rootnamearr, node, fn) => {
    let rootobjarr = {};

    (function next (rootarr, x = rootarr.length) {
      if (!x--) return fn(null, rootobjarr);

      o.recoverrootcachemapnode(opts, rootarr[x], node, (err, cachenode) => {
        if (err) return next(rootarr, x);

        rootobjarr[rootarr[x]] = [ cachenode ];

        next(rootarr, x);
      });
    }(rootnamearr));
  };

  o.persistrootcachemapfile = (opts, rootname, node, fn) => {
    const nodeuid = scrounge_uid.sanitised(node.get('uid')),
          nodejson = JSON.stringify(node.delete('content').toJS(), null, '  '),
          cachepath = path.join('./.scrounge', rootname, nodeuid);

    scrounge_file.writesilent(opts, cachepath, nodejson, fn);
  };

  o.buildrootcachemap = (opts, rootname, rootarr, fn) => {
    (function next (rootarr, x = rootarr.length) {
      if (!x--) return fn(null, 'done');

      o.persistrootcachemapfile(opts, rootname, rootarr[x], err => {
        if (err) return fn(err);

        next(rootarr, x);
      });
    }(rootarr));
  };

  o.buildrootobjcachemap = (opts, rootobj, fn) => {
    (function next (rootnamearr, x = rootnamearr.length) {
      if (!x--) return fn(null, 'done');

      o.buildrootcachemap(opts, rootnamearr[x], rootobj[rootnamearr[x]], err => {
        if (err) return fn(err);

        next(rootnamearr, x);
      });
    }(Object.keys(rootobj)));
  };

  o.buildmaps = (opts, rootsarr, rootobj, fn = optfn()) =>
    o.buildrootobjcachemap(opts, rootobj, fn);

  return o;
})({});
