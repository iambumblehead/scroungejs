var scroungejs = require('../index.js');

scroungejs.build({  
  inputPath : './testbuild/testbuildSrc',
  outputPath : './testbuild/testbuildFin',
  isRecursive : true,
  isTimestamped : true,
  isCompressed : true,
  isConcatenated : true,
  basepage : "./testbuild/index.mustache",
  //extnStylesheet : ".css",
  extnStylesheet : ".less",
  trees : "app.js,ViewB.js"
}, function (err, res) {
  if (err) return console.log(err);
  console.log('finished!');
});
