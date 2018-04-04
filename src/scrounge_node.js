// Filename: scrounge_node.js
// Timestamp: 2018.03.31-13:26:22 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const fs = require('fs'),
      path = require('path'),

      scrounge_uid = require('./scrounge_uid'),
      scrounge_file = require('./scrounge_file'),
      scrounge_elem = require('./scrounge_elem');

module.exports = (o => {
  // for a node with filepath ~/software/node.js
  // return a 'css' type node if type is 'css' and
  // corresponding css file exists (~/software/node.css)
  o.getastype = (node, type, fn) => {
    let filepath = scrounge_file.setextn(node.get('filepath'), type);

    fs.readFile(path.resolve(filepath), 'utf-8', (err, content) => {
      fn(err, err || node
        .set('moduletype', 'text/css')
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
  // extension returned may be '.css'
  o.setpublicextn = (opts, filepath, rootname) => {
    let rootextn = path.extname(rootname),
        fileextn = opts.jsextnarr.find(extn =>
          extn === rootextn
        ) || opts.cssextnarr.find(extn =>
          extn === rootextn
        ) || rootextn;

    return scrounge_file.setextn(filepath, fileextn);
  };

  o.setpublicoutputpath = (opts, node, rootname) => {
    let uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat
          ? scrounge_file.setbasename(filepath, rootname)
          : filepath;

    publicpath = o.setpublicextn(opts, publicpath, rootname);

    return scrounge_file.setpublicoutputpath(opts, publicpath, uid);
  };

  o.setpublicoutputpathreal = (opts, node, rootname) => {
    let uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat ?
          scrounge_file.setbasename(filepath, rootname) : filepath;

    publicpath = o.setpublicextn(opts, publicpath, rootname);

    return scrounge_file.setoutputpathreal(opts, publicpath, uid);
  };

  //
  // return a mapping of import paths
  // and the values they should be replaced with
  //
  o.buildimportreplacements = (opts, node) =>
    node.get('outarr').reduce((prev, cur) => {
      let refname = cur.get('refname'),
          depname = scrounge_uid.sanitised(cur.get('uid'));

      opts.aliasarr.map(([ matchname, newname ]) => (
        newname === refname &&
          (prev[matchname] = depname)
      ));

      prev[refname] = depname;

      return prev;
    }, {});


  // for each node in the array build ordered listing of elements
  o.arrgetincludetagarr = (opts, nodearr, rootname) => (
    opts.isconcat
      ? [ scrounge_elem.getincludetag(
        opts, o.setpublicoutputpath(opts, nodearr[0], rootname),
        nodearr[0].get('moduletype')) ]
      : nodearr.map(node => (
        scrounge_elem.getincludetag(
          opts, o.setpublicoutputpath(opts, node, rootname),
          node.get('moduletype')
        ))).reverse());

  return o;
})({});