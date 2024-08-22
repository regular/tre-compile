const fs = require('fs')
const path = require('path')
const debug = require('debug')('findup')

module.exports = function findUp(root, cwd, filename) {
  if (!cwd.startsWith(root)) throw new Error('findup: cwd is not in root')
  return search(root, cwd, filename)
}

function search(root, cwd, filename) {
  if (!cwd.startsWith(root)) return false

  const candidate = path.join(cwd, filename)
  debug('Looking for %s, candiate: %s', filename, candidate)
  if (fs.existsSync(candidate)) {
    debug('Looking for %s, found at: %s', filename, candidate)
    return candidate
  }
  const segments  = cwd.split(path.sep)
  segments.pop()
  cwd = path.sep + path.join.apply(path, segments)
  debug('new cwd', cwd)
  return search(root, cwd, filename)
}
