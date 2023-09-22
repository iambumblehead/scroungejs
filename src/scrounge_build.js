// Filename: scrounge_build.js
// Timestamp: 2018.04.08-02:32:04 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import simpletime from 'simpletime'

import scrounge_basepage from './scrounge_basepage.js'
import scrounge_watch from './scrounge_watch.js'
import scrounge_cache from './scrounge_cache.js'
import scrounge_root from './scrounge_root.js'
import scrounge_node from './scrounge_node.js'
import scrounge_file from './scrounge_file.js'
import scrounge_opts from './scrounge_opts.js'
import scrounge_log from './scrounge_log.js'

const writeroots = async (opts, rootarr, rootobj) => (
  scrounge_root.writearr(opts, rootarr, rootobj))

// tpl files aren't processed in the way scripts and stylesheets are
// tpl deparr, adjacent to js deparr, is created any nodes are simply copied
// to outputpath
const copyroottpl = async (opts, rootobj) => {
  //
  // by default, this feature switch off
  //
  if (!opts.istpl)
    return null

  const custopts = Object.create(opts)
  const jsrootarr = scrounge_root
    .getnamearrastype(opts, Object.keys(rootobj), '.js')

  custopts.isconcat = false
  custopts.iscompress = false

  const deparr = await scrounge_node
    .getarrastypearr(rootobj[jsrootarr[0]], opts.tplextnarr)

  let rootname = scrounge_file.setextn(jsrootarr[0], opts.tplextnarr[0])
  rootobj[rootname] = deparr

  await scrounge_root.write(custopts, rootname, rootobj)

  return true
}

// returned object uses rootnames as named-properties defined w/ rootarr
//
// existance of template and stylesheet files is checked here
const buildrootobj = async (opts, rootarr) => (
  scrounge_root.getrootarrasobj(opts, rootarr))

// if baseage does not exist, skip read/write with no failure
const writebasepage = async (opts, rootarr, rootobj) => {
  const { basepage, basepagein } = opts

  if (basepage && !scrounge_file.isexist(basepage))
    await scrounge_file.copy(opts, basepagein, basepage)

  return basepage
    ? scrounge_basepage.writeelemarr(opts, basepage, rootarr, rootobj)
    : null
}

const readbasepage = async opts => {
  const { basepage, basepagein } = opts
  const pageroots = basepage && scrounge_file.isexist(basepagein)
     && await scrounge_basepage.getrootnamearr(opts, basepagein)
  const pagetreearr = pageroots && pageroots.reduce((roots, curval) => {
    if (roots.indexOf(curval) === -1) roots.push(curval)

    return roots
  }, opts.treearr)


  return pagetreearr || opts.treearr
}

const updatedestfile = async (opts, srcfilename) => {
  opts = scrounge_opts(opts)

  if (opts.isconcat
      || !scrounge_opts.isfilenamesupportedtype(opts, srcfilename))
    return null
  
  const rootsarr = await readbasepage(opts)

  srcfilename = scrounge_file.rminputpath(opts, srcfilename)

  const node = await scrounge_root.getfilenameasnode(opts, srcfilename)

  scrounge_log.updatenode(opts, node.get('uid'))
  const nodefilepath = scrounge_opts.setfinalextn(opts, node.get('filepath'))
  const rootsarrfiltered = rootsarr.filter(root => (
    scrounge_opts.issamesupportedtype(opts, nodefilepath, root)))
  const rootnodescached = await scrounge_cache
    .recoverrootarrcachemapnode(opts, rootsarrfiltered, node)

  await writeroots(opts, rootsarrfiltered, rootnodescached)

  if (opts.basepage &&
      opts.istimestamp) {
    await scrounge_basepage.writeelemone(opts, opts.basepage, node)
  }

  return true
}

const build = async (opts = {}) => {
  let datebgn = new Date()

  opts = scrounge_opts(opts)

  scrounge_log.start(opts, datebgn)

  const rootsarr = await readbasepage(opts)
  const rootobj = await buildrootobj(opts, rootsarr)

  if (opts.iscachemap)
    await scrounge_cache.buildmaps(opts, rootsarr, rootobj)

  await writeroots(opts, rootsarr, rootobj)
  await copyroottpl(opts, rootobj)
  const res = await writebasepage(opts, rootsarr, rootobj)

  scrounge_log
    .finish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()))

  if (opts.iswatch)
    scrounge_watch(opts.inputpath, {}, async path => updatedestfile(opts, path))

  return res
}

export default Object.assign(build, {
  writeroots,
  copyroottpl,
  buildrootobj,
  writebasepage,
  readbasepage,
  updatedestfile,
  build
})
