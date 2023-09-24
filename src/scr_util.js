const scr_util_uidflat = uid => uid
  .replace(/\.[^.]*$/, '') // remove extension from uid
  .replace(/-|\/|\\/gi, '_') // remove slash and dash
  .replace(/[^a-z0-9_]+/gi, '')

export {
  scr_util_uidflat
}
