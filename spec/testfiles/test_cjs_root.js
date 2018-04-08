// Filename: test_cjs.js
// Timestamp: 2018.04.07-16:27:15 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const depa = require('./test_cjs_root_depa');

module.exports = {
  start : () => depa.start()
};
