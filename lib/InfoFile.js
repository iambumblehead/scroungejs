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

    getMintFilename : function () {
      var filename = this.filename,
          fileextn = path.extname(filename),      
          basename = path.basename(filename, fileextn);

      return basename.replace(/_mint|_cmpr/, '') + '_mint' + fileextn;
    },

    getCmprFilename : function (opts) {
      var filename = this.filename,
          fileextn = path.extname(filename),      
          basename = path.basename(filename, fileextn),
          timestamp;

      if (opts.isTimestamped) {
        if (opts.forceTimestamp) {
          timestamp = opts.forceTimestamp;
        } else {
          timestamp = FileInfoParser.getFormattedDate(this.timestamp);                  
        }
        return basename.replace(/_mint|_cmpr/, '_') + timestamp + fileextn;
      } else {
        return basename.replace(/_mint|_cmpr/, '') + fileextn;        
      }
    },

    getFilenameMatchRe : function () {
       var datePattern = '\\d{4}\\.\\\d{2}\\.\\d{2}',
           timePattern = '\\d{2}:\\d{2}:\\d{2}',
           filename = this.filename,
           fileextn = path.extname(filename),      
           basename = path.basename(filename, fileextn);

      basename = basename.replace(/_mint|_cmpr/, '_');
      return new RegExp(basename + datePattern + '-' + timePattern + fileextn);
    },

    // the contents of the file that this fileObj associates with
    getFileText : function (opts, funchandle) {
      var filename = this.filename, that = this;
      if (!filename) return funchandle(Message.dependencyNotFound(this));
      fs.readFile(filename, 'ascii', function(err, fd) {      
        if (err) return funchandle(err);
        if (opts.isRemoveRequires) {
          fd = that.removeRequires(fd);
//          console.log(['getFIleText', fd]);
        }
        funchandle(err, fd);
      });
    },

    removeRequires : function (text) {
      text = text.replace(/^.*require\(['"].*['"]\).*$/mgi, function (match) {          
        return '';
      });
      return text;
    },

    getFileTextCompressed : function (opts, funchandle) {
      var fileType = this.type, that = this;
      this.getFileText(opts, function(err, text) {
        if (err) return funchandle(err);
        if (fileType === 'js') {
          if (opts.isRemoveRequires) {
             text = that.removeRequires(text);
          }
          return funchandle(null, UtilityJS.getCompressed(text));
        }
        if (fileType === 'css') {
          return funchandle(null, UtilityCSS.getCompressed(text));
        }
        return funchandle(null, text);        
      });
    },

    // get file as compressed or uncompressed
    //getFileTextType : function (isCompressed, funchandle) {
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
      var filename = this.getCmprFilename(opts),
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
      var filenameNew = this.getCmprFilename(opts),
          filenameRe = this.getFilenameMatchRe();

      return text.replace(filenameRe, filenameNew);        
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
    getFromFile : function (fd, filename) {
      var that = BMBLib.clone(infoFile), traces,
          parser = FileInfoParser, treename;

      treename = parser.getFilename(fd) || filename.replace(/_mint/, '');

      that.filename = filename;
      that.treename = path.basename(treename);

      traces = parser.getTraceStatements(fd);
      if (traces.length) {
        traces = Message.traceStatementFoundAtTree(treename, traces);
        Message.storeMessage(traces);        
      }

      that.type = filename.match(/.js$/) ? 'js' : 'css';
      that.dependencyArr = parser.getDependencies(fd, filename) || [];

      that.timestamp = parser.getTimestamp(fd, filename) || new Date();
      
      that.authors = parser.getAuthors(fd);

      return that;
    }
  };

}());