const compile = require('./compile')
const addMeta = require('./add-meta')
const pull = require('pull-stream')
const defer = require('pull-defer')

module.exports = function(filename, opts) {
  opts = opts || {}
  const ret = defer.source()
  compile(filename, opts, (err, result) => {
    if (err) return ret.resolve(pull.error(err))
    const {body, js, sha} = result
    if (body) return ret.resolve(addMeta(body, sha, opts))
    ret.resolve(pull.values([
      `// script sha256 (this line excluded): ${sha}\n`,
      js
    ]))
  })
  return ret
}

