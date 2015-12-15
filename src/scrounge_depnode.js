// Filename: scrounge_depnode.js  
// Timestamp: 2015.12.15-10:49:18 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),

    scrounge_log = require('./scrounge_log'),
    scrounge_file = require('./scrounge_file'),
    scrounge_elem = require('./scrounge_elem'),    
    scrounge_adapt = require('./scrounge_adapt');

var scrounge_depnode = module.exports = (function (o) {

  o.getcontentadapted = function (opts, node, fn) {
    scrounge_adapt(opts, node, node.get('content'), fn);
  };

  o.getastype = function (node, type, fn) {
    var filepath = scrounge_file.setextn(node.get('filepath'), type);

    fs.readFile(path.resolve(filepath), 'utf-8', function (err, content) {
      fn(err, err || node
         .set('filepath', filepath)
         .set('content', content));
    });
  };

  o.getarrastype = function (deparr, type, fn) {
    (function next (deparr, x, finarr) {
      if (!x--) return fn(null, finarr);      

      o.getastype(deparr[x], type, function (err, node) {
        if (err) return next(deparr, x, finarr);

        finarr.push(node);
        next(deparr, x, finarr);
      });
    }(deparr, deparr.length, []));      
  };

  o.setpublicoutputpath = function (opts, node, rootname) {
    var uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat ?
          scrounge_file.setbasename(filepath, rootname) : filepath;

    return scrounge_file.setpublicoutputpath(opts, publicpath, uid);
  };

  o.setpublicoutputpathreal = function (opts, node, rootname) {
    var uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat ?
          scrounge_file.setbasename(filepath, rootname) : filepath;

    return scrounge_file.setoutputpathreal(opts, publicpath, uid);
  };

  // for each node in the array build ordered listing of elements
  o.arrgetincludetagarr = function (opts, depnodearr, rootname) {
    if (opts.isconcat) {
      return [
        scrounge_elem.getincludetag(
          o.setpublicoutputpath(opts, depnodearr[0], rootname)
        )
      ];
    } else {
      return depnodearr.map(function (node) {
        return scrounge_elem.getincludetag(
          o.setpublicoutputpath(opts, node, rootname)
        );
      }).reverse();
    }
  };  

  return o;
  
}({}));
