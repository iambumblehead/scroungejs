var fs = require('fs'), // read/write files
    path = require('path'),

    FileInfoNode = require('./fileInfoNode.js'),
    Message = require('../Message.js'),
    FileInfoParser = require('../FileInfoParser.js'),
    UtilityCSS = require('../UtilityCSS.js'),
    UtilityJS = require('../UtilityJS.js');

var FileInfoTree = module.exports = (function () {

  var fileInfoTree = {
    fileInfoObj : {},
    fileObjArr : [],

    // print to the console
    // '[...] ugly (1/15) Main.js'
    // '[...] ugly (2/15) Main.js' ...
    getProgressPrinterFn : function (l, opts) {
      var isCompressed = opts.isCompressed,
          msgFn = Message.compressingFile;

      return function (pos, infoObj) {
        if (isCompressed) {
          console.log(msgFn(infoObj, (l - pos) + '/' + l));
        }              
      };
    },

    // print to the console
    // '[...] ugly (Main.js 1/15) ViewB.js'
    // '[...] ugly (Main.js 2/15) ViewA.js' ...
    getProgressJoinPrinterFn : function (l, opts) {
      var isCompressed = opts.isCompressed,
          treename = this.fileInfoObj.treename,
          msgFn = (isCompressed) ? 
                    Message.joiningTreeFileCompressed :
                    Message.joiningTreeFile;

      return function (pos, infoObj) {
        console.log(msgFn(treename, infoObj, (l - pos) + '/' + l));
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
    writeInfoNodes : function (outputDir, opts, fn) {
      var that = this,
          infoObjArr = that.fileObjArr, 
          length = infoObjArr.length,
          progressPrint = that.getProgressPrinterFn(length, opts);

      (function copyNextInfoObj(x, infoObj, progress, isForceCat) {
        if (!x--) return fn(null, 'success');

        infoObj = infoObjArr[x];
        progressPrint(x, infoObj);
        infoObj.getContentProcessedStr(opts, function (err, text) {
          if (err) return fn(err);            
          infoObj.writeOutput(outputDir, text, opts, function(err, arr) {
            if (err) return fn(err);            
            copyNextInfoObj(x);
          });
        });
      }(length));
    },

    // compine each file in the tree info one string,
    // write the result to a file using properties from the tree's infoNode
    writeInfoTree : function (outputDir, opts, fn) {
      var that = this,
          infoObjArr = that.fileObjArr, 
          isLines = opts.isLines,
          finStr = '',
          length = infoObjArr.length,
          progressPrint = that.getProgressJoinPrinterFn(length, opts);

      (function copyNextInfoObj(x, infoObj, progress) {
        if (!x--) return that.writeAsTree(finStr, outputDir, opts, fn);

        infoObj = infoObjArr[x];
        infoObj.getContentProcessedStr(opts, function (err, str) {
          if (err) return fn(err);            

          finStr += str + (isLines ? "\n" : '');
          progressPrint(x, infoObj);
          copyNextInfoObj(x);
        });
      }(length));    
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
          filename = that.fileInfoObj.filename;

      fileObjArr.map(function (fileObj) {
        if (missingDependencyArr.indexOf(fileObj.treename) == -1) {        
          if (!fileObj.dependencyArr){
            console.log(fileObj);
            console.log(fileObj.__proto__);
            console.log('>>', fileObj.dependencyArr, '<<');            
          }
          fileObj.dependencyArr.map(function (dependency) {
            if (missingDependencyArr.indexOf(dependency) !== -1) {
              console.log(Message.missingDependency(filename, dependency));             
            }
          });
        }
      });
    },

    getAssociatedInfoNodeArr : function (fn) {
      var newFileObjArr = [],
          infoNodeArr = this.fileObjArr;

      (function next(x, infoNode, fileName) {
        if (!x--) return fn(null, newFileObjArr);

        infoNode = infoNodeArr[x];
        fileName = infoNode.filename.replace(/\.js$/, '.css');
        FileInfoNode.getFromFile(fileName, function (err, infoNodeObj) {
          if (err) return next(x);
          newFileObjArr.push(infoNodeObj);
          next(x);
        });
      }(infoNodeArr.length));
    },

    getAssociatedTree : function (fn) {
      var that = this, 
          infoNodeArr = that.fileObjArr,
          assocTree, fileInfoObj;

      that.getAssociatedInfoNodeArr(function (err, assocInfoNodeArr) {
        if (err) return fn(err);
        
        assocTree = Object.create(that);
        assocTree.fileObjArr = assocInfoNodeArr;
        fileInfoObj = assocTree.fileInfoObj;

        // this file may not necessarily exist and that is OK.
        assocTree.fileInfoObj = FileInfoNode.getNew({
          filename : fileInfoObj.filename.replace(/\.js$/, '.css'),
          treename : fileInfoObj.treename,
          type : '.css'
        });

        fn(null, assocTree);
      });
    }


  };

  return {
    getNew : function (params) {
      var that = Object.create(fileInfoTree);

      that.fileInfoObj = params.fileInfoObj;
      that.fileObjArr = params.fileObjArr;
      return that;
    }
  };

}());
