cost viewa = {
  ctrlsall: require('./test_cjs_root_depa');
},

module.exports : {
  start: () => 
    return viewa.ctrlsall.start();

};
