
var scrounge = require('./scrounge'),
    UserOptions = require('./lib/UserOptions.js'),
    userOptions;

// file
//  fileNode,
//  fileTree,
//  fileBasepage
//
// graph
//  dag
//
// elem
//  elemScrounge
//  elemInclude

// inherit from file prototype

module.exports = {
  build : function (options, fn) {
    userOptions = UserOptions.getNew(options);
    scrounge.go(userOptions, fn);
  }  
};