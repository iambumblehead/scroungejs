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

  getCompressed : function (text) {
    var ast = jsp.parse(text || "");
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    return pro.gen_code(ast);
  }
};