var fs = require('fs'), // read/write files
    path = require('path'),


    BMBLib = require('../BMBLib.js'),
    Message = require('../Message.js'),
    FileInfoParser = require('../FileInfoParser.js'),
    UtilityCSS = require('../UtilityCSS.js'),
    UtilityJS = require('../UtilityJS.js');

var FileInfoTree = module.exports = (function () {

  var fileInfoTree = {
    fileInfoObj : {},
    fileObjArr : [],

    // takes each info obj and copies the file
    writeInfoFiles : function (outputDir, opts, fn) {
      var infoObjArr = this.fileObjArr, 
          isCompressed = opts.isCompressed,
          length = infoObjArr.length;

      function printProgress (length, pos, infoObj) {
        var progress = (length - pos) + '/' + length;        

        if (isCompressed) {
          console.log(Message.compressingFile(infoObj, progress));          
        }      
      }

      (function copyNextInfoObj(x, infoObj, progress, isForceCat) {
        if (!x--) return fn(null, 'success');

        infoObj = infoObjArr[x];
        printProgress(length, x, infoObj);
        infoObj.getContentProcessedStr(opts, function (err, text) {
          if (err) return fn(err);            
          infoObj.writeOutput(outputDir, text, opts, function(err, arr) {
            if (err) return fn(err);            
            copyNextInfoObj(x);
          });
        });
      }(length));
    },

    // get authors from all files associated with tree
    getAuthorsArr : function () {
      var fileObjArr = this.fileObjArr, x, obj = {};
      
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
      var type = this.fileInfoObj.type,
          headInfo = this.getHeadInfo(opts),
          isClosure = opts.isClosure;

      if (type === 'js') {
        if (isClosure) {
          text = '(function () {\n' + text + '\n}());';
        }
        text = UtilityJS.getHeadText(headInfo, opts) + text;
      } else if (type === 'css') {
        text = UtilityCSS.getHeadText(headInfo, opts) + text;
      }
      return text;
    },

    writeInfoTree : function (outputDir, opts, fn) {
      var infoObjArr = this.fileObjArr, 
          fileType = this.fileInfoObj.type,

          treename = this.fileInfoObj.treename,
          isCompressed = opts.isCompressed,
          isLines = opts.isLines,
          type = opts.type,
          finalText = '',
          length,
          that = this;

      function write(text) {
        text = that.getFormattedTreeText(text, opts);
        that.fileInfoObj.writeOutput(outputDir, text, opts, function(err, arr) {
          fn(err, arr);
        });
      }

      (function copyNextInfoObj(x, infoObj, progress) {
        if (!x--) return write(finalText);
        infoObj = infoObjArr[x];

        infoObj.getContentProcessedStr(opts, function (err, text) {
          if (err) return fn(err);            
          finalText += text + (isLines ? "\n" : '');
          progress = (length - x) + '/' + length;
          if (isCompressed) {
            console.log(Message.joiningTreeFileCompressed(treename, infoObj, progress));
          } else {
            console.log(Message.joiningTreeFile(treename, infoObj, progress));
          }
          copyNextInfoObj(x);
        });
      }((length = infoObjArr.length)));    
    },

    getMissingDependencyArr : function () {
      var fileObjArr = this.fileObjArr, missingInfoArr = [], x;

      for (x = fileObjArr.length; x--;) {
        if (!fileObjArr[x].type) {
          missingInfoArr.push(fileObjArr[x].treename);
        }
      }
      return missingInfoArr;
    },

    reportMissingDependencyArr : function (missingDependencyArr) {
      var that = this,
          fileObjArr = that.fileObjArr,
          filename = that.fileInfoObj.filename;

      fileObjArr.map(function (fileObj) {
        if (missingDependencyArr.indexOf(fileObj.treename) == -1) {        
          fileObj.dependencyArr.map(function (dependency) {
            if (missingDependencyArr.indexOf(dependency) !== -1) {
              console.log(Message.missingDependency(filename, dependency));             
            }
          });
        }
      });
    }

  };

  return {
    getNew : function (params) {
      var that = BMBLib.clone(fileInfoTree);
      that.fileInfoObj = params.fileInfoObj;
      that.fileObjArr = params.fileObjArr;
      return that;
    }
  };

}());
