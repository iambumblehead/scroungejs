var fs = require('fs'), // read/write files
    path = require('path'),
    FileUtil = require('./FileUtil.js'),
    BMBLib = require('./BMBLib.js');

var ScroungeElement = module.exports = (function () {

  var scroungeElement = {
    trees : [],
    type : '',
    elem : '', //original element from this object created around 

    // include tags for css and js
    includeElemTplCSS : '<link href="$" rel="stylesheet" type="text/css">',
    includeElemTplJS : '<script src="$" type="text/javascript"></script>',

    // open/close full scrounge tags. $tags are for include tags
    scroungeTagOpenTpl : '<!-- <scrounge.$type$tree> -->',
    scroungeTagCloseTpl : '<!-- <\/scrounge> -->',

    // '   <!-- <scrounge.js> -->' >> '   '
    // '<!-- <scrounge.js> -->'    >> ''
    getElemIndentation : function () {
      var matchIndentation = this.elem.match(/^ */),
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

      if (type === 'css') {
        include = i + that.includeElemTplCSS;
      } else if (type === 'js') {
        include = i + that.includeElemTplJS;
      }

      return include;
    },

    // returns a scrounge element template
    // include tags are defind with value `$tags`
    // full trees attriute is defind with value `$tree`
    getScroungeElemTplStr : function () {
      var that = this, elemTplStr = '', type = that.type || '', 
          i = that.getElemIndentation();

      elemTplStr += i + that.scroungeTagOpenTpl;
      elemTplStr += '\n$tags\n';
      elemTplStr += i + that.scroungeTagCloseTpl;

      // type === ''|'js'|'css'
      elemTplStr = elemTplStr.replace(/\$type/, type);      

      return elemTplStr;
    },

    // is tree match?
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
      var that = this,
          scroungeTag = that.getScroungeElemTplStr(),
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
      var tag = this.getElemIncludeTplStr(),
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

    // return trees from all scrounge elements found in the string
    getFromStrTreesArr : function (str) {
      var scroungeElemObjArr = this.getFromStrScroungeElemObjArr(str), x,
          treesArr = [];

      for (x = scroungeElemObjArr.length; x--;) {
        treesArr = treesArr.concat(scroungeElemObjArr[x].trees);
      }

      // rm duplicates
      treesArr = treesArr.filter(function(tree, pos) {
        return treesArr.indexOf(tree) == pos;
      });

      return treesArr;
    },

    getNew : function (spec) {
      var that = BMBLib.clone(scroungeElement);
      that.elem = spec.elem || '';
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

    // type = all|js|css
    getFromStrScroungeElemObjArr : function (str, opts) {
      var that = this, scroungeTagArr, x, tagObjArr = [], type;

      if (typeof str === 'string') {
        scroungeTagArr = str.match(that.elementRe);
        if (scroungeTagArr) {
          for (x = scroungeTagArr.length; x--;) {
            tagObjArr.push(that.getFromStrScroungeElemObj(scroungeTagArr[x]));
          }        
        }
      }

      // if type is specified, filter by type
      if (typeof opts === 'object' &&
          typeof opts.extnType === 'string') {
        type = opts.extnType;
        tagObjArr = tagObjArr.filter(function (obj) {
          return obj.type === type;
        });
      }
      
      return tagObjArr;
    }
  };

}());
