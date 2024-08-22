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
  debug('root="%s", cwd="%s"', root, cwd)
  if (root == cwd) return false

  const segments  = cwd.split(path.sep).slice(1)
  segments.pop()
  debug('segments %o', segments)
  cwd = path.sep + (segments.length ? path.join.apply(path, segments) : '')
  debug('new cwd', cwd)
  return search(root, cwd, filename)
}
