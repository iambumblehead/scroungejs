var fs = require('fs'), // read/write files
    path = require('path'),

    Message = require('./Message.js'),
    FileInfoParser = require('./FileInfoParser.js'),
    BMBLib = require('./BMBLib.js');

var FileUtil = module.exports = {

  getMinty : function(input, opts, funchandle) {
    var extn = opts.extnType, 
        isRecursive = opts.isRecursive,
        isPassingFilename = this.isPassingFilename;

    (function getMints(input, cb) {
      var results = [];
      fs.stat(input, function(err, stat) {      
        if (err || !stat) return funchandle(Message.pathInputInvalid(input));        
        if (stat.isDirectory()) {
          fs.readdir(input, function(err, inputArr) {
            if (err) return cb(err);
            (function next() {
              var file = (inputArr.length) ? inputArr.pop() : null;
              if (!file) return cb(null, results);
              file = path.join(input, file);
              fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                  if (!isRecursive) return next();
                  getMints(file, function(err, res) {
                    results = results.concat(res);                  
                    next();
                  });
                } else if (stat && stat.isFile()) {
                  if (isPassingFilename(file, opts)) {
                    results.push(file);                
                  }
                  next();
                }
              });
            }());
          });
        } else if (stat.isFile()) {
          if (isPassingFilename(input, opts)) {
            results.push(input);                
          }
          cb(null, results);
        }
      });
    }(input, funchandle));
  },

  getFile : function (file, funchandle) {
    fs.readFile(file, 'ascii', function(err, fd) {
      if (err) return funchandle(Message.pathInvalid(file));
      funchandle(err, fd);
    });
  },

  getFiles : function (opts, funchandle) {
    var input = opts.inputPath,
        extn = opts.extnType,
        searchPath,
        isRecursive = opts.isRecursive;

    fs.stat(input, function(err, stat) {
      if (err) return funchandle(Message.pathInvalid(input));
      FileUtil.getMinty(input, opts, funchandle);
    });
  },

  copyFile : function (input, output, funchandle) {
    var dir = path.dirname(output);
    
    if (!input) return funchandle(Message.pathInputInvalid('input'));
    if (!output) return funchandle(Message.pathInputInvalid('output'));

    fs.readFile(input, 'ascii', function(err, text) {
      if (err) return funchandle(err);
      path.exists(dir, function (isExist){
        if (!isExist) return funchandle(Message.pathInputInvalid(dir));
        fs.writeFile(output, text, function (err) {      
          if (err) return funchandle(err);        
          funchandle(null, 'success');
        });
      });
    });
  },
  
  // only creates the path if it does not exist
  createPath : function (directory, funchandle) {
    fs.stat(directory, function (err, stat) { 
      if (stat && stat.isDirectory()) {
        funchandle(null, directory);
      } else {
        fs.mkdir(directory, 0755, function (err, res) {
          if (err) return funchandle(err);
          funchandle(err, res);
        });
      }
    });
  },

  // last dir on public path should be discoverable in outputDir
  // should err out if basename is a file name and not a directory
  // 
  // fullpath = '/home/scr/go/blah.js'
  // basepath = '/scr'
  // return === '/scr/go/blah.js'
  getPublicPath : function(filepath, publicRoot) {
    var outputpath, olddirpathArr, oldDirArr, newDirPath, singleDir, x, isPath, len;

    outputpath = path.normalize(filepath);
    outputpath = ((outputpath[0] === '/') ? '' : '/') + outputpath;
    
    if (!publicRoot) return outputpath;

    olddirpathArr = publicRoot.replace(/[\/]/gi, '<@>').split('<@>');
    oldDirArr = outputpath.replace(/[\/]/gi, '<@>').split('<@>'),
    newDirPath = '';
    singleDir = olddirpathArr[0] || olddirpathArr[1] || '';

    for (x = oldDirArr.length; x--;) {
      newDirPath = path.join(oldDirArr[x], newDirPath);
      if (oldDirArr[x] === singleDir) break;
    }
    
    return '/' + newDirPath;  
  },

  rmSimilarFiles : function (filename, outputdir, funchandle) {
    var matchname = filename + '', w, x,
        extnRe = /\.[cj]ss?$/,
        mintRe = /_mint|_cmpr/,
        timestampRe = /_(\d{4}\.\d\d\.\d\d)(-\d\d:\d\d:\d\d)?/,
        extn = path.extname(filename);

    // remove any timestamp
    matchname = matchname.replace(timestampRe, '');
    // remove any mint or cmpr designation
    matchname = matchname.replace(mintRe, '');

    fs.stat(outputdir, function(err, stat) {      
      if (err || !stat) return funchandle(Message.pathInputInvalid(outputdir));
      if (stat.isDirectory()) {
        fs.readdir(outputdir, function(err, contentArr) {
          if (err) return funchandle(err);
          for (x = contentArr.length; x--;) {
            if (contentArr[x].replace(timestampRe, '').replace(mintRe, '') === matchname) {
              return fs.unlink(path.join(outputdir, contentArr[x]), function (err) {
                if (err) return funchandle(err);
                return funchandle(null, 'success');                  
              });          
            }
          }
          return funchandle(null, 'success');
        });
      }
    });
  },

  isPassingFilename : function (filename, opts) {
    var fileextn = path.extname(filename),      
        basename = path.basename(filename, fileextn),
        optExtnType = (opts.extnType) ? '.' + opts.extnType : '',
        optIsMintFilter = opts.isMintFilter;

    if (!fileextn.match(/(js|css)$/)) return false;

    if (optExtnType && optExtnType !== fileextn) {
      return false;
    }

    if (optIsMintFilter && !basename.match(/_mint$/)) {
      return false;
    }

    return true;
  }

};
