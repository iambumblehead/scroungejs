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
      var that = this, i = that.getElementIndentation();
      return i + '<!-- <scrounge.' + that.type + '$tree> -->' +
             '\n$tags' +
             i + '<!-- <\/scrounge> -->';
    },

    getInclude : function () {
      var that = this, type = that.type, include,
          i = that.getElementIndentation();

      if (type === 'css') {
        include = i + '<link href="$" rel="stylesheet" type="text/css">';
      } else if (type === 'js') {
        include = i + '<script src="$" type="text/javascript"></script>';
      }

      return include;
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
          treeAttribute = '',
          tagsRe = /\$tags/,
          treeRe = /\$tree/;

      if (typeof trees === 'string') {
        treeAttribute = ' trees="' + trees + '"';
      }

      scroungeTag = scroungeTag.replace(treeRe, treeAttribute);                
      scroungeTag = scroungeTag.replace(tagsRe, tags);
      return scroungeTag;
    },

    getIncludeTag : function (fileInfoObj, opts) {
      var tag = this.getInclude(),
          filename = fileInfoObj.getCmprFilename(opts),
          filepath = opts.outputPath,
          fullpath = path.join(filepath, filename);

      if (opts.isBasepageSourcePaths) {
        fullpath = FileUtil.getPublicPath(fileInfoObj.filename, opts.publicPath);
      } else {
        fullpath = FileUtil.getPublicPath(fullpath, opts.publicPath);
      }

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

    getFromStrScroungeElemObj : function (str) {
      var that = this, type, trees,
          typeMatch = str.match(that.elementTypeRe),
          treeMatch = str.match(that.elementTreeRe);

      if (typeMatch && typeMatch[1]) type = typeMatch[1];
      if (treeMatch && treeMatch[1]) trees = treeMatch[1].split(',');
      
      return that.getNew({
        elem : str,
        type : type,
        trees : trees
      });
    },

    getFromStrScroungeElemObjArr : function (str) {
      var that = this, scroungeTagArr, x, tagObjArr = [];

      if (typeof str === 'string') {
        scroungeTagArr = str.match(that.elementRe);
        if (scroungeTagArr) {
          for (x = scroungeTagArr.length; x--;) {
            tagObjArr.push(that.getFromStrScroungeElemObj(scroungeTagArr[x]));
          }        
        }
      }

      return tagObjArr;
    }
  };

}());
