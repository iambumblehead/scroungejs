// Filename: scrounge_elem.js  
// Timestamp: 2017.04.23-14:16:53 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const path = require('path'),
      addquery = require('addquery');

const scrounge_elem = module.exports = (o => {

  // include tags for css and js  
  o.includejstpl = '<script src="$" type="text/javascript"></script>';
  o.includecsstpl = '<link href="$" rel="stylesheet" type="text/css">';

  o.elemre = /\ *<!-- <scrounge([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi;
  o.elemrootre = /root="([\s\S]*?)"/;
  o.elemtypere = /type="(\.[cj]ss?)?"/;
  
  o.getincludetag = (opts, filepath) => {
    var extn = path.extname(filepath),
        include;

    if (opts.cssextnarr.find(cssextn => 
      cssextn === extn
    )) {
      include = o.includecsstpl;
    } else if (opts.jsextnarr.find(jsextn => 
      jsextn === extn
    )) {
      include = o.includejstpl;      
    } else {
      throw new Error('Invalid type, ' + extn);
    }

    if (opts.version) {
      filepath = addquery(filepath, 'version=' + opts.version);
    }
    
    if (opts.istimestamp) {
      filepath = addquery(filepath, 'ts=' + opts.buildts);
    }

    return include.replace(/\$/, filepath);
  };

  o.getrootarr = str => {
    var rootmatch = str.match(o.elemrootre),
        rootarr = [];

    if (rootmatch && rootmatch[1]) {
      rootarr = rootmatch[1].split(/,/).map(root =>
        root.trim()
      );
    }

    return rootarr;
  };

  // return the indentation behind the scounge tag
  // scroung tag: '   <!-- <scrounge.js> -->'
  // indentation: '   '
  o.getindentation = elemstr => {
    var m = elemstr.match(/^\s*/);

    return Array.isArray(m) ? m[0] : '';  
  };

  o.gettype = str => {
    var typematch = str.match(o.elemtypere);

    return typematch && typematch[1];
  };  

  o.getelemarr = content => {
    return content.match(o.elemre) || [];
  };
  
  o.getpopulated = (elem, body) => {
    var indent = o.getindentation(elem);
    
    return elem.replace(elem.replace(o.elemre, '$2'), '\n' + body + '\n' + indent);
  };

  return o;
  
})({});
