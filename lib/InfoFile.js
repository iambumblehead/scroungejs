var fs = require('fs'),
    path = require('path'),

    BMBLib = require('./BMBLib.js'),
    FileUtil = require('./FileUtil.js'),
    Message = require('./Message.js'),
    UtilityJS = require('./UtilityJS.js'),
    UtilityCSS = require('./UtilityCSS.js'),
    FileInfoParser = require('./FileInfoParser.js');

var InfoFile = module.exports = (function() {
  var infoFile = {
    filename : '',
    treename : '',
    dependencryArr : [],
    type : '', // css|js

    // get filename w/out _mint or _cmpr affix, if one exists
    getBaseNameStr : function () {
      var filePath = this.filename.replace(/_mint|_cmpr/, '');

      return path.basename(filePath);
    },

    //getMintFilename : function () {
    //getFileNameMintStr : function () {
    getMintNameStr : function () {
      var baseName = this.getBaseNameStr(),
          fileExtn = path.extname(baseName),
          fileName = path.basename(baseName, fileExtn);

      return fileName + '_mint' + fileExtn;
    },

    // forceTimestamp, should be `forcedTimestamp`
    //getCmprFilename : function (opts) {
    
    //getFileNameCmprStr : function (opts) {
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
//      } else if (opts.isBasepageSourcePaths && opts.publicPath) {
//        filePath = FileUtil.getPublicPath(this.filename, opts.publicPath);
      } else {
        filePath = fileName;
      }

      return filePath;
    },
    

    // returns a regular expression that to be used
    // for matching discovering the filename
    getFilenameRe : function () {
       var datePattern = '\\d{4}\\.\\\d{2}\\.\\d{2}',
           timePattern = '\\d{2}:\\d{2}:\\d{2}',
           wordBegin = '[\/\"\']',
           filename = this.getBaseNameStr(),
           fileextn = path.extname(filename),      
           basename = path.basename(filename, fileextn);

      return new RegExp(wordBegin + basename + '_' + 
                        datePattern + '-' + 
                        timePattern + fileextn);
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
/*    
    getFileText : function (opts, funchandle) {
      var filename = this.filename, that = this;
      if (!filename) return funchandle(Message.dependencyNotFound(this));
      fs.readFile(filename, 'ascii', function(err, fd) {      
        if (err) return funchandle(err);
        if (opts.isRemoveRequires) {
          fd = that.removeRequires(fd);
        }
        funchandle(err, fd);
      });
    },
*/

    removeRequires : function (text) {
      text = text.replace(/^.*require\(['"].*['"]\).*$/mgi, function (match) {          
        return '';
      });
      return text;
    },
    removeConsole : function (text) {
      var t = text.replace(/console\.log\(['"\[].*['"\]]\)/mgi, 'console.log("")');
      return t.replace(/console\.log\([^"'].*\)/mgi, 'console.log("")');
    },

    getFileTextCompressed : function (opts, funchandle) {
      var fileType = this.type, that = this, cmprText = '';
      this.getFileText(opts, function(err, text) {
        if (err) return funchandle(err);
        if (fileType === 'js') {
          if (opts.isRemoveRequires) {
             text = that.removeRequires(text);
          }

          if (opts.isRemoveConsole) {
             text = that.removeConsole(text);
          }

          try {
            cmprText = UtilityJS.getCompressed(text);
          } catch(e) {
            return funchandle('[!!!] unable to compress ' + that.filename);            
          }
          return funchandle(null, cmprText);
        }
        if (fileType === 'css') {
          return funchandle(null, UtilityCSS.getCompressed(text));
        }
        return funchandle(null, text);        
      });
    },

    // get file as compressed or uncompressed
    getFileTextType : function (opts, funchandle) {
      var isCompressed = opts.isCompressed,
          isRemoveRequires = opts.isRemoveRequires,
          type = this.type;
      if (isCompressed) {
        this.getFileTextCompressed(opts, funchandle);
      } else {
        this.getFileText(opts, funchandle);  
      }
    },
    
    // write output to filename this fileObj associates with
    writeOutput : function (outputDir, opts, text, funchandle) {
      var filename = this.getCmprNameStr(opts),
          outputPath = path.join(outputDir, filename),
          filepath = this.filename;

      FileUtil.rmSimilarFiles(filename, outputDir, function (err, res) {
        FileUtil.createPath(outputDir, function (err, res) {
          if (err) return funchandle(err);
          console.log(Message.savingFile(outputPath));
          fs.writeFile(outputPath, text, function (err) {
            if (err) throw err;          
            funchandle(null, outputPath);
          });
        });
      });
    },

    getWithUpdatedTag : function (text, opts) {
      var filenameNew = this.getCmprNameStr(opts),
          filenameRe = this.getFilenameRe();

      return text.replace(filenameRe, '/' + filenameNew);        
    },

    inspectFileResults : [],
    inspectFileText : function (text) {
      var traceArr = FileInfoParser.getTraceStatements(text) || [],
          results = this.inspectFileResults = [],
          filename = this.filename, x;

      for (x = traceArr.length; x--;) {
        results.push(Message.traceStatementFound(filename, traceArr[x]));      
      }
    },

    reportMissingDependencyArr : function (missingDependencyArr) {
      var dependencyArr = this.dependencyArr, x,
          filename = this.treename;

      for (x = dependencyArr.length; x--;) {      
        if (missingDependencyArr.indexOf(dependencyArr[x]) > -1) {
          console.log(Message.missingDependency(filename, dependencyArr[x]));
        }
      }
    }
    
  };


  return {
    readFile : FileUtil.getFile,

    getNew : function (spec) {
      var that = Object.create(infoFile);
      that.filename = spec.filename || null;
      that.treename = spec.treename || null;
      that.type = spec.type || null;
      that.dependencyArr = spec.dependencyArr || [];
      that.timestamp = spec.timestamp || new Date();
      that.authors = spec.authors || null;
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
          authors : FileInfoParser.getAuthors(fd)
        });        

        fn(null, infoFileObj);
      });
    }
  };

}());
