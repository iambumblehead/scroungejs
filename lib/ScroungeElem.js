var fs = require('fs'),
    path = require('path'),
    FileUtil = require('./FileUtil.js'),
    BMBLib = require('./BMBLib.js');


var ScroungeElem = module.exports = (function () {

  var scroungeElem = {
    trees : [],
    type : '',
    elem : '', // original str elem from which this object is created

    // include tags for css and js
    includeElemTplCSS : '<link href="$" rel="stylesheet" type="text/css">',
    includeElemTplJS : '<script src="$" type="text/javascript"></script>',

    // open/close full scrounge tags. $tags are for include tags
    scroungeTagOpenTpl : '<!-- <scrounge$type$tree> -->',
    scroungeTagCloseTpl : '<!-- <\/scrounge> -->',

    // if this.elem === '   <!-- <scrounge.js> -->' return '   '
    // if this.elem === '<!-- <scrounge.js> -->' return ''
    getElemIndentation : function () {
    var matchIndentation = this.elem.match(/^\s*/),
        indentation = '';

      if (BMBLib.isArray(matchIndentation)) {
        indentation = matchIndentation[0];
      }

      return indentation;
    },

    // returns a css or js include element template
    // href|src attribute is defind with `$` value
    getElemIncludeTplStr : function () {
      var that = this, type = that.type, include = null,
          i = that.getElemIndentation();

      if (type === '.css') {
        include = i + that.includeElemTplCSS;
      } else if (type === '.js') {
        include = i + that.includeElemTplJS;
      }

      return include;
    },

    // returns a scrounge element template
    // include tags are defind with value `$tags`
    // full trees attriute is defind with value `$tree`
    // this.type will defined as '', 'js', or 'css'
    getScroungeElemTplStr : function () {
      var that = this, elemTplStr = '', type = that.type || '', 
          i = that.getElemIndentation();

      elemTplStr += i + that.scroungeTagOpenTpl;
      elemTplStr += '\n$tags\n';
      elemTplStr += i + that.scroungeTagCloseTpl;
      elemTplStr = elemTplStr.replace(/\$type/, that.getTypeAttributeStr());      

      return elemTplStr;
    },

    // does treeObj match this scrounge elem?
    // tree must be of same `type` as the scrounge elem, `js` or `css`
    isTreeMatch : function (treeObj, opts) {
      var that = this,
          treeName = treeObj.treename,
          treeType = treeObj.type,
          thisTreeArr = that.trees,
          thisType = that.type,
          isMatch = false;

      if (thisType === treeType) {
        if (thisTreeArr.length) {
          if (thisTreeArr.indexOf(treeName) !== -1) {
            isMatch = true;
          }
        } else if (opts.trees.length === 0) {
          isMatch = true;
        }
      }

      return isMatch;
    },

    // return a type attribute: ' type=".js"'
    getTypeAttributeStr : function () {
      var thisType = this.type, attributeStr = '';

      attributeStr = ' type="' + thisType + '"';
      return attributeStr;
    },


    // return a tree attribute: ' trees="treeName"'
    getTreeAttributeStr : function () {
      var thisTreeArr = this.trees, attributeStr = '';

      if (thisTreeArr.length) {
        attributeStr = ' trees="' + thisTreeArr.join(',') + '"';
      }
      return attributeStr;
    },

    getScroungeElemStr : function (includeElemsStr) {
      var that = this,
          treeAttributeStr = that.getTreeAttributeStr(),
          typeAttributeStr = that.getTypeAttributeStr(),
          scroungeElem = that.getScroungeElemTplStr();

      return scroungeElem
        .replace(/\$tree/, treeAttributeStr)
        .replace(/\$type/, typeAttributeStr)
        .replace(/\$tags/, includeElemsStr);
    },

    getIncludeTag : function (fileInfoObj, opts) {
      var tag = this.getElemIncludeTplStr(),
          fullpath = fileInfoObj.getPublicPathStr(opts);
      
      return tag.replace(/\$/, fullpath);
    },

    // if concatenation is enabled, 
    //   a tree will yield *one* include tag referencing the concatenated result
    //   of files belonging to the tree
    // else
    //   a tree will yield *multiple* include tags, one for *each* file 
    //   belonging to the tree
    getIncludeTagArr : function (treeObjArr, opts) {
      var that = this, tagArr = [], type = that.type;
      
      treeObjArr.map(function (treeObj) {
        if (treeObj.fileInfoObj.type === type) {
          if (treeObj.fileInfoObj.isConcatenated(opts)) {
            tagArr.push(that.getIncludeTag(treeObj.fileInfoObj, opts));
          } else {
            treeObj.fileObjArr.map(function (fileObj) {
              tagArr.push(that.getIncludeTag(fileObj, opts));              
            });
          }
        }
      });
        
      return tagArr.reverse();
    },
    
    // return a fully formed scrounge element with include
    // tags for the trees passed in by treeObjArr
    getTreeArrAsScroungeElemStr : function (treeObjArr, opts) {
      var that = this, 
          tagArr = that.getIncludeTagArr(treeObjArr, opts);

      return that.getScroungeElemStr(tagArr.join('\n'));
    }  
  };

  return {
    elemTreeRe : /trees="([\s\S]*?)"/,
    elemTypeRe : /type="(\.[cj]ss?)?"/,
    elemRe : /\ *<!-- <scrounge([\s\S]*?)> -->([\s\S]*?)<!-- <\/scrounge> -->/gmi,

    getNew : function (spec) {
      var that = Object.create(scroungeElem);
      that.elem = spec.elem || '';
      that.trees = spec.trees || [];
      that.type = spec.type || null;
      return that;
    },

    // return trees from all scrounge elements found in the string
    // treenames are returned in any order
    getFromStrTreesArr : function (str) {
      var scroungeElemObjArr = this.getFromStrScroungeElemObjArr(str), x,
          treesArr = [];

      for (x = scroungeElemObjArr.length; x--;) {
        treesArr = treesArr.concat(scroungeElemObjArr[x].trees);
      }

      // rm duplicates
      treesArr = treesArr.filter(function (tree, pos) {
        return treesArr.indexOf(tree) == pos;
      });

      return treesArr;
    },

    getFromStrScroungeElemObj : function (str) {
      var that = this, type, trees,
          typeMatch = str.match(that.elemTypeRe),
          treeMatch = str.match(that.elemTreeRe);

      if (typeMatch && typeMatch[1]) type = typeMatch[1];
      if (treeMatch && treeMatch[1]) trees = treeMatch[1].split(/,/);

      if (trees) {
        trees = trees.map(function (tree) {
          return tree.trim();
        });      
      }

      return that.getNew({
        elem : str,
        type : type,
        trees : trees
      });
    },

    getFromStrScroungeElemAllObjArr : function (str, opts) {
      var that = this, scroungeTagArr, tagObjArr = [];

      if (typeof str === 'string') {
        scroungeTagArr = str.match(that.elemRe);
        if (scroungeTagArr) {
          scroungeTagArr.map(function (tag) {
            tagObjArr.push(that.getFromStrScroungeElemObj(tag));            
          });
        }
      }    
      return tagObjArr;
    },
    
    // if 'type' is passed as an option, only scroungeElems of the given type
    // are returned. 
    // `{ type : 'js' }` would return scrounge.js elements
    // `{ type : 'css' }` would return scrounge.css elements`
    getFromStrScroungeElemObjArr : function (str, opts) {
      var elemObjArr = this.getFromStrScroungeElemAllObjArr(str),
          type;

      if (typeof opts === 'object' &&
          typeof opts.extnType === 'string') {
        type = opts.extnType;
        elemObjArr = elemObjArr.filter(function (obj) {
          return obj.type === type;
        });
      }
      
      return elemObjArr;
    }
  };

}());
