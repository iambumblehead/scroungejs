// Filename: scrounge.js  
// Timestamp: 2017.04.23-13:04:26 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const scrounge_basepage = require('./scrounge_basepage'),
      scrounge_depnode = require('./scrounge_depnode'),
      scrounge_watch = require('./scrounge_watch'),
      scrounge_build = require('./scrounge_build'),
      scrounge_cache = require('./scrounge_cache'),
      scrounge_root = require('./scrounge_root'),    
      scrounge_file = require('./scrounge_file'),    
      scrounge_opts = require('./scrounge_opts'),
      scrounge_log = require('./scrounge_log');

const scrounge = module.exports = (o => {

  o = (opts, fn) => 
    scrounge_build(opts, fn);

  o.basepage = scrounge_basepage;
  o.depnode = scrounge_depnode;
  o.watch = scrounge_watch;
  o.build = scrounge_build;
  o.cache = scrounge_cache;
  o.root = scrounge_root;
  o.file = scrounge_file;
  o.opts = scrounge_opts;
  o.log = scrounge_log;

  return o;
  
})({});
