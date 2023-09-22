// Filename: scrounge_uid.js
// Timestamp: 2018.03.31-00:56:14 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

export default {
  sanitised: uid => uid
    .replace(/\.[^.]*$/, '') // remove extension from uid
    .replace(/-|\/|\\/gi, '_') // remove slash and dash
    .replace(/[^a-z0-9_]+/gi, '')
}
