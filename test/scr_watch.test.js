import fs from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import scroungejs from '../src/scr.js'

test('should watch a file`', async () => {
  const opts = {
    metaurl: import.meta.url,
    inputpath: '../sample/src/',
    outputpath: '../sample/out/watch',
    publicpath: '../sample/out/watch/',
    basepagein: '../sample/index.tpl.html',
    basepage: '../sample/out/watch/index.html',
    isuidfilenames: true,
    iscompress: false,
    isconcat: false,
    treearr: ['app.js', 'app.css'],
    deploytype: 'module'
  }

  // run scrounge one time to generate output files
  await scroungejs(opts)

  // create and find various filepaths needed or test
  const outdir = path.join(
    import.meta.dirname, '../sample/out/watch/')
  const outfile = await fs.readdir(outdir)
    .then(files => files.find(file => file.endsWith('viewsall.js')))
  const outfilepath = path.join(outdir, outfile)
  // const tsmatchRe = /\.js\?ts=\d{13}/g
  const srcfilepath = path.join(
    import.meta.dirname, '../sample/src/views/viewsall.js')

  const srcfilecontent = await fs.readFile(srcfilepath, 'utf8')
  const srcfilecontentupdated =  srcfilecontent.replace(
    "const hello = () => 'hello'",
    "const hello = () => 'hola'")

  // verify current output file
  const outfilecontent0 = await fs.readFile(outfilepath, 'utf8')
  assert.ok(outfilecontent0.includes("const hello = () => 'hello'"))
  assert.ok(!outfilecontent0.includes("const hello = () => 'hola'"))

  // commented-out for now, not sure if needed
  // verified timestamp that may not be needed for esm modules
  // const outindexcontent = (
  //   await fs.readFile(outindexpath, { encoding: 'utf8' }))
  // const outindexsrcfilets = +String(
  //   (outindexcontent.match(tsmatchRe) || [])[0]).slice(-13)

  const watchers = scroungejs.watchers(opts)
  // https://github.com/paulmillr/chokidar/issues/790
  // setTimeout is used rather than 'ready' here, waiting for
  // chokidar or fs.watch to listen
  await setTimeout(4000)

  // write changes to this file
  await fs.writeFile(srcfilepath, srcfilecontentupdated)
  await setTimeout(4000)

  // verify source copied to output file by watcher
  const outfilecontent1 = await fs.readFile(outfilepath, 'utf8')
  assert.ok(outfilecontent1.includes("const hello = () => 'hola'"))
  assert.ok(!outfilecontent1.includes("const hello = () => 'hello'"))

  await fs.writeFile(srcfilepath, srcfilecontent)
  await setTimeout(4000)

  // verify source copied to output file by watcher (again)
  const outfilecontent2 = await fs.readFile(outfilepath, 'utf8')
  assert.ok(outfilecontent2.includes("const hello = () => 'hello'"))
  assert.ok(!outfilecontent2.includes("const hello = () => 'hola'"))

  // close watchers
  assert.ok(await scroungejs.watchersclose(watchers))
})
