// Filename: viewa.js  
// Timestamp: 2015.12.07-20:16:12 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var viewa = {
  ctrlsall : require('../controls/ctrlsall')
};

module.exports = {
  start : function () {
    viewa.ctrlsall.start();
  }
};
