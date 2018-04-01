// Filename: scrounge_elem.js
// Timestamp: 2018.03.31-17:44:35 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),
      addquery = require('addquery');

module.exports = (o => {
  // include tags for css and js
  //
  // type="text/javascript"
  // type="module"
  o.includejstpl = '<script src="$" type=":type"></script>';
  o.includecsstpl = '<link href="$" rel="stylesheet" type="text/css">';

  o.elemre = / *<!-- <scrounge([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi;
  o.elemrootre = /root="([\s\S]*?)"/;
  o.elemtypere = /type="(\.[cj]ss?)?"/;

  o.getincludetag = (opts, filepath, moduletype) => {
    let extn = path.extname(filepath),
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
      throw new Error(`Invalid type, ${extn}`);
    }

    if (opts.version)
      filepath = addquery(filepath, `version=${opts.version}`);

    if (opts.istimestamp)
      filepath = addquery(filepath, `ts=${opts.buildts}`);

    if (opts.deploytype === 'script' &&
        moduletype === 'module') {
      moduletype = 'text/javascript';
    }

    return include
      .replace(/\$/, filepath)
      .replace(/:type/, moduletype);
  };

  o.getrootarr = str => {
    let rootmatch = str.match(o.elemrootre),
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
    let m = elemstr.match(/^\s*/);

    return Array.isArray(m) ? m[0] : '';
  };

  o.gettype = str => {
    let typematch = str.match(o.elemtypere);

    return typematch && typematch[1];
  };

  o.getelemarr = content =>
    content.match(o.elemre) || [];

  o.getpopulated = (elem, body) => {
    let indent = o.getindentation(elem);

    return elem.replace(elem.replace(o.elemre, '$2'), `\n${body}\n${indent}`);
  };

  return o;
})({});
