// Filename: scrounge_adapt.js  
// Timestamp: 2016.11.21-15:50:07 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var umd = require('umd'),
    path = require('path'),
    less = require('less'),
    babel = require('babel-core'),
    babelpresetes2015 = require('babel-preset-es2015-script'),
    umdname = require('umdname'),
    cleancss = require('clean-css'),
    //uglifyjs = require('uglify-js'),
    bcjstocjs = require('bcjstocjs'),    
    moduletype = require('moduletype'),
    replacerequires = require('replace-requires'),
    
    scrounge_log = require('./scrounge_log');


var scrounge_adapt = module.exports = (function (o) {

  o = function (opts, depmod, str, fn) {
    var filepath = depmod.get('filepath'),
        extname = path.extname(filepath).slice(1);

    opts.embedarr.map(function (embed) {
      if (~filepath.indexOf(embed.filepath)) {
        str = embed.content + str;
      }
    });

    opts.globalarr.map(function (global) {
      // module namespace defined on user-given name 
      if (~filepath.indexOf(global.filepath)) {
        str += '\nif (typeof window === "object") window.:NAME = :UID;'
          .replace(/:NAME/g, global.name)
          .replace(/:UID/g, o.uidsanitised(depmod.get('uid')));
      }
    });

    if (extname && typeof o[extname] === 'function') {
      o[extname](opts, depmod, str, fn);
    } else {
      fn(null, str);
    }
  };

  o.uidsanitised = uid =>
    uid
      .replace(/\.[^\.]*$/, '')     // remove extension from uid
      .replace(/-|\/|\\/gi, '_')        // remove slash and dash
      .replace(/[^a-z0-9_]+/gi, '');

  o.js = (opts, depmod, str, fn) => {
    var filepath = depmod.get('filepath'),
        modname = o.uidsanitised(depmod.get('uid')),
        outarr = depmod.get('outarr'),
        skip = opts.skippatharr.some(path =>
          filepath.indexOf(path) !== -1
        ),
        umdstr;

    //if (opts.ises2015 && !skip) {
    if (!skip) {
      str = babel.transform(str, {
        //compact: false,
        compact: opts.iscompress && !skip,//true,
        presets: opts.ises2015 ? [
          babelpresetes2015
        ] : []
      }).code;
    }

    if (skip) {
      umdstr = str;
    } else if (moduletype.umd(str)) {
      umdstr = umdname(str, modname);
    } else if (moduletype.cjs(str)) {
      umdstr = umd(modname, str, { commonJS : true });
      umdstr = replacerequires(umdstr, depmod.get('outarr').reduce(function (prev, cur) {
        return prev[cur.get('refname')] = o.uidsanitised(cur.get('uid')), prev;
      }, {}));
    } else if (moduletype.amd(str) || moduletype.esm(str)) {
      scrounge_log.unsupportedtype(opts, moduletype.is(str), modname);
      return fn('[!!!] unsupported module');      
    } else {
      umdstr = str;
    }

    if (opts.iscompress && !skip) {
      try {
        fn(null, umdstr);
        //fn(null, uglifyjs.minify(umdstr, { fromString: true }).code);
      } catch (e) {
        console.error('[!!!] parse error ' + filepath);
        
        fn(e);
      }
    } else {
      fn(null, umdstr);
    }
  };
  
  o.css = (opts, depmod, str, fn) => {
    fn(null, opts.iscompress ?
       new cleancss().minify(str).styles : str);
  };

  o.less = (opts, depmod, str, fn) => {
    less.render(str, {
      filename : path.resolve(depmod.get('filepath'))
    }, (err, output) => {
      err ? fn(err) : o.css(opts, depmod, output.css, fn);
    });
  };
  
  return o;
  
}());
