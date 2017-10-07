// Filename: scrounge_adapt.js  
// Timestamp: 2017.10.07-01:46:00 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const umd = require('umd'),
      path = require('path'),
      less = require('less'),
      babel = require('babel-core'),
      babelpresetenv = require('babel-preset-env'),
      umdname = require('umdname'),
      cleancss = require('clean-css'),
      bcjstocjs = require('bcjstocjs'),    
      moduletype = require('moduletype'),
      typescript = require('typescript'),
      replacerequires = require('replace-requires'),
      
      scrounge_log = require('./scrounge_log');

module.exports = (o => {

  o = (opts, depmod, str, fn) => {
    var filepath = depmod.get('filepath'),
        extname = path.extname(filepath).slice(1);

    opts.embedarr.map((embed) => {
      if (~filepath.indexOf(embed.filepath)) {
        str = embed.content + str;
      }
    });

    opts.globalarr.map((global) => {
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

    if (!skip) {
      //str = uglifyjs.minify(str, { fromString: true }).code;
      str = babel.transform(str, {
        compact: opts.iscompress && !skip,
        presets: opts.ises2015 ? [
          babelpresetenv
        ] : [],
        plugins: opts.babelpluginarr || []
      }).code;
    }

    if (skip) {
      umdstr = str;
    } else if (moduletype.umd(str)) {
      umdstr = umdname(str, modname);
    } else if (moduletype.cjs(str)) {
      umdstr = umd(modname, str, { commonJS : true });
      umdstr = replacerequires(umdstr, depmod.get('outarr').reduce((prev, cur) => {
        let refname = cur.get('refname'),
            depname = o.uidsanitised(cur.get('uid'));

        opts.aliasarr.map(([matchname, newname]) => (
          newname === refname &&
            (prev[matchname] = depname)
        ));

        prev[refname] = depname;

        return prev;
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

  o.tsx = o.ts = (opts, depmod, str, fn) => {
    let tsconfig = opts.tsconfig || {},
        jsstr = typescript.transpileModule(str, tsconfig).outputText;

    o.js(opts, depmod, jsstr, fn);
  };    
  
  o.css = (opts, depmod, str, fn) => {
    fn(null, opts.iscompress ?
       new cleancss().minify(str).styles : str);
  };

  o.less = (opts, depmod, str, fn) => {
    less.render(str, {
      filename : path.resolve(depmod.get('filepath'))
    }, (err, output) => {
      if (err) console.error(err);
      
      err ? fn(err) : o.css(opts, depmod, output.css, fn);
    });
  };
  
  return o;
  
})({});
