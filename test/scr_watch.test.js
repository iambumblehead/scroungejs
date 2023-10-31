import test from 'node:test'
import assert from 'node:assert/strict'

import scroungejs from '../src/scr.js'

test('should watch a file`', async () => {
  // use iswatch...
  //scroungejs.watch('src/*', scroungeopts)
  // const dir = import.meta.url

  const opts = {
    metaurl: import.meta.url,
    inputpath: '../sample/src',
    outputpath: '../sample/out/watch',
    publicpath: '../sample/out/watch/',
    basepagein: '../sample/index.tpl.html',
    basepage: '../sample/out/watch/index.html',
    isuidfilenames: true,
    iscompress: false,
    isconcat: false,
    treearr: [ 'app.js', 'app.css' ],
    deploytype: 'module'
  }
  
  await scroungejs(opts)

  // watch...
  // const watch = scroungejs.watch(opts)
  // console.log({ res })
  // 'touch a file'
  // 'untouch a feil'

  
  assert.strictEqual(typeof scroungejs, 'function')
})
