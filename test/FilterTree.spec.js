var FilterTree = require('../lib/FilterTree');
var CompareObj = require('compareobj');

//describe("FilterTree.something", function () {
//});

describe("filterTree.addTrees", function () {
  it("should preserve order of trees added", function () {
    var filterTree = FilterTree.getNew();
    var resultExpected = ['tree1', 'tree2'];
    
    filterTree.addTrees(['tree1', 'tree2'], '.js');
    expect( 
      CompareObj.isSameMembersDefinedArrSame(
        filterTree.trees['.js'], resultExpected
      ) 
    ).toBe( true );
  });
});

