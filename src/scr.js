import simpletime from 'simpletime'

import scr_watch from './scr_watch.js'
import scr_cache from './scr_cache.js'
import scr_node from './scr_node.js'
import scr_file from './scr_file.js'
import scr_opts from './scr_opts.js'

import {
  scr_enum_extn_grouptypeJS,
  scr_enum_extn_grouptypeCSS
} from './scr_enum.js'

import {
  scr_name_is_extn,
  scr_name_with_extn,
  scr_name_list_unique
} from './scr_name.js'

import {
  scr_root_write,
  scr_root_writearr,
  scr_root_rootsobj,
  scr_root_node_create
} from './scr_root.js'

import {
  scr_basepage_writeelemarr,
  scr_basepage_writeelemone,
  scr_basepage_getrootnamearr
} from './scr_basepage.js'

import {
  scr_logstart,
  scr_logfinish,
  scr_logupdatenode  
} from './scr_log.js'

const writeroots = async (opts, rootarr, rootobj) => (
  scr_root_writearr(opts, rootarr, rootobj))

// tpl files aren't processed in the way scripts and stylesheets are
// tpl deparr, adjacent to js deparr, is created any nodes are simply copied
// to outputpath
const copyroottpl = async (opts, rootobj) => {
  if (!opts.istpl)
    return null

  const custopts = Object.create(opts)
  const jsrootarr = scr_name_list_unique(
    Object.keys(rootobj)
      .map(name => scr_name_with_extn(name, scr_enum_extn_grouptypeJS)))

  custopts.isconcat = false
  custopts.iscompress = false

  const deparr = await scr_node
    .getarrastypearr(rootobj[jsrootarr[0]], opts.tplextnarr)

  let rootname = scr_file.setextn(jsrootarr[0], opts.tplextnarr[0])
  rootobj[rootname] = deparr

  await scr_root_write(custopts, rootname, rootobj)

  return true
}

// returned object uses rootnames as named-properties defined w/ rootarr
//
// existance of template and stylesheet files is checked here
const buildrootobj = async (opts, rootarr) => (
  scr_root_rootsobj(opts, rootarr))

// if baseage does not exist, skip read/write with no failure
const writebasepage = async (opts, rootarr, rootobj) => {
  const { basepage, basepagein } = opts

  if (basepage && !scr_file.isexist(basepage))
    await scr_file.copy(opts, basepagein, basepage)

  return basepage
    ? scr_basepage_writeelemarr(opts, basepage, rootarr, rootobj)
    : null
}

const readbasepage = async opts => {
  const { basepage, basepagein } = opts
  const pageroots = basepage && scr_file.isexist(basepagein)
     && await scr_basepage_getrootnamearr(opts, basepagein)
  const pagetreearr = pageroots && pageroots.reduce((roots, curval) => {
    if (roots.indexOf(curval) === -1) roots.push(curval)

    return roots
  }, opts.treearr)


  return pagetreearr || opts.treearr
}

const scr_filepath_get_grouptype = (opts, filepath) => (
  [ [ scr_enum_extn_grouptypeJS, ...opts.jsextnarr ],
    [ scr_enum_extn_grouptypeCSS, ...opts.cssextnarr ]
  ].find(extns => (
    extns.some(extn => scr_name_is_extn(filepath, extn)))) || [])[1]

const updatedestfile = async (optsuser, srcfilename) => {
  const opts = scr_opts(optsuser)
  const supportedextnsfound = []
    .concat(opts.cssextnarr, opts.jsextnarr)
    .filter(extn => scr_name_is_extn(srcfilename, extn))
  
  if (opts.isconcat || supportedextnsfound.length === 0)
    return null

  const rootsarr = await readbasepage(opts)

  srcfilename = scr_file.rminputpath(opts, srcfilename)

  const node = await scr_root_node_create(opts, srcfilename)

  scr_logupdatenode(opts, node.get('uid'))

  const nodefilepath = node.get('filepath')
  const groupTypeExtn = scr_filepath_get_grouptype(opts, nodefilepath)
  const nodegrouppath = scr_name_with_extn(nodefilepath, groupTypeExtn)
  const rootsarrfiltered = rootsarr.filter(root => (
    nodegrouppath === scr_filepath_get_grouptype(opts, root)))
  const rootnodescached = await scr_cache
    .recoverrootarrcachemapnode(opts, rootsarrfiltered, node)

  await writeroots(opts, rootsarrfiltered, rootnodescached)

  if (opts.basepage &&
      opts.istimestamp) {
    await scr_basepage_writeelemone(opts, opts.basepage, node)
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
  updatedestfile
})
