// Filename: app.js  
// Timestamp: 2015.12.15-08:36:39 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)  

var viewsall = require('./views/viewsall.js'),
    testbowercomponent = require('testbowercomponent');

window.app = {
  start : function () {
    viewsall.start();
  }
};
