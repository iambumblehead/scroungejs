var BMBLib = require('./BMBLib.js'),
    path = require('path');

var FilterTree = module.exports = (function () {

  // three 'values' for each filter are notable.
  // 1) null, no filters are present
  // 2) empty array, 
  // 3) array containing elements (names of trees) 

  var filter = {
    trees : {
      '.js'  : null,
      '.css' : null
    },

    addTree : function (name, type) {
      var trees = this.trees;
      trees[type] = trees[type] || [];
      trees[type].push(name);
    },

    addTrees : function (nameArr, type) {
      var trees = this.trees, x;

      trees[type] = trees[type] || [];
      for (x = nameArr.length; x--;) {
        trees[type].push(nameArr[x]);            
      }
    },

    // trees given by command line option
    addTreeByFilename : function (fname) {
      var filename = fname,
          fileextn = path.extname(filename);

      this.addTree(filename, '.css');      
      this.addTree(filename, '.js');      
    },

    isTreePass : function (tree) {
      var treeInfo, treetype, treename, filter;

      if (!tree || !tree.fileInfoObj) return false;

      treeInfo = tree.fileInfoObj;
      treetype = treeInfo.type;
      treename = treeInfo.treename;
      filter = this.trees[treetype];

      return !filter || filter.indexOf(treename) > -1;
    },

    getFilteredTreeArr : function (origTreeArr) {
      var treeFilters = this.trees, x,
          jsFilter = treeFilters['.js'],
          cssFilter = treeFilters['.css'];

      return origTreeArr.filter(function (tree) {
        var treename = tree.treename;
        return (jsFilter === null || jsFilter.indexOf(treename) !== -1)
          || (cssFilter === null || cssFilter.indexOf(treename) !== -1);      
      });
    }
  };

  return {
    getNew : function (basepage) {
      var that = BMBLib.clone(filter);

      that.trees = {
        '.js'  : null,
        '.css' : null
      };

      return that;
    } 
  };

}());
