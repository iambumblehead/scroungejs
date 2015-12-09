// Filename: scrounge_log.js  
// Timestamp: 2015.12.08-14:19:00 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  


var path = require('path'),
    archy = require('archy'),
    depgraph = require('depgraph');

var scrounge_log = module.exports = (function (o) {

  o = function (opts, msg) {
    if (!opts.issilent) console.log(msg);
  };

  o.printroot = function (opts, rootname, tree) {
    o(opts, '[...] root: ' + rootname + '\n\n' + archy(tree));
  };

  o.start = function (opts, time) {
    o(opts, '');
    o(opts, '[...] start: ' + time);    
  };

  o.finish = function (opts, time) {
    o(opts, '[...] finish: ' + time);
  };

  o.rootjoin = function (opts, root, type, filename, inum, lnum, j) {
    o(opts, '[...] :j: (:rootname, :roottype, :progress) :filename'
      .replace(':j', j)
      .replace(':rootname', root)
      .replace(':roottype', type)
      .replace(':progress', (lnum - inum) + '/' + lnum)
      .replace(':filename', path.resolve(filename)
               .replace(process.cwd(), '.')
               .replace(process.env.HOME, '~')));
  };

  o.rootjoinplainfile = function (opts, root, type, filename, inum, lnum, j) {
    o.rootjoin(opts, root, type, filename, inum, lnum, 'join');
  };

  o.rootjoinminfile = function (opts, root, type, filename, inum, lnum, j) {
    o.rootjoin(opts, root, type, filename, inum, lnum, 'ugly');
  };

  o.rootjoinfile = function (opts, root, type, filename, inum, lnum, j) {
    if (opts.iscompress) {
      o.rootjoinminfile.apply(0, arguments);
    } else {
      o.rootjoinplainfile.apply(0, arguments);
    }
  };

  o.unsupportedtype = function (opts, type, filename) {
    o(opts, '[...] unsupported type: :type, :filename'
      .replace(/:type/, type)
      .replace(/:filename/, filename));
  };

  o.write = function (opts, filename) {
    o(opts, '[...] write: :filename'
      .replace(/:filename/, path.resolve(filename)
               .replace(process.cwd(), '.')
               .replace(process.env.HOME, '~')));
  };
  
  return o;

}());
