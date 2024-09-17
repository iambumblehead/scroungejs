// Filename: scrounge.spec.js
// Timestamp: 2015.12.08-00:14:42 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import scrounge from '../src/scr.js'

test("should do nothing when called with no parameters", async () => {
  assert.strictEqual(await scrounge(), null)
})
