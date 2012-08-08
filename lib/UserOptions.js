var BMBLib = require('./BMBLib.js'),
    path = require('path');

var UserOptions = module.exports = (function () {

  var defaultOptions = {
    inputPath : './',
    outputPath : './cmpr',
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
    isRemoveRequires : true,
    
    forceConcatenateTrees : [],
    forceConcatenateTypes : [],

    basepage : '',

    extnType : '', // js | css
    publicPath : '',

    isForceConcatenatedType : function (infoObj) {
      return this.forceConcatenateTypes.indexOf(infoObj.type) > -1;
    }
  };
  
  return {
    getNew : function (spec) {
      var that = BMBLib.clone(defaultOptions),
          homeDir = process.env.HOME + '/';

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

      if (spec.trees) {
        that.trees = spec.trees;      
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

      that.inputPath = that.inputPath.replace(/^~/, process.env.HOME);
      that.outputPath = that.outputPath.replace(/^~/, process.env.HOME);
      that.publicPath = that.publicPath.replace(/^~/, process.env.HOME);
      that.basepage = that.basepage.replace(/^~/, process.env.HOME);

      that.isRemoveRequires = spec.isRemoveRequires !== 'false';
      that.isCopyright = spec.isCopyright === 'true';
      that.isRecursive = spec.isRecursive === 'true' || spec.r;
      that.isConcatenation = spec.isConcatenation === 'true';
      that.isMintFilter = spec.isMintFilter === 'true' || spec.m;
      that.isCompressed = spec.isCompressed === 'true';
      that.isTimestamped = spec.isTimestamped === 'true';
      that.isWarning = spec.isWarning === 'true' || spec.w;
      that.isLines = spec.isLines === 'true' || spec.l;
      that.isClosure = spec.isClosure === 'true' || spec.c;
      that.isSilent = spec.isSilent === 'true' || spec.s;

      if (that.isSilent) console.log = function () {};
      if (that.isSilent || !that.isWarning) console.warn = function () {};

      that.input = that.inputPath;
      that.output = that.outputPath;
        
      return that;
    }
  };
}());