// Filename: scrounge_basepage.js  
// Timestamp: 2015.12.08-13:28:33 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),

    scrounge_depnode = require('./scrounge_depnode'),
    scrounge_elem = require('./scrounge_elem'),
    scrounge_file = require('./scrounge_file'),
    scrounge_log = require('./scrounge_log');

var scrounge_basepage = module.exports = (function (o) {

  // each scrounge element may define _array_ of rootname
  // removes duplicates. flattens array. unoptimised.  
  o.contentgetrootnamearr = function (content) {
    return scrounge_elem.getelemarr(content).reduce(function (prev, cur) {
      return prev.concat(scrounge_elem.getrootarr(cur));
    }, []).sort().filter(function (val, i, arr) {
      return arr.slice(i + 1).indexOf(val) === -1;
    });
  };

  o.getrootnamearr = function (opts, filepath, fn) {
    scrounge_file.read(opts, filepath, function (err, content) {
      return fn(err, err || o.contentgetrootnamearr(content));
    });
  };

  o.writeelemarr = function (opts, filepath, elemarr, nodearrobj, fn) {
    scrounge_file.read(opts, filepath, function (err, content) {
      if (err) return fn(err);
      
      var newcontent = scrounge_elem.getelemarr(content).reduce(function (content, elem) {
        var indent = scrounge_elem.getindentation(elem);
        
        return content.replace(elem, scrounge_elem.getpopulated(
          elem, scrounge_elem.getrootarr(elem).filter(function (root) {
            // only operate on rootnames with an associated nodearr
            return nodearrobj[root] && nodearrobj[root].length;
          }).map(function (root) {
            
            // each node in the array returns ordered listing of elements
            return scrounge_depnode.arrgetincludetagarr(opts, nodearrobj[root], root)
              .map(function (elem) {
                return indent + elem;
              }).join('\n');
          }).join('\n')
        ));
      }, content);

      scrounge_file.write(opts, filepath, newcontent, fn);
    });
  };

  return o;
  
}({}));
