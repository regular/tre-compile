const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const trumpet = require('trumpet')
const compile = require('../')
const test = require('tape')

test('generated HTML has correct manifest link', t=>{
  t.plan(1)

  const tr = trumpet()

  pull(
    compile(__dirname + '/fixtures/hello.js', {"html-inject-meta": {manifest: 'manimani'}}),
    pull.through(console.log),
    toPull.sink(tr, err=>{
      if (err) throw err
    })
  )

  tr.select('head > link', elem =>{
    console.log('XX')
    elem.getAttribute('href', href => {
      console.log('href', href)
      t.equal(href, "manimani")
    })
  })
})
