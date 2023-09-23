// Filename: scrounge.js
// Timestamp: 2018.03.31-13:41:39 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import scr_basepage from './scr_basepage.js'
import scr_watch from './scr_watch.js'
import scr_build from './scr_build.js'
import scr_cache from './scr_cache.js'
import scr_node from './scr_node.js'
import scr_root from './scr_root.js'
import scr_file from './scr_file.js'
import scr_opts from './scr_opts.js'
import scr_log from './scr_log.js'

export default Object.assign(scr_build, {
  basepage: scr_basepage,
  watch: scr_watch,
  build: scr_build,
  cache: scr_cache,
  node: scr_node,
  root: scr_root,
  file: scr_file,
  opts: scr_opts,
  log: scr_log
})
