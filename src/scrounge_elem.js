// Filename: scrounge_elem.js
// Timestamp: 2018.04.08-06:10:37 (last modified)
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

  // moduletype definion 'css', 'cjs', 'esm' becomes
  //
  //   'text/css', 'text/javascript', or 'module'
  //
  o.getincludetag = (opts, filepath, moduletype) => {
    let extn = path.extname(filepath),
        include;

    if (opts.cssextnarr.includes(extn))
      include = o.includecsstpl;
    else if (opts.jsextnarr.includes(extn))
      include = o.includejstpl;
    else
      throw new Error(`Invalid type, ${extn}`);

    if (opts.version)
      filepath = addquery(filepath, `v=${opts.version}`);

    if (opts.istimestamp)
      filepath = addquery(filepath, `ts=${opts.buildts}`);

    if (moduletype === 'css')
      moduletype = 'test/css';
    else if (opts.deploytype === 'module' && moduletype === 'esm')
      moduletype = 'module';
    else
      moduletype = 'text/javascript';

    return include
      .replace(/\$/, filepath)
      .replace(/:type/, moduletype);
  };

  o.getrootarr = str => {
    let rootmatch = str.match(o.elemrootre);

    return (rootmatch && rootmatch[1])
      ? rootmatch[1].split(/,/).map(root => root.trim())
      : [];
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

  // (re)populate scrounge 'elem' body with 'body'
  //
  // elem,
  //
  //   <!-- <scrounge root="app.css"> -->
  //   <!-- </scrounge> -->
  //
  // body,
  //
  //   <link href="./out/viewa.css?ts=152" rel="stylesheet" type="text/css">
  //   <link href="./out/viewb.css?ts=152" rel="stylesheet" type="text/css">
  //
  // return,
  //
  //   <!-- <scrounge root="app.css"> -->
  //   <link href="./out/viewa.css?ts=123" rel="stylesheet" type="text/css">
  //   <link href="./out/viewb.css?ts=123" rel="stylesheet" type="text/css">
  //   <!-- </scrounge> -->
  //
  o.getpopulated = (elem, body) => elem.replace(
    elem.replace(o.elemre, '$2'), `\n${body}\n${o.getindentation(elem)}`);

  return o;
})({});
