// Filename: ctrlsall.js  
// Timestamp: 2015.12.07-20:16:52 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var ctrla = require('./ctrla');
var ctrlb = require('./ctrlb');

var ctrlsall = {
  ctrla : ctrla,
  ctrlb : ctrlb
};

module.exports = {
  start : function () {
    ctrlsall.ctrla.start();
    ctrlsall.ctrlb.start();    
  }
};
