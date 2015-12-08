// Filename: scrounge.js  
// Timestamp: 2015.12.08-00:13:17 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),
    optfn = require('optfn'),
    depgraph = require('depgraph'),
    simpletime = require('simpletime'),

    scrounge_basepage = require('./scrounge_basepage'),
    scrounge_root = require('./scrounge_root'),    
    scrounge_file = require('./scrounge_file'),    
    scrounge_opts = require('./scrounge_opts'),
    scrounge_log = require('./scrounge_log');

var scrounge = module.exports = (function (o) {

  o = function (opts) {
    o.build(opts);
  };
  
  o.writeroots = function (opts, rootarr, rootobj, fn) {
    scrounge_root.writearr(opts, rootarr, rootobj, fn);
  };
  
  // returned object uses rootnames as named-properties defined w/ rootarr
  o.buildrootobj = function (opts, rootarr, fn) {
    scrounge_root.getrootarrasobj(opts, rootarr, fn);
  };

  // if baseage does not exist, skip read/write with no failure
  o.writebasepage = function (opts, rootarr, rootobj, fn) {
    var basepage = opts.basepage,
        basepagein = opts.basepagein;
    
    if (basepage && !scrounge_file.isexist(basepage)) {
      scrounge_file.copy(opts, basepagein, basepage, function (err, res) {
        if (err) return fn(err);
        
        scrounge_basepage.writeelemarr(opts, basepage, rootarr, rootobj, fn);
      });
    } else {
      fn(null);
    }
  };
  
  o.readbasepage = function (opts, fn) {
    var basepage = opts.basepage,
        basepagein = opts.basepagein;
    
    if (basepage && scrounge_file.isexist(basepagein)) {
      scrounge_basepage.getrootnamearr(opts, basepagein, fn);
    } else {
      fn(null, []);
    }
  };

  o.build = function (opts, fn) {
    var datebgn = new Date();

    fn = optfn(fn);
    opts = scrounge_opts(opts);
    
    scrounge_log.start(opts, datebgn);

    o.readbasepage(opts, function (err, rootsarr) {
      if (err) throw new Error(err);
      
      o.buildrootobj(opts, rootsarr, function (err, rootobj) {
        if (err) throw new Error(err);

        o.writeroots(opts, rootsarr, rootobj, function (err, nodearr) {
          if (err) throw new Error(err);

          o.writebasepage(opts, rootsarr, rootobj, function (err, res) {
            if (err) throw new Error(err);
          
            scrounge_log.finish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()));
          });
        });
      });
    });
  };

  return o;
  
}());
