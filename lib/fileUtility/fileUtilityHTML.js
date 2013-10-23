var FileUtilityHTML = module.exports = {

  getCompressed : function (text) {
    // should remove comments
    return text;
  },

  preProcess : function (str, opts, fn) {
    return fn(null, str);
  }

};
