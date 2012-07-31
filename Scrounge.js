var argv = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),

    Graph = require('./lib/DAG.js'),
    BMBLib = require('./lib/BMBLib.js'),
    Message = require('./lib/Message.js'),
    FileUtil = require('./lib/FileUtil.js'),
    BasepageUtil = require('./lib/BasepageUtil.js'),
    InfoTree = require('./lib/InfoTree.js'),
    InfoFile = require('./lib/InfoFile.js'),
    UserOptions = require('./lib/UserOptions.js'),

    options = UserOptions.getNew(argv);


var scrounge = {
  getBasepageFilters : function (basepage, funchandle) {
    if (!basepage) return funchandle(null, null);
    basepage.readFilters(function (err, filters) {
      if (err) return funchandle(err);
      funchandle(null, filters);
    });      
  },

  writeBasepage : function (basepage, treeObjArr, opts, funchandle) {
    if (!basepage) return funchandle(null, null);
    basepage.writeTrees(treeObjArr, opts, funchandle);
  },

  // copies each tree item to timestamped file in final dir
  writeFilesTreeArr : function (treeObjArr, opts, funchandle) {
    var that = this, output = opts.outputPath;

    if (!treeObjArr || !treeObjArr.length) return funchandle(null, 'success');
    (function copyNextTreeObj(x, treeObj) {
      if (!x--) return funchandle(null, 'success');    
      treeObjArr[x].writeInfoFiles(output, opts, function(err, res) {
        if (err) return funchandle(err);
        copyNextTreeObj(x);        
      });
    }(treeObjArr.length));
  },

  writeTreesTreeArr : function (treeObjArr, opts, funchandle) {
    var that = this, output = opts.outputPath;

    if (!treeObjArr || !treeObjArr.length) return funchandle(null, 'success');
    (function copyNextTreeObj(x, treeObj) {
      if (!x--) return funchandle(null, 'success');    
      treeObjArr[x].writeInfoTree(output, opts, function(err, res) {
        if (err) return funchandle(err);
        copyNextTreeObj(x);        
      });
    }(treeObjArr.length));
  },

  // write the compressd output of all trees in the collection
  writeCompressedTrees : function (treeObjArr, opts, funchandle) {
    var concatArr = [], that = this,
        unconcatArr = [], x, forceTypes;

    if (opts.isConcatenation) {
      this.writeTreesTreeArr(treeObjArr, opts, funchandle);
    } else {
      for (x = treeObjArr.length; x--;) {
        if (opts.isForceConcatenatedType(treeObjArr[x].fileInfoObj)) {
          concatArr.push(treeObjArr[x]);
        } else {
          unconcatArr.push(treeObjArr[x]);
        }
      }
      this.writeTreesTreeArr(concatArr, opts, function () {
        that.writeFilesTreeArr(unconcatArr, opts, funchandle);
      });
    }
  },

  // async access of files as fileinfo objs
  getFileInfoObjArr : function (filenameArr, funchandle) {
    var fileObjArr = [], that = this;

    if (!filenameArr.length) return funchandle(null, fileObjArr);
    (function openNext(x, filename) {
      if (!x--) return funchandle(null, fileObjArr);
      if (!(filename = filenameArr[x])) return openNext(x);
      console.log(Message.openFile(filename));
      fs.readFile(filename, 'ascii', function(err, fd) {
        if (err) return funchandle(err);
        fileObjArr.push(InfoFile.getFromFile(fd, filename));
        openNext(x);
      });
    }(filenameArr.length));      
  },

  // build a new tree with associated files of different extension
  getAssociatedCSSTree : function (treeObj, funchandle) {
    var newFileObjArr = [];

    if (!treeObj.fileObjArr || !treeObj.fileObjArr.length) return funchandle();

    (function getNext(x, fileObj, filename) {
      if (!x--) return funchandle(null, newFileObjArr);
      fileObj = BMBLib.clone(treeObj.fileObjArr[x]);
      
      if (!fileObj.filename) {
         console.log(Message.missingDependency(treeObj.fileInfoObj.treename,  treeObj.fileObjArr[x].treename));
      }

      filename = fileObj.filename.replace(/\.js$/, '.css');

      FileUtil.getFile(filename, function (err, fd, nfileObj) {
        if (err) return getNext(x);

        nfileObj = InfoFile.getFromFile(fd, filename);
        newFileObjArr.push(nfileObj);
        getNext(x);
      });
    }(treeObj.fileObjArr.length));
  },

  getAssociatedTrees : function (filters, treeObjArr, funchandle) {
    var assocTreeArr = [], x, filtername, y, type, that = this;

    if (filters && filters.css) {
      for (x = filters.css.length; x--;) {
        if ((filtername = filters.css[x])) {
          if (filtername.match(/js$/)) {
            // find trees matching filter name -convert them
            return (function getNextTree(y, tree) {
              if (!y--) return funchandle(null, assocTreeArr);
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
    funchandle(null, assocTreeArr);
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
  treesInspect : function (treeArr, funchandle) {
    var missingDependencyArr = scrounge.getMissingDependencyArr(treeArr), x;
    if (missingDependencyArr.length) {
      treeArr.map(function (tree) {
        tree.reportMissingDependencyArr(missingDependencyArr);
      });
      return funchandle(Message.stopping());
    } 
    funchandle(null);
  },

  treesBuild : function (opts, basepage, funchandle) {
    var basepageUtil, fileObjBuilder, x, treeObjArr;
    FileUtil.getFiles(opts, function (err, fileInfoArr) {
      if (err) return funchandle(err);
      scrounge.getBasepageFilters(basepage, function (err, filters) {
        if (err) return funchandle(err);
        scrounge.getFileInfoObjArr(fileInfoArr, function (err, fileInfoObjArr) {
          if (err) return funchandle(err);          

          treeObjArr = scrounge.getAsTrees(fileInfoObjArr, filters);
          scrounge.treesInspect(treeObjArr, function (err) {
            if (err) return funchandle(err);
            scrounge.getAssociatedTrees((filters) ? filters.trees : null, treeObjArr, function (err, assocTreeArr) {
              if (err) return funchandle(err);              
              for (x = assocTreeArr.length; x--;) {
                treeObjArr.push(assocTreeArr[x]);
              }
              funchandle(null, treeObjArr);
            });
          });
        });
      });
    });
  },
  
  treesApply : function (treeObjArr, opts, basepage, funchandle) {
    if (!treeObjArr.length) return Message.noTreesFound();
    scrounge.writeCompressedTrees(treeObjArr, opts, function (err, compressed) {
      if (err) return funchandle(err);
      scrounge.writeBasepage(basepage, treeObjArr, opts, function (err) {
        if (err) return funchandle(err);        
        funchandle(null);
      });
    });
  },

  go : function (opts) {
    var bgnDateObj = new Date(), totalTime,
        basepage = (opts.basepage) ? BasepageUtil.getNew(opts.basepage) : null;

    scrounge.treesBuild(opts, basepage, function (err, treeArr) {
      if (err) return console.log(err);
      scrounge.treesApply(treeArr, opts, basepage, function (err) {
        if (err) return console.log(err);
        Message.releaseMessages();
        totalTime = BMBLib.getElapsedTime(bgnDateObj, new Date());
        console.log(Message.finish(totalTime));
      });
    });
  }
};

scrounge.go(options);

