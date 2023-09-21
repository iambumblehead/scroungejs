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

export default Object.assign(scrounge_build, {
  basepage: scrounge_basepage,
  watch: scrounge_watch,
  build: scrounge_build,
  cache: scrounge_cache,
  node: scrounge_node,
  root: scrounge_root,
  file: scrounge_file,
  opts: scrounge_opts,
  log: scrounge_log
})
