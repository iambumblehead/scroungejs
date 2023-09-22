// Filename: scrounge_root.js
// Timestamp: 2018.04.09-21:49:20 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import path from 'path'
import depgraph from 'depgraph'

import scrounge_log from './scrounge_log.js'
import scrounge_file from './scrounge_file.js'
import scrounge_opts from './scrounge_opts.js'
import scrounge_node from './scrounge_node.js'
import scrounge_adapt from './scrounge_adapt.js'
import scrounge_prepend from './scrounge_prepend.js'

// converts rootname array to one of the specified type
// filters the result so that all values are unique
//
const getnamearrastype = (opts, rootnamearr, type) => rootnamearr
  .map(root => scrounge_file.setextn(root, type))
  .sort()
  .filter((root, i, arr) => i < 1 || root !== arr[i - 1])

// return rootname as a graph
const getasgraph = async (opts, rootpath) => (
  depgraph.graph.getfromseedfile(rootpath, opts))

const getfilenameasnode = async (opts, rootname) => {
  const filepath = getrootnameaspathextn(opts, rootname)
  const node = filepath && await depgraph.node.get_fromfilepath(filepath)

  if (!filepath)
    scrounge_log.rootfilenotfound(opts, filepath)

  return node
}

const getrootnameaspath = (opts, rootname) => opts.jsextnarr.map(extn => (
  scrounge_file.setextn(path.join(opts.inputpath, rootname), extn)
)).find(scrounge_file.isexist)

// returns extn-sensitive rootname (less or css)
const getrootnameaspathextn = (opts, rootname) => {
  const extnarr = scrounge_opts.filenamesupportedcss(opts, rootname)
    ? opts.cssextnarr
    : opts.jsextnarr

  return extnarr.map(extn => (
    scrounge_file.setextn(path.join(opts.inputpath, rootname), extn)
  )).find(scrounge_file.isexist)
}

// return rootname as a graph deparr
const getasdeparr = async (opts, rootname) => {
  if (!/.js/.test(path.extname(rootname)))
    throw new Error('.js file required for deparr')

  let rootpath = getrootnameaspath(opts, rootname)
  if (!rootpath) {
    scrounge_log.rootfilenotfound(opts, rootname)
    return null
  }

  const graph = await getasgraph(opts, rootpath)

  if (opts.treetype !== 'none')
    scrounge_log.printroot(
      opts, rootname, opts.treetype === 'small'
        ? depgraph.tree.getfromgraphsmall(graph)
        : depgraph.tree.getfromgraph(graph))

  return depgraph.graph.getdeparr(graph).reverse()
}

//
// returns a map object { treename : dependencyarr }
//
const getrootarrasdeparr = async (opts, rootarr) => {
  let graphnamearr = getnamearrastype(opts, rootarr, '.js')

  return (async function nextgraph (graphnamearr, x, graphsobj) {
    if (!x--) return graphsobj

    const deparr = await getasdeparr(opts, graphnamearr[x])
    const prenodearr = await scrounge_prepend
      .getprenodearr(opts, graphnamearr[x])

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
        jsdeparr = jsdeparrobj[scrounge_file.setextn(rootname, '.js')]

    if (rootextn === '.js')
      deparrobj[rootname] = jsdeparrobj[rootname]

    if (rootextn === '.css') {
      const deparr = await scrounge_node
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
      graphname = scrounge_file.setextn(rootname, '.js'),
      deparr = graphobj[rootname],

      nodewrite = async (opts, node, rootname, content, fn) => {
        let filepath = scrounge_node.getoutputpathreal(opts, node, rootname),
            rootextn = path.extname(rootname),
            fileextn =
            opts.jsextnarr.find(extn => extn === rootextn) ||
            opts.cssextnarr.find(extn => extn === rootextn) ||
            rootextn

        filepath = scrounge_file.setextn(filepath, fileextn)

        if (fileextn === '.js' && opts.issourcemap) {
          scrounge_adapt.js({
            ...opts,
            sourcemap: true,
            sourceFileName: path.basename(filepath),
            iscompress: true,
            test: true
          }, node, content, async (err, contenta, map) => {
            await scrounge_file.write(opts, `${filepath}.map`, JSON.stringify(map, null, '  '))
            content = `//# sourceMappingURL=${path.basename(filepath)}.map\n${content}`
            const res = await scrounge_file.write(opts, filepath, content, true)

            fn(null, res)
          })
        } else {
          const res = await scrounge_file.write(opts, filepath, content, true)

          fn(null, res)
        }
      }

  if (opts.isconcat) {
    (function nextdep (dep, x, contentarr) {
      if (!x--) return nodewrite(opts, dep[0], rootname, contentarr.join('\n'), (err, res) => {
        if (err) return error(err)

        resolve(res)
      })

      let adaptopts = {
        ...opts,
        issourcemap: false,
        iscompress: opts.issourcemap === false && opts.iscompress
      }

      scrounge_adapt(adaptopts, dep[x], (err, res) => {
        if (err) return error(err)

        scrounge_log.rootjoinfile(
          adaptopts, graphname, rootextn, dep[x].get('filepath'), x, deparr.length
        )

        contentarr.push(res)
        nextdep(deparr, x, contentarr)
      })
    }(deparr, deparr.length, []))
  } else {
    (function nextdep (dep, x) {
      if (!x--) return resolve('success')

      scrounge_adapt(opts, dep[x], (err, res) => {
        if (err) return error(err)

        nodewrite(opts, dep[x], rootname, res, err => {
          if (err) return error(err)

          nextdep(dep, x)
        })
      })
    }(deparr, deparr.length))
  }
})

const writearr = async (opts, rootnamearr, graphobj) => {
  if (!rootnamearr.length)
    return null

  if (graphobj[rootnamearr[0]] && graphobj[rootnamearr[0]].length) {
    await scrounge_file.mkdirp(opts.outputpath)
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
