// Filename: scrounge_elem.js  
// Timestamp: 2015.12.08-00:00:41 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var path = require('path'),

    scrounge_file = require('./scrounge_file');

var scrounge_elem = module.exports = (function (o) {

  // include tags for css and js  
  o.includejstpl = '<script src="$" type="text/javascript"></script>';
  o.includecsstpl = '<link href="$" rel="stylesheet" type="text/css">';

  o.elemre = /\ *<!-- <scrounge([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi;
  o.elemrootre = /root="([\s\S]*?)"/;
  o.elemtypere = /type="(\.[cj]ss?)?"/;
  
  o.getincludetag = function (filepath) {
    var extn = path.extname(filepath),
        include;

    if (!/.css|.js/.test(extn)) {
      throw new Error('Invalid type, ' + extn);
    } else if (extn === '.css') {
      include = o.includecsstpl;
    } else if (extn === '.js') {
      include = o.includejstpl;
    }

    return include.replace(/\$/, filepath);
  };

  o.getrootarr = function (str) {
    var rootmatch = str.match(o.elemrootre),
        rootarr = [];

    if (rootmatch && rootmatch[1]) {
      rootarr = rootmatch[1].split(/,/).map(function (root) {
        return root.trim();
      });
    }

    return rootarr;
  };

  // return the indentation behind the scounge tag
  // scroung tag: '   <!-- <scrounge.js> -->'
  // indentation: '   '
  o.getindentation = function (elemstr) {
    var m = elemstr.match(/^\s*/);

    return Array.isArray(m) ? m[0] : '';  
  };

  o.gettype = function (str) {
    var typematch = str.match(o.elemtypere);

    return typematch && typematch[1];
  };  

  o.getelemarr = function (content) {
    return content.match(o.elemre) || [];
  };
  
  o.getpopulated = function (elem, body) {
    var indent = o.getindentation(elem);
    
    return elem.replace(elem.replace(o.elemre, '$2'), '\n' + body + '\n' + indent);
  };

  return o;
  
}({}));
