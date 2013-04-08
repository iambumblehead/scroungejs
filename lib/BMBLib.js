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
  }
};

