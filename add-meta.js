const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const throughout = require('throughout')
const BufferList = require('bl')
const htmlInjectMeta = require('html-inject-meta')
const injectCSP = require('./inject-csp')
const pkg = require('./package.json')
const debug = require('debug')('add-meta')

module.exports = function addMeta(body, sha, opts) {
  opts = opts || {}
  const bl = BufferList()
  bl.append(body)
  debug('htmlInjectMeta opts', opts)
  const tho = throughout(
    htmlInjectMeta(opts),
    injectCSP(Object.assign({}, opts['html-inject-meta'] || {}, {
      csp: opts.insertCSP == false ? '' : `script-src 'sha256-${sha}' 'wasm-eval'; worker-src blob: data: 'self' 'wasm-eval'`,
      generator: `${pkg.name} ${pkg.version}`,
    }))
  )
  const ret = pull(
    toPull.source(tho),
    pull.map(b=>b.toString())
  )
  bl.pipe(tho)
  return ret
}
