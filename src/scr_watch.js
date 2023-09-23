import chokidar from 'chokidar'

export default (globs, opts = {}, fn) => {
  const watcher = chokidar.watch(globs, opts.watch || { cwd: '.' })

  // you may choose to disable watch w/ opts.iswatch = false
  if (typeof fn === 'function')
    watcher.on('change', fn)
}
