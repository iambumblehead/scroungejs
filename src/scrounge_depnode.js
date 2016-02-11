// Filename: scrounge_depnode.js  
// Timestamp: 2016.02.11-11:46:00 (last modified)
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

  // for a node with filepath ~/software/node.js
  // return a 'css' type node if type is 'css' and
  // corresponding css file exists (~/software/node.css)
  o.getastype = function (node, type, fn) {
    var filepath = scrounge_file.setextn(node.get('filepath'), type);

    fs.readFile(path.resolve(filepath), 'utf-8', function (err, content) {
      fn(err, err || node
         .set('filepath', filepath)
         .set('content', content));
    });
  };

  o.getastypearr = function (node, typearr, fn) {
    (function next (typearr, x) {
      if (!x--) return fn('type not found ' + typearr);

      o.getastype(node, typearr[x], function (err, node) {
        if (err) return next(typearr, x);
        
        fn(null, node);
      });

    }(typearr, typearr.length));            
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

  o.getarrastypearr = function (deparr, typearr, fn) {
    (function next (deparr, x, finarr) {
      if (!x--) return fn(null, finarr);      

      o.getastypearr(deparr[x], typearr, function (err, node) {
        if (err) return next(deparr, x, finarr);

        finarr.push(node);
        next(deparr, x, finarr);
      });
    }(deparr, deparr.length, []));      
  };

  // if basename has extension '.less',
  // extension returned may be '.css'  
  o.setpublicextn = function (opts, filepath, rootname) {
    var rootextn = path.extname(rootname),
        fileextn = opts.jsextnarr.find(function (extn) {
          return extn === rootextn;
        }) || opts.cssextnarr.find(function (extn) {
          return extn === rootextn;
        }) || rootextn;

    return scrounge_file.setextn(filepath, fileextn);
  };

  o.setpublicoutputpath = function (opts, node, rootname) {
    var uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat ?
          scrounge_file.setbasename(filepath, rootname) : filepath;

    publicpath = o.setpublicextn(opts, publicpath, rootname);

    return scrounge_file.setpublicoutputpath(opts, publicpath, uid);
  };

  o.setpublicoutputpathreal = function (opts, node, rootname) {
    var uid = node.get('uid'),
        filepath = node.get('filepath'),
        publicpath = opts.isconcat ?
          scrounge_file.setbasename(filepath, rootname) : filepath;

    publicpath = o.setpublicextn(opts, publicpath, rootname);    

    return scrounge_file.setoutputpathreal(opts, publicpath, uid);
  };

  // for each node in the array build ordered listing of elements
  o.arrgetincludetagarr = function (opts, depnodearr, rootname) {
    if (opts.isconcat) {
      return [
        scrounge_elem.getincludetag(
          opts, o.setpublicoutputpath(opts, depnodearr[0], rootname)
        )
      ];
    } else {
      return depnodearr.map(function (node) {
        return scrounge_elem.getincludetag(
          opts, o.setpublicoutputpath(opts, node, rootname)
        );
      }).reverse();
    }
  };  

  return o;
  
}({}));
