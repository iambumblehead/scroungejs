var fs = require('fs'), // read/write files
    path = require('path'),
    FileUtil = require('./FileUtil.js'),
    BMBLib = require('./BMBLib.js');

var ScroungeElement = module.exports = (function () {

  var scroungeElement = {
    trees : [],
    type : '',
    elem : '', //original element from this object created around 

    getElementIndentation : function () {
      var matchIndentation = this.elem.match(/^ */);
      return (matchIndentation) ? matchIndentation[0] : '';
    },

    getElement : function () {
      var i = this.getElementIndentation();
      return i + '<!-- <scrounge.' + this.type + '$tree> -->' +
             '\n$tags' +
             i + '<!-- <\/scrounge> -->';
    },

    getInclude : function () {
      var type = this.type,
          i = this.getElementIndentation();

      if (type === 'css') {
        return i + '<link href="$" rel="stylesheet" type="text/css">';
      }
      if (type === 'js') {
        return i + '<script src="$" type="text/javascript"></script>';
      }
    },

    isTreeMatch : function (treeObj) {
      var treename = treeObj.treename,
          treetype = treeObj.type,
          definedTreeArr = this.trees,
          definedType = this.type;

      if (definedTreeArr.length) {
        return (definedTreeArr.indexOf(treename) > -1 &&
                (!definedType || definedType === treetype));        
      } else {
        return definedType === treetype;
      }
    },

    getScroungeElem : function (tags, trees) {
      var scroungeTag = this.getElement(),
          treeAttribute = (trees) ? ' trees="' + trees + '"' : '',
          tagsRe = /\$tags/,
          treeRe = /\$tree/;

      scroungeTag = scroungeTag.replace(treeRe, treeAttribute);                
      scroungeTag = scroungeTag.replace(tagsRe, tags);
      return scroungeTag;
    },

    getIncludeTag : function (fileInfoObj, opts) {
      var tag = this.getInclude(),
          filename = fileInfoObj.getCmprFilename(opts),
          filepath = opts.outputPath,
          fullpath = path.join(filepath, filename);

      fullpath = FileUtil.getPublicPath(fullpath, opts.publicPath);
      fullpath.replace(/[cj]ss?/, fileInfoObj.type);
      return tag.replace(/\$/, fullpath) + '\n';
    },

    buildTagText : function (treeObjArr, opts) {
      var fileObjArr, tags = '', x, y, type = this.type,
          tObjArr = treeObjArr.filter(function (t) {
            return t.fileInfoObj.type === type;
          });

      for (x = tObjArr.length; x--;) {
         if (opts.isConcatenation || opts.isForceConcatenatedType(tObjArr[x].fileInfoObj)) {
           tags += this.getIncludeTag(tObjArr[x].fileInfoObj, opts);           
        } else {
          fileObjArr = tObjArr[x].fileObjArr;
          for (y = fileObjArr.length; y--;) {
            tags += this.getIncludeTag(fileObjArr[y], opts);
          }
        }
      }
      return this.getScroungeElem(tags, this.trees.join(','));
    }  
  };

  return {
    elementTreeRe : /trees="([\s\S]*?)"/,
    elementTypeRe : /scrounge\.([cj]ss?)/,
    elementRe : /\ *<!-- <scrounge\.[jc]ss?([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi,

    getNew : function (spec) {
      var that = BMBLib.clone(scroungeElement);
      that.elem = spec.elem;
      that.trees = spec.trees || [];
      that.type = spec.type || null;
      return that;
    },

    getFromElement : function (element) {
        var typeMatch = element.match(this.elementTypeRe),
            treeMatch = element.match(this.elementTreeRe);

      return this.getNew({
        elem : element,
        type : (typeMatch && typeMatch[1]) ? typeMatch[1] : null,
        trees : (treeMatch && treeMatch[1]) ? treeMatch[1].split(',') : null
      });
    },

    getFromMarkup : function (text) {
      var scroungeTagArr, x, tree, trees, tagObjArr = [], 
          typeRe = this.ElementTypeRe,
          treeRe = this.ElementTreeRe,
          element;

      scroungeTagArr = text.match(this.elementRe) || [];
      for (x = scroungeTagArr.length; x--;) {
        tagObjArr.push(this.getFromElement(scroungeTagArr[x]));
      }
      return tagObjArr;
    }
  };

}());
