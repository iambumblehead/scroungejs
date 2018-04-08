// Filename: test_malformed.js  
// Timestamp: 2018.04.07-14:46:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

cost viewa = {
  ctrlsall : require('./test_cjs_root_depa');
},

module.exports : {
  start : () => 
    return viewa.ctrlsall.start();

};
