// Filename: scrounge_file.js  
// Timestamp: 2015.12.08-12:58:11 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    pathpublic = require('pathpublic'),

    scrounge_adapt = require('./scrounge_adapt'),
    scrounge_log = require('./scrounge_log');

var scrounge_file = module.exports = (function (o) {

  o.setextn = function (filename, extn) {
    return path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + extn);
  };

  o.setbasename = function (filepath, uid) {
    var fileextn = path.extname(filepath),
        uidname = o.setextn(scrounge_adapt.uidsanitised(uid), fileextn);
    
    return path.join(path.dirname(filepath), uidname);
  };

  o.setpublicpath = function (opts, filepath, uid) {
    if (opts.isconcat) {
      return pathpublic.get(filepath, opts.publicpath);
    } else {
      return pathpublic.get(o.setbasename(filepath, uid), opts.publicpath);    
    }
  };

  o.setpublicoutputpath = function (opts, filepath, uid) {
    return o.setpublicpath(opts, path.join(
      opts.outputpath, path.basename(filepath)
    ), uid);
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
