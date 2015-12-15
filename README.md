scrounge.js
===========
**(c)[Bumblehead][0], 2012-2016** [MIT-license](#license)
![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)

__NOT FOR PRODUCTION USE -ALPHA QUALITY__

scrounge.js is a narrow use-case build-tool of minimal setup. It is a decision-making wrapper around tools like [depgraph][1], [replace-requires][2], [uglifyjs2][3], [umd][4] and [detective][5]. features include:

 * **supports CommonJS** and NPM/Bower module resolution and _**does not support**_ **AMD, ES6 or other module formats**
 * compression and concatenation are enabled or disabled for each build (useful during development)
 * does not require unusual tags or attributes added to markup files
 * handles ".css" and ".less" stylesheets

Clone and try out the test with `npm start`.

[0]: http://www.bumblehead.com                                     "bumblehead"
[1]: https://github.com/iambumblehead/depgraph                       "depgraph"
[2]: https://github.com/bendrucker/replace-requires          "replace-requires"
[3]: http://github.com/mishoo/UglifyJS2                             "uglifyjs2"
[4]: https://github.com/ForbesLindesay/umd                                "umd"
[5]: https://github.com/substack/node-detective                "node-detective"

---------------------------------------------------------
#### <a id="get-started"></a>get started

A sample scrounge.js configuration found in test/,

```javascript
scroungejs.build({
  inputpath      : './test/testbuild1/testbuildSrc',
  outputpath     : './test/testbuild1/testbuildFin',
  publicpath     : './testbuildFin',
  basepage       : './test/testbuild1/index.html',
  iscompressed   : true,
  isconcatenated : false,
  roots          : 'app.js'
}, function (err, res) {
  if (err) return console.log(err);
  console.log('finished!');
});
```

It console prints this when it runs,

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

It then creates or updates index.html to look like this,

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

That's the basic functionality with details explained below. Pull Requests are liberally accepted.

---------------------------------------------------------
#### <a id="modifiers"></a>modifiers

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png)

 - **inputpath= _path_**, _default: ./_
   
   a systempath to a directory

 - **outputpath= _path_**, _default: ./www\__
 
   a systempath to a directory or file
   
 - **publicpath= _path_**, _default: null_
   
   a path to files created by scrounge.js used with basepage 

   `./getStarted/app/cmpr/app.js`, with publicpath `/cmpr/`

   ```html
   <script src="/cmpr/app.js" type="text/javascript"></script>';
   ```

 - **isunique= _bool_**, _default: false_

   add a unique argument to reference paths in include elements
   
   ```html
   <script src="Main.js?u=1370491167925" type="text/javascript"></script>';
   <link href="Main.css?u=1370491167926" rel="stylesheet" type="text/css">
   ```

 - **iscompressed= _bool_**, _default: false_

   compress scripts and styles before writing them.

 - **isconcatenated= _bool_**, _default: false_

   concatenate scripts and stylesheets files before writing them.

 - **issilent= _bool_**, _default: false_

   supress console messages.

 - **isbrowser= _bool_**, _default: true_

   locate files defined to the "browser" property defined in package.json and bower.json files.
   
 - **basepage= _basepage_**, _default: null_
   
   update scrounge tags in the defined basepage. basepage is not modified if it does not contain scrounge tags.


---------------------------------------------------------
#### <a id="license"></a>license

 ![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) 2012-2016 [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
