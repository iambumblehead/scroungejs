var argv = require('optimist').argv,
    fs = require('fs'),
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

  getAsTrees : function (fileInfoObjArr, filters, opts) {
    var treeFilters, graph = Graph.get(),
        treeArr = graph.addFileInfoArr(fileInfoObjArr).getSourceArr();

    if (filters) {
      treeArr = filters.getFilteredTreeArr(treeArr);    
    }

    treeArr.map(function (tree) {
      if (tree.dependencyArr.length) {
        console.log('\n' + Message.getAsArchyStr(graph.getAsArchyTree(tree, opts)));
      }
    });

    return treeArr.map(function (tree) {
      return InfoTree.getNew({
        fileObjArr : graph.getSorted(tree),
        fileInfoObj : tree
      });
    });

  },

  getMissingDependencyArr : function (treeArr) {
    var missingDepArr = [];

    treeArr.map(function (tree) {
      tree.getMissingDependencyArr().map(function (dep) {
        missingDepArr.push(dep);
      });
    });

    return missingDepArr;
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

    FileUtil.getTreeFiles(opts, function (err, filenameArr) {
      if (err) return fn(err);

      infoBasepage.getFilters(function (err, filters) {
        if (err) return fn(err);

        InfoNode.getFromFileArr(filenameArr, function (err, fileInfoObjArr) {
          if (err) return fn(err);          

//          console.log('filters', filters);

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
            treeObjArr = scrounge.getAsTrees(fileInfoObjArr, filters, opts);            
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

      // probably not important
      if (opts.extnType) {
        treeArr = treeArr.filter(function (tree) {
          return tree.fileInfoObj.type === opts.extnType ? true : false;
        });
      }

//      console.log('treeArr assoc --- ', treeArr);
      InfoTree.writeTreeArr(treeArr, opts, function (err, res) {
        if (err) return fn(err);
//        console.log('writeTrees', treeArr);
        infoBasepage.writeTrees(treeArr, opts, fn);        
      });
    });
  },

  go : function (opts, fn) {
    var bgnDateObj = new Date(), totalTime,
        infoBasepage = InfoBasepage.getNew(opts),
        cb = function (err, res) { 
          if (typeof fn === 'function') fn(err, res);
        };

    Message.start();
    scrounge.treesBuild(opts, infoBasepage, function (err, treeArr) {
      if (err) throw new Error(err);

      if (opts.stop === 'tree') {
        return cb(null, '');
      }

      scrounge.copyAll(opts, function (err, res) {
        if (err) throw new Error(err);     
        scrounge.treesApply(treeArr, opts, infoBasepage, function (err) {
          if (err) throw new Error(err);
          Message.releaseMessages();
          totalTime = SimpleTime.getElapsedTimeFormatted(bgnDateObj, new Date());
          console.log(Message.finish(totalTime));
          cb(null, totalTime);
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



