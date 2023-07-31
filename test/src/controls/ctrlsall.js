// Filename: ctrlsall.js  
// Timestamp: 2015.12.07-20:16:52 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import ctrla from './ctrla.js'
import ctrlb from './ctrlb.js'

var ctrlsall = {
  ctrla : ctrla,
  ctrlb : ctrlb
};

export default {
  start : function () {
    ctrlsall.ctrla.start();
    ctrlsall.ctrlb.start();    
  }
};
