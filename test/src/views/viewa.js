// Filename: viewa.js
// Timestamp: 2018.03.29-00:40:34 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var viewa = {
  ctrlsall : require('../controls/ctrlsall')
};

module.exports = {
  start : function () {
    viewa.ctrlsall.start();
  }
};
