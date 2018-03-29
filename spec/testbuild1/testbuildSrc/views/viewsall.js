// Filename: viewsall.js
// Timestamp: 2018.03.29-00:48:28 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)

let viewsall = {
  viewa : require('./viewa'),
  viewb : require('./viewb')
};

// mo-dule.exp-orts = {
export default {
  start : () => {
    viewsall.viewa.start();
    viewsall.viewb.start();
  }
};
