

var Message = module.exports = {
  storedMessageArr : [],
  releaseMessages : function () {
    var storedMessageArr = this.storedMessageArr, x;
    for (x = storedMessageArr.length; x--;) {
      console.warn(storedMessageArr[x]);
    }
  },
  storeMessage : function (storeMessage) {
    this.storedMessageArr.push([storeMessage]);
  },

  compressingTreeObj : function (treeObj) {
    var f = treeObj.fileInfoObj, l = treeObj.fileObjArr.length;
    console.log('[ttt] tree: ' + f.treename + ': ' + f.type + ' tree,' + ' (' + l + ' nodes)');
  },

  noScroungeElementFound : function () {
    return '[...] no scrounge element found.';
  },

  noTreesFound : function () {
    console.log('[...] no files found.');
  },
  dependencyNotFound : function (fileObj) {
    console.log('[!!!] dependency not found: ' + fileObj.treename);
  },

  writeBasepage : function (basepage) {
    return '[mmm] modified: ' + basepage;
  },
  openBasepage : function (basepage) {
    return '[...] open: ' + basepage;
  },
  openFile : function (filename) {
    return '[...] open: ' + filename;
  },


  joiningTreeFile : function (treename, fileObj, progress) {
    return "[...] join: (" + treename + " " + progress + ") " + fileObj.filename;
  },
  joiningTreeFileCompressed : function (treename, fileObj, progress) {
    return "[...] ugly: (" + treename + " " + progress + ") " + fileObj.filename;
  },
  compressingFile : function (fileObj, progress) {
    return "[...] ugly: (" + progress + ") " + fileObj.filename;
  },
  pathInvalid : function (path) {
    return "[!!!] path is invalid: " + path;
  },
  pathInputInvalid : function (path) {
    return "[!!!] input path is invalid: " + path;
  },
  savingFile : function (file) {
    return "[...] write: " + file;
  },
  missingDependency : function (filename, dependencyname) {
    return "[!!!] '" + dependencyname + "' dependency not found: " + filename;
  },
  basepageNotFound : function (basepagename) {
    return "[!!!] basepage is not found'" + basepagename;
  },
  traceStatementFound : function (filename, statement) {
    return "[WWW] trace: " + filename + ", " + statement;        
  },
  traceStatementFoundAtTree : function (treename, statements) {
    return "[WWW] trace @ " + treename + ", " + statements;        
  },
  stopping : function () {
    return "[...] stopping.";
  },
  finish : function (msg) {
    return '[...] finish: ' + msg;
  }
};