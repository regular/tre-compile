const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const throughout = require('throughout')
const BufferList = require('bl')
const htmlInjectMeta = require('html-inject-meta')
const injectCSP = require('./inject-csp')
const pkg = require('./package.json')

module.exports = function addMeta(body, sha, opts) {
  opts = opts || {}
  const bl = BufferList()
  bl.append(body)
  const tho = throughout(
    htmlInjectMeta(opts),
    injectCSP({
      repositoryUrl: opts.repositoryUrl,
      repositoryBranch: opts.repositoryBranch,
      commit: opts.commit,
      main: opts.main,
      csp: `style-src 'unsafe-inline' 'self'; font-src blob: 'self'; worker-src blob: 'self'; script-src 'sha256-${sha}'`,
      generator: `${pkg.name} ${pkg.version}`,
      keywords: opts['html-inject-meta'].keywords || opts.keywords
    })
  )
  const ret = pull(
    toPull.source(tho),
    pull.map(b=>b.toString())
  )
  bl.pipe(tho)
  return ret
}
