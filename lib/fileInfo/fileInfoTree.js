var fs = require('fs'), // read/write files
    path = require('path'),
    pathpublic = require('pathpublic'),

    FileInfoNode = require('./fileInfoNode.js'),
    Message = require('../Message.js'),
    FileUtil = require('../FileUtil.js'),
    FileInfoParser = require('../FileInfoParser.js'),
    UtilityHTML = require('../fileUtility/fileUtilityHTML.js'),
    UtilityCSS = require('../fileUtility/fileUtilityCSS.js'),
    UtilityJS = require('../fileUtility/fileUtilityJS.js');

var FileInfoTree = module.exports = (function () {

  var fileInfoTree = {
    fileInfoObj : {},
    fileObjArr : [],

    isConcatenated : function (opts) {
      return this.fileInfoObj.isConcatenated(opts);
    },

    isCompressed : function (opts) {
      return this.fileInfoObj.isCompressed(opts);
    },

    // print to the console
    // '[...] ugly (1/15) Main.js'
    // '[...] ugly (2/15) Main.js' ...
    getProgressPrinterFn : function (l, opts) {
      var isCompressed = this.isCompressed(opts),
          tree = this.fileInfoObj.treename,
          msgFn = Message.compressingFile;

      return function (pos, infoObj) {
        if (isCompressed) {
          console.log(msgFn(infoObj, tree, (l - pos) + '/' + l, opts));
        }              
      };
    },

    // print to the console
    // '[...] ugly (Main.js 1/15) ViewB.js'
    // '[...] ugly (Main.js 2/15) ViewA.js' ...
    getProgressJoinPrinterFn : function (l, opts) {
      var isCompressed = this.isCompressed(opts),//opts.isCompressed,
          treename = this.fileInfoObj.treename,
          msgFn = (isCompressed) ?
                  Message.compressingFile :
                  Message.joiningFile;

      return function (pos, infoObj) {
        if (isCompressed) {
          console.log(msgFn(infoObj, treename, (l - pos) + '/' + l, opts));
        } else {
          console.log(msgFn(infoObj, treename, (l - pos) + '/' + l, opts));
        }
      };
    },

    // get authors from all files associated with tree
    getAuthorsArr : function () {
      var fileObjArr = this.fileObjArr, obj = {};
      
      fileObjArr.map(function (fileObj) {
        fileObj.authorsArr.map(function (author) {
          obj[author] = true;
        });
      });

      return Object.keys(obj);
    },

    getHeadInfo : function (opts) {
      var that = this, obj = {},
          fileInfoObj = that.fileInfoObj;

      obj.timestamp = fileInfoObj.timestamp;
      obj.filename = fileInfoObj.treename;
      obj.copyright = opts.copyright || null;
      obj.authorsArr = that.getAuthorsArr();        

      return obj;
    },

    getFormattedTreeText : function (text, opts) {
      var that = this,
          type = that.fileInfoObj.type,
          headInfo = that.getHeadInfo(opts),
          isClosure = opts.isClosure;

      if (type === '.js') {
        if (isClosure) {
          text = '(function () {\n' + text + '\n}());';
        }
        text = UtilityJS.getHeadText(headInfo, opts) + text;
      } else if (type === 'css') {
        text = UtilityCSS.getHeadText(headInfo, opts) + text;
      }
      return text;
    },

    writeAsTree : function (str, outputDir, opts, fn) {
      var that = this,
          fileInfoObj = that.fileInfoObj;

      str = that.getFormattedTreeText(str, opts);
      fileInfoObj.writeOutput(outputDir, str, opts, fn);    
    },


    // write each file in the tree to the output directory
    writeTreeNodes : function (opts, fn) {
      var that = this,
          outputDir = opts.outputPath,
          infoObjArr = that.fileObjArr, 
          length = infoObjArr.length,
          progressPrint = that.getProgressPrinterFn(length, opts);

      (function next(x, infoObj, progress, isForceCat) {
        if (!x--) return fn(null, 'success');

        infoObj = infoObjArr[x];
        progressPrint(x, infoObj);

        infoObj.getContentProcessedStr(opts, function (err, text) {
          if (err) return fn(err);            
          
          infoObj.writeOutput(outputDir, text, opts, function(err, arr) {
            if (err) return fn(err);            
            next(x);
          });
        });
      }(length));
    },



    // compine each file in the tree info one string,
    // write the result to a file using properties from the tree's infoNode
    writeTreeNodesConcatenated : function (opts, fn) {
      var that = this,
          outputDir = opts.outputPath,
          infoObjArr = that.fileObjArr, 
          isLines = opts.isLines,
          finStr = '',
          length = infoObjArr.length,
          progressPrint = that.getProgressJoinPrinterFn(length, opts);

      (function next(x, infoObj, progress) {
        if (!x--) return that.writeAsTree(finStr, outputDir, opts, fn);

        infoObj = infoObjArr[x];
        progressPrint(x, infoObj);

        infoObj.getContentProcessedStr(opts, function (err, str) {
          if (err) return fn(err);            
          finStr += str + (isLines ? "\n" : '');
          next(x);
        });
      }(length));    
    },

    // writeTreeNodesConcatenated
    // writeTreeNodes
    write : function (opts, fn) {
      var that = this;

      if (that.isConcatenated(opts)) {
        that.writeTreeNodesConcatenated(opts, fn);
      } else {
        that.writeTreeNodes(opts, fn);      
      }
    },

    getMissingDependencyArr : function () {
      var fileObjArr = this.fileObjArr, 
          missingInfoArr = [];

      missingInfoArr = fileObjArr.filter(function (fileObj) {
        return (fileObj.type) ? false : true;
      });

      return missingInfoArr;
    },

    reportMissingDependencyArr : function (missingDependencyArr) {
      var that = this,
          fileObjArr = that.fileObjArr,
          treename = that.fileInfoObj.treename;

      fileObjArr.map(function (fileObj) {
        if (missingDependencyArr.indexOf(fileObj.treename) == -1) {        
          if (fileObj.dependencyArr) {
            fileObj.dependencyArr.map(function (dependency) {
              if (missingDependencyArr.indexOf(dependency) !== -1) {
                console.log(Message.missingDependency(treename, dependency));             
              }
            });
          } else {
            that.fileObjArr.map(function (fileNode) {
              if (typeof fileNode.dependencyArr === 'object') {
                fileNode.dependencyArr.map(function (dependency) {
                  if (dependency === fileObj.treename) {                
                    console.log('[!!!] not found: ', fileObj.treename, fileNode.filename);
                  }
                });
              }
            });
          }
        }
      });
    }
  };

  return {
    getNew : function (params) {
      var that = Object.create(fileInfoTree);
      that.fileInfoObj = params.fileInfoObj;
      that.fileObjArr = params.fileObjArr;
      return that;
    },

    // retrieve infoNodes of a different type
    getAssocInfoNodeArr : function (infoTreeObj, type, fn) {
      var infoNodeArr = infoTreeObj.fileObjArr,
          newFileObjArr = [];

      (function next(x, infoNode, fileName) {
        if (!x--) return fn(null, newFileObjArr);

        infoNode = infoNodeArr[x];

        fileName = FileUtil.getFilenameWithExtn(infoNode.filename, type);

        FileInfoNode.getFromFile(fileName, function (err, infoNodeObj) {
          if (err) return next(x);
          newFileObjArr.push(infoNodeObj);
          next(x);
        });
      }(infoNodeArr.length));
    },
      
    // build an associated tree from the given tree
    getAssocTree : function (infoTreeObj, type, opts, fn) {
      var assocTree, fileInfoObj, filename;

      this.getAssocInfoNodeArr(infoTreeObj, type, function (err, infoNodeArr) {
        if (err) return fn(err);

        if (infoNodeArr.length) {
          assocTree = Object.create(infoTreeObj);
          assocTree.fileObjArr = infoNodeArr;
          fileInfoObj = assocTree.fileInfoObj;

          filename = FileUtil.getFilenameWithExtn(fileInfoObj.filename, type);

          // this file may not necessarily exist and that is OK.

          assocTree.fileInfoObj = FileInfoNode.getNew({
            filename : filename,
            treename : fileInfoObj.treename,
            type : type
          });
        }

        fn(null, assocTree);
      });       
    },

    getTreeAsAssocTreeArr : function (tree, opts, fn) {
      var assocTreeArr = [];

      assocTreeArr.push(tree);
      FileInfoTree.getAssocTree(tree, opts.extnStylesheet, opts, function (err, cssTree) {
        if (err) return fn(err);       
        if (cssTree) assocTreeArr.push(cssTree);
        FileInfoTree.getAssocTree(tree, opts.extnTemplate, opts, function (err, tplTree) {
          if (err) return fn(err);
          if (tplTree) assocTreeArr.push(tplTree);
          fn(null, assocTreeArr);
        });
      });
    },

    // from a treeArr, get a new tree array composed of all
    // associated trees
    getTreeArrAsAssocTreeArr : function (treeObjArr, opts, fn) {
      var that = this, assocTreeArr = [];

      (function next(x, treeObj) {
        if (!x--) return fn(null, assocTreeArr); 
        that.getTreeAsAssocTreeArr(treeObjArr[x], opts, function (err, res) {
          if (err) return fn(err);
          assocTreeArr = assocTreeArr.concat(res);
          next(x);                  
        });
      }(treeObjArr.length));
    },
    
    writeAssocTrees : function (tree, opts, fn) {
      var that = this,
          output = opts.outputPath;

      that.getTreeAsAssocTreeArr(tree, opts, function (err, treeObjArr) {
        if (err) return fn(err);       
      
        (function next(x, treeObj) {
          if (!x--) return fn(null, 'success');    
          treeObjArr[x].write(opts, function (err, res) {
            if (err) return fn(err);
            next(x);
          });
        }(treeObjArr.length));
      });
    },

    writeTreeArr : function (treeObjArr, opts, fn) {
      var that = this,
          output = opts.outputPath;

      (function next(x, treeObj) {
        if (!x--) return fn(null, 'success');    
        treeObjArr[x].write(opts, function (err, res) {
          if (err) return fn(err);
          next(x);
        });
      }(treeObjArr.length));
    }
    
  };

}());
