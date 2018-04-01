scroungejs
===========
**(c)[Bumblehead][0]** [MIT-license](#license)
![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)

Scroungejs is an old and obscure build tool. It started as an emacs elisp script in 2009. It supports ES6 and CommonJS modules and is mostly a wrapper around tools like [depgraph][1], [replace-requires][2], and [detective][5].

Scroungejs was used by foxsports.com and ties.com. It currently supports ES6 and CommonJS modules.

[0]: http://www.bumblehead.com                                     "bumblehead"
[1]: https://github.com/iambumblehead/depgraph                       "depgraph"
[2]: https://github.com/bendrucker/replace-requires          "replace-requires"
[3]: https://github.com/mishoo/UglifyJS2                             "uglifyjs2"
[4]: https://github.com/ForbesLindesay/umd                                "umd"
[5]: https://github.com/substack/node-detective                "node-detective"

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png)

A sample scroungejs configuration is found in spec/. But here's one with several common configuration options. Configuration properties are optional and if you're unsure about an option, you probably don't need it.

All options with some descriptions are found in [scrounge_opts.js][6].

```javascript
scroungejs.build({
  version        : require('./package.json').version,
  iscompressed   : true,
  isconcatenated : false,
  inputpath      : './src/',
  outputpath     : './build/',
  basepagein     : './src/index.tpl.html',
  basepage       : './build/index.html',
  prependarr : [{
    treename : 'myapprootfile.js',
    sourcearr : [
      './node_modules/three/build/three.js',
      './node_modules/hls.js/dist/hls.min.js'
    ]
  }],

  skipdeparr : [
    '/hls.js'
  ],

  treearr : [
    'myapprootfile.js',
    'myapprootfile.css'
  ]
}, function (err, res) {
  if (err) return console.log(err);
  console.log('finished!');
});
```


The example in spec console prints something like this when it runs,
```bash
[...] start: Mon Dec 07 2015 22:09:36 GMT-0800 (PST)
[...] root: app.js

scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/app.js
└─┬ scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/views/viewsall.js
. ├─┬ scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/views/viewa.js
. │ └─┬ scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/controls/ctrlsall.js
. │   ├─┬ scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/controls/ctrla.js
. │   │ └── scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/models/modela.js
. │   └─┬ scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/controls/ctrlb.js
. │     └── scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/models/modelb.js
. └── scroungejs-0.8.0:~/test/testbuild1/testbuildSrc/views/viewb.js

[...] ugly: (app.js, .css, 1/1) ./test/testbuild1/testbuildSrc/views/viewa.css
[...] write: ./test/testbuild1/testbuildFin/app.css
[...] ugly: (app.js, .js, 1/9) ./test/testbuild1/testbuildSrc/views/viewb.js
[...] ugly: (app.js, .js, 2/9) ./test/testbuild1/testbuildSrc/models/modelb.js
[...] ugly: (app.js, .js, 3/9) ./test/testbuild1/testbuildSrc/controls/ctrlb.js
[...] ugly: (app.js, .js, 4/9) ./test/testbuild1/testbuildSrc/models/modela.js
[...] ugly: (app.js, .js, 5/9) ./test/testbuild1/testbuildSrc/controls/ctrla.js
[...] ugly: (app.js, .js, 6/9) ./test/testbuild1/testbuildSrc/controls/ctrlsall.js
[...] ugly: (app.js, .js, 7/9) ./test/testbuild1/testbuildSrc/views/viewa.js
[...] ugly: (app.js, .js, 8/9) ./test/testbuild1/testbuildSrc/views/viewsall.js
[...] ugly: (app.js, .js, 9/9) ./test/testbuild1/testbuildSrc/app.js
[...] write: ./test/testbuild1/testbuildFin/app.js
[...] write: ./test/testbuild1/index.html
[...] finish: 00:00:288 (mm:ss:ms)
```

It reads index.tpl.html,

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- <scrounge trees="app.css"> -->
    <!-- </scrounge> -->
    <!-- <scrounge trees="app.js"> -->
    <!-- </scrounge> -->
  </head>
  <body>
    <script type="text/javascript">
      app.start();
    </script>
  </body>
</html>
```

It creates and updates a resulting index.html to look like this,
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- <scrounge trees="app.css"> -->
    <link href="./testbuildFin/app.css" rel="stylesheet" type="text/css">
    <!-- </scrounge> -->
    <!-- <scrounge trees="app.js"> -->
    <script src="./testbuildFin/app.js" type="text/javascript"></script>
    <!-- </scrounge> -->
  </head>
  <body>
    <script type="text/javascript">
      app.start();
    </script>
  </body>
</html>
```

That's the basic functionality.


[6]: https://github.com/iambumblehead/scroungejs/blob/master/src/scrounge_opts.js  "scrounge_opts.js"


![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
