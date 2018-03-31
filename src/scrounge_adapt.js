// Filename: scrounge_adapt.js
// Timestamp: 2018.03.31-14:42:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const umd = require('umd'),
      path = require('path'),
      less = require('less'),
      babel = require('babel-core'),
      babelpresetenv = require('babel-preset-env'),
      umdname = require('umdname'),
      Cleancss = require('clean-css'),
      moduletype = require('moduletype'),
      typescript = require('typescript'),
      replacerequires = require('replace-requires'),
      replaceimports = require('replace-imports'),

      scrounge_node = require('./scrounge_node'),
      scrounge_uid = require('./scrounge_uid'),
      scrounge_log = require('./scrounge_log');

module.exports = (o => {
  o = (opts, node, fn) => {
    let filepath = node.get('filepath'),
        extname = path.extname(filepath).slice(1),
        str = node.get('content');

    opts.embedarr.map(embed => {
      if (~filepath.indexOf(embed.filepath)) {
        str = embed.content + str;
      }
    });

    opts.globalarr.map(global => {
      // module namespace defined on user-given name
      if (~filepath.indexOf(global.filepath)) {
        str += '\nif (typeof window === "object") window.:NAME = :UID;'
          .replace(/:NAME/g, global.name)
          .replace(/:UID/g, scrounge_uid.sanitised(node.get('uid')));
      }
    });

    if (extname && typeof o[extname] === 'function') {
      o[extname](opts, node, str, fn);
    } else {
      fn(null, str);
    }
  };

  o.js = (opts, node, str, fn) => {
    let filepath = node.get('filepath'),
        modname = scrounge_uid.sanitised(node.get('uid')),
        skip = opts.skippatharr.some(path =>
          filepath.indexOf(path) !== -1
        ),
        umdstr;

    if (!skip) {
      // str = uglifyjs.minify(str, { fromString: true }).code;
      str = babel.transform(str, {
        compact : opts.iscompress && !skip,
        presets : opts.ises2015 ? [
          babelpresetenv
        ] : [],
        plugins : opts.babelpluginarr || []
      }).code;
    }

    if (skip) {
      umdstr = str;
    } else if (moduletype.umd(str)) {
      umdstr = umdname(str, modname);
    } else if (moduletype.cjs(str) || moduletype.esm(str)) {
      if (moduletype.cjs(str) && !moduletype.esm(str)) {
        umdstr = umd(modname, str, { commonJS : true });
      } else {
        umdstr = str;
      }

      let replacements = scrounge_node.buildimportreplacements(opts, node);
      umdstr = replacerequires(umdstr, replacements);

      if (moduletype.esm(str)) {
        replacements = Object.keys(replacements).reduce((prev, key) => {
          prev[key] = `./${replacements[key]}.js`;

          return prev;
        }, {});
        // https://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/
        umdstr = replaceimports(umdstr, replacements);
      }
    } else if (moduletype.amd(str)) {
      scrounge_log.unsupportedtype(opts, moduletype.is(str), modname);
      return fn('[!!!] unsupported module');
    } else {
      umdstr = str;
    }

    if (opts.iscompress && !skip) {
      try {
        fn(null, umdstr);
        // fn(null, uglifyjs.minify(umdstr, { fromString: true }).code);
      } catch (e) {
        console.error(`[!!!] parse error ${filepath}`);

        fn(e);
      }
    } else {
      fn(null, umdstr);
    }
  };

  // perform o.js on mjs files
  o.mjs = o.js;

  o.ts = (opts, node, str, fn) => {
    let tsconfig = opts.tsconfig || {},
        jsstr = typescript.transpileModule(str, tsconfig).outputText;

    o.js(opts, node, jsstr, fn);
  };

  // perform o.ts on tsx files
  o.tsx = o.ts;

  o.css = (opts, node, str, fn) => {
    fn(null, opts.iscompress ?
      new Cleancss().minify(str).styles : str);
  };

  o.less = (opts, node, str, fn) => {
    less.render(str, {
      filename : path.resolve(node.get('filepath'))
    }, (err, output) => {
      if (err) console.error(err);

      return err ? fn(err) : o.css(opts, node, output.css, fn);
    });
  };

  return o;
})({});
