// Filename: app.js
// Timestamp: 2018.03.29-00:42:04 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)

const viewsall = require('./views/viewsall.js');

let app = {
  start : () => {
    viewsall.start();
  }
};

if (typeof window === 'object')
  window.app = app;
