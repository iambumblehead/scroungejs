var SimpleTime = require('simpletime'),
    UglifyJS = require('uglify-js');

var FileUtilityJS = module.exports = {

  // constructs a the 'head' of a javascript file
  // ex.
  //  // Filename: Main.js
  //  // Timestamp: 2013.04.01-12:08:54 (last modified)
  //  // Author(s): Bumblehead (www.bumblehead.com), Chihung Yu
  //  // Copyright FOX
  getHeadText : function (spec, opts) {
    var timestamp = SimpleTime.getDateAsISO(spec.timestamp),
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

  // uses simple regex to dangerously remove require statments from javascript
  // be careful with this.
  rmRequires : function (str) {
    var requiresRe = /^.*require\(['"].*['"]\).*$/mgi, 
        newStr;

    newStr = str.replace(requiresRe, function (match) { return ''; });
    return newStr;
  },


  // uses UglifyJS to comprehensively remove console statements
  // from code. 
  rmConsole : function (str) {
    var ast = UglifyJS.parse(str),
        consoleStrNodeArr = [],
        i, node, start_pos, end_pos, replacement;

    function splice_string (str, begin, end, replacement) {
      return str.substr(0, begin) + replacement + str.substr(end);
    }

    ast.walk(new UglifyJS.TreeWalker(function(node){
      if (node instanceof UglifyJS.AST_Call && 
          node.start.value === 'console') {
        consoleStrNodeArr.push(node);
      }
    }));

    // now go through the nodes backwards and replace code
    for (i = consoleStrNodeArr.length; i--;) {
      node = consoleStrNodeArr[i];
      start_pos = node.start.pos;
      end_pos = node.end.endpos;
      replacement = '"0"';
      str = splice_string(str, start_pos, end_pos, replacement);
    }
    return str;
  },

  preProcess : function (str, opts, fn) {
    var that = this, cmprStr = str + '';

    if (opts.isRemoveRequires) {
      cmprStr = that.rmRequires(cmprStr);
    }
    if (opts.isRemoveConsole) {
      cmprStr = that.rmRequires(cmprStr);
    }
    return fn(null, cmprStr);
  },

  getCompressed : function (str, opts) {
    try {
      str = UglifyJS.minify(str, { fromString: true }).code;
    } catch (e) {
      str = null;
    }
    return str;
  }
};
