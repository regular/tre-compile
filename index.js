const compile = require('./compile')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const defer = require('pull-defer')
const throughout = require('throughout')
const BufferList = require('bl')
const htmlInjectMeta = require('html-inject-meta')
const injectCSP = require('./inject-csp')

module.exports = function(filename, opts) {
  opts = opts || {}
  const ret = defer.source()
  compile(filename, (err, result) => {
    if (err) return ret.resolve(pull.error(err))
    const {body, sha} = result
    const bl = BufferList()
    bl.append(body)
    const tho = throughout(
      htmlInjectMeta(opts),
      injectCSP({csp: `script-src 'sha256-${sha}';`})
    )
    ret.resolve(toPull.source(tho))
    bl.pipe(tho)
  })
  return ret
}
