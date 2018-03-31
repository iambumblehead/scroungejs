// Filename: scrounge_basepage.js
// Timestamp: 2018.03.31-13:26:52 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const scrounge_node = require('./scrounge_node'),
      scrounge_elem = require('./scrounge_elem'),
      scrounge_file = require('./scrounge_file');

module.exports = (o => {
  // each scrounge element may define _array_ of rootname
  // removes duplicates. flattens array. unoptimised.
  o.contentgetrootnamearr = content =>
    scrounge_elem.getelemarr(content).reduce((prev, cur) => (
      prev.concat(scrounge_elem.getrootarr(cur))
    ), []).sort().filter((val, i, arr) => (
      arr.slice(i + 1).indexOf(val) === -1
    ));

  o.getrootnamearr = (opts, filepath, fn) =>
    scrounge_file.read(opts, filepath, (err, content) => (
      fn(err, err || o.contentgetrootnamearr(content))
    ));

  // read basepage and udpdate single elem timestampe only
  o.writeelemone = (opts, filepath, elem, node, fn) => {
    scrounge_file.read(opts, filepath, (err, content) => {
      if (err) return fn(err);

      let scriptpath = scrounge_file
            .setpublicoutputpath(opts, node.get('filepath'), node.get('uid')),
          scriptsre = new RegExp(
            `${scriptpath.replace(/\.[^.]*$/, '')}.*(ts=[0-9]*)`, 'g'),
          newcontent = content.replace(scriptsre, (a, b) => (
            a.replace(b, `ts=${opts.buildts}`)));

      scrounge_file.write(opts, filepath, newcontent, fn);
    });
  };

  o.writeelemarr = (opts, filepath, elemarr, nodearrobj, fn) => {
    scrounge_file.read(opts, filepath, (err, content) => {
      if (err) return fn(err);

      let newcontent = scrounge_elem.getelemarr(content).reduce((content, elem) => {
        let indent = scrounge_elem.getindentation(elem);

        return content.replace(elem, scrounge_elem.getpopulated(
          elem, scrounge_elem.getrootarr(elem).filter(root => (
            // only operate on rootnames with an associated nodearr
            nodearrobj[root] && nodearrobj[root].length
          )).map(root => (
            // each node in the array returns ordered listing of elements
            scrounge_node.arrgetincludetagarr(opts, nodearrobj[root], root)
              .map(elem => indent + elem).join('\n')
          )).join('\n')
        ));
      }, content);


      newcontent = newcontent.replace(/:scrounge.version/gi, opts.version);

      scrounge_file.write(opts, filepath, newcontent, fn);
    });
  };

  return o;
})({});
