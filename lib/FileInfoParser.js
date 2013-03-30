var path = require('path');

var FileInfoParser = module.exports = {

  // does the file have mint suffix? 
  // ex., `Main_mint.js` === true
  isMint : function (filename) {
    var regex = /^[\w]*_mint.(js|css)$/;
    return (typeof filename === 'string' &&
            path.basename(filename).match(regex)) ? true : false;       
  },
  
  // get filename as it is defined in the file,
  // ex., `Filename: Main.js` === "Main.js"
  getFilename : function (file) {
    var regex = /Filename: (.*\.(js|css))\b/,
        match = file.match(regex), fileName = null;

    if (match) {
      fileName = match[1];
      fileName = path.basename(fileName);
    }

    return fileName;
  },

  // get array of authors as they are defined in the file,
  // ex., `Author(s): author1, author2` === ["author1", "author2"]
  getAuthors : function (file) {
    var regex = /Author(\(s\))?: (.*)[\r\n\b]?/,
        match = file.match(regex), authors = null;
    
    if (match && match[2]) {
      authors = match[2].trim().split(/, ?/);
    }

    return authors;
  },

  // get timestamp as defined in file. timestamp is returned as date object
  // the following are valid timestamps:
  // `Timestamp: 2013.02.20-22:41:39 (last modified)  `
  // `Timestamp: 2013.02.20-22:41:39 (last modified)`
  // `Timestamp: 2013.02.20-22:41:39`
  // `Timestamp: 2013.02.20`
  getTimestamp : function (file) {
    var regex = /Timestamp:\s(\d{4}\.\d\d\.\d\d)(-\d\d:\d\d:\d\d)?\b/,
        match = file.match(regex), m, hh, mm, ss, hhmmssMatch;
    
    m = (match) ? this.parseISO8601(match[1]) : null;
    if (m && match[2]) {
      hhmmssMatch = match[2].match(/-(\d\d):(\d\d):(\d\d)/);
      hh = hhmmssMatch[1];
      mm = hhmmssMatch[2];
      ss = hhmmssMatch[3];
      
      m.setHours(hh);
      m.setMinutes(mm);
      m.setSeconds(ss);

      return m;
    }
    return m;
  },

  // get dependencyArr as defined in this file. each dependency is a string.
  // multiple dependencies may be defined. the following are valid dependencies:
  // `Requires: file.js`
  // `Requires: file.js  `
  // `Requires: file.js, file2.js`
  getDependencies : function (file) {
    //var requiresRe = /Requires: ( ?[\w]*\.[cj]ss?([,\r\n\b ]|$))*/,
    var requiresRe = /Requires: ((\/\/)? ?[\w]*\.[cj]ss?[,\r\n\b ]?)*/,
        filenameRe = /[\w]*\.[cj]ss?/g,
        match = file.match(requiresRe),
        dependencyArr = [];

    if (match) {
      match = match[0].match(filenameRe);
      if (match) {
        dependencyArr = match;
      }
    }
    
    return dependencyArr;
  },

  parseISO8601 : function (dateStringInRange) {
    var isoExp = /^\s*(\d{4})\.(\d\d)\.(\d\d)\s*$/,
        date = new Date(NaN), month,
        parts = isoExp.exec(dateStringInRange);

    if (parts) {
      month = +parts[2];
      date.setFullYear(parts[1], month - 1, parts[3]);
      if(month != date.getMonth() + 1) {
        date.setTime(NaN);
      }
    }
    
    return date;
  },

  getFormattedDate : function (date) {
    var year = date.getFullYear(),
        isInRange = year >= 0 && year <= 9999, yyyy, mm, dd, h, m, s;

    if(!isInRange) {
      throw RangeError("formatDate: year must be 0000-9999");
    }

    yyyy = ("000" + year).slice(-4);
    mm = ("0" + (date.getMonth() + 1)).slice(-2);
    dd = ("0" + (date.getDate())).slice(-2);

    h = ("0" + date.getHours()).slice(-2);
    m = ("0" + date.getMinutes()).slice(-2);
    s = ("0" + date.getSeconds()).slice(-2);
    return yyyy + "." + mm + "." + dd + '-' + h + ':' + m + ':' + s;
  },

  getTraceStatements : function (file) {
    var matches = [], matchConsole, matchOpera, matchAlert,
        traceRe = {
          alert : /^(?!(.*\/\/)).*alert\([\s\S]*?\)/gm,
          opera : /^(?!(.*\/\/)).*opera\.postError\([\s\S]*?\)/gm,
          console : /^(?!(.*\/\/)).*console\.log\([\s\S]*?\)/gm
        };

    matchConsole = file.match(traceRe.console);
    matchAlert = file.match(traceRe.alert);
    matchOpera = file.match(traceRe.opera);

    matches = (matchConsole) ? matches.concat(matchConsole) : matches;
    matches = (matchAlert) ? matches.concat(matchAlert) : matches;
    matches = (matchOpera) ? matches.concat(matchOpera) : matches;

    return matches;
  }


};
