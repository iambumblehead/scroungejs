import path from 'path'
import depgraph from 'depgraph'

import scr_file from './scr_file.js'
import scr_opts from './scr_opts.js'
import scr_node from './scr_node.js'
import scr_adapt from './scr_adapt.js'

import {
  scr_logrootfilenotfound,
  scr_logprintroot,
  scr_logrootjoinfile
} from './scr_log.js'

// converts rootname array to one of the specified type
// filters the result so that all values are unique
//
const getnamearrastype = (opts, rootnamearr, type) => rootnamearr
  .map(root => scr_file.setextn(root, type))
  .sort()
  .filter((root, i, arr) => i < 1 || root !== arr[i - 1])

// return rootname as a graph
const getasgraph = async (opts, rootpath) => (
  depgraph.graph.getfromseedfile(rootpath, opts))

const getfilenameasnode = async (opts, rootname) => {
  const filepath = getrootnameaspathextn(opts, rootname)
  const node = filepath && await depgraph.node.get_fromfilepath(filepath)

  if (!filepath)
    scr_logrootfilenotfound(opts, filepath)

  return node
}

const getrootnameaspath = (opts, rootname) => opts.jsextnarr.map(extn => (
  scr_file.setextn(path.join(opts.inputpath, rootname), extn)
)).find(scr_file.isexist)

// returns extn-sensitive rootname (less or css)
const getrootnameaspathextn = (opts, rootname) => {
  const extnarr = scr_opts.filenamesupportedcss(opts, rootname)
    ? opts.cssextnarr
    : opts.jsextnarr

  return extnarr.map(extn => (
    scr_file.setextn(path.join(opts.inputpath, rootname), extn)
  )).find(scr_file.isexist)
}

// return rootname as a graph deparr
const getasdeparr = async (opts, rootname) => {
  if (!/.js/.test(path.extname(rootname)))
    throw new Error('.js file required for deparr')

  let rootpath = getrootnameaspath(opts, rootname)
  if (!rootpath) {
    scr_logrootfilenotfound(opts, rootname)
    return null
  }

  const graph = await getasgraph(opts, rootpath)

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
const getrootarrasdeparr = async (opts, rootarr) => {
  const graphnamearr = getnamearrastype(opts, rootarr, '.js')
  const prependspecarr = opts.prependarr

  return (async function nextgraph (graphnamearr, x, graphsobj) {
    if (!x--) return graphsobj

    const deparr = await getasdeparr(opts, graphnamearr[x])
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

//
// obtains the map object created from 'js' roots
// constructs non-js root definitions derived from js roots
//
const getrootarrasobj = async (opts, rootarr) => {
  const jsdeparrobj = await getrootarrasdeparr(opts, rootarr)

  return (async function next (rootarr, x, len, jsdeparrobj, deparrobj) {
    if (x >= len) return deparrobj

    let rootname = rootarr[x],
        rootextn = path.extname(rootname),
        jsdeparr = jsdeparrobj[scr_file.setextn(rootname, '.js')]

    if (rootextn === '.js')
      deparrobj[rootname] = jsdeparrobj[rootname]

    if (rootextn === '.css') {
      const deparr = await scr_node
        .getarrastypearr(jsdeparr, opts.cssextnarr)

      deparrobj[rootname] = deparr
    }

    return next(rootarr, ++x, len, jsdeparrobj, deparrobj)
  }(rootarr, 0, rootarr.length, jsdeparrobj, {}))
}

// matches should be build and constructed ahead of this point,
// to be reused for write at basepage
const write = async (opts, rootname, graphobj) => new Promise((resolve, error) => {
  let rootextn = path.extname(rootname),
      graphname = scr_file.setextn(rootname, '.js'),
      deparr = graphobj[rootname],

      nodewrite = async (opts, node, rootname, content) => {
        let filepath = scr_node.getoutputpathreal(opts, node, rootname),
            rootextn = path.extname(rootname),
            fileextn =
              opts.jsextnarr.find(extn => extn === rootextn) ||
              opts.cssextnarr.find(extn => extn === rootextn) ||
              rootextn

        filepath = scr_file.setextn(filepath, fileextn)

        if (fileextn === '.js' && opts.issourcemap) {
          const [ , map ] = await scr_adapt.js({
            ...opts,
            sourcemap: true,
            sourceFileName: path.basename(filepath),
            iscompress: true,
            test: true
          }, node, content)

          await scr_file.write(opts, `${filepath}.map`, JSON.stringify(map, null, '  '))
          content = `//# sourceMappingURL=${path.basename(filepath)}.map\n${content}`
        }

        return scr_file.write(opts, filepath, content, true)
      }

  if (opts.isconcat) {
    (async function nextdep (dep, x, contentarr) {
      if (!x--) {
        resolve(await nodewrite(opts, dep[0], rootname, contentarr.join('\n')))
      }

      let adaptopts = {
        ...opts,
        issourcemap: false,
        iscompress: opts.issourcemap === false && opts.iscompress
      }

      const [ res ] = await scr_adapt(adaptopts, dep[x])

      scr_logrootjoinfile(
        adaptopts, graphname, rootextn, dep[x].get('filepath'), x, deparr.length
      )

      contentarr.push(res)
      nextdep(deparr, x, contentarr)
    }(deparr, deparr.length, []))
  } else {
    (async function nextdep (dep, x) {
      if (!x--) return resolve('success')

      const [ res ] = await scr_adapt(opts, dep[x])
      await nodewrite(opts, dep[x], rootname, res)

      return nextdep(dep, x)
    }(deparr, deparr.length))
  }
})

const writearr = async (opts, rootnamearr, graphobj) => {
  if (!rootnamearr.length)
    return null

  if (graphobj[rootnamearr[0]] && graphobj[rootnamearr[0]].length) {
    await scr_file.mkdirp(opts.outputpath)
    await write(opts, rootnamearr[0], graphobj)
  }

  return writearr(opts, rootnamearr.slice(1), graphobj)
}

export default {
  getnamearrastype,
  getasgraph,
  getfilenameasnode,
  getrootnameaspath,
  getrootnameaspathextn,
  getasdeparr,
  getrootarrasdeparr,
  getrootarrasobj,
  write,
  writearr
}
