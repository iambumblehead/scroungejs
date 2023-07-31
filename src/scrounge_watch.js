// Filename: scrounge_watch.js
// Timestamp: 2018.04.04-00:07:24 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import chokidar from 'chokidar'

export default (o => {
  o = (globs, opts = {}, fn) => {
    let watcher = chokidar.watch(globs, opts.watch || {
      cwd : '.'
    })

    // you may choose to disable watch w/ opts.iswatch = false
    if (typeof fn === 'function')
      watcher.on('change', fn)
  }

  return o
})({})
