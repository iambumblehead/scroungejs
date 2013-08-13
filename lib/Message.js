var archy = require('archy');

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


  getStrAsCol : function (str, colWidthNum) {
    if (str.length < colWidthNum) {
      while (str.length < colWidthNum) {
        str = ' ' + str;
      }
    } else {
      str = str.substr(0, colWidthNum - 4); 
      str += '...';
    }
    return str;
  },

  getAsArchyStr : function (obj) {
    return archy(obj);
  },

  compressingTreeObj : function (treeObj) {
    var f = treeObj.fileInfoObj, 
        l = treeObj.fileObjArr.length;
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

  /*
  openFileTpl : function (basepage) {
    return '[...] read files';
    //return '[mmm] modified: ' + basepage;
  },
   */

  readFiles : function (length) {
    return '[...] read: files (' + length + '/' + length + ')';
  },

  openBasepage : function (basepage) {
    return '[...] open: ' + basepage;
  },
  openFile : function (filename) {
    return '[...] open: ' + filename;
  },

  joiningTreeFiles : function (treeInfoObj) {
    //return '[...] join: ' + treeInfoObj.fileInfoObj.treename + ', '  + treeInfoObj.fileObjArr.length + ' files';
    return '[...] join: ' + treeInfoObj.fileInfoObj.treename;
  },

  joinTree : function (treeInfoObj) {
    var typeColStr = treeInfoObj.fileInfoObj.type,
        treeColStr = treeInfoObj.fileInfoObj.treename;

    return '[...] join: tree: ' + treeColStr + ', type: ' + typeColStr;
  },

  joiningTreeFilesProgressTpl : function (treeInfoObj) {
    var typeColStr = treeInfoObj.fileInfoObj.type;
    var treeColStr = treeInfoObj.fileInfoObj.treename;
    //return '[...] [:bar] ' + typeColStr + ' :percent :etas';
    return '[...] [:bar] :percent (:current/:total)';
  },

  /*
  joiningTreeFile : function (treename, fileObj, progress) {
    return "[...] join: (" + treename + " " + progress + ") " + fileObj.filename;
  },
   */
  /*
  joiningTreeFileCompressed : function (treename, fileObj, progress) {
    return "[...] ugly: (" + treename + " " + progress + ") " + fileObj.filename;
  },
   */
  copyFileProgress : function (filename, progress) {
    return "[...] copy: (" + progress + ") " + filename;
  },

  /*
  copyFileProgress : function (fileObj, progress) {
    return "[...] copy: (" + progress + ") " + fileObj.filename;
  },
   */
  compressingFile : function (fileObj, tree, progress) {
    var tpl = "[...] ugly: (:treename, :treetype, :progress) :filename";

    return tpl
      .replace(':treename', tree)
      .replace(':treetype', fileObj.type)
      .replace(':progress', progress)
      .replace(':filename', fileObj.filename);
  },

  joiningFile : function (fileObj, tree, progress) {
    var tpl = "[...] join: (:treename, :treetype, :progress) :filename";

    return tpl
      .replace(':treename', tree)
      .replace(':treetype', fileObj.type)
      .replace(':progress', progress)
      .replace(':filename', fileObj.filename);
  },

  pathInvalid : function (path) {
    return "[!!!] path is invalid: " + path;
  },
  pathInputInvalid : function (path) {
    return "[!!!] input path is invalid: " + path;
  },
  pathOutputInvalid : function (path) {
    return "[!!!] output path is invalid: " + path;
  },
  savingFile : function (file) {
    return "[...] write: " + file.replace(process.env.HOME, '~');
  },
  missingDependency : function (filename, dependencyname) {
    return "[!!!] '" + dependencyname + "' dependency not found: " + filename;
  },
  missingDependencyArr : function (dependencyArr) {
    //return "[!!!] missing dependencies: " + dependencyArr.join(', ');      
    return "[!!!] missing dependencies: " + dependencyArr.map(function (dep) {
      return dep.treename;
    }).join(', ');      
  },
  basepageNotFound : function (basepagename) {
    return "[!!!] basepage is not found '" + basepagename + "'";
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
  start : function () {
    return '[...] start: scroungejs';
  },
  finish : function (msg) {
    return '[...] finish: ' + msg;
  }
};


