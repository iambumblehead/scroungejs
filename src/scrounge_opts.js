// Filename: scrounge_opts.js  
// Timestamp: 2015.12.08-17:40:50 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    
    scrounge_file = require('./scrounge_file');

var scrounge_opts = module.exports = (function (o) {

  o = function (opts) {
    return o.get(opts);
  };

  o.ispathexist = function (filepath) {
    return scrounge_file.isexist(filepath);
  };

  o.getasbool = function (val, defval) {
    if (String(val) === 'true')  defval = true;
    if (String(val) === 'false') defval = false;    

    return defval ? true : false;    
  };

  o.getasstring = function (val, defval) {
    if (typeof val === 'string' && val) defval = val;

    return String(defval);
  };

  o.getasarr = function (val, defval) {
    if (Array.isArray(val))      defval = val;
    if (typeof val === 'string') defval = val.split(',');

    return defval;
  };

  o.getassuffixed = function (pathval, suffix) {
    var extn = path.extname(pathval),
        base = path.basename(pathval, extn),
        dir = path.dirname(pathval);

    return path.join(dir, base + '.tpl' + extn);
  };

  o.get = function (opt) {
    var finopt = {};

    // all options optional
    opt = opt || {};
    
    finopt.inputpath  = o.getasstring(opt.inputpath, './');
    finopt.outputpath = o.getasstring(opt.outputpath, './www_');
    finopt.publicpath = o.getasstring(opt.publicpath, './');

    finopt.tplextnarr = ['.mustache'];
    finopt.cssextnarr = ['.css', '.less'];

    finopt.typearr    = o.getasarr(opt.typearr, []);
    finopt.treearr    = o.getasarr(opt.treearr, []);
    finopt.skippatharr = o.getasarr(opt.skippatharr, []);    
    finopt.treetype   = /full/.test(opt.treetype) ? 'full' : 'small';
    
    finopt.isconcat   = o.getasbool(opt.isconcatenated, true);
    finopt.iscompress = o.getasbool(opt.iscompressed, false);
    finopt.issilent   = o.getasbool(opt.issilent, false);
    finopt.isupdate   = o.getasbool(opt.isupdateonly, false);
      
    finopt.basepage   = o.getasstring(opt.basepage, '');
    finopt.basepagein = o.getasstring(opt.basepagein, finopt.basepage);    

    finopt.preprocessarr = [
      ['.js', function (opts, filename, str, fn) {
        try {
          fn(null, uglifyjs.minify(str, { fromString: true }).code);
        } catch (e) {
          fn(e);
        }
      }],
      ['.css', function (opts, filename, str, fn) {
        fn(null, new cleancss().minify(str));
      }],
      ['.less', function (opts, filename, str, fn) {
        return less.render(str, function (err, output) {
          fn(err, err || new cleancss().minify(output.css));
        });                
      }]
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

}());
