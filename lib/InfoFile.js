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

    // the contents of the file that this fileObj associates with
    getFileText : function (funchandle) {
      var filename = this.filename;
      if (!filename) return funchandle(Message.dependencyNotFound(this));
      fs.readFile(filename, 'ascii', function(err, fd) {      
        funchandle(err, fd);
      });
    },

    getFileTextCompressed : function (funchandle) {
      var fileType = this.type;
      this.getFileText(function(err, text) {
        if (err) return funchandle(err);
        if (fileType === 'js') {
          return funchandle(null, UtilityJS.getCompressed(text));
        }
        if (fileType === 'css') {
          return funchandle(null, UtilityCSS.getCompressed(text));
        }
        return funchandle(null, text);        
      });
    },

    // get file as compressed or uncompressed
    getFileTextType : function (isCompressed, funchandle) {
      if (isCompressed) {
        this.getFileTextCompressed(funchandle);
      } else {
        this.getFileText(funchandle);  
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