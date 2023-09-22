# scroungejs

> [!WARNING]  
> This application is not suitable for production, if you plan on using it, you are on you own.

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)

[![npm version](https://badge.fury.io/js/scroungejs.svg)](https://badge.fury.io/js/scroungejs) [![Build Status](https://github.com/iambumblehead/scroungejs/workflows/test/badge.svg)][6]

An obscure build tool starting as an emacs elisp script in 2009. Scroungejs was used by [foxsports.com](https://espn.com) and [ties.com](http://ties.com).

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png)

A test configuration is found in spec/. Below is a config with common options. [All options][7] are optional and if you're unsure about an option, you likely don't need it.
```javascript
scroungejs({
  version : process.env.npm_package_version,
  inputpath : './src/',
  outputpath : './build/',
  iscompress : true,
  isconcat : false,
  
  // read this template html and output to basepage
  basepagein : './src/index.tpl.html',
  basepage : './build/index.html',
  
  // join contents of these files to top of this tree's file
  prependarr : [{
    treename : 'app.js',
    sourcearr : [
      './node_modules/three/build/three.js',
      './node_modules/hls.js/dist/hls.min.js'
    ]
  }],

  skipdeparr : [
    '/hls.js'
  ],

  // write these trees, the root file of a tree the treename
  treearr : [
    'app.js',
    'app.css'
  ]
}, (err, res) => {
  console.log(err || 'finished');
});
```


The example in test/ console-prints something like this when it runs,
```bash
[...] start: Tue Apr 03 2018 23:12:23 GMT-0700 (PDT)
[...] root: app.js

scroungejs-1.3.6:~/test/src/app.js
└─┬ scroungejs-1.3.6:~/test/src/views/viewsall.js
. ├─┬ scroungejs-1.3.6:~/test/src/views/viewb.mjs
. │ └─┬ scroungejs-1.3.6:~/test/src/controls/ctrlsall.js
. │   ├─┬ scroungejs-1.3.6:~/test/src/controls/ctrla.js
. │   │ └── scroungejs-1.3.6:~/test/src/models/modela.js
. │   └─┬ scroungejs-1.3.6:~/test/src/controls/ctrlb.js
. │     └── scroungejs-1.3.6:~/test/src/models/modelb.js
. └── scroungejs-1.3.6:~/test/src/views/viewa

[...] ugly: (app.js, .css, 1/2) ./src/views/viewa.less
[...] ugly: (app.js, .css, 2/2) ./src/views/viewb.less
[...] write: ./out/app.css ~25.93kb
[...] ugly: (app.js, .js, 1/9) ./src/models/modela.js
[...] ugly: (app.js, .js, 2/9) ./src/controls/ctrla.js
[...] ugly: (app.js, .js, 3/9) ./src/models/modelb.js
[...] ugly: (app.js, .js, 4/9) ./src/controls/ctrlb.js
[...] ugly: (app.js, .js, 5/9) ./src/controls/ctrlsall.js
[...] ugly: (app.js, .js, 6/9) ./src/views/viewb.mjs
[...] ugly: (app.js, .js, 7/9) ./src/views/viewa.js
[...] ugly: (app.js, .js, 8/9) ./src/views/viewsall.js
[...] ugly: (app.js, .js, 9/9) ./src/app.js
[...] write: ./out/app.js ~2016.23kb
[...] write: ./out/app.js.map
[...] write: ./index.html
[...] finish: 00:00:167 (mm:ss:ms)
```

It reads index.tpl.html,
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- <scrounge root="app.css"> -->
    <!-- </scrounge> -->
    <!-- <scrounge root="app.js"> -->
    <!-- </scrounge> -->
  </head>
  <body></body>
</html>
```

It creates and updates a resulting index.html,
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- <scrounge root="app.css"> -->
    <link href="./out/app.css" rel="stylesheet" type="text/css">
    <!-- </scrounge> -->
    <!-- <scrounge root="app.js"> -->
    <script src="./out/app.js" type="text/javascript"></script>
    <!-- </scrounge> -->
  </head>
  <body></body>
</html>
```

If you update a file and concatenate is false, you'll see this,
```bash
[...] update: scroungejs-1.3.6:~/test/src/lib/library.js
[...] write: ./index.html
```


[0]: http://www.bumblehead.com                                     "bumblehead"
[1]: https://github.com/iambumblehead/depgraph                       "depgraph"
[3]: https://github.com/mishoo/UglifyJS2                             "uglifyjs2"
[4]: https://github.com/ForbesLindesay/umd                                "umd"
[6]: https://github.com/iambumblehead/scroungejs                   "scroungejs"
[7]: https://github.com/iambumblehead/scroungejs/blob/master/src/scrounge_opts.js  "scrounge_opts.js"


![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 
