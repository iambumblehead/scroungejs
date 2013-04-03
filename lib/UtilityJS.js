var BMBLib = require('./BMBLib.js'),
    jsp = require('uglify-js').parser,
    pro = require('uglify-js').uglify;

var UtilityJS = module.exports = {
  getHeadText : function (spec, opts) {
    var timestamp = BMBLib.getFormattedDate(spec.timestamp),
        authorsArr = spec.authorsArr || [],
        headText = '';

    headText +=
      "// Filename: " + spec.filename + "  \n" +
      "// Timestamp: " + timestamp + " (last modified)  \n";

    if (authorsArr.length) {
      headText +=
        "// Author(s): " + authorsArr.join(', ') + "  \n";    
    }

    if (spec.copyright) {
      headText += "//  \n" +
        "// " + spec.copyright + "  \n";        
    }

    headText += '\n';
    
    return headText;
  },

  rmRequires : function (str) {
    var requiresRe = /^.*require\(['"].*['"]\).*$/mgi, 
        newStr;

    newStr = str.replace(requiresRe, function (match) { return ''; });
    return newStr;
  },

  // primitive. be careful using this.
  rmConsole : function (str) {
    var consoleRe1 = /console\.log\(['"\[].*['"\]]\)/mgi,
        consoleRe2 = /console\.log\([^"'].*\)/mgi,
        newStr = str + '';

    newStr = newStr.replace(consoleRe1, 'console.log("")');
    newStr = newStr.replace(consoleRe2, 'console.log("")');
    return newStr;
  },

  preProcess : function (str, opts) {
    var that = this, cmprStr = str + '';
    if (opts.isRemoveRequires) {
      cmprStr = that.rmRequires(cmprStr);
    }
    if (opts.isRemoveConsole) {
      cmprStr = that.rmRequires(cmprStr);
    }
    return cmprStr;
  },

  getCompressed : function (str, opts) {
    var ast;
    try {
      ast = jsp.parse(str);
      ast = pro.ast_mangle(ast);
      ast = pro.ast_squeeze(ast);
      str = pro.gen_code(ast);
    } catch (e) {
      str = null;
    }
    return str;
  }
};