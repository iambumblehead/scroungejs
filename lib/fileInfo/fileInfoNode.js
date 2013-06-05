var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    ProgressBar = require('console-progress'),

    BMBLib = require('../BMBLib.js'),
    FileUtil = require('../FileUtil.js'),
    Message = require('../Message.js'),
    UtilityJS = require('../fileUtility/fileUtilityJS.js'),
    UtilityCSS = require('../fileUtility/fileUtilityCSS.js'),
    UtilityHTML = require('../fileUtility/fileUtilityHTML.js'),
    FileInfoParser = require('../FileInfoParser.js');

var FileInfoNode = module.exports = (function() {
  var fileInfoNode = {
    filename : '',
    treename : '',
    dependencryArr : [],
    type : '', // css|js

    // opts.isTimestamp may be a boolean value
    // or an array with elements defined as types or treenames
    isBoolOrArrMatch : function (opt) {
      var that = this, isTrue = false;

      if (opt === true) {
        isTrue = true;
      } else if (util.isArray(opt)) {
        if (opt.indexOf(that.type) !== -1) {
          isTrue = true;
        } else if (opt.indexOf(that.treename) !== -1) {
          isTrue = true;
        }
      }
      return isTrue;    
    },
    
    isTimestamped : function (opts) {
      return this.isBoolOrArrMatch(opts.isTimestamped);
    },

    isConcatenated : function (opts) {
      return this.isBoolOrArrMatch(opts.isConcatenated);
    },

    isCompressed : function (opts) {
      return this.isBoolOrArrMatch(opts.isCompressed);
    },

    getFileUtility : function () {
      var type = this.type;
      if (type === '.js') {
        return UtilityJS;
      } else if (type === '.css') {
        return UtilityCSS;
      } else if (type === '.mustache' || type === 'html') {
        return UtilityHTML;
      }
    },

    // get filename w/out _mint or _cmpr affix, if one exists
    getBaseNameStr : function () {
      var filePath = this.filename.replace(/_mint|_cmpr/, '');

      return path.basename(filePath);
    },

    getMintNameStr : function () {
      var baseName = this.getBaseNameStr(),
          fileExtn = path.extname(baseName),
          fileName = path.basename(baseName, fileExtn);

      return fileName + '_mint' + fileExtn;
    },

    getCmprNameStr : function (opts) {
      var that = this,
          baseName = that.getBaseNameStr(),
          fileExtn = path.extname(baseName),      
          isTimestamped = that.isTimestamped(opts),
          timestamp, fileNameCmpr;
      
      if (isTimestamped) {
        if (opts.forceTimestamp) {
          timestamp = opts.forceTimestamp;
        } else {
          timestamp = FileInfoParser.getFormattedDate(that.timestamp);                  
        }
        fileNameCmpr = path.basename(baseName, fileExtn);
        fileNameCmpr = fileNameCmpr + '_' + timestamp + fileExtn;
      } else {
        fileNameCmpr = baseName;
      }
      
      return fileNameCmpr;
    },

    // publicPath as different from systemPath,
    // for example,
    //   system path: '/home/duko/project/app/js/Main.js'
    //   public path: '/app/js/Main.js'
    //
    // public path may also be an internet path on an fqdn, for example
    //   public path: 'http://www.scroungejs.com/app/js/Main.js'
    getPublicPathStr : function (opts) {
      var that = this, fileName = that.getCmprNameStr(opts), filePath;

      if (opts.outputPath) {
        filePath = path.join(opts.outputPath, fileName);                
      } else if (opts.isBasepageSourcePaths) {
        filePath = fileName;      
      } else {
        filePath = fileName;
      }

      if (opts.publicPath) {
        filePath = FileUtil.getPublicPath(filePath, opts.publicPath);
      }

      if (opts.isSourcePathUnique) {
        filePath += '?u=' + Date.now();
      }

      return filePath;
    },
    

    // return constructed re for matching the filename
    getFilenameRe : function (opts) {
       var datePattern = '\\d{4}\\.\\\d{2}\\.\\d{2}',
           timePattern = '\\d{2}:\\d{2}:\\d{2}',
           beginBndry = '[\/\"\']',
           filename = this.getBaseNameStr(),
           fileextn = path.extname(filename),      
           basename = path.basename(filename, fileextn),
           reStr;

      reStr = beginBndry + basename;
      if (opts && opts.isTimestamped) {
        reStr += '_' + datePattern + '-' + timePattern;
      }
      reStr += fileextn;

      return new RegExp(reStr);
    },

    // the contents of the file that this fileObj associates with
    getContentStr : function (fn) {
      var thisFilePath = this.filename;
      if (!thisFilePath) return fn(Message.dependencyNotFound(this));
      fs.readFile(thisFilePath, 'ascii', fn);
    },

    getAsCompressedStr : function (str, opts) {
      var that = this, cmprStr = str + '',
          fileUtility = that.getFileUtility();

      if (fileUtility) {
        cmprStr = fileUtility.getCompressed(str, opts);
      }

      if (cmprStr === null) {
        console.log('[!!!] unable to compress ' + that.filename);      
      }

      return cmprStr;        
    },

    // get file as compressed or uncompressed
    getContentProcessedStr : function (opts, fn) {
      var that = this, Utility = that.getFileUtility();

      that.getContentStr(function (err, res) {
        if (err) return fn(err);

        res = Utility.preProcess(res, opts);

        if (that.isCompressed(opts)) {
          res = that.getAsCompressedStr(res, opts);
        }

        fn(null, res);
      });
    },
    
    // write output to filename this fileObj associates with
    writeOutput : function (outputDir, str, opts, fn) {
      var filename = this.getCmprNameStr(opts),
          outputPath = path.join(outputDir, filename);

      FileUtil.createPath(outputDir, function (err, res) {
        if (err) return fn(err);
        FileUtil.rmSimilarFiles(filename, outputDir, function (err, res) {
          if (err) return fn(err);
          console.log(Message.savingFile(outputPath));
          fs.writeFile(outputPath, str, fn);
        });
      });
    }
  };


  return {
    readFile : FileUtil.getFile,

    getNew : function (spec) {
      var that = Object.create(fileInfoNode);
      that.filename = spec.filename || null;
      that.treename = spec.treename || null;
      that.type = spec.type || null;
      that.dependencyArr = spec.dependencyArr || [];
      that.timestamp = spec.timestamp || new Date();
      that.authorsArr = spec.authorsArr || [];
      return that;
    },

    getFromFile : function (filePath, fn) {
      var that = this, treeName, traces, infoFileObj,
          fileExtn = path.extname(filePath);
      that.readFile(filePath, function (err, fd) {
        if (err) return fn(err);

        // tree name is filename defined in file 
        // OR is actual filename w/out mint extension
        treeName = FileInfoParser.getFilename(fd);
        if (!treeName) {
          treeName = filePath.replace(/_mint/, '');
        }
        treeName = path.basename(treeName);

        traces = FileInfoParser.getTraceStatements(fd);
        if (traces.length) {
          traces = Message.traceStatementFoundAtTree(treeName, traces);
          Message.storeMessage(traces);        
        }

        infoFileObj = that.getNew({
          filename : filePath,
          treename : treeName,
          type : fileExtn,
          dependencyArr : FileInfoParser.getDependencies(fd),
          timestamp : FileInfoParser.getTimestamp(fd),
          authorsArr : FileInfoParser.getAuthors(fd)
        });        

        fn(null, infoFileObj);
      });
    },

    // get an array of fileInfoNode objects
    getFromFileArr : function (filenameArr, fn) {
      var fileObjArr = [], that = this,
          length = filenameArr.length;

          
      console.log(Message.readFiles(length));
      (function openNext(x, filename) {
        if (!x--) return fn(null, fileObjArr);
        if (!(filename = filenameArr[x])) return openNext(x);

        that.getFromFile(filename, function (err, infoFileObj) {
          if (err) return fn(err);        
          fileObjArr.push(infoFileObj);
          openNext(x);
        });
      }(length));      
    }
  };

}());
