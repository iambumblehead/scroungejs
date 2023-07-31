// Filename: scrounge_opts.spec.js
// Timestamp: 2015.11.25-22:35:50 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import test from 'node:test'
import assert from 'node:assert/strict'
import scrounge_opts from '../src/scrounge_opts.js'


test('should return `path/to/index.html`, `tpl` as `path/to/index.tpl.html`', () => {
  assert.strictEqual(
    scrounge_opts.getassuffixed('path/to/index.html', 'tpl'), 
    'path/to/index.tpl.html'
  );
});

