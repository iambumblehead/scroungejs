// Filename: build.js  
// Timestamp: 2015.12.15-08:36:57 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var scroungejs = require('../../');

scroungejs.build({  
  inputpath      : './spec/testbuild1/testbuildSrc',
  outputpath     : './spec/testbuild1/testbuildFin',
  publicpath     : './testbuildFin',
  basepage       : './spec/testbuild1/index.html',
  iscompressed   : false,
  isconcatenated : false,
  roots          : 'app.js'
}, (err, res) => {
    if (err)
        console.log(err);
    else
        console.log('finished!');
});
