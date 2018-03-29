// Filename: build.js
// Timestamp: 2018.03.29-00:38:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

let scroungejs = require('../../');

scroungejs.build({
  inputpath : './spec/testbuild1/testbuildSrc',
  outputpath : './spec/testbuild1/testbuildFin',
  publicpath : './testbuildFin',
  basepage : './spec/testbuild1/index.html',
  iscompressed : false,
  isconcatenated : false,
  roots : 'app.js'
}, err => {
  if (err)
    console.log(err);
  else
    console.log('finished!');
});
