var path = require('path');

var FileInfoParser = module.exports = {
  isMint : function (filename) {
    var regex = /^[\w]*_mint.(js|css)$/;
    return (filename && path.basename(filename).match(regex));
  },
  getFilename : function (file) {
    var regex = /Filename: (.*\.(js|css))\b/,
        match = file.match(regex);
    return (match) ? match[1] : null;
  },
  getAuthors : function (file) {
    var regex = /Author(\(s\))?: (.*)[\r\n]/,
        match = file.match(regex);
    return (match && match[2]) ? match[2].split(',') : null;
  },

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

  parseISO8601 : function (dateStringInRange) {
    var isoExp = /^\s*(\d{4})\.(\d\d)\.(\d\d)\s*$/,
        date = new Date(NaN), month,
        parts = isoExp.exec(dateStringInRange);
    if(parts) {
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
  },

  getDependencies : function (file, filename) {
    var requiresRe = /Requires: ([\w]*\.[cj]ss?[,\r\n\b ]|\W)*/,
        match = file.match(requiresRe),
        dependencies = [];
    if (match) {
      return match[0].match(/[\w]*\.[cj]ss?/g);
    }
    return dependencies;
  }
};