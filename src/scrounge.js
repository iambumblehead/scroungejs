// Filename: scrounge.js
// Timestamp: 2018.03.31-13:41:39 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scrounge_basepage = require('./scrounge_basepage'),
      scrounge_watch = require('./scrounge_watch'),
      scrounge_build = require('./scrounge_build'),
      scrounge_cache = require('./scrounge_cache'),
      scrounge_node = require('./scrounge_node'),
      scrounge_root = require('./scrounge_root'),
      scrounge_file = require('./scrounge_file'),
      scrounge_opts = require('./scrounge_opts'),
      scrounge_log = require('./scrounge_log');

module.exports = (o => {
  o = (opts, fn) =>
    scrounge_build(opts, fn);

  o.basepage = scrounge_basepage;
  o.watch = scrounge_watch;
  o.build = scrounge_build;
  o.cache = scrounge_cache;
  o.node = scrounge_node;
  o.root = scrounge_root;
  o.file = scrounge_file;
  o.opts = scrounge_opts;
  o.log = scrounge_log;

  return o;
})({});
