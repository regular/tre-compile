const test = require('tape')
const {exec} = require('../git-meta')

test('environment set by wrapper', t=>{
  exec('git', {}, (err, data)=>{
    t.notOk(err)
    t.equals(data, 'Hello, world!\n')
    t.end()
  })
})
