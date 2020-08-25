const compile = require('./compile')
const addMeta = require('./add-meta')
const pull = require('pull-stream')
const defer = require('pull-defer')

module.exports = function(filename, opts) {
  opts = opts || {}
  const ret = defer.source()
  compile(filename, (err, result) => {
    if (err) return ret.resolve(pull.error(err))
    const {body, sha} = result
    ret.resolve(addMeta(body, sha, opts))
  })
  return ret
}

