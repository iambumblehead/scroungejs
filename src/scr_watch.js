import chokidar from 'chokidar'

const scr_watchersclose = async watchers => {
  if (!watchers.length)
    return watchers

  await watchers[0].close()

  return scr_watchersclose(watchers.slice(1))
}

const scr_watchers = (globs, opts = {}, fn) => {
  const watchers = []
  const watcher = chokidar.watch(globs, opts.watch || { cwd: '.' })

  watchers.push(watcher)

  if (typeof fn === 'function')
    watcher.on('change', fn)

  return watchers
}

export {
  scr_watchers as default,
  scr_watchers,
  scr_watchersclose
}
