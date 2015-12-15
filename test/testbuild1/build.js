// Filename: build.js  
// Timestamp: 2015.12.15-08:36:57 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var scroungejs = require('../../index.js');

scroungejs.build({  
  inputpath      : './test/testbuild1/testbuildSrc',
  outputpath     : './test/testbuild1/testbuildFin',
  publicpath     : './testbuildFin',
  basepage       : './test/testbuild1/index.html',
  iscompressed   : false,
  isconcatenated : false,
  roots          : 'app.js'
}, function (err, res) {
  if (err) return console.log(err);
  console.log('finished!');
});
