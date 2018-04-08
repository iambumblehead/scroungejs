// Filename: scrounge_adapt.js
// Timestamp: 2018.04.07-19:01:44 (last modified)
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

      scrounge_uid = require('./scrounge_uid');

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

  o.try = (path, fn) => {
    try {
      return fn();
    } catch (e) {
      console.error(e);

      throw new Error(`[!!!] parse error ${path}`);
    }
  };

  o.js = (opts, node, str, fn) => {
    let filepath = node.get('filepath'),
        modname = scrounge_uid.sanitised(node.get('uid')),
        skip = opts.skippatharr
          .some(path => ~filepath.indexOf(path));

    if (skip)
      return fn(null, str);

    str = o.try(filepath, () => (
      babel.transform(str, {
        compact : opts.iscompress && !skip,
        presets : opts.ises2015 ? [
          babelpresetenv
        ] : [],
        plugins : opts.babelpluginarr || []
      })).code);

    if (moduletype.umd(str)) {
      str = umdname(str, modname);
    } else if (moduletype.cjs(str) ||
               moduletype.esm(str)) {
      if (moduletype.cjs(str) && !moduletype.esm(str)) {
        str = umd(modname, str, { commonJS : true });
      }

      // build import and require replacement mappings
      let replace = node.get('outarr').reduce((prev, cur) => {
        let refname = cur.get('refname'),
            depname = scrounge_uid.sanitised(cur.get('uid'));

        opts.aliasarr.map(([ matchname, newname ]) => (
          newname === refname &&
            (prev[matchname] = depname)
        ));

        prev.require[refname] = depname;
        prev.import[refname] = `./${depname}.js`;

        return prev;
      }, {
        require : {},
        import : {}
      });

      str = replacerequires(str, replace.require);
      str = replaceimports(str, replace.import);
    }

    fn(null, str);
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
