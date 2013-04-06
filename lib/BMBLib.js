var BMBLib = module.exports = {

  isArray : function (obj) {
    if (obj) {
      if (!(obj.propertyIsEnumerable('length'))) {
        return (typeof obj === 'object' && typeof obj.length === 'number');
      }
    }
    return false;
  },

  sprintf : function (text){
    var i=1, args=arguments;
    return text.replace(/%s/g, function(pattern){
        return (i < args.length) ? args[i++] : "";
    });
  },

  getElapsedTime : function (bgnDateObj, endDateObj) {
    var ms = endDateObj.getTime() - bgnDateObj.getTime(),
        sec = Math.round(ms/1000),
        min = Math.round(ms/(60 * 1000));
    min = ((min.length > 1) ? '' : '0') + min;
    sec = ((sec.length > 1) ? '' : '0') + sec;
    ms += '';
    ms = (ms.length > 2) ? (ms[0] + ms[1]) : ms;
    return (min + ':' + (sec.length ? '' : '0') + sec + ':' + ms + ' (mm:ss:ms)');
  },

  getFormattedDate : function (date) {
    var year = date.getFullYear(),
        isInRange = year >= 0 && year <= 9999, yyyy, mm, dd;
    if(!isInRange) {
      throw RangeError("formatDate: year must be 0000-9999");
    }
    yyyy = ("000" + year).slice(-4);
    mm = ("0" + (date.getMonth() + 1)).slice(-2);
    dd = ("0" + (date.getDate())).slice(-2);
    return yyyy + "." + mm + "." + dd;
  }
  
};
