const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const trumpet = require('trumpet')
const compile = require('../')
const test = require('tape')

test('generated HTML has correct CSP meta tag', t=>{
  t.plan(1)

  const tr = trumpet()

  pull(
    compile(__dirname + '/fixtures/hello.js'),
    toPull.sink(tr, err=>{
      if (err) throw err
    })
  )

  tr.select('head > meta[http-equiv=Content-Security-Policy]', elem =>{
    elem.getAttribute('content', content => {
      console.log('content', content)
      t.equal(content, "script-src 'sha256-CUw8HveZ/Ul1RlVYNFUk8BlVufRthQdGgoSP/WMYY9o=';")
    })
  })
})
