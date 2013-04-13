var path = require('path');

var UserOptions = module.exports = (function () {

  var defaultOptions = {
    inputPath : './',
    outputPath : './cmpr',
    trees : null,

    isRecursive : false,
    isConcatenation : false,
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
    forceConcatenateTrees : [],
    forceConcatenateTypes : [],

    copyAll : [],

    basepage : '',
    isBasepageSourcePaths : false,

    extnType : '', // js | css
    publicPath : '',

    isForceConcatenatedType : function (infoObj) {
      return this.forceConcatenateTypes.indexOf(infoObj.type) > -1;
    }
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

      if (spec.copyAll) {
        that.copyAll = spec.copyAll.split(',');      
      }

      if (spec.trees) {
        that.trees = spec.trees.split(',');      
      }

      if (spec.forceTimestamp) {
        that.forceTimestamp = spec.forceTimestamp;      
      }

      if (spec.forceConcatenateTrees) {
        that.forceConcatenateTrees = spec.forceConcatenateTrees.split(',');
      }

      if (spec.forceConcatenateTypes) {
        that.forceConcatenateTypes = spec.forceConcatenateTypes.split(',');
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
      that.isConcatenation = isTrue(spec.isConcatenation);
      that.isUpdateOnly = isTrue(spec.isUpdateOnly);
      that.isConcatenation = isTrue(spec.isConcatenation);
      that.isMintFilter = isTrue(spec.isMintFilter) || isTrue(spec.m);
      that.isCompressed = isTrue(spec.isCompressed);
      that.isTimestamped = isTrue(spec.isTimestamped);
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
