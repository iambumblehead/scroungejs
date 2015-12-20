// Filename: scrounge.js  
// Timestamp: 2015.12.19-23:35:01 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),
    optfn = require('optfn'),
    simpletime = require('simpletime'),

    scrounge_basepage = require('./scrounge_basepage'),
    scrounge_depnode = require('./scrounge_depnode'),
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

  // tpl files aren't processed in the way scripts and stylesheets are
  // tpl deparr, adjacent to js deparr, is created any nodes are simply copied
  // to outputpath
  o.copyroottpl = function (opts, rootobj, fn) {
    //
    // by default, this feature switch off
    //
    if (opts.istpl) {
      var jsrootarr = scrounge_root.getnamearrastype(opts, Object.keys(rootobj), '.js');
      var custopts = Object.create(opts);

      custopts.isconcat = false;
      custopts.iscompress = false;    
      
      scrounge_depnode.getarrastypearr(rootobj[jsrootarr[0]], opts.tplextnarr, function (err, deparr) {
        if (err) return fn(err);

        var rootname = scrounge_file.setextn(jsrootarr[0], opts.tplextnarr[0]);
        rootobj[rootname] = deparr;
        
        scrounge_root.write(custopts, rootname, rootobj, fn);
      });
    } else {
      fn(null);
    }
  };
  
  // returned object uses rootnames as named-properties defined w/ rootarr
  //
  // existance of template and stylesheet files is checked here
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
    } else if (basepage && scrounge_file.isexist(basepage)) {
      scrounge_basepage.writeelemarr(opts, basepage, rootarr, rootobj, fn);
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

          o.copyroottpl(opts, rootobj, function (err) {
            if (err) throw new Error(err);            

            o.writebasepage(opts, rootsarr, rootobj, function (err, res) {
              if (err) throw new Error(err);
              
              scrounge_log.finish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()));
              
              fn(err, res);
            });
          });
        });          
      });
    });
  };

  return o;
  
}());
