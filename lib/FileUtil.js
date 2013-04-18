var fs = require('fs'), // read/write files
    path = require('path'),
    nodefs = require('node-fs'),
    Message = require('./Message.js'),
    FileInfoParser = require('./FileInfoParser.js');

var FileUtil = module.exports = {

  // print to the console
  // '[...] copy (1/15) ./cmpr/viewA.mustache'
  // '[...] copy (2/15) ./cmpr/viewB.mustache' ...
  getCopyProgressPrinterFn : function (l, opts) {
    var msgFn = Message.copyFileProgress;

    return function (pos, infoObj) {
      console.log(msgFn(infoObj, (l - pos) + '/' + l));
    };
  },


  getMinty : function(input, opts, filterFn, fn) {
    var extn = opts.extnType, 
        isRecursive = opts.isRecursive;
    
    filterFn = filterFn || function () { return true; };

    // upon discovery of emacs backup files, stops reading dir
    (function getMints(input, cb) {
      var results = [];
      fs.stat(input, function(err, stat) {      
        if (err || !stat) return fn(Message.pathInputInvalid(input));        
        
        if (stat.isDirectory()) {
          fs.readdir(input, function(err, inputArr) {
            if (err) return cb(err);
            (function next() {
              var file = (inputArr.length) ? inputArr.pop() : null;
              if (!file) return cb(null, results);
              file = path.join(input, file);
              fs.stat(file, function(err, stat) {
                if (err) return cb(err);
                if (stat && stat.isDirectory()) {
                  if (!isRecursive) return next();
                  getMints(file, function(err, res) {
                    results = results.concat(res);                  
                    next();
                  });
                } else if (stat && stat.isFile()) {
                  //if (isPassingFilename(file, opts)) {
                  if (filterFn(file, opts)) {
                    results.push(file);                
                  }
                  next();
                }
              });
            }());
          });
        } else if (stat.isFile()) {
          //if (isPassingFilename(input, opts)) {
          if (filterFn(input, opts)) {
            results.push(input);                
          }
          cb(null, results);
        } else {
          cb(null, results);
        }
      });
    }(input, fn));
  },

  // read a file. adds error message for failed read and
  // allows file read w/out specifying ascii encoding each time
  getFile : function (file, fn) {
    fs.readFile(file, 'ascii', function(err, fd) {
      if (err) return fn(Message.pathInvalid(file));
      fn(err, fd);
    });
  },

  // get files recursively. 
  //
  // exampleOptions = {
  //   extnType : 'js'
  //   isRecursive : true,
  //   inputPath : '/home/bumblehead'
  // }
  getTreeFiles : function (opts, fn) {
    var that = this, 
        input = opts.inputPath;

    fs.stat(input, function(err, stat) {
      if (err) return fn(Message.pathInvalid(input));

      opts.isPassingFilename = that.isPassingFilename;
      FileUtil.getMinty(input, opts, function (filename, opts) {
        return that.isPassingFilename(filename, opts);
      }, fn);
    });
  },


  getCopyAllFiles : function (opts, fn) {
    var input = opts.inputPath, that = this, x,
        cpProgressFn,
        filenameMatchArr = opts.copyAll.map(function (m) { 
          return new RegExp(m.replace(/^:/, '')); 
        });

    fs.stat(input, function(err, stat) {
      if (err) return fn(Message.pathInvalid(input));
      // get the files
      FileUtil.getMinty(input, opts, function (filename, opts) {
        for (x = filenameMatchArr.length; x--;) {
          if (filename.match(filenameMatchArr[x])) return true;
        }

        return false;
      }, function (err, filesArr) {
        if (err) return fn(err);

        cpProgressFn = that.getCopyProgressPrinterFn(filesArr.length);
        for (x = filesArr.length; x--;) {
          cpProgressFn(x, filesArr[x]);
        }

        fn(null);
      });
    });
  },


  
  copyFile : function (input, output, fn) {
    var dir = path.dirname(output);
    
    if (!input) return fn(Message.pathInputInvalid('input'));
    if (!output) return fn(Message.pathOutputInvalid('output'));

    fs.readFile(input, 'ascii', function(err, text) {
      if (err) return fn(err);
      path.exists(dir, function (isExist){
        if (!isExist) return fn(Message.pathInputInvalid(dir));
        fs.writeFile(output, text, function (err) {      
          if (err) return fn(err);        
          fn(null, 'success');
        });
      });
    });
  },
  
  // only creates the path if it does not exist
  // https://github.com/bpedro/node-fs/blob/master/lib/fs.js
  createPath : function (directory, fn) {
    fs.stat(directory, function (err, stat) { 
      if (stat && stat.isDirectory()) {
        fn(null, directory);
      } else {
        nodefs.mkdir(directory, 0755, true, function (err, res) {
          if (err) return fn(err);
          fn(err, res);
        });
      }
    });
  },


  // last dir on public path should be discoverable in outputDir
  // should err out if basename is a file name and not a directory
  // 
  // fullpath = '/home/scr/go/blah.js'
  // basepath = './scr'
  // return === './scr/go/blah.js'
  getPublicPath : function(filepath, publicRoot) {
    var outputpath, olddirpathArr, oldDirArr, newDirPath, singleDir, x, isPath, len,
        publicRootDir, initialPathRe = /^\.?\/?/;

    outputpath = path.normalize(filepath);
    outputpath = ((outputpath[0] === '/') ? '' : '/') + outputpath;

    if (!publicRoot) return outputpath;

    publicRootDir = publicRoot.match(initialPathRe);
    publicRootDir = publicRootDir[0] || '';
    
    publicRoot = publicRoot.replace(initialPathRe, '');

    olddirpathArr = publicRoot.replace(/[\/]/gi, '<@>').split('<@>');
    oldDirArr = outputpath.replace(/[\/]/gi, '<@>').split('<@>'),
    newDirPath = '';
    singleDir = olddirpathArr[0] || olddirpathArr[1] || '';

    for (x = oldDirArr.length; x--;) {
      newDirPath = path.join(oldDirArr[x], newDirPath);
      if (oldDirArr[x] === singleDir) break;
    }
    // don't use path.join() which will remove relative paths
    return publicRootDir + newDirPath;  
  },

  // remove mint and timestamp filename affixes which scrounge may create
  // for a filename.
  //   Main_mint_lsdkjflskdjsldfkj.js is returned as 'Main.js'
  getPathNameScroungeStripped : (function (pathname) {
    var mintRe = /_mint|_cmpr/,
        timestampRe = /_(\d{4}\.\d\d\.\d\d)(-\d\d:\d\d:\d\d)?/;
    
    return function (pathname) {
      return pathname.replace(timestampRe, '').replace(mintRe, '');
    };
  }()),


  rmSimilarFiles : function (filename, outputdir, fn) {
    var stripFn = this.getPathNameScroungeStripped,
        matchname = stripFn(filename + ''), x;

    fs.stat(outputdir, function(err, stat) {      
      if (err || !stat) return fn(Message.pathOutputInvalid(outputdir));
      if (stat.isDirectory()) {
        fs.readdir(outputdir, function(err, pathnameArr) {
          if (err) return fn(err);
          for (x = pathnameArr.length; x--;) {
            if (stripFn(pathnameArr[x]) === matchname) {
              return fs.unlink(path.join(outputdir, pathnameArr[x]), fn);
            }
          }
          return fn(null, 'success');
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
  },

  getFilenameWithExtn : function (filepath, extn) {
    var filename = '', 
        fileextn, dir;

    if (typeof filepath === 'string') {
      fileextn = path.extname(filepath);
      filename = path.basename(filepath, fileextn) + extn;
      
      dir = path.dirname(filepath);
      if (dir) {
        filename = path.join(dir, filename);
      }
    }

    return filename;
  }

};
