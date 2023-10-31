import test from 'node:test'
import assert from 'node:assert/strict'

import scrounge from '../src/scr.js'

test('should watch a file`', async () => {
  // use iswatch...
  //scroungejs.watch('src/*', scroungeopts)
  assert.strictEqual(await scrounge(), null)
})
