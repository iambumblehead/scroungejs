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

  // build a new tree with associated files of different extension
  getAssociatedCSSTree : function (treeObj, fn) {
    var newFileObjArr = [];

    (function getNext(x, fileObj, filename) {
      if (!x--) return fn(null, newFileObjArr);
      fileObj = Object.create(treeObj.fileObjArr[x]);
      filename = fileObj.filename.replace(/\.js$/, '.css');

      InfoFile.getFromFile(filename, function (err, infoFileObj) {
        // ignore error... perhaps the file doesn't exist
        if (typeof infoFileObj === 'object') {
          newFileObjArr.push(infoFileObj);
        }
        getNext(x);
      });
    }(treeObj.fileObjArr.length));
  },

  

  getAssociatedTrees : function (filters, treeObjArr, fn) {
    var assocTreeArr = [], x, filtername, y, type, that = this;

    // if css filters exist, 
    //  loop through each css filter,
    //  identify any matching js filter,
    //    
    // strategy create a method in filters object
    //   filters.getAssociatedFilers?
    //   scrounge.css tree=main.js
    //   where filter is css and it matches a js name
    if (filters && filters.css) {
      for (x = filters.css.length; x--;) {
        if ((filtername = filters.css[x])) {
          if (filtername.match(/js$/)) {
            // find trees matching filter name -convert them
            return (function getNextTree(y, tree) {
              if (!y--) return fn(null, assocTreeArr);
              that.getAssociatedCSSTree(treeObjArr[y], function (err, newFileObjArr) {
                var tree = BMBLib.clone(treeObjArr[y]);
                tree.fileInfoObj = BMBLib.clone(tree.fileInfoObj);
                tree.fileInfoObj.filename = tree.fileInfoObj.filename.replace(/\.js$/, '.css');
                tree.fileInfoObj.type = '.css';
                tree.fileObjArr = newFileObjArr;

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
      console.log(Message.missingDependencyArr(missingDependencyArr));
      return fn(Message.stopping());
    } 
    fn(null);
  },

  treesBuild : function (opts, basepage, fn) {
    var basepageUtil, fileObjBuilder, x, treeObjArr;

    FileUtil.getFiles(opts, function (err, filenameArr) {
      if (err) return fn(err);
      basepage.getFilters(function (err, filters) {
        if (err) return fn(err);
        InfoFile.getFromFileArr(filenameArr, function (err, fileInfoObjArr) {
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
      basepage.writeTrees(treeObjArr, opts, fn);
    });
  },

  go : function (opts, fn) {
    var bgnDateObj = new Date(), totalTime,
        basepage = BasepageUtil.getNew(opts);

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



