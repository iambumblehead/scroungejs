import simpletime from 'simpletime'

import scr_basepage from './scr_basepage.js'
import scr_watch from './scr_watch.js'
import scr_cache from './scr_cache.js'
import scr_root from './scr_root.js'
import scr_node from './scr_node.js'
import scr_file from './scr_file.js'
import scr_opts from './scr_opts.js'

import {
  scr_logstart,
  scr_logfinish,
  scr_logupdatenode  
} from './scr_log.js'

const writeroots = async (opts, rootarr, rootobj) => (
  scr_root.writearr(opts, rootarr, rootobj))

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
  const jsrootarr = scr_root
    .getnamearrastype(opts, Object.keys(rootobj), '.js')

  custopts.isconcat = false
  custopts.iscompress = false

  const deparr = await scr_node
    .getarrastypearr(rootobj[jsrootarr[0]], opts.tplextnarr)

  let rootname = scr_file.setextn(jsrootarr[0], opts.tplextnarr[0])
  rootobj[rootname] = deparr

  await scr_root.write(custopts, rootname, rootobj)

  return true
}

// returned object uses rootnames as named-properties defined w/ rootarr
//
// existance of template and stylesheet files is checked here
const buildrootobj = async (opts, rootarr) => (
  scr_root.getrootarrasobj(opts, rootarr))

// if baseage does not exist, skip read/write with no failure
const writebasepage = async (opts, rootarr, rootobj) => {
  const { basepage, basepagein } = opts

  if (basepage && !scr_file.isexist(basepage))
    await scr_file.copy(opts, basepagein, basepage)

  return basepage
    ? scr_basepage.writeelemarr(opts, basepage, rootarr, rootobj)
    : null
}

const readbasepage = async opts => {
  const { basepage, basepagein } = opts
  const pageroots = basepage && scr_file.isexist(basepagein)
     && await scr_basepage.getrootnamearr(opts, basepagein)
  const pagetreearr = pageroots && pageroots.reduce((roots, curval) => {
    if (roots.indexOf(curval) === -1) roots.push(curval)

    return roots
  }, opts.treearr)


  return pagetreearr || opts.treearr
}

const updatedestfile = async (opts, srcfilename) => {
  opts = scr_opts(opts)

  if (opts.isconcat
      || !scr_opts.isfilenamesupportedtype(opts, srcfilename))
    return null
  
  const rootsarr = await readbasepage(opts)

  srcfilename = scr_file.rminputpath(opts, srcfilename)

  const node = await scr_root.getfilenameasnode(opts, srcfilename)

  scr_logupdatenode(opts, node.get('uid'))
  const nodefilepath = scr_opts.setfinalextn(opts, node.get('filepath'))
  const rootsarrfiltered = rootsarr.filter(root => (
    scr_opts.issamesupportedtype(opts, nodefilepath, root)))
  const rootnodescached = await scr_cache
    .recoverrootarrcachemapnode(opts, rootsarrfiltered, node)

  await writeroots(opts, rootsarrfiltered, rootnodescached)

  if (opts.basepage &&
      opts.istimestamp) {
    await scr_basepage.writeelemone(opts, opts.basepage, node)
  }

  return true
}

const build = async (opts = {}) => {
  let datebgn = new Date()

  opts = scr_opts(opts)

  scr_logstart(opts, datebgn)

  const rootsarr = await readbasepage(opts)
  const rootobj = await buildrootobj(opts, rootsarr)

  if (opts.iscachemap)
    await scr_cache.buildmaps(opts, rootsarr, rootobj)

  await writeroots(opts, rootsarr, rootobj)
  await copyroottpl(opts, rootobj)
  const res = await writebasepage(opts, rootsarr, rootobj)

  scr_logfinish(opts, simpletime.getElapsedTimeFormatted(datebgn, new Date()))

  if (opts.iswatch)
    scr_watch(opts.inputpath, {}, async path => updatedestfile(opts, path))

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
