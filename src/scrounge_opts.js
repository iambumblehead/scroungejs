// Filename: scrounge_opts.js
// Timestamp: 2018.04.04-00:31:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),
      castas = require('castas'),
      scrounge_file = require('./scrounge_file');

module.exports = (o => {
  o = opts =>
    o.get(opts);

  o.get = opt => {
    let finopt = {};

    // all options optional
    opt = opt || {};

    finopt.inputpath = castas.str(opt.inputpath, './');
    finopt.outputpath = castas.str(opt.outputpath, './www_');
    finopt.publicpath = castas.str(opt.publicpath, './');

    // deploytype is 'script' or 'module'.
    //
    // If 'module' is used, ES6-style modules are deployed in 'module' format
    // and must be 'imported' (ES6) by other scripts and NOT 'required' (CJS)
    //
    // if 'script' is used, ES6-style modules are converted to UMD and may be
    // 'required' or 'imported' by any dpendant script
    finopt.deploytype = castas.str(opt.deploytype, 'script'); // script|module
    finopt.version = castas.str(opt.version, '');

    finopt.tplextnarr = [ '.mustache' ];
    finopt.cssextnarr = [ '.css', '.less' ];
    finopt.jsextnarr = [ '.js', '.mjs', '.ts', '.tsx' ];

    finopt.tsconfig = opt.tsconfig || {};
    finopt.typearr = castas.arr(opt.typearr, []);
    finopt.treearr = castas.arr(opt.treearr, []);
    finopt.skipdeparr = castas.arr(opt.skipdeparr, []); // depgraph
    finopt.skippatharr = castas.arr(opt.skippatharr, []); // scrounge
    finopt.treetype = /full/.test(opt.treetype) ? 'full' : 'small';
    finopt.embedarr = castas.arr(opt.embedarr, []);
    finopt.globalarr = castas.arr(opt.globalarr, []);
    finopt.prependarr = castas.arr(opt.prependarr, []);
    finopt.aliasarr = castas.arr(opt.aliasarr, []);
    finopt.babelpluginarr = castas.arr(opt.babelpluginarr, []);

    finopt.iswatch = castas.bool(opt.iswatch, true);
    finopt.iscachemap = castas.bool(opt.iscachemap, true);
    finopt.iscompress = castas.bool(opt.iscompress, false);
    finopt.isconcat = castas.bool(opt.isconcat, true);
    finopt.issilent = castas.bool(opt.issilent, false);
    finopt.ises2015 = castas.bool(opt.ises2015, false);
    finopt.istpl = castas.bool(opt.istpl, false);

    finopt.browser = castas.bool(opt.isbrowser, true);
    finopt.iscircular = castas.bool(opt.iscircular, false);
    finopt.istimestamp = castas.bool(opt.istimestamp, true);

    finopt.buildts = castas.ts(opt.buildts, Date.now());
    finopt.basepage = castas.str(opt.basepage, '');
    finopt.basepagein = castas.str(opt.basepagein, finopt.basepage);

    if (finopt.basepagein)
      if (!scrounge_file.isexist(finopt.basepagein))
        if (scrounge_file.isexist(o.getassuffixed(finopt.basepage, 'tpl')))
          finopt.basepagein = o.getassuffixed(finopt.basepage, 'tpl');
        else
          throw new Error(`basepagein, file not found ${finopt.basepagein}`);

    return finopt;
  };

  o.getassuffixed = pathval => {
    let extn = path.extname(pathval),
        base = path.basename(pathval, extn),
        dir = path.dirname(pathval);

    return path.join(dir, `${base}.tpl${extn}`);
  };

  o.filenamesupportedcss = (opts, filename, fileextn = path.extname(filename)) =>
    opts.cssextnarr.find(extn => extn === fileextn);

  o.filenamesupportedjs = (opts, filename, fileextn = path.extname(filename)) =>
    opts.jsextnarr.find(extn => extn === fileextn);

  o.isfilenamesupportedtype = (opts, filename, fileextn = path.extname(filename)) =>
    o.filenamesupportedjs(opts, filename, fileextn) ||
    o.filenamesupportedcss(opts, filename, fileextn);

  o.issamesupportedtype = (opts, filenamea, filenameb) => {
    let supportedextna = o.isfilenamesupportedtype(opts, filenamea),
        supportedextnb = o.isfilenamesupportedtype(opts, filenameb);

    return supportedextna === supportedextnb;
  };

  return o;
})();
