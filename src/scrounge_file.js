// Filename: scrounge_file.js  
// Timestamp: 2015.12.07-23:53:16 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    pathpublic = require('pathpublic'),
    scrounge_log = require('./scrounge_log');

var scrounge_file = module.exports = (function (o) {

  o.setextn = function (filename, extn) {
    return path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + extn);
  };

  o.setpublicpath = function (opts, filepath) {
    return pathpublic.get(filepath, opts.publicpath);    
  };

  o.setpublicoutputpath = function (opts, filepath) {
    return o.setpublicpath(opts, path.join(
      opts.outputpath, path.basename(filepath)
    ));
  };

  o.setoutputpath = function (opts, filepath) {
    return path.join(
      opts.outputpath, path.basename(filepath)
    );
  };  

  o.isexist = function (filepath) {
    var isexists = false;
    
    try {
      isexists = fs.statSync(filepath).isFile();
    } catch (err) { }

    return isexists;
  };

  o.read = function (opts, filepath, fn) {
    fs.readFile(path.resolve(filepath), 'utf-8', fn);
  };

  o.write = function (opts, filepath, content, fn) {
    scrounge_log.write(opts, filepath);

    mkdirp(path.dirname(filepath), function (err) {
      if (err) return fn(err);
      
      fs.writeFile(path.resolve(filepath), content, fn);
    });
  };

  o.copy = function (opts, filepathin, filepathout, fn) {
    o.read(opts, filepathin, function (err, res) {
      if (err) return fn(err);

      o.write(opts, filepathout, res, fn);
    });
  };

  return o;
  
}({}));
