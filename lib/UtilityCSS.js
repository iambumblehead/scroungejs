var BMBLib = require('./BMBLib.js'),
    cleanCSS = require('clean-css');

var UtilityCSS = module.exports = {
  getHeadText : function (spec) {
    var timestamp = BMBLib.getFormattedDate(spec.timestamp),
        authorsArr = spec.authorsArr || [],
        headText = '';

    headText += '/*  \n' +
      " * Filename: " + spec.filename + "  \n" +
      " * Timestamp: " + spec.filename + " (last modified)  \n";

    if (authorsArr.length) {
      headText +=
      " * Author(s): " + authorsArr.join(', ') + "  \n";    
    }      

    if (spec.copyright) {
      headText += "*  \n" +
        "* " + spec.copyright + "  \n";        
    }
    
    headText += '*/  \n';
    
    return headText;
  },

  getCompressed : function (text) {
    return cleanCSS.process(text || "");
  }
};