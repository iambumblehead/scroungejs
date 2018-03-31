// Filename: scrounge_build.js
// Timestamp: 2018.03.31-13:27:22 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),
      optfn = require('optfn'),
      simpletime = require('simpletime'),

      scrounge_basepage = require('./scrounge_basepage'),
      scrounge_cache = require('./scrounge_cache'),
      scrounge_root = require('./scrounge_root'),
      scrounge_node = require('./scrounge_node'),
      scrounge_file = require('./scrounge_file'),
      scrounge_opts = require('./scrounge_opts'),
      scrounge_log = require('./scrounge_log');

module.exports = (o => {
  o = (opts, fn) =>
    o.build(opts, fn);

  o.writeroots = (opts, rootarr, rootobj, fn) =>
    scrounge_root.writearr(opts, rootarr, rootobj, fn);

  // tpl files aren't processed in the way scripts and stylesheets are
  // tpl deparr, adjacent to js deparr, is created any nodes are simply copied
  // to outputpath
  o.copyroottpl = (opts, rootobj, fn) => {
    //
    // by default, this feature switch off
    //
    if (opts.istpl) {
      let jsrootarr = scrounge_root.getnamearrastype(opts, Object.keys(rootobj), '.js'),
          custopts = Object.create(opts);

      custopts.isconcat = false;
      custopts.iscompress = false;

      scrounge_node.getarrastypearr(rootobj[jsrootarr[0]], opts.tplextnarr, (err, deparr) => {
        if (err) return fn(err);

        let rootname = scrounge_file.setextn(jsrootarr[0], opts.tplextnarr[0]);
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
  o.buildrootobj = (opts, rootarr, fn) =>
    scrounge_root.getrootarrasobj(opts, rootarr, fn);

  // if baseage does not exist, skip read/write with no failure
  o.writebasepage = (opts, rootarr, rootobj, fn) => {
    const { basepage, basepagein } = opts;

    if (basepage && !scrounge_file.isexist(basepage)) {
      scrounge_file.copy(opts, basepagein, basepage, err => {
        if (err) return fn(err);

        scrounge_basepage.writeelemarr(opts, basepage, rootarr, rootobj, fn);
      });
    } else if (basepage && scrounge_file.isexist(basepage)) {
      scrounge_basepage.writeelemarr(opts, basepage, rootarr, rootobj, fn);
    } else {
      fn(null);
    }
  };

  o.readbasepage = (opts, fn) => {
    const { basepage, basepagein } = opts;

    if (basepage && scrounge_file.isexist(basepagein)) {
      scrounge_basepage.getrootnamearr(opts, basepagein, (err, res) => {
        if (err) return fn(err);

        fn(null, res.reduce((roots, curval) => {
          if (roots.indexOf(curval) === -1) roots.push(curval);

          return roots;
        }, opts.treearr));
      });
    } else {
      fn(null, opts.treearr);
    }
  };

  o.throwerror = (err, fn) => {
    err = new Error(err);
    setTimeout(() => { throw err; });

    return fn(err);
  };

  o.updatedestfile = (opts, srcfilename, fn) => {
    fn = optfn(fn);
    opts = scrounge_opts(opts);

    if (opts.isconcat === false &&
        scrounge_opts.isfilenamesupportedtype(opts, srcfilename)) {
      o.readbasepage(opts, (err, rootsarr) => {
        if (err) return o.throwerror(err, fn);

        scrounge_root.getfilenameasnode(opts, path.basename(srcfilename), (err, node) => {
          if (err) return o.throwerror(err, fn);

          rootsarr = rootsarr.filter(root => (
            scrounge_opts.issamesupportedtype(opts, node.get('filepath'), root)));

          scrounge_cache.recoverrootarrcachemapnode(opts, rootsarr, node, (err, rootnodescached) => {
            if (err) return o.throwerror(err, fn);

            o.writeroots(opts, rootsarr, rootnodescached, fn);

            if (opts.basepage &&
                opts.istimestamp) {
              scrounge_basepage.writeelemone(opts, opts.basepage, srcfilename, node, fn);
            }
          });
        });
      });
    }
  };

  o.buildcachemap = (opts, fn) => {
    let datebgn = new Date();

    fn = optfn(fn);
    opts = scrounge_opts(opts);

    scrounge_log.start(opts, datebgn);

    o.readbasepage(opts, (err, rootsarr) => {
      if (err) return o.throwerror(err, fn);

      o.buildrootobj(opts, rootsarr, (err, rootobj) => {
        if (err) return o.throwerror(err, fn);

        scrounge_cache.buildmaps(opts, rootsarr, rootobj, err => {
          if (err) return o.throwerror(err, fn);

          scrounge_log.finish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()));
        });
      });
    });
  };

  o.build = (opts, fn) => {
    let datebgn = new Date();

    fn = optfn(fn);
    opts = scrounge_opts(opts);

    scrounge_log.start(opts, datebgn);

    o.readbasepage(opts, (err, rootsarr) => {
      if (err) return o.throwerror(err, fn);

      o.buildrootobj(opts, rootsarr, (err, rootobj) => {
        if (err) return o.throwerror(err, fn);

        if (opts.iscachemap) {
          scrounge_cache.buildmaps(opts, rootsarr, rootobj);
        }

        o.writeroots(opts, rootsarr, rootobj, err => {
          if (err) return o.throwerror(err, fn);

          o.copyroottpl(opts, rootobj, err => {
            if (err) return o.throwerror(err, fn);

            o.writebasepage(opts, rootsarr, rootobj, (err, res) => {
              if (err) return o.throwerror(err, fn);

              scrounge_log.finish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()));

              fn(err, res);
            });
          });
        });
      });
    });
  };

  return o;
})({});
