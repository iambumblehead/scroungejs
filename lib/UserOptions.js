var path = require('path'),
    util = require('util');

var UserOptions = module.exports = (function () {

  var defaultOptions = {
    inputPathArr : [ './' ], 
    outputPath : './cmpr',
    treeView : 'partial',
    stop : 'never',

    forceTimestamp : null, // a forced timestamp value

    isRecursive : false,
    isConcatenated : false,
    isCompressed : false,
    isTimestamped : false,
    isCopyright : false,
    isWarning : false,
    isSilent : false,
    isLines : false,
    isClosure : false,
    isMintFilter : false,
    isUpdateOnly : false,
    isRemoveRequires : true,
    isRemoveConsole : false,
    trees : [],

    extnTemplate : null,

    copyAll : [],

    basepage : '',
    isBasepageSourcePaths : false,
    isSourcePathUnique : false,

    extnType : '', // js | css
    publicPath : ''
  };
  
  return {
    getFullPath : function (p) {
      return p
        .replace(/^~(?=\/)/, process.env.HOME)
        .replace(/^.(?=\/)/, process.cwd());
    },
    optConvert : {
      isTrue : function (opt) {
        return opt === true || opt === 'true';
      },
      isFalse : function (opt) {
        return opt === false || opt === 'false';
      },
      getAsBoolOrArr : function (opt) {
        var fin = false;

        if (opt === true || opt === 'true') {
          fin = true;
        } else if (opt === false || opt === 'false') {
          fin = false;
        } else if (typeof opt === 'string') {
          fin = opt.split(',');      
        } else if (util.isArray(opt)) {
          fin = opt;      
        }

        return fin;
      }
    },

    getNew : function (spec) {
      var that = Object.create(defaultOptions),
          homeDir = process.env.HOME + '/',
          getFullPath = this.getFullPath,
          optConvert = this.optConvert;

      // multiple inputPath may be given
      //that.inputPathArr = (typeof that.inputPathArr === 'string' && that.inputPathArr === '')
      that.inputPathArr = optConvert.getAsBoolOrArr(spec.inputPath) ||
                          optConvert.getAsBoolOrArr(spec.i) ||
                          that.inputPathArr;

      /*
      if (spec.inputPath) {
        that.inputPath = spec.inputPath;       
      } else if (spec.i) {
        that.inputPath = spec.i; 
      }
       */

      if (spec.outputPath) {
        that.outputPath = spec.outputPath;
      } else if (spec.o) {
        that.outputPath = spec.o;
      } else {
        if (that.inputPathArr[0].match(/(css|js)$/)) {
          that.outputPath = path.join(path.dirname(that.inputPathArr[0]), 'cmpr');          
        } else {
          that.outputPath = path.join(that.inputPathArr[0], 'cmpr');            
        }
      }


      if (spec.extnTemplate) {
        that.extnTemplate = spec.extnTemplate;
      }

      if (spec.extensionType) {
        that.extnType = spec.extensionType;
      } else if (spec.t) {
        that.extnType = spec.t;
      }

      if (spec.publicPath) {
        that.publicPath = spec.publicPath;
      } else if (spec.p) {
        that.publicPath = spec.p;
      }

      if (spec.basepage) {
        that.basepage = spec.basepage;
      }

      if (spec.stop) {
        that.stop = spec.stop;
      }

      if (spec.treeView) {
        that.treeView = spec.treeView;
      }

      if (spec.copyAll) {
        that.trees = optConvert.getAsBoolOrArr(spec.copyAll);
        //that.copyAll = spec.copyAll.split(',');      
      }

      if (spec.trees) {
        that.trees = optConvert.getAsBoolOrArr(spec.trees);
        //that.trees = spec.trees.split(',');      
      }

      if (spec.forceTimestamp) {
        that.forceTimestamp = spec.forceTimestamp;      
      }

      if (spec.isBasepageSourcePaths) {
        that.isBasepageSourcePaths = spec.isBasepageSourcePaths;
      }

      if (spec.isSourcePathUnique) {
        that.isSourcePathUnique = spec.isSourcePathUnique;
      }


      //that.inputPathArr = that.inputPathArr.map(function (inputPath) {
      //  return getFullPath(inputPath);
      //});
      //that.outputPath = getFullPath(that.outputPath);
      //that.publicPath = getFullPath(that.publicPath);
      //that.basepage = getFullPath(that.basepage);

      if (optConvert.isFalse(spec.isRemoveRequires)) {
        that.isRemoveRequires = false;      
      }

      that.isCopyright = optConvert.isTrue(spec.isCopyright);
      that.isRecursive = optConvert.isTrue(spec.isRecursive) || optConvert.isTrue(spec.r);
      that.isUpdateOnly = optConvert.isTrue(spec.isUpdateOnly);
      that.isMintFilter = optConvert.isTrue(spec.isMintFilter) || optConvert.isTrue(spec.m);

      that.isCompressed = optConvert.getAsBoolOrArr(spec.isCompressed);
      that.isConcatenated = optConvert.getAsBoolOrArr(spec.isConcatenated);
      that.isTimestamped = optConvert.getAsBoolOrArr(spec.isTimestamped);

      that.isRemoveConsole = optConvert.isTrue(spec.isRemoveConsole);
      that.isWarning = optConvert.isTrue(spec.isWarning) || optConvert.isTrue(spec.w);
      that.isLines = optConvert.isTrue(spec.isLines) || optConvert.isTrue(spec.l);
      that.isClosure = optConvert.isTrue(spec.isClosure) || optConvert.isTrue(spec.c);
      that.isSilent = optConvert.isTrue(spec.isSilent) || optConvert.isTrue(spec.s);

      if (that.isSilent) console.log = function () {};
      if (that.isSilent || !that.isWarning) console.warn = function () {};

//      that.input = that.inputPath;
//      that.output = that.outputPath;

      return that;
    }
  };
}());
