const crypto = require('crypto')
const debug = require('debug')('tre-compile')
const Browserify = require('browserify')
const indexhtmlify = require('indexhtmlify')
const BufferList = require('bl')
const eolfix = require('eol-fix-stream')
const htmlInlineEscape = require('./html-inline-escape')

module.exports = function compile(filename, opts, cb) {
  if (typeof opts == 'function') {
    cb = opts
    opts = null
  }
  opts = opts || {}
  const makeDoc  = opts.indexhtmlify == false ? false : true
  debug('browserify opts: %o', opts)
  const browserify = Browserify(opts)
  browserify.transform(file => eolfix(), {global: true})
  browserify.add(filename)
  browserify.bundle()
  .pipe(BufferList( (err, buffer) => {
    if (err) {
      console.error(err.annotated)
      return cb(err)
    }
    if (makeDoc) {
      buffer = Buffer.from(htmlInlineEscape(buffer.toString()))
    }
    const bl_hash = BufferList()
    bl_hash.append(buffer)

    const hash = crypto.createHash('sha256')
    hash.update(bl_hash.slice())
    const sha = hash.digest('base64')
    debug('script hash is %s', sha)

    if (!makeDoc) {
      return cb(null, {sha, js: buffer})
    }
    
    const doc = BufferList()
    doc.append(buffer)
    doc.pipe(indexhtmlify())
    .pipe(BufferList( (err, buffer) => {
      if (err) {
        console.error(err.message)
        return cb(err)
      }
      cb(null, {sha, body: buffer})
    }))
  }))
}
