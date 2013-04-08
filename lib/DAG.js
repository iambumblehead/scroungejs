
var Graph = module.exports = (function () {
  var graph = {
    vertexMap : {},
    // returns an individual tree, sorted.
    getSorted : function (sourceObj) {
      var vertexMap = this.vertexMap,
          vertexFound = {},
          vertexArr = [];

      if (sourceObj && sourceObj.treename) {
      (function exploreVertex(vertex) {
        if (!vertexFound[vertex]) {
          vertexFound[vertex] = 1;
          vertexMap[vertex].out.map(exploreVertex);
          vertexArr.push(vertexMap[vertex].content);
        }
       }(sourceObj.treename));
      }
      return vertexArr.reverse();
    },

    addFileInfoArr : function (fileInfoArr, x) {
      if (fileInfoArr) {
        for (x = fileInfoArr.length; x--;) {
          if (fileInfoArr[x]) {
            this.addVertex(fileInfoArr[x]);
            this.addVertexEdges(fileInfoArr[x].treename, fileInfoArr[x].dependencyArr);            
          }
        }
      }
      return this;
    },

    addVertex : function (spec) {
      var obj = this.vertexMap[spec.treename] || {};

      obj.in = obj.in || [];
      obj.out = obj.out || [];
      obj.content = spec;
      obj.treename = obj.treename || spec.treename;
      obj.filename = obj.filename || spec.filename;

      this.vertexMap[spec.treename] = obj;
      return obj;
    },
    // vertex with 'in' degree of 0
    // returns all trees
    getSourceArr : function () {
      var sourceArr = [], vertexMap = this.vertexMap;

      for (var o in vertexMap) {
        if (vertexMap.hasOwnProperty(o)) {
          if (vertexMap[o].in.length === 0 && vertexMap[o].filename) {
            sourceArr.push(vertexMap[o].content);
          }
        }
      }
      return sourceArr;
    },

    eraseAllEdges : function() {
      var vertexMap = this.vertexMap;

      for (var o in vertexMap) {
        if (vertexMap.hasOwnProperty(o)) {
          vertexMap[o].in = [];
          vertexMap[o].out = [];
        }
      }
    },

    addVertexEdge : function (vertexBgn, vertexEnd) {
      var vertexMap = this.vertexMap;

      if (!vertexMap[vertexBgn]) this.addVertex({ treename: vertexBgn });
      if (!vertexMap[vertexEnd]) this.addVertex({ treename: vertexEnd });      

      vertexMap[vertexBgn].out.push(vertexEnd);
      vertexMap[vertexEnd].in.push(vertexBgn);
    },

    addVertexEdges : function (vertexBgn, vertexEndArr) {
      var x, vEndArr = vertexEndArr || [];

      for (x = vEndArr.length; x--;) {
        this.addVertexEdge(vertexBgn, vEndArr[x]);
      }
    }
  };

  return {
    get : function (fileArr) {
      var that = Object.create(graph);
      that.vertexMap = {};
      return that;
    }
  };
}());

