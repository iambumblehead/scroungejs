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

  getAsTrees : function (fileInfoObjArr, filters) {
    var treeFilters, graph = Graph.get(),
        treeArr = graph.addFileInfoArr(fileInfoObjArr).getSourceArr();

    if (filters) {
      treeArr = filters.getFilteredTreeArr(treeArr);    
    }

    treeArr = treeArr.map(function (tree) {
      console.log(Message.getAsArchyStr(graph.getAsArchyTree(tree)));      
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

    //FileUtil.getFiles(opts, function (err, filenameArr) {
    FileUtil.getTreeFiles(opts, function (err, filenameArr) {
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
            fn(null, treeObjArr);
          });
        });
      });
    });
  },

  // copy all files specified by `copyAll` modifier
  copyAll : function (opts, fn) {
    FileUtil.getCopyAllFiles(opts, function () {
      fn(null, '');
    });
  },

  // associated trees are fetched first and used
  // to construct scrounge elements for an existing basepage
  treesApply : function (treeObjArr, opts, infoBasepage, fn) {
    if (!treeObjArr.length) return Message.noTreesFound();

    InfoTree.getTreeArrAsAssocTreeArr(treeObjArr, opts, function (err, treeArr) {
      if (err) return fn(err);  
      InfoTree.writeTreeArr(treeArr, opts, function () {
        if (err) return fn(err);
        infoBasepage.writeTrees(treeArr, opts, fn);        
      });
    });
  },

  go : function (opts, fn) {
    var bgnDateObj = new Date(), totalTime,
        infoBasepage = InfoBasepage.getNew(opts);

    scrounge.treesBuild(opts, infoBasepage, function (err, treeArr) {
      if (err) return console.log(err);
      scrounge.copyAll(opts, function (err, res) {
        if (err) return console.log(err);     
        scrounge.treesApply(treeArr, opts, infoBasepage, function (err) {
          if (err) return console.log(err);
          Message.releaseMessages();
          totalTime = SimpleTime.getElapsedTimeFormatted(bgnDateObj, new Date());
          console.log(Message.finish(totalTime));
          if (typeof fn === 'function') fn(null, totalTime);
        });
      });
    });
  }
};


// if called from command line...
if (require.main === module) {
  options = UserOptions.getNew(argv);
  scrounge.go(options);    
} 



