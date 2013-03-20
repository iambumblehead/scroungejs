
var scrounge = require('./scrounge'),
    UserOptions = require('./lib/UserOptions.js'),
    userOptions;

module.exports = {
  build : function (options, fn) {
    userOptions = UserOptions.getNew(options);
    scrounge.go(userOptions, fn);
  }  
};