const scr_err_umdformatnotsupported = () => new Error(
  '[!!!] umd format no-longer supported')

const scr_err_nodetypenotfound = type => new Error(
  `type not found ${type}`)

const scr_err_basepageinnotfound = basepagein => new Error(
  `basepagein, file not found ${basepagein}`)

const scr_err_rootnamemusthavejsextn = rootname => new Error(
  `.js file required for deparr root name, ${rootname}`)

export {
  scr_err_umdformatnotsupported,
  scr_err_nodetypenotfound,
  scr_err_basepageinnotfound,
  scr_err_rootnamemusthavejsextn
}
