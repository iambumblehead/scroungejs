// Filename: scrounge_watch.js
// Timestamp: 2017.07.29-19:20:06 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const chokidar = require('chokidar'),

      scrounge_build = require('./scrounge_build');

module.exports = (o => {
  // var watcher = chokidar.watch(globs, opts);
  o = (globs, opts = {}) => {
    let watcher = chokidar.watch(globs, opts.watch || {});

    // persistent true
    watcher
      // .on('add', path => console.log(`File ${path} has been added`))
      // .on('change', path => console.log(`File ${path} has been changed`));
      .on('change', path => (
        scrounge_build.updatedestfile(opts, path)));
  };

  return o;
})({});
