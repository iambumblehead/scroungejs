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

  // each node exists as a single string label or an
  // object w/ defined `nodes` array and a `label`
  /*
  getTreeDependencyStr : function (treeInfoObj, opts) {
    return archy({
      label : 'beep',
      nodes : ['ity', {
        label : 'boop',
        nodes : [{
          label : 'o_O',
          nodes : [{
            label : 'oh',
            nodes : [ 'hello', 'puny' ]
          }]
        }]
      }]
    });


    function getAsArchyNode(treeInfoObj) {
      //console.log(treeInfoObj);
    }

    
    getAsArchyNode(treeInfoObj);
    //console.log('treeInfo');



  },
   */

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

  joiningTreeFilesProgressTpl : function (treeInfoObj) {
    //var typeColStr = this.getStrAsCol(treeInfoObj.fileInfoObj.type, 8);
    //var typeColStr = this.getStrAsCol('.mustacheff', 8);
    var typeColStr = treeInfoObj.fileInfoObj.type;
    return '[...] [:bar] ' + typeColStr + ' :percent :etas';
  },

  /*
  joiningTreeFile : function (treename, fileObj, progress) {
    return "[...] join: (" + treename + " " + progress + ") " + fileObj.filename;
  },
   */
    joiningTreeFileCompressed : function (treename, fileObj, progress) {
    return "[...] ugly: (" + treename + " " + progress + ") " + fileObj.filename;
  },
  copyFileProgress : function (filename, progress) {
    return "[...] copy: (" + progress + ") " + filename;
  },

  /*
  copyFileProgress : function (fileObj, progress) {
    return "[...] copy: (" + progress + ") " + fileObj.filename;
  },
   */
  compressingFile : function (fileObj, progress) {
    return "[...] ugly: (" + progress + ") " + fileObj.filename;
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
    return "[...] write: " + file;
  },
  missingDependency : function (filename, dependencyname) {
    return "[!!!] '" + dependencyname + "' dependency not found: " + filename;
  },
  missingDependencyArr : function (dependencyArr) {
    return "[!!!] missing dependencies: " + dependencyArr.join(', ');
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
  finish : function (msg) {
    return '[...] finish: ' + msg;
  }
};



// [...] open: /home/duko/Software/Main1.js
// [...] open: /home/duko/Software/Main1.css
// [...] open: /home/duko/Software/Main1.mustache
// [...] open: /home/duko/Software/Main2.js
// [...] open: /home/duko/Software/Main2.css
// [...] open: /home/duko/Software/Main2.mustache
// [...] join: (Main.js 1/225) /home/duko/Software/Main1.js
// [...]                       /home/duko/Software/Main1.js
