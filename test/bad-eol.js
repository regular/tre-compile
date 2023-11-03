const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const trumpet = require('trumpet')
const compile = require('../')
const test = require('tape')

test('generated HTML has correct CSP meta tag', t=>{
  t.plan(1)

  const tr = trumpet()

  pull(
    compile(__dirname + '/fixtures/bad-eol.js'),
    toPull.sink(tr, err=>{
      if (err) throw err
    })
  )

  tr.select('head > meta[http-equiv=Content-Security-Policy]', elem =>{
    elem.getAttribute('content', content => {
      console.log('content', content)
      t.equal(content,"script-src 'sha256-YzlAbScHMChdMR7/3NX6ltYcKtFmD9E/6V5wP0uC5KY=' 'wasm-eval'; worker-src blob: data: 'self' 'wasm-eval'")
    })
  })
})
