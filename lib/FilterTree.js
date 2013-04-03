var path = require('path');


// should be teeFilter
// trees are given from three places,
// 1) from the command line via the trees modifier
//   ex. --trees=Main.js,Crypto.js
// 2) from a javascript file via scrounge's constructor
//   ex. scroungejs.build({ trees : [ 'Main.js', 'Crypto.js' ] });
// 3) from the attribute of a basepage's scrounge element
//   ex. <scrounge.js trees="Main.js,Crypto.js">
//   ex. <scrounge.css trees="Main.js">
// 
var FilterTree = module.exports = (function () {

  // these 'values' for each filter are notable.
  // 1) null, 
  //   - no filters are present
  //   - build all trees found
  // 2) empty array, 
  //   - filters are present
  //   - build no trees
  // 3) populated array (names of trees) 
  //   - filters are present
  //   - build only the trees defined in the array
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

    // a tree that contains view-related scripts can be used to construct a 
    // corresponding tree that contains related stylesheets. a tree used to 
    // construct another tree this way is a 'host' tree.
    //
    //   <scrounge.js trees="Main.js,Crypto.js">
    //   </scrounge>
    //   <scrounge.css trees="Main.js">
    //   </scrounge>
    // 
    // the scrounge.css element has a tree attribute with a host `Main.js`. 
    // It is a `.css` type tree composed of .css files that associate with the
    // .js files of host `Main.js`. Files are associated through filename.
    // 
    // `Main.css` would be associated with `Main.js`. 
    // `ViewA.css` would be associated with `ViewB.css`
    getHostTreeNameArr : function () {
      var cssFilters = this.trees['.css'],
          treeArr = [];
      
      if (cssFilters) {
        treeArr = cssFilters.filter(function (treename) {
          return treename.match(/js$/) ? true : false;
        });
      }

      return treeArr;
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
      var that = Object.create(filter);

      that.trees = {
        '.js'  : null,
        '.css' : null
      };

      return that;
    } 
  };

}());
