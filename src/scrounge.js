// Filename: scrounge.js
// Timestamp: 2018.03.31-13:41:39 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import scrounge_basepage from './scrounge_basepage.js'
import scrounge_watch from './scrounge_watch.js'
import scrounge_build from './scrounge_build.js'
import scrounge_cache from './scrounge_cache.js'
import scrounge_node from './scrounge_node.js'
import scrounge_root from './scrounge_root.js'
import scrounge_file from './scrounge_file.js'
import scrounge_opts from './scrounge_opts.js'
import scrounge_log from './scrounge_log.js'

export default (o => {
  o = (opts, fn) =>
    scrounge_build(opts, fn)

  o.basepage = scrounge_basepage
  o.watch = scrounge_watch
  o.build = scrounge_build
  o.cache = scrounge_cache
  o.node = scrounge_node
  o.root = scrounge_root
  o.file = scrounge_file
  o.opts = scrounge_opts
  o.log = scrounge_log

  return o
})({})
