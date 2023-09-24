import path from 'path'
import depgraph from 'depgraph'

import scr_file from './scr_file.js'
import scr_node from './scr_node.js'
import scr_adapt from './scr_adapt.js'

import {
  scr_name_with_extn,
  scr_name_list_unique,
  scr_name_is_extn_list
} from './scr_name.js'

import {
  scr_logrootfilenotfound,
  scr_logprintroot,
  scr_logrootjoinfile
} from './scr_log.js'

import {
  scr_err_rootnamemusthavejsextn,
  scr_err_rootpathnotfound
} from './scr_err.js'

import {
  scr_enum_extn_grouptypeJS,
  scr_enum_extn_grouptypeCSS
} from './scr_enum.js'

// return rootname as a graph
const scr_root_graph_create = async (opts, rootpath) => (
  depgraph.graph.getfromseedfile(rootpath, opts))

const scr_root_node_create = async (opts, rootname) => {
  const rootnamepath = path.join(opts.inputpath, rootname)
  const rootnameextnarr = scr_name_is_extn_list(rootname, opts.cssextnarr)
    ? opts.cssextnarr
    : opts.jsextnarr

  // can have extn like less or css
  const rootpath = rootnameextnarr
    .map(extn => scr_name_with_extn(rootnamepath, extn))
    .find(scr_file.isexist)

  if (!rootpath)
    scr_logrootfilenotfound(opts, rootpath)

  return depgraph.node.get_fromfilepath(rootpath)
}

// return rootname as a graph deparr
const scr_root_deps_create = async (opts, rootname) => {
  if (path.extname(rootname) !== scr_enum_extn_grouptypeJS)
    throw scr_err_rootnamemusthavejsextn(rootname)

  const rootpath = opts.jsextnarr
    .map(extn => scr_name_with_extn(path.join(opts.inputpath, rootname), extn))
    .find(scr_file.isexist)

  if (!rootpath)
    throw scr_err_rootpathnotfound(rootname)

  const graph = await scr_root_graph_create(opts, rootpath)

  if (opts.treetype !== 'none')
    scr_logprintroot(
      opts, rootname, opts.treetype === 'small'
        ? depgraph.tree.getfromgraphsmall(graph)
        : depgraph.tree.getfromgraph(graph))

  return depgraph.graph.getdeparr(graph).reverse()
}

//
// returns a map object { treename : dependencyarr }
//
const scr_roots_deps_create = async (opts, rootarr) => {
  // converts rootname array to the specified type
  // then filters results for uniqueness  
  const graphnamearr = scr_name_list_unique(
    rootarr.map(name => scr_name_with_extn(name, '.js')))
  const prependspecarr = opts.prependarr

  return (async function nextgraph (graphnamearr, x, graphsobj) {
    if (!x--) return graphsobj

    const deparr = await scr_root_deps_create(opts, graphnamearr[x])
    const prependspec = prependspecarr.find(o => o.treename === graphnamearr[x])
    const prenodearr = prependspec
      ? await depgraph.node.get_arrfromfilepathrel(prependspec.sourcearr, opts)
      : null

    graphsobj[graphnamearr[x]] = prenodearr
      ? deparr.concat(prenodearr)
      : deparr

    return nextgraph(graphnamearr, x, graphsobj)
  }(graphnamearr, graphnamearr.length, {}))
}

// obtains the map object created from 'js' roots
// constructs non-js root definitions derived from js roots
//
const scr_root_rootsobj = async (opts, rootarr) => {
  const jsdeparrobj = await scr_roots_deps_create(opts, rootarr)

  return (async function next (rootarr, x, len, jsdeparrobj, deparrobj) {
    if (x >= len) return deparrobj

    let rootname = rootarr[x],
        rootextn = path.extname(rootname),
        jsdeparr = jsdeparrobj[scr_file.setextn(rootname, '.js')]

    if (rootextn === scr_enum_extn_grouptypeJS)
      deparrobj[rootname] = jsdeparrobj[rootname]

    if (rootextn === scr_enum_extn_grouptypeCSS) {
      const deparr = await scr_node
        .getarrastypearr(jsdeparr, opts.cssextnarr)

      deparrobj[rootname] = deparr
    }

    return next(rootarr, ++x, len, jsdeparrobj, deparrobj)
  }(rootarr, 0, rootarr.length, jsdeparrobj, {}))
}

const scr_root_depswrite = async (deps, x, opts, rootname) => {
  if (!x--) return 'success'

  const [ res ] = await scr_adapt(opts, deps[x])
  await scr_root_nodewrite(opts, deps[x], rootname, res)

  return scr_root_depswrite(deps, x, opts, rootname)
}
//    }(deparr, deparr.length))

const scr_root_depswriteroots = async (deps, x, opts, rootname, roots = []) => {
  if (!x--) scr_root_nodewrite(opts, deps[0], rootname, roots.join('\n'))

  const adaptopts = {
    ...opts,
    issourcemap: false,
    iscompress: opts.issourcemap === false && opts.iscompress
  }

  roots.push((await scr_adapt(adaptopts, deps[x]))[0])

  scr_logrootjoinfile(
    adaptopts, rootname, deps[x].get('filepath'), x, deps.length)

  return scr_root_depswriteroots(deps, x, opts, rootname, roots)
}

const scr_root_nodewrite = async (opts, node, rootname, content) => {
  let filepath = scr_node.getoutputpathreal(opts, node, rootname),
      rootextn = path.extname(rootname),
      fileextn = (
        opts.jsextnarr.find(extn => extn === rootextn) ||
          opts.cssextnarr.find(extn => extn === rootextn))
      || rootextn

  filepath = scr_file.setextn(filepath, fileextn)

  if (fileextn === scr_enum_extn_grouptypeJS && opts.issourcemap) {
    const [ , map ] = await scr_adapt.js({
      ...opts,
      sourcemap: true,
      iscompress: true,
      sourceFileName: path.basename(filepath)
    }, node, content)

    const mapsource = JSON.stringify(map, null, '  ')
    const mapfilepath = `${filepath}.map`
    const mapfilename = path.basename(mapfilepath)
    const mapinclude = `//# sourceMappingURL=${mapfilename}`

    await scr_file.mkdirp(opts.outputpath)
    await scr_file.write(opts, mapfilepath, mapsource)

    content = [ mapinclude, content ].join('\n')
  }

  await scr_file.mkdirp(opts.outputpath)
  return scr_file.write(opts, filepath, content, true)
}

// matches should be build and constructed ahead of this point,
// to be reused for write at basepage
const scr_root_write = async (opts, rootname, rootdeps) => opts.isconcat
  ? scr_root_depswriteroots(rootdeps, rootdeps.length, opts, rootname)
  : scr_root_depswrite(rootdeps, rootdeps.length, opts, rootname)

const scr_root_writearr = async (opts, rootnamearr, graphobj) => {
  if (!rootnamearr.length)
    return null

  const rootname = rootnamearr[0]
  const rootdeps = graphobj[rootname] || []

  if (rootdeps.length)
    await scr_root_write(opts, rootname, rootdeps)

  return scr_root_writearr(opts, rootnamearr.slice(1), graphobj)
}

export {
  scr_root_graph_create,
  scr_root_node_create,
  scr_root_deps_create,
  scr_roots_deps_create,
  scr_root_rootsobj,
  scr_root_write,
  scr_root_writearr
}
