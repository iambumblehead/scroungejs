var argv = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),

    Graph = require('./lib/DAG.js'),
    BMBLib = require('./lib/BMBLib.js'),
    Message = require('./lib/Message.js'),
    FileUtil = require('./lib/FileUtil.js'),
    FilterTree = require('./lib/FilterTree.js'),
    BasepageUtil = require('./lib/fileInfo/fileInfoBasepage.js'),
    InfoTree = require('./lib/fileInfo/fileInfoTree.js'),
    InfoFile = require('./lib/fileInfo/fileInfoNode.js'),
    UserOptions = require('./lib/UserOptions.js'),

    options;


var scrounge = module.exports = {
  getBasepageFilters : function (basepage, fn) {
    if (!basepage) return fn(null, null);
    basepage.getFilters(fn);
  },

  writeBasepage : function (basepage, treeObjArr, opts, fn) {
    if (!basepage) return fn(null, null);
    basepage.writeTrees(treeObjArr, opts, fn);
  },

  // copies each tree item to timestamped file in final dir
  writeFilesTreeArr : function (treeObjArr, opts, fn) {
    var that = this, output = opts.outputPath;

    if (!treeObjArr || !treeObjArr.length) return fn(null, 'success');
    (function copyNextTreeObj(x, treeObj) {
      if (!x--) return fn(null, 'success');    
      treeObjArr[x].writeInfoFiles(output, opts, function(err, res) {
        if (err) return fn(err);
        copyNextTreeObj(x);        
      });
    }(treeObjArr.length));
  },

  writeTreesTreeArr : function (treeObjArr, opts, fn) {
    var that = this, output = opts.outputPath;

    if (!treeObjArr || !treeObjArr.length) return fn(null, 'success');
    (function copyNextTreeObj(x, treeObj) {
      if (!x--) return fn(null, 'success');    
      treeObjArr[x].writeInfoTree(output, opts, function(err, res) {
        if (err) return fn(err);
        copyNextTreeObj(x);        
      });
    }(treeObjArr.length));
  },

  // write the compressd output of all trees in the collection
  writeCompressedTrees : function (treeObjArr, opts, fn) {
    var concatArr = [], that = this,
        unconcatArr = [], x, forceTypes;

    // do not compress or copy files if basepage uses source paths.
    if (opts.isBasepageSourcePaths) return  fn(null);

    if (opts.isConcatenation) {
      this.writeTreesTreeArr(treeObjArr, opts, fn);
    } else {
      for (x = treeObjArr.length; x--;) {
        if (opts.isForceConcatenatedType(treeObjArr[x].fileInfoObj)) {
          concatArr.push(treeObjArr[x]);
        } else {
          unconcatArr.push(treeObjArr[x]);
        }
      }
      this.writeTreesTreeArr(concatArr, opts, function () {
        that.writeFilesTreeArr(unconcatArr, opts, fn);
      });
    }
  },

  // async access of files as fileinfo objs
  getFileInfoObjArr : function (filenameArr, fn) {
    var fileObjArr = [], that = this;

    if (!filenameArr.length) return fn(null, fileObjArr);
    (function openNext(x, filename) {
      if (!x--) return fn(null, fileObjArr);
      if (!(filename = filenameArr[x])) return openNext(x);
      console.log(Message.openFile(filename));
      InfoFile.getFromFile(filename, function (err, infoFileObj) {
        if (err) return fn(err);        
        fileObjArr.push(infoFileObj);
        openNext(x);
      });
      /*
      fs.readFile(filename, 'ascii', function(err, fd) {
        if (err) return fn(err);
        fileObjArr.push(InfoFile.getFromFile(fd, filename));
        openNext(x);
      });
       */
    }(filenameArr.length));      
  },

  // build a new tree with associated files of different extension
  getAssociatedCSSTree : function (treeObj, fn) {
    var newFileObjArr = [];

    if (!treeObj.fileObjArr || !treeObj.fileObjArr.length) return fn();

    (function getNext(x, fileObj, filename) {
      if (!x--) return fn(null, newFileObjArr);
      fileObj = BMBLib.clone(treeObj.fileObjArr[x]);
      
      if (!fileObj.filename) {
         console.log(Message.missingDependency(treeObj.fileInfoObj.treename,  treeObj.fileObjArr[x].treename));
      }

      filename = fileObj.filename.replace(/\.js$/, '.css');
      InfoFile.getFromFile(filename, function (err, infoFileObj) {
        if (err) return fn(err);        
        newFileObjArr.push(infoFileObj);
        getNext(x);
      });
      /*
      FileUtil.getFile(filename, function (err, fd, nfileObj) {
        if (err) return getNext(x);

        nfileObj = InfoFile.getFromFile(fd, filename);
        newFileObjArr.push(nfileObj);
        getNext(x);
      });
       */
    }(treeObj.fileObjArr.length));
  },

  getAssociatedTrees : function (filters, treeObjArr, fn) {
    var assocTreeArr = [], x, filtername, y, type, that = this;

    if (filters && filters.css) {
      for (x = filters.css.length; x--;) {
        if ((filtername = filters.css[x])) {
          if (filtername.match(/js$/)) {
            // find trees matching filter name -convert them
            return (function getNextTree(y, tree) {
              if (!y--) return fn(null, assocTreeArr);
              that.getAssociatedCSSTree(treeObjArr[y], function (err, newTreeObj) {
                var tree = BMBLib.clone(treeObjArr[y]);
                tree.fileInfoObj = BMBLib.clone(tree.fileInfoObj);
                tree.fileInfoObj.filename = tree.fileInfoObj.filename.replace(/\.js$/, '.css');
                tree.fileInfoObj.type = 'css';
                tree.fileObjArr = newTreeObj;

                assocTreeArr.push(tree);

                getNextTree(y);
              });              
            }(treeObjArr.length));
          }
        }
      }
    }
    fn(null, assocTreeArr);
  },

  getAsTrees : function (fileInfoObjArr, filters) {
    var treeFilters, graph = Graph.get(),
        treeArr = graph.addFileInfoArr(fileInfoObjArr).getSourceArr();

    if (filters) {
      treeArr = filters.getFilteredTreeArr(treeArr);    
    }

    treeArr = treeArr.map(function (tree) {
      return InfoTree.getNew({
        fileObjArr : graph.getSorted(tree),
        fileInfoObj : tree
      });
    });

    return treeArr;
  },

  getMissingDependencyArr : function (treeArr) {
    var missingDependencyArr = [], missingTreeInfoArr, x, y;
    for (x = treeArr.length; x--;) {
      missingTreeInfoArr = treeArr[x].getMissingDependencyArr();
        for (y = missingTreeInfoArr.length; y--;) {
          missingDependencyArr.push(missingTreeInfoArr[y]);
        }
    }
    return missingDependencyArr;
  },

  // check each tree for missing dependencies
  treesInspect : function (treeArr, fn) {
    var missingDependencyArr = scrounge.getMissingDependencyArr(treeArr), x;
    if (missingDependencyArr.length) {
      treeArr.map(function (tree) {
        tree.reportMissingDependencyArr(missingDependencyArr);
      });
      console.log('[!!!] missingDependencies: ' + missingDependencyArr);
      return fn(Message.stopping());
    } 
    fn(null);
  },

  treesBuild : function (opts, basepage, fn) {
    var basepageUtil, fileObjBuilder, x, treeObjArr;

    FileUtil.getFiles(opts, function (err, fileInfoArr) {
      if (err) return fn(err);
      scrounge.getBasepageFilters(basepage, function (err, filters) {
        if (err) return fn(err);
        scrounge.getFileInfoObjArr(fileInfoArr, function (err, fileInfoObjArr) {
          if (err) return fn(err);          

          if (opts.trees) {
            if (!filters) {
              filters = FilterTree.getNew();
            }
            filters.addTreeByFilename(opts.trees);              
          }

          if (opts.isUpdateOnly) {
            treeObjArr = [InfoTree.getNew({
              fileObjArr : fileInfoObjArr,
              fileInfoObj : fileInfoObjArr[0] 
            })];
          } else {
            treeObjArr = scrounge.getAsTrees(fileInfoObjArr, filters);            
    //        console.log('filterTrees', treeObjArr);
          }

          scrounge.treesInspect(treeObjArr, function (err) {
            if (err) return fn(err);
            scrounge.getAssociatedTrees((filters) ? filters.trees : null, treeObjArr, function (err, assocTreeArr) {
              if (err) return fn(err);              
              for (x = assocTreeArr.length; x--;) {
                treeObjArr.push(assocTreeArr[x]);
              }
              fn(null, treeObjArr);
            });
          });
        });
      });
    });
  },
  
  treesApply : function (treeObjArr, opts, basepage, fn) {
    if (!treeObjArr.length) return Message.noTreesFound();
    scrounge.writeCompressedTrees(treeObjArr, opts, function (err, compressed) {
      if (err) return fn(err);
      scrounge.writeBasepage(basepage, treeObjArr, opts, function (err) {
        if (err) return fn(err);        
        fn(null);
      });
    });
  },

  go : function (opts, fn) {
    var bgnDateObj = new Date(), totalTime,
        basepage = (opts.basepage) ? BasepageUtil.getNew(opts.basepage) : null;

    scrounge.treesBuild(opts, basepage, function (err, treeArr) {
      if (err) return console.log(err);
      scrounge.treesApply(treeArr, opts, basepage, function (err) {
        if (err) return console.log(err);
        Message.releaseMessages();
        totalTime = BMBLib.getElapsedTime(bgnDateObj, new Date());
        console.log(Message.finish(totalTime));
        if (typeof fn === 'function') fn(null, totalTime);
      });
    });
  }
};


// if called from command line...
if (require.main === module) {
  options = UserOptions.getNew(argv);
  scrounge.go(options);    
} 



