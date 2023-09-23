import path from 'path'
import archy from 'archy'

// also returns msg string
const scr_log = (opts, msg) => (
  (opts.issilent || console.log(msg)) || msg)

const scr_logprintroot = (opts, rootname, tree) => (
  scr_log(opts, `[...] root: ${rootname}\n\n${archy(tree)}`))

const scr_logstart = (opts, time) => (
  scr_log(opts, ''),
  scr_log(opts, `[...] start: ${time}`))

const scr_logfinish = (opts, time) => (
  scr_log(opts, `[...] finish: ${time}`))

const scr_logupdatenode = (opts, uid) => (
  scr_log(opts, `[...] update: ${uid}`))

const scr_logrootjoin = (opts, root, type, filename, inum, lnum, j) => (
  scr_log(opts, (
    '[...] :j: (:rootname, :roottype, :progress) :filename'
      .replace(':j', j)
      .replace(':rootname', root)
      .replace(':roottype', type)
      .replace(':progress', `${lnum - inum}/${lnum}`)
      .replace(':filename', path.resolve(filename)
        .replace(process.cwd(), '.')
        .replace(process.env.HOME, '~')))))

const scr_logrootjoinplainfile = (opts, root, type, filename, inum, lnum) => (
  scr_logrootjoin(opts, root, type, filename, inum, lnum, 'join'))

const scr_logrootjoinminfile = (opts, root, type, filename, inum, lnum) => (
  scr_logrootjoin(opts, root, type, filename, inum, lnum, 'ugly'))

const scr_logrootjoinfile = (opts, rootname, filename, inum, lnum, j) => {
  const type = path.extname(rootname)
  const root = rootname.slice(0, -type.length) + type

  opts.iscompress
    ? scr_logrootjoinminfile(opts, root, type, filename, inum, lnum, j)
    : scr_logrootjoinplainfile(opts, root, type, filename, inum, lnum, j)
}

const scr_logunsupportedtype = (opts, type, filename) => (
  scr_log(opts, '[...] unsupported type: :type, :filename'
    .replace(/:type/, type)
    .replace(/:filename/, filename)))

const scr_logrootfilenotfound = (opts, rootname) => (
  scr_log(opts, '[...] root file not found: :rootname'
    .replace(/:rootname/, rootname)))

const scr_logwrite = (opts, filename, bytesize) => (
  scr_log(opts, '[...] write: :filename :size'
    .replace(/:filename/, path.resolve(filename)
      .replace(process.cwd(), '.')
      .replace(process.env.HOME, '~'))
    .replace(/:size/, bytesize ? `~${bytesize / 1000}kb` : '')))

export {
  scr_log as default,
  scr_logprintroot,
  scr_logstart,
  scr_logfinish,
  scr_logupdatenode,
  scr_logrootjoin,
  scr_logrootjoinplainfile,
  scr_logrootjoinminfile,
  scr_logrootjoinfile,
  scr_logunsupportedtype,
  scr_logrootfilenotfound,
  scr_logwrite,
}
