// Filename: viewb.mjs
// Timestamp: 2018.03.31-14:12:45 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)

let viewb = {
  ctrlsall : require('../controls/ctrlsall')
};

export default {
  start : () => {
    viewb.ctrlsall.start();
  }
};
