Scrounge.js
===========
**(c)[Bumblehead][0], 2012** [MIT-license](#license)  
![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand3.png)
### OVERVIEW:


Scrounge.js is a command line tool that processes .js and .css files.
With it you may compress, concatenate and/or timestamp your files as part of a
build process for your web site. It is made to be as flexible as possible and 
its features are selectively enabled as needed. Scrounge.js concatenates files 
in an ordered way -each file appears after the files that it depends on.  

Scrounge.js provides advantages over other deployment tools:  

 - it is just a command line tool -no config file, vm or framework.  
 - it does not interfere with the node.js requirejs module system.  
 - compression and concatenation are enabled/disabled for each build.  
 - html files do not need unusual tags or attributes added to them.  
 - it works with almost any collection javascript files.
 - by default, it does not add javascript to the files that it generates.  
 - it is packaged with an emacs config file.
 
Scrounge.js relies on other packages, notably: [css-clean][1] and 
[js-uglify][2].

[Get Started](#get-started) with Scrounge.js to learn more.

[0]: http://www.bumblehead.com                             "bumblehead"
[1]: http://github.com/GoalSmashers/clean-css              "css-clean"
[2]: http://github.com/mishoo/UglifyJS                     "js-uglify"

---------------------------------------------------------
#### <a id="install"></a>INSTALL:

Run npm's install command in the same directory as Scrounge's _package.json_ to 
have all dependencies fetched for you.

> `$ cd /path/to/scrounge/ && npm install`

If you have npm installed, you may also use `npm install scroungejs`

---------------------------------------------------------

#### <a id="get-started">GET STARTED:

_The directory named 'getStarted' and its contents are provided with the 
[Scrounge][3] package._

 1. **Call Scrounge.js with node.**  

 > `$ node ./Scrounge.js`  
 > `[...] open: Scrounge.js`  
 > `[...] write: cmpr/Scrounge.js`  
 > `[...] finish: 00:00:23 (mm:ss:ms)`  

 2. **Specify an input path.**  

 > `$ node ./Scrounge.js -i ./getStarted`  
 > `[...] open: getStarted/fileB.js`  
 > `[...] open: getStarted/fileA.js`  
 > `[...] write: getStarted/cmpr/fileB.js`  
 > `[...] write: getStarted/cmpr/fileA.js`  
 > `[...] finish: 00:00:25 (mm:ss:ms)`  

 3. **Define arguments for compression and timestamping.**  
 
 > `$ node ./Scrounge.js -i ./getStarted \`  
 > `   --isTimestamped=true --isCompressed=true`  
 > `[...] open: getStarted/fileB.js`  
 > `[...] open: getStarted/fileA.js`  
 > `[...] ugly: (1/2) getStarted/fileB.js`  
 > `[...] write: getStarted/cmpr/fileB_2012.07.07-15:25:57.js`  
 > `[...] ugly: (2/2) getStarted/fileA.js`  
 > `[...] write: getStarted/cmpr/fileA_2012.07.07-15:25:46.js`  
 > `[...] finish: 00:00:25 (mm:ss:ms)`  

 4. **Define a dependency in _fileB.js_.**  
 
 Scrounge.js will concatenate files that have dependencies among them. 
 Dependencies are defined in .js and .css files using the 'Requires' property.  
 
 >  *./getStarted/fileB.js:*

 > `// Requires: fileA.js`  

 5. **Concatenate files with Scrounge.js**
 
 Dependency-related files are recognized as a _tree_. A tree is composed of one 
 file that depends on files which may depend on other files and so on. A file that 
 begins a dependency is a tree _source_ file. Here, _fileB.js_ is a source file. 

 > `$ node ./Scrounge.js -i ./getStarted --isConcatenation=true`  
 > `[...] open: getStarted/fileB.js`  
 > `[...] open: getStarted/fileA.js`  
 > `[...] ugly: (fileB.js 1/2) getStarted/fileA.js`  
 > `[...] ugly: (fileB.js 2/2) getStarted/fileB.js`  
 > `[...] write: getStarted/cmpr/fileB.js`  
 > `[...] finish: 00:00:27 (mm:ss:ms)`  

 6. **Build a larger tree found in _./getStarted/app/_.**  
 
 > `$ node ./Scrounge.js -i ./getStarted/app \`  
 > `  --isConcatenation=true --isRecursive=true`   
 > `[...] open: getStarted/app/models/ModelA_mint.js`  
 > `[...] open: getStarted/app/lib/library.js`  
 > `[...] open: getStarted/app/app2.js`  
 > `[...] open: getStarted/app/views/ViewA_mint.css`   
 > `[...] open: getStarted/app/views/ViewA_mint.js`  
 > `[...] open: getStarted/app/views/ViewsAll_mint.js`  
 > `[...] open: getStarted/app/controls/CtrlsAll_mint.js`  
 > `[...] open: getStarted/app/app_mint.js`  
 > `[...] join: (library.js 1/1) getStarted/app/library.js`  
 > `[...] write: getStarted/cmpr/library.js`   
 > `[...] join: (app2.js 1/1) getStarted/app/app2.js`  
 > `[...] write: getStarted/cmpr/app2.js`  
 > `[...] join: (ViewA.css 1/1) getStarted/app/ViewA_mint.css`  
 > `[...] write: getStarted/cmpr/ViewA.css`    
 > `[...] join: (app.js 1/5) getStarted/app/models/ModelA_mint.js`  
 > `[...] join: (app.js 2/5) getStarted/app/controls/CtrlsAll_mint.js`  
 > `[...] join: (app.js 3/5) getStarted/app/views/ViewA_mint.js`  
 > `[...] join: (app.js 4/5) getStarted/app/views/ViewsAll_mint.js`  
 > `[...] join: (app.js 5/5) getStarted/app/app_mint.js`  
 > `[...] write: getStarted/app/cmpr/app.js`  
 > `[...] finish: 00:00:42 (mm:ss:ms)`   
 
 6. **Define filters for the build process.**  

 When `--extensionType=js` is given, files without a `js` extension are
 ignored by the build process.  
 
 When `--isMintFilter=true` is provided, files that do not have `_mint` affixed 
 to their filename are ignored by the build process. The rest of this guide will
 use `--isMintFilter=true` to filter unwanted files from the  build process.  

 Other filters are explained in the [Modifiers](#modifiers) section.  
 
 > `$ node ./Scrounge.js -i ./getStarted/app --isConcatenation=true \`
 > `  --isRecursive=true --isMintFilter=true --extensionType=js`  
 > `[...] open: getStarted/app/models/ModelA_mint.js`  
 > `[...] open: getStarted/app/app2.js`  
 > `[...] open: getStarted/app/views/ViewA_mint.js`  
 > `[...] open: getStarted/app/views/ViewsAll_mint.js`  
 > `[...] open: getStarted/app/controls/CtrlsAll_mint.js`  
 > `[...] open: getStarted/app/app_mint.js`  
 > `[...] join: (app2.js 1/1) getStarted/app/app2.js`  
 > `[...] write: getStarted/cmpr/app2.js`  
 > `[...] join: (app.js 1/5) getStarted/app/models/ModelA_mint.js`  
 > `[...] join: (app.js 2/5) getStarted/app/controls/CtrlsAll_mint.js`  
 > `[...] join: (app.js 3/5) getStarted/app/views/ViewA_mint.js`  
 > `[...] join: (app.js 4/5) getStarted/app/views/ViewsAll_mint.js`  
 > `[...] join: (app.js 5/5) getStarted/app/app_mint.js`  
 > `[...] write: getStarted/app/cmpr/app.js`  
 > `[...] finish: 00:00:42 (mm:ss:ms)`  

 7. **Open _ViewA\_mint.js_.**  

 There are four properties defined at the top of the file. 
 
 >  *./getStarted/app/views/ViewA_mint.js:*
  
 > `// Filename: ViewA.js`  
 > `// Timestamp: 2011.06.03`  
 > `// Author(s): Bumblehead`    
 > `// Requires: CtrlsAll.js, ModelA.js`   

 Scrounge.js' build process will recognize a file through its defined _Filename_ 
 property if one is provided. To create a dependency on ViewA_mint.js use
 '`// Requires: ViewA.js`' in another file.
 
 All file properties are explained in the [File Properties](#file-properties) 
 section.  

 8. **Update _index.mustache_ using Scrounge.js.**  

 The index file contains a _scrounge_ element.
 
 > *./getStarted/index.mustache* 
 
 > `<!doctype html>`  
 > `<html>`  
 > &nbsp;&nbsp;`<head>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/scr/libFile.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;`</head>`  
 > &nbsp;&nbsp;`<body>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js> -->`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
 > &nbsp;&nbsp;`</body>`  
 > `</html>`  
     
 9. **modify the basepage _index.mustache_ with scrounge.js**  
    
 _using -s makes the output 'silent'_
 
 > `$ node ./Scrounge.js -s -i ./getStarted/app \`  
 > `--basepage=./getStarted/index.mustache --isRecursive=true --isMintFilter=true`   
 
 10. **open _index.mustache_.**  
      
 > *./getStarted/index.mustache* 

 > `<!doctype html>`  
 > `<html>`  
 > &nbsp;&nbsp;`<head>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/app/lib/library.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;`</head>`  
 > &nbsp;&nbsp;`<body>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js> -->`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/ModelA.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/CtrlsAll.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/ViewA.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/ViewsAll.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/app.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<script src="./getStarted/cmpr/app2.js" type="text/javascript"></script>`  
 > &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
 > &nbsp;&nbsp;`</body>`  
 > `</html>`      
     
 11. **define a public path and update _index.mustache_.**  

 _--isConcatenation=true is used to shorten the example output_        
     
 Files on the web are accessed through a path that is relative to a _public
 root_ directory. Scrounge can modify a basepage so that added filepaths
 use a public root path rather than a system based path.
     
 For example, `app.js` may be available publicly from the directory `/cmpr`,
 and so its _public path_ would be `/cmpr/app.js`.
 
 > `$ node ./Scrounge.js -s -i ./getStarted/app \`  
 > `  --basepage=./getStarted/index.mustache --isRecursive=true \`  
 > `  --publicPath=/cmpr --isConcatenation=true --isMintFilter=true`  

 12. **open _index.mustache_.**  
     
 >    *./getStarted/index.mustache*  

 >    `<!doctype html>`  
 >    `<html>`  
 >    &nbsp;&nbsp;`<head>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/app/lib/library.js" type="text/javascript"></script>`       
 >    &nbsp;&nbsp;`</head>`  
 >    &nbsp;&nbsp;`<body>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js> -->`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app.js" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app2.js" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
 >    &nbsp;&nbsp;`</body>`  
 >    `</html>`      

 13. **add another scrounge element. define tree attributes.**  

 >    *./getStarted/index.mustache* 
 
 >    `<!doctype html>`  
 >    `<html>`  
 >    &nbsp;&nbsp;`<head>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/app/lib/library.js" type="text/javascript"></script>`            
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.css trees="app.js"> -->`       
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`       
 >    &nbsp;&nbsp;`</head>`  
 >    &nbsp;&nbsp;`<body>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js trees="app.js"> -->`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app.js" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app2.js" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
 >    &nbsp;&nbsp;`</body>`  
 >    `</html>`  
          
 14. **call scrounge.js.**  
    
 Trees may be defined in a basepage or by using the `--trees` argument.
 When trees are defined, scrounge will output the defined trees only.
     
 > `$ node ./Scrounge.js -s -i ./getStarted/app \`
 > `  --basepage=./getStarted/index.mustache --isRecursive=true --publicPath=/cmpr`       

 >    *./getStarted/index.mustache* 
     
 >    `<!doctype html>`  
 >    `<html>`  
 >    &nbsp;&nbsp;`<head>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/app/lib/library.js" type="text/javascript"></script>`                 
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.css trees="app.js"> -->`       
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app.css" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`       
 >    &nbsp;&nbsp;`</head>`  
 >    &nbsp;&nbsp;`<body>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js trees="app.js"> -->`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<script src="/cmpr/app.js" type="text/javascript"></script>`  
 >    &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
 >    &nbsp;&nbsp;`</body>`  
 >    `</html>`       

 15. ## You are now ready to use Scrounge.js.

 ![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand10.png) 

[3]: http://github.com/bumblehead/scrounge.js            "scrounge.js"

---------------------------------------------------------

#### <a id="file-properties">FILE PROPERTIES:

Scrounge.js' build process is affected by information in files it processes.

  > *./getStarted/app/views/ViewA_mint.js*

  > `// Filename: ViewA.js`  
  > `// Timestamp: 2011.06.03-22:10:20`  
  > `// Author(s): Bumblehead (www.bumblehead.com)`  
  > `// Requires: CtrlsAll.js, ModelA.js`  

  > *./getStarted/app/views/ViewA_mint.css*

  > `/* Filename: Main.css`  
  > `.* Timestamp: 2011.06.03-22:10:20`  
  > `.* Author(s): Bumblehead (www.bumblehead.com)`  
  > `.*/`


  - `Filename:` _filename_  
     the file will be recognized by this name when processed by Scounge.js.
     the defined filename may be different from the file's system path filename.

  - `Requires:` _filename_, _more filenames_  
     the file depends on files with these filenames.  
     
  - `Timestamp:` _YYYY.MM.DD-H:MM:SS_  
     the file will associate with this timestamp. the default is Date.now().
     the most recent timestamp among the concatenated files is used to as the 
     timestamp of the resulting file.

  - `Authors:` _authorname_, _more authornames_  
     a concatenated file is saved with its own `Authors:` definition that
     contains authornames given by source files.



---------------------------------------------------------

#### <a id="basepage">BASEPAGE:

Scrounge.js can add include elements for the js and css files it processes.
Only a basepage that contains one or more _scrounge elements_ will be modified.

  >  *example.html* 

  >  `<!doctype html>`  
  >  `<html>`  
  >  &nbsp;&nbsp;`<head>`  
  >  &nbsp;&nbsp;&nbsp;&nbsp;`<!-- <scrounge.js> -->`  
  >  &nbsp;&nbsp;&nbsp;&nbsp;`<!-- </scrounge> -->`  
  >  &nbsp;&nbsp;`</head>`  
  >  &nbsp;&nbsp;`<body></body>`  
  >  `</html>`


Scrounge.js adds js/css include elements in the body of scrounge elements.
Something like the following could be added to the body of the scrounge element
above.  

  >  *example.html* 
 
  >  `<!-- <scrounge.js> -->`  
  >  `<script src="cmpr/app1_cmpr.js" type="text/javascript"></script>`  
  >  `<script src="cmpr/app2_cmpr.js" type="text/javascript"></script>`   
  >  `<script src="cmpr/app3_cmpr.js" type="text/javascript"></script>`   
  >  `<!-- </scrounge> -->`
   
Each time that you modify a basepage with scrounge.js, the body of the tags is 
remade by Scrounge.js.

a 'tree' attribute will affect the body of the element produced by scrounge.js.

  >  *example.html*
  
  >  `<!-- <scrounge.css tree="app1.js,app2"> -->`   
  >  `<script src="cmpr/app_cmpr.js" type="text/javascript"></script>`  
  >  `<script src="cmpr/app_cmpr.js" type="text/javascript"></script>`   
  >  `<!-- </scrounge> -->`   
   
example scrounge elements are given below

  >  `<!-- <scrounge.css tree="Map.css,Main.js"> -->`  
  >  `<!-- </scrounge> -->`  
  >  `<!-- <scrounge.js tree="Main.js,Crypto.js"> -->`  
  >  `<!-- </scrounge> -->`  
  >  `<!-- <scrounge.css tree="Main.js"> -->`  
  >  `<!-- </scrounge> -->`  




---------------------------------------------------------

#### <a id="modifiers">MODIFIERS:

 - `--inputPath=`_inputpath_, `-i` _inputpath_  
   a systempath to a directory or file. the default inputpath value is './'.

 - `--outputPath=`_outputpath_, `-o` _outputpath_  
   a systempath to a directory or file. the default outpupath value is './cmpr'.
   
 - `--publicPath=`_public/path/to/files_, `-p` _public/path/to/files_  
   a path to the files created by scrounge.
   
   a valid public path is discoverable on the full system path to the file.
   for example, `/cmpr` is found on the path `./getStarted/app/cmpr/app.js`.   
   
   this file's full public path would be `/cmpr/app.js`.  
   
   a public path is not useful without a `-basepage` argument as it affects
   only paths generated for the specified basepage.   
  
 - `--isBasepageSourcePaths=`_bool_  
   basepage include tags will reference scripts in source directory.
   disables compression, concatenation and copying of files. uses `publicPath`
       
   ex.  
   >  `$ node scrounge.js -l --isRecursive=true --isBasepageSourcePaths=true \`  
   >  `  --basepage=~/Software/kuaweb/sources/index.html \`  
   >  `  --inputPath=~/Software/kuaweb/sources/appSrc --publicPath=/appSrc`

 - `--isCompressed=`_bool_  
   compress all files and trees before writing them to disk.

 - `--isRecursive=`_bool_  
   discover files in nested directories on the given path.
   
 - `--isWarning=`_bool_  
   raise warnings around trace statements.

 - `--isLines=`_bool_  
   each compressed script on its own line.

 - `--isClosure=`_bool_  
   compressed js code will added in the body of anonymous self-calling function.

 - `--isSilent=`_bool_, `-s`  
   supress console messages.
   
 - `--isMintFilter=`_bool_  
   only process files that include `_mint` in their filename.

 - `--isTimestamped=`_bool_  
   add a timestamp to name of the output files.

 - `--isRemoveRequires=`_bool_  
   remove 'requires' statements from javascript files. `true` by default.
   
 - `--isUpdateOnly=`_bool_  
   modify include tags in a basepage only. do not build scrounge elements.

 - `--extensionType=`_type_, `-t` _type_   
   process files of one type only, `js` or `css`.
   
 - `--forceConcatenateTrees=`_tree1,tree2_  
   force the concatenation of specified trees.
   
 - `--forceConcatenateTypes=`_type1,type2_  
   force the concatenation of `js` and/or `css` files.  
   
 - `--forceTimestamp=`_timestamp_  
   all timestamped files will use the given timestamp.
   
 - `--basepage=`_basepage_, `-b` _basepage_  
   update scrounge tags in the defined basepage.
   
   scrounge.js will not modify or process any file that does not contain 
   scrounge tags.


---------------------------------------------------------

#### <a id="license">License:

 ![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) 2012 [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the 'Software'), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
