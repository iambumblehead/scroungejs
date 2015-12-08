// Filename: app.js  
// Timestamp: 2015.12.07-20:13:49 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)  

var viewsall = require('./views/viewsall.js');


window.app = {
  start : function () {
    viewsall.start();
    //console.log('start');
  }
};
