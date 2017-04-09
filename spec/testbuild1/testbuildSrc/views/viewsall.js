// Filename: viewsall.js  
// Timestamp: 2015.12.07-20:15:20 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)  

var viewsall = {
  viewa : require('./viewa'),
  viewb : require('./viewb')
};


module.exports = {
  start : function () {
    viewsall.viewa.start();
    viewsall.viewb.start();
  }
};
