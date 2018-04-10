// Filename: scrounge_log.js
// Timestamp: 2018.04.09-21:30:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const path = require('path'),
      archy = require('archy');

module.exports = (o => {
  // also returns msg string
  o = (opts, msg) =>
    (opts.issilent || console.log(msg)) || msg;

  o.printroot = (opts, rootname, tree) =>
    o(opts, `[...] root: ${rootname}\n\n${archy(tree)}`);

  o.start = (opts, time) => {
    o(opts, '');
    o(opts, `[...] start: ${time}`);
  };

  o.finish = (opts, time) =>
    o(opts, `[...] finish: ${time}`);

  o.updatenode = (opts, uid) =>
    o(opts, `[...] update: ${uid}`);

  o.rootjoin = (opts, root, type, filename, inum, lnum, j) =>
    o(opts, '[...] :j: (:rootname, :roottype, :progress) :filename'
      .replace(':j', j)
      .replace(':rootname', root)
      .replace(':roottype', type)
      .replace(':progress', `${lnum - inum}/${lnum}`)
      .replace(':filename', path.resolve(filename)
        .replace(process.cwd(), '.')
        .replace(process.env.HOME, '~')));

  o.rootjoinplainfile = (opts, root, type, filename, inum, lnum) =>
    o.rootjoin(opts, root, type, filename, inum, lnum, 'join');

  o.rootjoinminfile = (opts, root, type, filename, inum, lnum) =>
    o.rootjoin(opts, root, type, filename, inum, lnum, 'ugly');

  o.rootjoinfile = (opts, root, type, filename, inum, lnum, j) =>
    opts.iscompress
      ? o.rootjoinminfile(opts, root, type, filename, inum, lnum, j)
      : o.rootjoinplainfile(opts, root, type, filename, inum, lnum, j);

  o.unsupportedtype = (opts, type, filename) =>
    o(opts, '[...] unsupported type: :type, :filename'
      .replace(/:type/, type)
      .replace(/:filename/, filename));

  o.rootfilenotfound = (opts, rootname) =>
    o(opts, '[...] root file not found: :rootname'
      .replace(/:rootname/, rootname));

  o.write = (opts, filename) =>
    o(opts, '[...] write: :filename'
      .replace(/:filename/, path.resolve(filename)
        .replace(process.cwd(), '.')
        .replace(process.env.HOME, '~')));

  return o;
})({});
