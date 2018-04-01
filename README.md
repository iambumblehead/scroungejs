scroungejs
===========
![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)

An obscure build tool starting as an emacs elisp script in 2009, scroungejs supports ES6 and CommonJS modules and wraps scripts like [depgraph][1], [replace-requires][2], and [detective][5].

Scroungejs was used by [foxsports.com](https://www.glassdoor.com/Reviews/FOX-Sports-Reviews-E14925.htm) and [ties.com](http://ties.com).

[0]: http://www.bumblehead.com                                     "bumblehead"
[1]: https://github.com/iambumblehead/depgraph                       "depgraph"
[2]: https://github.com/bendrucker/replace-requires          "replace-requires"
[3]: https://github.com/mishoo/UglifyJS2                             "uglifyjs2"
[4]: https://github.com/ForbesLindesay/umd                                "umd"
[5]: https://github.com/substack/node-detective                "node-detective"

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png)

A test configuration is found in spec/. Here's a config with some common options. [All options][6] are optional and if you're unsure about an option, you likey don't need it.
```javascript
scroungejs.build({
  version        : require('./package.json').version,
  iscompressed   : true,
  isconcatenated : false,
  inputpath      : './src/',
  outputpath     : './build/',
  
  // read this template html and output to basepage
  basepagein     : './src/index.tpl.html',
  basepage       : './build/index.html',
  
  // join contents of these files to top of this tree's file
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

  // write these trees, the root file of a tree the treename
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


[6]: https://github.com/iambumblehead/scroungejs/blob/master/src/scrounge_opts.js  "scrounge_opts.js"


![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
