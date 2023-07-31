// Filename: scrounge_node.js
// Timestamp: 2018.04.08-13:52:41 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// node : { moduletype, filepath, content }

import fs from 'fs'
import path from 'path'

import scrounge_file from './scrounge_file.js'
import scrounge_elem from './scrounge_elem.js'

export default (o => {
  // for a node with filepath ~/software/node.js
  // return a 'css' type node if type is 'css' and
  // corresponding css file exists (~/software/node.css)
  o.getastype = (node, type, fn) => {
    let filepath = scrounge_file.setextn(node.get('filepath'), type);

    fs.readFile(path.resolve(filepath), 'utf-8', (err, content) => {
      fn(err, err || node
        .set('module', 'css')
        .set('filepath', filepath)
        .set('content', content));
    });
  };

  o.getastypearr = (node, typearr, fn) =>
    (function next (typearr, x) {
      if (!x--) return fn(`type not found ${typearr}`);

      o.getastype(node, typearr[x], (err, node) => {
        if (err) return next(typearr, x);

        fn(null, node);
      });
    }(typearr, typearr.length));

  o.getarrastype = (deparr, type, fn) =>
    (function next (deparr, x, finarr) {
      if (!x--) return fn(null, finarr);

      o.getastype(deparr[x], type, (err, node) => {
        if (err) return next(deparr, x, finarr);

        finarr.push(node);
        next(deparr, x, finarr);
      });
    }(deparr, deparr.length, []));

  o.getarrastypearr = (deparr, typearr, fn) =>
    (function next (deparr, x, finarr) {
      if (!x--) return fn(null, finarr);

      o.getastypearr(deparr[x], typearr, (err, node) => {
        if (err) return next(deparr, x, finarr);

        finarr.push(node);
        next(deparr, x, finarr);
      });
    }(deparr, deparr.length, []));

  // if basename has extension '.less',
  // extension returned would be '.css'
  o.setpublicextn = (opts, filepath, rootextn) => scrounge_file.setextn(
    filepath, (
      opts.jsextnarr.find(extn => extn === rootextn) ||
      opts.cssextnarr.find(extn => extn === rootextn) || rootextn));

  o.setoutputname = (opts, filepath, rootname) => o.setpublicextn(opts, (
    opts.isconcat
      ? scrounge_file.setbasename(filepath, rootname)
      : filepath), path.extname(rootname));

  //
  // return 'public' output path of node, path given to browser
  //
  o.getoutputpathpublic = (opts, node, rootname) => o.setoutputname(
    opts, scrounge_file.setpublicoutputpath(
      opts, node.get('filepath'), node.get('uid')), rootname);

  //
  // return final real system output path of node
  //
  o.getoutputpathreal = (opts, node, rootname) => o.setoutputname(
    opts, scrounge_file.setoutputpathreal(
      opts, node.get('filepath'), node.get('uid')), rootname);

  // for each node in the array build ordered listing of elements
  o.arrgetincludetagarr = (opts, nodearr, rootname) => (
    (opts.isconcat || opts.deploytype === 'module')
      ? [ scrounge_elem.getincludetag(
        opts, o.getoutputpathpublic(opts, nodearr[0], rootname),
        nodearr[0].get('module')) ]
      : nodearr.map(node => (
        scrounge_elem.getincludetag(
          opts, o.getoutputpathpublic(opts, node, rootname),
          node.get('module')
        ))).reverse());

  return o;
})({});
