import fs from 'node:fs'
import url from 'node:url'

// import chokidar from 'chokidar'
//
// chokidar may be preferable to fs.watch.
// chokidar was replaced w/ fs.watch when troubleshooting watch behaviour
// and decided to continue using fs.watch, but chokidar is probably fine

const scr_watchersclose = async watchers => {
  if (!watchers.length)
    return watchers

  await watchers[0].close()

  return scr_watchersclose(watchers.slice(1))
}

const scr_watchers = (dir, opts = {}, fn) => {
  const watchers = []

  // convert to url for mode compatibility
  dir = new url.URL(dir, opts.metaurl)
  watchers.push(fs.watch(dir, { recursive: true }, (evtype, filename) => {
    if (evtype === 'change') {
      const filepath = new url.URL(filename, dir)
      fn(String(filepath).replace(/^file:\/\//, ''))
    }
  }))

  return watchers
}

// this commented out area is kept here in case chokidar is needed in future
// const scr_watchers = (globs, opts = {}, fn) => {
//   const watchers = []
//   const watcher = chokidar.watch(globs, opts.watch || { cwd: '.' })
//
//   watchers.push(watcher)
//
//   if (typeof fn === 'function') {
//     watcher
//       .on('ready', () => console.log('[...] watch: ready'))
//       .on('change', fn)
//   }
//
//   return watchers
// }

export {
  scr_watchers as default,
  scr_watchers,
  scr_watchersclose
}
