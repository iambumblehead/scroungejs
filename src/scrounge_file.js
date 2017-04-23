// Filename: scrounge_file.js  
// Timestamp: 2017.04.23-10:37:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const fs = require('fs'),
      path = require('path'),
      mkdirp = require('mkdirp'),
      pathpublic = require('pathpublic'),
      scrounge_adapt = require('./scrounge_adapt'),
      scrounge_log = require('./scrounge_log');

const scrounge_file = module.exports = (o => {

  o.setextn = (filename, extn) => 
    path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + extn);

  o.setposixbasename = (filepath, uid) =>
    o.setbasename(filepath, uid).replace(/\\/g, '/');

  o.setbasename = (filepath, uid) => {
    var dirname = path.dirname(filepath),
        extname = path.extname(filepath);

    return path.join(dirname, scrounge_adapt.uidsanitised(uid) + extname);
  };  

  o.setpublicpath = (opts, filepath, uid) => {
    if (!opts.isconcat) {
      filepath = o.setposixbasename(filepath, uid);
    }
    
    return pathpublic.get(filepath, opts.publicpath);    
  };

  o.setpublicoutputpath = (opts, filepath, uid) =>
    o.setpublicpath(opts, path.join(
      opts.outputpath, path.basename(filepath)
    ), uid);

  o.setoutputpathreal = (opts, filepath, uid) => {
    if (!opts.isconcat && !/.mustache$/.test(filepath)) {
      filepath = o.setbasename(filepath, uid);
    }

    return path.join(opts.outputpath, path.basename(filepath));
  };  

  o.setoutputpath = (opts, filepath) =>
    path.join(opts.outputpath, path.basename(filepath));

  o.isexist = filepath => {
    var isexists = false;
    
    try {
      isexists = fs.statSync(filepath).isFile();
    } catch (err) { }

    return isexists;
  };

  o.read = (opts, filepath, fn) =>
    fs.readFile(path.resolve(filepath), 'utf-8', fn);

  o.writesilent = (opts, filepath, content, fn) =>
    mkdirp(path.dirname(filepath), err => {
      if (err) return fn(err);
      
      fs.writeFile(path.resolve(filepath), content, fn);
    });

  o.write = (opts, filepath, content, fn) => {
    scrounge_log.write(opts, filepath);

    o.writesilent(opts, filepath, content, fn);
  };

  o.copy = (opts, filepathin, filepathout, fn) =>
    o.read(opts, filepathin, (err, res) => {
      if (err) return fn(err);

      o.write(opts, filepathout, res, fn);
    });


  return o;
  
})({});
