// Filename: viewsall.js
// Timestamp: 2018.03.31-17:36:37 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)

import viewb from './viewb.mjs';
import viewa from './viewa.js';

let viewsall = {
  viewa,// : require('./viewa'),
  viewb
  //viewb : require('./viewb').default
};

console.log('viewb', viewsall.viewb);

const hello = () => 'hello'
const start = () => {
  viewsall.viewa.start();
  viewsall.viewb.start();
};

// mo-dule.exp-orts = {
export default {
  start,
  hello
};
