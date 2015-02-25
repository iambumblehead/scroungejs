var SimpleTime = require('simpletime'),
    cleanCSS = require('clean-css'),
    less = require('less');
    

var FileUtilityCSS = module.exports = {
  getHeadText : function (spec) {
    var timestamp = SimpleTime.getDateAsISO(spec.timestamp),
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

  preProcess : function (str, opts, fn) {
    if (opts.extnStylesheet === '.less') {
      return less.render(str, function (err, output) {
        if (err) return fn(err);
        fn(err, output.css);
      });
    }
    return fn(null, str);
  },

  getCompressed : function (text) {
    return new cleanCSS().minify(text);
  }
};
