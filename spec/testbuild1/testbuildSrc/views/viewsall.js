// Filename: viewsall.js
// Timestamp: 2018.03.30-01:00:11 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)



let viewsall = {
  viewa : require('./viewa'),
  viewb : require('./viewb')
};

const hello = () => 'hello',
      start = () => {
        viewsall.viewa.start();
        viewsall.viewb.start();
      };

// mo-dule.exp-orts = {
export default {
  start,
  hello
};
