import test from 'node:test'
import assert from 'node:assert/strict'

import {
  scr_name_with_suffix_extn
} from '../src/scr_name.js'


test('should return `to/index.html`, `tpl` as `to/index.tpl.html`', () => {
  assert.strictEqual(
    scr_name_with_suffix_extn('path/to/index.html', 'tpl'),
    'path/to/index.tpl.html'
  )
})

