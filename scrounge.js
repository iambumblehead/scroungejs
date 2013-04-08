var argv = require('optimist').argv,
    fs = require('fs'),
    path = require('path'),
    SimpleTime = require('simpletime'),

    Graph = require('./lib/DAG.js'),
    BMBLib = require('./lib/BMBLib.js'),
    Message = require('./lib/Message.js'),

    FileUtil = require('./lib/FileUtil.js'),
    FilterTree = require('./lib/FilterTree.js'),

    InfoBasepage = require('./lib/fileInfo/fileInfoBasepage.js'),
    InfoTree = require('./lib/fileInfo/fileInfoTree.js'),
    InfoNode = require('./lib/fileInfo/fileInfoNode.js'),

    UserOptions = require('./lib/UserOptions.js'),

    options;


var scrounge = module.exports = {

  // copies each tree item to timestamped file in final dir
  writeFilesTreeArr : function (treeObjArr, opts, fn) {
    var that = this, output = opts.outputPath;
    (function next(x, treeObj) {
      if (!x--) return fn(null, 'success');    
      treeObjArr[x].writeInfoNodes(output, opts, function(err, res) {
        if (err) return fn(err);
        next(x);        
      });
    }(treeObjArr.length));
  },

  writeTreesTreeArr : function (treeObjArr, opts, fn) {
    var that = this, output = opts.outputPath;
    (function next(x, treeObj) {
      if (!x--) return fn(null, 'success');    
      treeObjArr[x].writeInfoTree(output, opts, function(err, res) {
        if (err) return fn(err);
        next(x);        
      });
    }(treeObjArr.length));
  },

  // write the compressd output of all trees in the collection
  writeCompressedTrees : function (treeObjArr, opts, fn) {
    var concatArr = [], that = this,
        unconcatArr = [], x, forceTypes;

    // do not compress or copy files if basepage uses source paths.
    if (opts.isBasepageSourcePaths) return fn(null);

    if (opts.isConcatenation) {
      that.writeTreesTreeArr(treeObjArr, opts, fn);
    } else {
      treeObjArr.map(function (treeObj) {
        if (opts.isForceConcatenatedType(treeObj.fileInfoObj)) {
          concatArr.push(treeObj);
        } else {
          unconcatArr.push(treeObj);
        }        
      });
      that.writeTreesTreeArr(concatArr, opts, function () {
        that.writeFilesTreeArr(unconcatArr, opts, fn);
      });
    }
  },

  getAssociatedTrees : function (filters, treeObjArr, fn) {
    var hostTreeNameArr = filters.getHostTreeNameArr(),
        assocTreeArr = [], x, hostTreeObjArr;

    hostTreeObjArr = treeObjArr.filter(function (treeObj) {
      return hostTreeNameArr.indexOf(treeObj.fileInfoObj.treename) !== -1;
    });

    (function next(x, treeObj) {
      if (!x--) return fn(null, assocTreeArr);
      treeObj = hostTreeObjArr[x];
      treeObj.getAssociatedTree(function (err, assocTree) {
        if (err) return fn(err);
        assocTreeArr.push(assocTree);
        next(x);        
      });
    }(hostTreeObjArr.length));
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

  treesBuild : function (opts, infoBasepage, fn) {
    var basepageUtil, fileObjBuilder, x, treeObjArr;

    FileUtil.getFiles(opts, function (err, filenameArr) {
      if (err) return fn(err);
      infoBasepage.getFilters(function (err, filters) {
        if (err) return fn(err);
        InfoNode.getFromFileArr(filenameArr, function (err, fileInfoObjArr) {
          if (err) return fn(err);          

          if (!filters) {
            filters = FilterTree.getNew();
          }

          opts.trees.map(function (treename) {
            filters.addTreeByFilename(treename);              
          });

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
            scrounge.getAssociatedTrees(filters, treeObjArr, function (err, assocTreeArr) {
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
  
  treesApply : function (treeObjArr, opts, infoBasepage, fn) {
    if (!treeObjArr.length) return Message.noTreesFound();
    scrounge.writeCompressedTrees(treeObjArr, opts, function (err, compressed) {
      if (err) return fn(err);
      infoBasepage.writeTrees(treeObjArr, opts, fn);
    });
  },

  go : function (opts, fn) {
    var bgnDateObj = new Date(), totalTime,
        infoBasepage = InfoBasepage.getNew(opts);

    scrounge.treesBuild(opts, infoBasepage, function (err, treeArr) {
      if (err) return console.log(err);
      scrounge.treesApply(treeArr, opts, infoBasepage, function (err) {
        if (err) return console.log(err);
        Message.releaseMessages();
        totalTime = SimpleTime.getElapsedTimeFormatted(bgnDateObj, new Date());
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



