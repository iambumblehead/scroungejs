var scroungejs = require('../index.js');

scroungejs.build({  
  inputPath : './getStarted',
  outputPath : './testrun/',
  isRecursive : true,
  isTimestamped : true,
  //isCompressed : true,
  //isConcatenated : true
  trees : "app.js"
}, function (err, res) {
  if (err) return console.log(err);
  console.log('finished!');
});