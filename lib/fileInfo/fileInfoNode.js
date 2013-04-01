var fs = require('fs'),
    path = require('path'),

    BMBLib = require('../BMBLib.js'),
    FileUtil = require('../FileUtil.js'),
    Message = require('../Message.js'),
    UtilityJS = require('../UtilityJS.js'),
    UtilityCSS = require('../UtilityCSS.js'),
    FileInfoParser = require('../FileInfoParser.js');

var FileInfoNode = module.exports = (function() {
  var fileInfoNode = {
    filename : '',
    treename : '',
    dependencryArr : [],
    type : '', // css|js

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
      var baseName = this.getBaseNameStr(),
          fileExtn = path.extname(baseName),      
          timestamp, fileNameCmpr;

      if (opts && opts.isTimestamped) {
        if (opts.forceTimestamp) {
          timestamp = opts.forceTimestamp;
        } else {
          timestamp = FileInfoParser.getFormattedDate(this.timestamp);                  
        }
        fileNameCmpr = path.basename(baseName, fileExtn);
        fileNameCmpr = fileNameCmpr + '_' + timestamp + fileExtn;
      } else {
        fileNameCmpr = baseName;
      }
      
      return fileNameCmpr;
    },

    // publicPath as different from systemPath
    // path the script is served from, ex. `/app/js/Main.js`
    getPublicPathStr : function (opts) {
      var fileName = this.getCmprNameStr(opts), filePath;

      if (opts.outputPath) {
        filePath = path.join(opts.outputPath, fileName);                
      //} else if (opts.isBasepageSourcePaths && opts.publicPath) {
      //  filePath = FileUtil.getPublicPath(this.filename, opts.publicPath);
      } else {
        filePath = fileName;
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
      fs.readFile(thisFilePath, 'ascii', function (err, res) {
        if (err) return fn(err);
        fn(null, res);
      });            
    },

    getAsCompressedStr : function (str, opts) {
      var that = this, fileType = that.type, cmprStr = str + '';

      if (fileType === 'js') {
        cmprStr = UtilityJS.getCompressed(str, opts);
      } else if (fileType === 'css') {
        cmprStr = UtilityCSS.getCompressed(str, opts);
      }

      if (cmprStr === null) {
        console.log('[!!!] unable to compress ' + that.filename);      
      }

      return cmprStr;        
    },

    // get file as compressed or uncompressed
    getContentProcessedStr : function (opts, fn) {
      var that = this;

      that.getContentStr(opts, function (err, res) {
        if (err) return fn(err);

        if (opts.isCompressed) {
          res = that.getAsCompressedStr(res, opts);
        }

        fn(null, res);
      });
    },
    
    // write output to filename this fileObj associates with
    writeOutput : function (outputDir, str, opts, fn) {
      var filename = this.getCmprNameStr(opts),
          outputPath = path.join(outputDir, filename);

      FileUtil.rmSimilarFiles(filename, outputDir, function (err, res) {
        if (err) return fn(err);
        FileUtil.createPath(outputDir, function (err, res) {
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
    }
  };

}());
