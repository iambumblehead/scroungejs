var fs = require('fs'), // read/write files
    path = require('path'),


    BMBLib = require('./BMBLib.js'),
    Message = require('./Message.js'),
    FileInfoParser = require('./FileInfoParser.js'),
    UtilityCSS = require('./UtilityCSS.js'),
    UtilityJS = require('./UtilityJS.js');

var InfoTree = module.exports = (function () {
  var infoTree= {
    fileInfoObj : {},
    fileObjArr : [],

    // takes each info obj and copies the file
    writeInfoFiles : function (outputDir, opts, funchandle) {
      var infoObjArr = this.fileObjArr, 
          fileType = this.fileInfoObj.type, 
          isTimestamped = opts.isTimestamped,
          isCompressed = opts.isCompressed,
          length;

      if (!infoObjArr || !infoObjArr.length) return funchandle(null, 'success');

      (function copyNextInfoObj(x, infoObj, progress, isForceCat) {
        if (!x--) return funchandle(null, 'success');
        infoObj = infoObjArr[x];
        progress = (length - x) + '/' + length;        

        if (isCompressed) {
          console.log(Message.compressingFile(infoObj, progress));          
        }

        infoObj.getFileTextType(isCompressed, function (err, text) {
          if (err) return funchandle(err);            
          infoObj.writeOutput(outputDir, opts, text, function(err, arr) {
            copyNextInfoObj(x);
          });
        });
      }((length = infoObjArr.length)));
    },

    hasAuthor : function (author, authorsArr) {
      var x, authorLow = author.toLowerCase().trim(), 
          authorOld;
      for (x = authorsArr.length; x--;) {
        authorOld = authorsArr[x].toLowerCase().trim();
        if (authorLow === authorOld) {
          return true;
        };
      }
      return false;
    },
    
    getAuthors : function () {
      var fileObjArr = this.fileObjArr, x ,
          fileObj, infoObj, authorsArr = [], z,
          hasAuthor = this.hasAuthor,
          fileObjAuthorsArr, y;    
      for (x = fileObjArr.length; x--;) {
        fileObj = fileObjArr[x];
        fileObjAuthorsArr = fileObj.authors;
        if (!fileObjAuthorsArr) continue;
        for (z = fileObjAuthorsArr.length; z--;) {
          if (hasAuthor(fileObjAuthorsArr[z], authorsArr)) continue;
          authorsArr.push(fileObjAuthorsArr[z]);
        }
      }
      return authorsArr;
    },


    getHeadInfo : function (opts) {
      var headInfoObj = {}, authors,
          fileInfoObj = this.fileInfoObj;

      headInfoObj.timestamp = fileInfoObj.timestamp;
      headInfoObj.filename = fileInfoObj.treename;

      if (opts.copyright) {
        headInfoObj.copyright = opts.copyright;
      }

      authors = this.getAuthors();
      headInfoObj.authorsArr = authors;        

      return headInfoObj;
    },

    getFormattedTreeText : function (text, opts) {
      var type = this.fileInfoObj.type,
          headInfo = this.getHeadInfo(opts),
          isClosure = opts.isClosure;

      //console.log(['text', text]);
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

    getFormattedFileText : function () {

    },
    
    // tree is concatenated version of the files
    writeInfoTree : function (outputDir, opts, funchandle) {
      var infoObjArr = this.fileObjArr, 
          fileType = this.fileInfoObj.type,

          treename = this.fileInfoObj.treename,
          isTimestamped = opts.isTimestamped,
          isCompressed = opts.isCompressed,
          isLines = opts.isLines,
          type = opts.type,
          finalText = '',
          length,

          that = this;

      function write(text) {
        text = that.getFormattedTreeText(text, opts);
        that.fileInfoObj.writeOutput(outputDir, opts, text, function(err, arr) {
          funchandle(err, arr);
        });
      }


      (function copyNextInfoObj(x, infoObj, progress) {
        if (!x--) return write(finalText);
        infoObj = infoObjArr[x];
        infoObj.getFileTextType(isCompressed, function (err, text) {
          if (err) return funchandle(err);            
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
      var fileObjArr = this.fileObjArr, x, 
          missingInfoArr = [];
      for (x = fileObjArr.length; x--;) {
        if (!fileObjArr[x].type) {
          missingInfoArr.push(fileObjArr[x].treename);
        }
      }
      return missingInfoArr;
    },

    reportMissingDependencyArr : function (missingDependencyArr) {
      var fileObjArr = this.fileObjArr, x,
          filename = this.fileInfoObj.filename;

      for (x = fileObjArr.length; x--;) {
        if (missingDependencyArr.indexOf(fileObjArr[x].treename) == -1) {
          if (fileObjArr[x].reportMissingDependencyArr) {
            fileObjArr[x].reportMissingDependencyArr(missingDependencyArr);
          }
        }
      }
    }

  };

  return {
    getNew : function (params) {
      var that = BMBLib.clone(infoTree);
      that.fileInfoObj = params.fileInfoObj;
      that.fileObjArr = params.fileObjArr;
      return that;
    }
  };

}());

//
// treeObj {
//   treename : tree,
//   fileObjArr : [fileObj, fileObj]
//   fileObj : {
//     type : type
//     cmprFilename : cmprFilename
//     timestamp : timestamp,
//     outputdir : outputdir,
//     authors : authors
//   },
// }

