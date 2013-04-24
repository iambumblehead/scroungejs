var path = require('path'),
    util = require('util');

var UserOptions = module.exports = (function () {

  var defaultOptions = {
    inputPath : './',
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

    extnType : '', // js | css
    publicPath : ''
  };
  
  return {
    getNew : function (spec) {
      var that = Object.create(defaultOptions),
          homeDir = process.env.HOME + '/',
          isTrue = function (opt) {
            return opt === true || opt === 'true';
          },
          isFalse = function (opt) {
            return opt === false || opt === 'false';
          },
          getAsBoolOrArr = function (opt) {
            if (opt === true || opt === 'true') {
              return true;
            } else if (typeof opt === 'string') {
              return opt.split(',');      
            } else if (util.isArray(opt)) {
              return opt;      
            }
          };

      if (spec.inputPath) {
        that.inputPath = spec.inputPath;       
      } else if (spec.i) {
        that.inputPath = spec.i; 
      }

      if (spec.outputPath) {
        that.outputPath = spec.outputPath;
      } else if (spec.o) {
        that.outputPath = spec.o;
      } else {
        if (that.inputPath.match(/(css|js)$/)) {
          that.outputPath = path.join(path.dirname(that.inputPath), 'cmpr');          
        } else {
          that.outputPath = path.join(that.inputPath, 'cmpr');            
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
        that.copyAll = spec.copyAll.split(',');      
      }

      if (spec.trees) {
        that.trees = spec.trees.split(',');      
      }

      if (spec.forceTimestamp) {
        that.forceTimestamp = spec.forceTimestamp;      
      }

      if (spec.isBasepageSourcePaths) {
        that.isBasepageSourcePaths = spec.isBasepageSourcePaths;
      }

      that.inputPath = that.inputPath.replace(/^~/, process.env.HOME);
      that.outputPath = that.outputPath.replace(/^~/, process.env.HOME);
      that.publicPath = that.publicPath.replace(/^~/, process.env.HOME);
      that.basepage = that.basepage.replace(/^~/, process.env.HOME);

      if (isFalse(spec.isRemoveRequires)) {
        that.isRemoveRequires = false;      
      }

      that.isCopyright = isTrue(spec.isCopyright);
      that.isRecursive = isTrue(spec.isRecursive) || isTrue(spec.r);
      that.isUpdateOnly = isTrue(spec.isUpdateOnly);
      that.isMintFilter = isTrue(spec.isMintFilter) || isTrue(spec.m);

      that.isCompressed = getAsBoolOrArr(spec.isCompressed);
      that.isConcatenated = getAsBoolOrArr(spec.isConcatenated);
      that.isTimestamped = getAsBoolOrArr(spec.isTimestamped);

      that.isRemoveConsole = isTrue(spec.isRemoveConsole);
      that.isWarning = isTrue(spec.isWarning) || isTrue(spec.w);
      that.isLines = isTrue(spec.isLines) || isTrue(spec.l);
      that.isClosure = isTrue(spec.isClosure) || isTrue(spec.c);
      that.isSilent = isTrue(spec.isSilent) || isTrue(spec.s);

      if (that.isSilent) console.log = function () {};
      if (that.isSilent || !that.isWarning) console.warn = function () {};

      that.input = that.inputPath;
      that.output = that.outputPath;

      return that;
    }
  };
}());
