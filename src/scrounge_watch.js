// Filename: scrounge_watch.js
// Timestamp: 2018.04.04-00:07:24 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const chokidar = require('chokidar');

module.exports = (o => {
  o = (globs, opts = {}, fn) => {
    let watcher = chokidar.watch(globs, opts.watch || {
      cwd : '.'
    });

    watcher.on('change', fn);
  };

  return o;
})({});
