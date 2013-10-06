var fs = require('fs'), // read/write files
    path = require('path'),
    nodefs = require('node-fs'),
    Message = require('./Message.js'),
    pathpublic = require('pathpublic'),
    FileInfoParser = require('./FileInfoParser.js');

var FileUtil = module.exports = {

  getFullPath : function (p) {
    return p
      .replace(/^~(?=\/)/, process.env.HOME)
      .replace(/^.(?=\/)/, process.cwd());
  },


  isArray : function (obj) {
    if (typeof obj === 'object' && obj) {
      if (!(obj.propertyIsEnumerable('length'))) {
        return (typeof obj.length === 'number');
      }
    }
    return false;
  },

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
                    if (res) {
                      results = results.concat(res);                                        
                    }
                    next();
                  });
                } else if (stat && stat.isFile()) {
                  if (filterFn(file, opts)) {
                    results.push(file);                
                  }
                  next();
                }
              });
            }());
          });
        } else if (stat.isFile()) {
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
    var path = FileUtil.getFullPath(file);

    if (path.match(/socialFin/)) throw new Error('ouch');
    fs.readFile(path, 'utf-8', function(err, fd) {
      if (err) return fn(Message.pathInvalid(file));
      fn(err, fd);
    });
  },

  // recursive. return files that may be added to the tree 
  // only files of the defined type will be returned, if type is defined
  //
  // exampleOptions = {
  //   extnType : 'js'
  //   isRecursive : true,
  //   inputPathArr : ['/home/bumblehead', '/home/bumblehead2']
  // }
  getTreeFiles : function (opts, fn) {
    var that = this, 
        inputArr = opts.inputPathArr,
        treeFilesArr = [];

    if (!FileUtil.isArray(inputArr)) {
      return fn(new Error('[!!!] inputPathArr: ', inputArr));
    }

    (function next(x, input) {
      if (!x--) return fn(null, treeFilesArr);

      input = that.getFullPath(inputArr[x]);      

      fs.stat(input, function(err, stat) {
        if (err) return fn(Message.pathInvalid(input));

        opts.isPassingFilename = that.isPassingFilename;

        FileUtil.getMinty(input, opts, function (filename, opts) {
          return that.isPassingFilename(filename, opts);
        }, function (err, resArr) {
          if (err) return fn(err);

          // convert full system path to the local path given as input
          treeFilesArr = treeFilesArr.concat(resArr.map(function (path) {
            return pathpublic.get(path, inputArr[x]);
          }));
          next(x);
        });
      });

    }(inputArr.length));
  },


  getCopyAllFiles : function (opts, fn) {
    var inputArr = opts.inputPathArr, that = this, x,
        cpProgressFn,
        filenameMatchArr = opts.copyAll.map(function (m) { 
          return new RegExp(m.replace(/^:/, '')); 
        });

    (function next(x, input) {
      if (!x--) return fn(null);

      input = that.getFullPath(inputArr[x]);

      fs.stat(input, function(err, stat) {
        if (err) return fn(Message.pathInvalid(input));
        // get the files
        FileUtil.getMinty(input, opts, function (filename, opts) {
          for (var y = filenameMatchArr.length; y--;) {
            if (filename.match(filenameMatchArr[y])) return true;
          }

          return false;
        }, function (err, filesArr) {
          if (err) return fn(err);

          if (filesArr.length) {
            cpProgressFn = that.getCopyProgressPrinterFn(filesArr.length);
            for (var y = filesArr.length; y--;) {
              cpProgressFn(x, filesArr[y]);
            }        
          }

          next(x);
        });
      });
    }(inputArr.length));
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

  getPublicPath : pathpublic.get,

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

  // should be refactored
  isPassingFilename : function (filename, opts) {
    var fileextn = path.extname(filename),      
        basename = path.basename(filename, fileextn),
        optExtnType = opts.extnType || '',
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

  // avoids using node's 'path' object, which sometimes
  // normalizes paths in ways that are unwanted. 
  // simply replace the extension if there is one
  getFilenameWithExtn : function (filepath, extn) {
    var filename = '', 
        fileextn, dir;

    if (typeof filepath === 'string') {
      fileextn = new RegExp(path.extname(filepath) + '$');
      filename = filepath.replace(fileextn, extn);
    }

    return filename;
  }

};
