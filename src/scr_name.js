import path from 'node:path'

// assumes that the name has an existing extension
const scr_name_with_extn = (name, extn) => (
  name.slice(0, -path.extname(name).length) + extn)

// eg, ('basename.html', 'suffix') => 'basename.suffix.html'
const scr_name_with_suffix_extn = (name, suffix) => (
  suffix = `.${suffix}${path.extname(name)}`,
  name.slice(0, -path.extname(name).length) + suffix)

const scr_name_list_unique = names => names.sort()
  .filter((name, i, arr) => i < 1 || name !== arr[i - 1])

const scr_name_is_extn = (name, extn) => (
  path.extname(name) === extn)

const scr_name_is_extn_list = (name, extnlist) => {
  const nameextn = path.extname(name)

  return extnlist.some(extn => nameextn === extn)
}

export {
  scr_name_with_extn,
  scr_name_with_suffix_extn,
  scr_name_list_unique,
  scr_name_is_extn,
  scr_name_is_extn_list
}
