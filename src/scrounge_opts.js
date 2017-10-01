// Filename: scrounge_opts.js  
// Timestamp: 2017.07.29-19:37:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const fs = require('fs'),
      path = require('path'),
      util = require('util'),
      castas = require('castas'),
      scrounge_file = require('./scrounge_file');

module.exports = (o => {

  o = opts =>
    o.get(opts);

  o.ispathexist = filepath =>
    scrounge_file.isexist(filepath);

  o.getassuffixed = (pathval, suffix) => {
    var extn = path.extname(pathval),
        base = path.basename(pathval, extn),
        dir = path.dirname(pathval);

    return path.join(dir, base + '.tpl' + extn);
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
    

  o.get = (opt) => {
    var finopt = {};

    // all options optional
    opt = opt || {};
    
    finopt.inputpath  = castas.str(opt.inputpath, './');
    finopt.outputpath = castas.str(opt.outputpath, './www_');
    finopt.publicpath = castas.str(opt.publicpath, './');
    finopt.version    = castas.str(opt.version, '');

    finopt.tplextnarr = ['.mustache'];
    finopt.cssextnarr = ['.css', '.less'];
    finopt.jsextnarr  = ['.js', '.ts', '.tsx'];
    
    finopt.tsconfig    = opt.tsconfig || {};
    finopt.typearr     = castas.arr(opt.typearr, []);
    finopt.treearr     = castas.arr(opt.treearr, []);
    finopt.skipdeparr  = castas.arr(opt.skipdeparr, []);  // depgraph
    finopt.skippatharr = castas.arr(opt.skippatharr, []); // scrounge
    finopt.treetype    = /full/.test(opt.treetype) ? 'full' : 'small';
    finopt.embedarr    = castas.arr(opt.embedarr, []);
    finopt.globalarr   = castas.arr(opt.globalarr, []);
    finopt.prependarr  = castas.arr(opt.prependarr, []);
    finopt.aliasarr    = castas.arr(opt.aliasarr, []);
    
    finopt.isconcat    = castas.bool(opt.isconcatenated, true);
    finopt.iscompress  = castas.bool(opt.iscompressed, false);
    finopt.issilent    = castas.bool(opt.issilent, false);
    finopt.isupdate    = castas.bool(opt.isupdateonly, false);
    finopt.istpl       = castas.bool(opt.istpl, false);
    finopt.ises2015    = castas.bool(opt.ises2015, false);
    finopt.iscachemap  = castas.bool(opt.iscachemap, true);
    finopt.browser     = castas.bool(opt.isbrowser, true);    
    finopt.iscircular  = castas.bool(opt.iscircular, false);
    finopt.istimestamp = castas.bool(opt.istimestamp, true);
    
    finopt.buildts     = castas.ts(opt.buildts, Date.now());
    finopt.basepage    = castas.str(opt.basepage, '');
    finopt.basepagein  = castas.str(opt.basepagein, finopt.basepage);    

    finopt.preprocessarr = [
      ['.js', (opts, filename, str, fn) => {
        try {
          fn(null, uglifyjs.minify(str, { fromString: true }).code);
        } catch (e) {
          fn(e);
        }
      }],
      ['.css', (opts, filename, str, fn) => (
        fn(null, new cleancss().minify(str)))
      ],
      ['.less', (opts, filename, str, fn) => (
        less.render(str, (err, output) => {
          fn(err, err || new cleancss().minify(output.css));
        }))
      ]
    ];

    if (finopt.basepagein) {
      if (!o.ispathexist(finopt.basepagein)) {
        if (o.ispathexist(o.getassuffixed(finopt.basepage, 'tpl'))) {
          finopt.basepagein = o.getassuffixed(finopt.basepage, 'tpl');
        } else {
          throw new Error('basepagein, file not found ' + finopt.basepagein);            
        }
      }
    }

    return finopt;
  };

  return o;

})();
