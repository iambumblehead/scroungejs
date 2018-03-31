// Filename: scrounge_file.js
// Timestamp: 2018.03.31-00:56:32 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const fs = require('fs'),
      path = require('path'),
      mkdirp = require('mkdirp'),
      pathpublic = require('pathpublic'),
      scrounge_uid = require('./scrounge_uid'),
      scrounge_log = require('./scrounge_log');

module.exports = (o => {
  o.setextn = (filename, extn) =>
    path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + extn);

  o.setposixbasename = (filepath, uid) =>
    o.setbasename(filepath, uid).replace(/\\/g, '/');

  o.setbasename = (filepath, uid) => {
    let dirname = path.dirname(filepath),
        extname = path.extname(filepath);

    return path.join(dirname, scrounge_uid.sanitised(uid) + extname);
  };

  o.setpublicpath = (opts, filepath, uid) => {
    if (!opts.isconcat) {
      filepath = o.setposixbasename(filepath, uid);
    }

    let publicpath = pathpublic.get(filepath, opts.publicpath);
    // if !publicpath... publicpath dir not found in filepath
    //   use publicpath and root directory
    return (typeof publicpath === 'string' && publicpath.startsWith(opts.publicpath))
      ? publicpath
      : path.join(opts.publicpath, path.basename(filepath));
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
    let isexists = false;

    try {
      isexists = fs.statSync(filepath).isFile();
    } catch (err) { /* */ }

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
