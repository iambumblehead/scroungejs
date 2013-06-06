scroungejs
==========
**(c)[Bumblehead][0], 2012,2013** [MIT-license](#license)  
![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)

### OVERVIEW:

Scroungejs is a javascript program that processes .js and .css files. With it you may compress, concatenate and/or timestamp your files as part of a build process for your web site. It is made to be as flexible as possible and its features are selectively enabled as needed. Scroungejs concatenates files in an ordered way -each file appears after the files that it depends on.  

Scroungejs provides advantages over other deployment tools:  

 - usable as a command line tool -no config file or framework.  
 - callable from a javascript file using node.js.   
 - it does not interfere with the node.js requirejs module system.  
 - compression and concatenation are enabled/disabled for each build.  
 - html files do not need unusual tags or attributes added to them.  
 - it works with almost any collection of javascript files.
 - by default, it does not add javascript to files it generates.  
 - it is packaged with an emacs config file.
 
Scroungejs relies on other packages, notably: [css-clean][1] and [UglifyJS2][2].

Read about [how it works](#how-it-works) to learn more, or [get started](#get-started) with scroungejs.

[0]: http://www.bumblehead.com                            "bumblehead"
[1]: http://github.com/GoalSmashers/clean-css              "css-clean"
[2]: http://github.com/mishoo/UglifyJS2                    "js-uglify"

---------------------------------------------------------
#### <a id="how-it-works"></a>HOW IT WORKS:

Scroungejs reads files from a 'source' directory and it writes files to an 'output' directory. The output directory will have the minified and concatenated result of your web application files (.js and .css files).

Scroungejs handles burdensome tasks related to web application development and deployment. It will optionally perform these tasks:

 * Update an html-formatted file to include references to web application files. 

 * Concatenate files. When an html file is updated, it will be updated with references to the resulting concatenated or unconcatenated files.

 * Timestamp files. Scroungejs will write files that have a timestamp in the filename. When an html file is updated, it will be updated with references to the resulting timestamped filenames. _Timestamped filenames ease development and deployment -no need to clear the browser cache to use the most recent file. An updated timestamp yields a unique filename and so a cached version of the file will not be used by a web browser._

 * Produce output for one or more specific web applications when a directory contains files that are used by multiple web applications.

 * Find console.log statements among the source files of your web application. It may also be used to remove console.log from the files that it generates.

 * Remove `requires` statements from files that it generates. This is useful for application files that are shared by a node.js environment and a browser environment. A node.js environment should access files found in the 'source' directory and a web browser should access files found in the 'output' directory.


---------------------------------------------------------
#### <a id="install"></a>INSTALL:

Scroungejs may be downloaded directly or installed through `npm`.

 * **npm**   

 ```bash
 $ npm install scroungejs
 ```

 * **Direct Download**
 
 ```bash  
 $ git clone https://github.com/iambumblehead/scroungejs.git
 $ cd scroungejs && npm install
 ```

---------------------------------------------------------

#### <a id="get-started">GET STARTED:

 1. **Before Starting...**   

 'Examples demonstrate usage from a shell but scroungejs is also usable from a javascript file. Each environment uses the same modifiers. Only the syntax is different. 'Both examples would produce the same output.
 
 > *shell*

 > ```bash
   $ node ./scrounge.js \  
     --inputPath=./getStarted \
     --isTimestamped=true \
     --isCompressed=true
   ```

 > *javascript file*

 > ```javascript
   var scroungejs = require('scroungejs');
   scroungejs.build({  
     inputPath : './getStarted',
     isTimestamped : true,  
     isComressed : true
   }, function (err, res) {
     if (err) return console.log(err);
     console.log('finished!')
   });
   ```
   
 2. **Visit the scroungejs directory.**  
 
 ```bash
 $ cd /path/to/scroungejs
 ```

 3. **Call scroungejs with node.**  

 ```bash
 $ node ./scrounge.js
 [...] read: files (2/2)
 [...] write: cmpr/scrounge.js
 [...] write: cmpr/index.js
 [...] finish: 00:00:23 (mm:ss:ms)
 ```

 4. **Specify an input path.**  
 
 _The directory named 'getStarted' and its contents are provided with the [Scrounge][3] package._ 

 ```bash
 $ node ./scrounge.js -i ./getStarted
 [...] read: files (2/2) 
 [...] write: getStarted/cmpr/fileB.js
 [...] write: getStarted/cmpr/fileA.js
 [...] finish: 00:00:25 (mm:ss:ms)
 ```
 
 5. **Use compression and timestamping modifiers.**  
 
 ```bash
 $ node ./scrounge.js -i ./getStarted \
    --isTimestamped=true --isCompressed=true
 [...] read: files (2/2) 
 [...] ugly: (fileA.js, .js, 1/2) getStarted/fileB.js
 [...] write: getStarted/cmpr/fileB_2012.07.07-15:25:57.js
 [...] ugly: (fileB.js, .js, 2/2) getStarted/fileA.js
 [...] write: getStarted/cmpr/fileA_2012.07.07-15:25:46.js
 [...] finish: 00:00:25 (mm:ss:ms)
 ```

 6. **Define a dependency in _fileB.js_.**  
 
 scroungejs will concatenate dependency-related files. Dependencies are defined in .js and .css files using the 'Requires' property.  
 
 Open `fileB.js` and add the following line to the top: `// Requires: fileA.js`.

 _File properties are explained in section [File Properties](#file-properties)._

 > *./getStarted/fileB.js:*

 > ```javascript
 > // Requires: fileA.js
 > ```
   
 7. **Concatenate files**  
 
 Dependency-related files are recognized as a _tree_. A tree is composed of one file that depends on other files 'and so on. Here _fileB.js_ is a _source_ file that begins a dependency tree. 

 When tree information is collected a visual representation of each tree is printed.

 `isConcatenated` may be defined as true or false or it may be defined with comma separated names of trees or extension types, such as '.js'. Only matching files will be concatenated.


 ```bash
 $ node ./scrounge.js -i ./getStarted --isConcatenated=true
 [...] read: files (2/2)  
  
 fileB.js  
 └── fileA.js  
  
 [...] join: (fileA.js, .js, 1/2) getStarted/fileA.js
 [...] join: (fileB.js, .js, 2/2) getStarted/fileB.js
 [...] write: getStarted/cmpr/fileB.js
 [...] finish: 00:00:27 (mm:ss:ms)
 ```

 8. **Specify an Output Directory**
 
 If a specified output directory does not exist it is created.

 ```bash
 $ node ./scrounge.js -i ./getStarted --isConcatenated=true \
  --outputPath=./app/public/cmpr
 [...] read: files (2/2)  
  
 fileB.js  
 └── fileA.js  
  
 [...] join: (fileA.js, .js, 1/2) getStarted/fileA.js
 [...] join: (fileB.js, .js, 2/2) getStarted/fileB.js
 [...] write: app/public/cmpr/fileB.js
 [...] finish: 00:00:27 (mm:ss:ms)
 ```
 
 9. **Build a larger tree found in _./getStarted/app/_.**  
 
 Multiple trees may be discovered and concatenated and .css files that associate with a tree will be discovered as well.

 ```bash
 $ node ./scrounge.js -i ./getStarted/app --isConcatenated=true \
   --outputPath=./app/public/cmpr --isRecursive=true --trees=app.js
 [...] read: files (12/12)  
  
 app.js
 └─┬ ViewsAll.js
 . ├─┬ ViewB.js
 . │ └─┬ CtrlsAll.js
 . │   ├─┬ CtrlB.js
 . │   │ └── ModelB.js
 . │   └─┬ CtrlA.js
 . │     └── ModelA.js
 . └── ViewA.js  
  
 [...] join: (app.js, .css, 1/1) getStarted/app/views/ViewA.css
 [...] write: app/public/cmpr/app.css
 [...] join: (app.js, .js, 1/9) getStarted/app/models/ModelB.js
 [...] join: (app.js, .js, 2/9) getStarted/app/controls/CtrlB.js
 [...] join: (app.js, .js, 3/9) getStarted/app/models/ModelA.js
 [...] join: (app.js, .js, 4/9) getStarted/app/controls/CtrlA.js
 [...] join: (app.js, .js, 5/9) getStarted/app/controls/CtrlsAll.js
 [...] join: (app.js, .js, 6/9) getStarted/app/views/ViewB.js
 [...] join: (app.js, .js, 7/9) getStarted/app/views/ViewA.js
 [...] join: (app.js, .js, 8/9) getStarted/app/views/ViewsAll.js
 [...] join: (app.js, .js, 9/9) getStarted/app/app.js
 [...] write: app/public/cmpr/app.js
 [...] finish: 00:00:17 (mm:ss:ms)
 ```

 10. **Define filters for the build process.**  

 When `--extensionType=js` is given, files without a `js` extension are ignored by the build process.  

 _Other modifiers are explained in section [Modifiers](#modifiers)._

 ```bash
 $ node ./scrounge.js -i ./getStarted/app --isConcatenated=true \
   --outputPath=./app/public/cmpr --isRecursive=true --tress=app.js \
   --extensionType=.js
 [...] read: files (12/12)  
  
 app.js
 └─┬ ViewsAll.js
 . ├─┬ ViewB.js
 . │ └─┬ CtrlsAll.js
 . │   ├─┬ CtrlB.js
 . │   │ └── ModelB.js
 . │   └─┬ CtrlA.js
 . │     └── ModelA.js
 . └── ViewA.js  
  
 [...] join: (app.js, .css, 1/1) getStarted/app/views/ViewA.css
 [...] write: app/public/cmpr/app.css
 [...] join: (app.js, .js, 1/9) getStarted/app/models/ModelB.js
 [...] join: (app.js, .js, 2/9) getStarted/app/controls/CtrlB.js
 [...] join: (app.js, .js, 3/9) getStarted/app/models/ModelA.js
 [...] join: (app.js, .js, 4/9) getStarted/app/controls/CtrlA.js
 [...] join: (app.js, .js, 5/9) getStarted/app/controls/CtrlsAll.js
 [...] join: (app.js, .js, 6/9) getStarted/app/views/ViewB.js
 [...] join: (app.js, .js, 7/9) getStarted/app/views/ViewA.js
 [...] join: (app.js, .js, 8/9) getStarted/app/views/ViewsAll.js
 [...] join: (app.js, .js, 9/9) getStarted/app/app.js
 [...] write: app/public/cmpr/app.js
 [...] finish: 00:00:12 (mm:ss:ms)
 ```
 11. **Controlling the tree display.**  
 
 To make scroungejs display the tree and stop, use the modifier `stop=tree`
 
 By default, each dependency is only displayed once. This makes the tree smaller when, for example, a library is required by many files. To view the entire tree, use the modifier `treeView=full`

 ```bash
 $ node ./scrounge.js -i ./getStarted/app --isConcatenated=true \
   --isRecursive=true --stop=tree --treeView=full
 [...] read: files (12/12)  
  
 app.js
 └─┬ ViewsAll.js
 . ├─┬ ViewB.js
 . │ └─┬ CtrlsAll.js
 . │   ├─┬ CtrlB.js
 . │   │ └── ModelB.js
 . │   └─┬ CtrlA.js
 . │     └── ModelA.js
 . └─┬ ViewA.js
 .   └── CtrlsAll.js  
  
 ```
 
 12. **Update _index.mustache_ using scroungejs.**  

 The index file contains a _scrounge_ element.
 
  > *./getStarted/index.mustache* 

  > ```html
  > <!doctype html>
  > <html>
  >   <head>
  >     <script src="/scr/libFile.js" type="text/javascript"></script>
  >   </head>
  >   <body>  
  >     <!-- <scrounge type=".js"> -->
  >     <!-- </scrounge> -->
  >   </body>
  > </html>
  > ```
     
 13. **modify the _basepage_ `index.mustache` with scroungejs**  
 
 Call scroungejs without concatenation on the _basepage_.
 
 _using -s makes the output 'silent'_

 ```bash
 $ node ./scrounge.js -s -i ./getStarted/app \
 --basepage=./getStarted/index.mustache --isRecursive=true \
 --outputPath=./app/public/cmpr
 ```
 
 *./getStarted/index.mustache* 

 ```html
 <!doctype html>
 <html>
   <head>
     <script src="/app/lib/library.js" type="text/javascript"></script>
   </head>
   <body>
     <!-- <scrounge type=".js"> -->
     <script src="/app/public/cmpr/library.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/app2.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/ModelB.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/CtrlB.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/ModelA.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/CtrlA.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/CtrlsAll.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/ViewB.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/ViewA.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/ViewsAll.js" type="text/javascript"></script>
     <script src="/app/public/cmpr/app.js" type="text/javascript"></script>     
     <!-- </scrounge> -->
   </body>
 </html>
 ```
     
 13. **modify the basepage _index.mustache_ and use concatenation.**  
 
 Call scroungejs with concatenation on this _basepage_. scroungejs correctly modifies the basepage for concatenated files.

 ```bash
 $ node ./scrounge.js -s -i ./getStarted/app --isConcatenated=true \
 --basepage=./getStarted/index.mustache --isRecursive=true \
 --outputPath=./app/public/cmpr
 ```
 
 *./getStarted/index.mustache* 
     
 ```html   
 <!doctype html>  
 <html>  
   <head>  
     <script src="/app/lib/library.js" type="text/javascript"></script>  
   </head>  
   <body>  
     <!-- <scrounge type=".js"> -->  
     <script src="/app/public/cmpr/library.js" type="text/javascript"></script>  
     <script src="/app/public/cmpr/app2.js" type="text/javascript"></script>  
     <script src="/app/public/cmpr/app.js" type="text/javascript"></script>  
     <!-- </scrounge> -->  
   </body>  
 </html>  
 ```

 14. **define a public path and update _index.mustache_.**  

 This index page may reference a root web directory served from `app/public`. In this case, files copied to `/app/public/cmpr/` should be accessed through the path `/cmpr`. 
 
 Scroungejs will modify a basepage to reference scripts from a _publicPath_.

 ```bash
 $ node ./scrounge.js -s -i ./getStarted/app --isConcatenated=true \
   --basepage=./getStarted/index.mustache --isRecursive=true \
   --outputPath=./app/public/cmpr --publicPath=/cmpr
 ```

 > *./getStarted/index.mustache*  

 ```html
 <!doctype html>  
 <html>  
   <head>  
     <script src="/app/lib/library.js" type="text/javascript"></script>
   </head>  
   <body>  
     <!-- <scrounge type=".js"> -->  
     <script src="/cmpr/library.js" type="text/javascript"></script>
     <script src="/cmpr/app.js" type="text/javascript"></script>  
     <script src="/cmpr/app2.js" type="text/javascript"></script>  
     <!-- </scrounge> -->  
   </body>  
 </html>
 ```

 15. **define tree attributes.**  
 
 If a tree attribute is defined in a scrounge element, only the file or files that result from the named tree are added to the scrounge element.  
 
 Trees may be defined in a scrounge element attribute or by using the `--trees` modifier. When trees are defined, scrounge will output the defined trees only.

 > *./getStarted/index.mustache* 

 ```html
 <!doctype html>  
 <html>  
   <head>  
     <script src="/app/lib/library.js" type="text/javascript"></script>  
     <!-- <scrounge type=".css" trees="app.js"> -->     
     <!-- </scrounge> -->  
   </head>  
   <body>  
     <!-- <scrounge type=".js" trees="app.js"> -->  
     <!-- </scrounge> -->  
   </body>  
 </html>  
 ```

 ```bash
 $ node ./scrounge.js -s -i ./getStarted/app
   --basepage=./getStarted/index.mustache --isRecursive=true --publicPath=/cmpr
 ```

 > *./getStarted/index.mustache* 
 
 ```html
 <!doctype html>  
 <html>  
   <head>  
     <script src="/app/lib/library.js" type="text/javascript"></script>  
     <!-- <scrounge type=".css" trees="app.js"> -->
     <script src="/cmpr/app.css" type="text/javascript"></script>  
     <!-- </scrounge> -->     
   </head>  
   <body>  
     <!-- <scrounge type=".js" trees="app.js"> -->  
     <script src="/cmpr/app.js" type="text/javascript"></script>  
     <!-- </scrounge> -->  
   </body>  
 </html>  
 ```

 16. ## You are now ready to use scroungejs.

 ![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png) 

[3]: http://github.com/bumblehead/scrounge.js            "scrounge.js"

---------------------------------------------------------

#### <a id="file-properties">FILE PROPERTIES:

Each file processed by scroungejs may affect the build process.
This is done through information added to each file.

 > *./getStarted/app/views/ViewA.js*

 > ```javascript
   // Filename: ViewA.js
   // Timestamp: 2011.06.03-22:10:20
   // Author(s): Bumblehead (www.bumblehead.com)
   // Requires: CtrlsAll.js, ModelA.js
   ```

 > *./getStarted/app/views/ViewA.css*

 > ```css
   /* Filename: Main.css
    * Timestamp: 2011.06.03-22:10:20
    * Author(s): Bumblehead (www.bumblehead.com)
    */
   ```


  - `Filename:` _filename_  
     _by default_, filename is the file's system filename.  
     the file will be recognized by this name when processed by scroungejs.  

  - `Requires:` _filename_, _more filenames_  
     _by default_, file has no dependencies.  
     the file depends on files with these filenames.  
     
  - `Timestamp:` _YYYY.MM.DD-H:MM:SS_  
     _by default_, timestamp is a result of `Date.now()`.  
     the file will associate with this timestamp. concatenated files will produce a file that uses the most recent timestamp found.

  - `Authors:` _authorname_, _more authornames_  
     _by default_, file does not associate with an author.  
     the file associates with the given author(s). concatenated files will produce a file that associates with all defined authors.  
     
  - `DoNotCompress:` _bool_     
     _by default_, `false`
     Scroungejs will skip compression of this file value is `true`


---------------------------------------------------------

#### <a id="basepage">BASEPAGE:

scroungejs may add include elements for the js and css files it processes. Only a basepage that contains one or more _scrounge elements_ will be modified.

   > *example.html* 

   ```html
   <!doctype html>  
   <html>  
     <head>  
       <!-- <scrounge type=".js"> -->  
       <!-- </scrounge> -->  
     </head>  
     <body></body>   
   </html>  
   ```

scroungejs adds js/css include elements in the body of scrounge elements. Something like the following could be added to the body of the scrounge element above.  

  > *example.html* 

  ```html
  <!-- <scrounge type=".js"> -->
  <script src="cmpr/app1.js" type="text/javascript"></script>
  <script src="cmpr/app2.js" type="text/javascript"></script>
  <script src="cmpr/app3.js" type="text/javascript"></script>
  <!-- </scrounge> -->
  ````
   
   
Each time that you modify a basepage with scroungejs, the body of the tags is remade by scroungejs.

a 'tree' attribute will affect the body of the element produced by scroungejs.

  > *example.html*

  ```html
  <!-- <scrounge type=".css" tree="app1.js,app2"> -->
  <script src="cmpr/app1.js" type="text/javascript"></script>
  <script src="cmpr/app2.js" type="text/javascript"></script>
  <!-- </scrounge> -->
  ```


example scrounge elements are given below

  > *example.html*
  
  ```html
  <!-- <scrounge type=".css" tree="Map.css,Main.js"> -->
  <!-- </scrounge> -->
  <!-- <scrounge type=".js" tree="Main.js,Crypto.js"> -->
  <!-- </scrounge> -->
  <!-- <scrounge type=".css" tree="Main.js"> -->
  <!-- </scrounge> -->
  ```


---------------------------------------------------------

#### <a id="modifiers">MODIFIERS:

 - **--inputPath= _path_**, **-i _path_**, _default: ./_  
   
   a systempath to a directory or file.

 - **--outputPath= _path_**, **-o _path_**, _default: ./cmpr_  
 
   a systempath to a directory or file.
   
 - **--publicPath= _path_**, **-p _path_**, _default: null_  
   a path to the files created by scrounge. examples describe it best

   for the file `./getStarted/app/cmpr/app.js`, with publicPath `/cmpr/app.js`:

   a resulting basepage element:
   ```html
   <script src="/cmpr/app.js" type="text/javascript"></script>';
   ```
   
   for the file `./getStarted/app/cmpr/app.js`, with publicPath `http://www.site.com/cmpr/app.js`:   
     
   a resulting basepage element:
   ```html
   <script src="http://www.site.com/cmpr/app.js" type="text/javascript"></script>';
   ```   
   
   a public path is not useful without a `--basepage` argument as it affects only paths generated for the specified basepage.   
  
 - **--isBasepageSourcePaths= _bool_**, _default: false_  
   basepage include tags will reference scripts in source directory.
   disables compression, concatenation and copying of files. uses `publicPath`
       
   ex.  
   ```bash
   $ node scrounge.js -l --isRecursive=true \        
     --isBasepageSourcePaths=true \  
     --basepage=~/Software/kuaweb/sources/index.html \  
     --inputPath=~/Software/kuaweb/sources/appSrc --publicPath=/appSrc
   ```

 - **--isSourcePathUnique= _bool_**, _default: false_  
   add a unique argument to reference paths in include elements
   
   if enabled, an include element may appear as follows:
   
   ```html
   <script src="Main.js?u=1370491167925" type="text/javascript"></script>';
   <link href="Main.css?u=1370491167926" rel="stylesheet" type="text/css">
   ```
     
 - **--extnTemplate= _str_**, _default: ''_  
   prompts scroungejs to recognize the given string as an extentions for template files. For example, `--extnTemplate=.mustache`. 

   If `ViewSignin.js` is included in scroungejs' output, `ViewSignin.mustache` will be included as well and it will be copied to the specified output directory.    

 - **--isCompressed= _bool_, _extension_, _tree_**, _default: false_  
   compress all files and/or trees before writing them to disk. If an extension or a treename are given only files that associate with the treename or extension will be compressed.

 - **--isConcatenated= _bool_, _extension_, _tree_**, _default: false_  
   concatenate all js/css files that form a tree before writing them to disk. If an extension or a treename are given only files that associate with the treename or extension will be concatenated.

 - **--isRecursive= _bool_**, _default: false_  
   discover files in nested directories on the given path.
   
 - **--isWarning= _bool_**, _default: false_  
   raise warnings around trace statements.

 - **--isLines= _bool_**, _default: false_  
   each compressed script on its own line.

 - **--isClosure= _bool_**, _default: false_  
   compressed js code will added in the body of anonymous self-calling function.

 - **--isSilent= _bool_**, **-s**, _default: false_  
   supress console messages.
   
 - **--isMintFilter= _bool_**, _default: false_  
   only process files that include `_mint` in their filename. this should only be used for the special case when a build directory has many files that should not be included in the build process. `_mint` distinguishes a file that _should_ be included in the build process from a file that _should not_ be included in the build process.

 - **--isTimestamped= _bool_, _extension_, _tree_**, _default: false_  
   add a timestamp to name of the output files. If an extension or treename are given only files that associate with the treename or extension will be timestamped

 - **--isRemoveRequires= _bool_**, _default: true_  
   remove 'requires' statements from javascript files. `true` by default.
   
 - **--isRemoveConsole= _bool_**, _default: false_  
   remove 'console.log' statements from javascript files.
   uses UglifyJS2 ast to comprehensively remove console.log
   
 - **--isUpdateOnly= _bool_**, _default: false_  
   modify include tags in a basepage only. do not build scrounge elements.

 - **--extensionType= _type_**, **-t _type_**, _default: null_   
   process files of one type only, `js` or `css`.
   
 - **--forceTimestamp= _timestamp_**, _default: null_  
   all timestamped files will use the given timestamp.
   
 - **--basepage= _basepage_**, **-b _basepage_**, _default: null_  
   update scrounge tags in the defined basepage.
   
   scroungejs will not modify or process a file that does not contain scrounge tags.


---------------------------------------------------------

#### <a id="license">License:

 ![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) 2012 [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
