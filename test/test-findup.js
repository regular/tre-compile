const test = require('tape')
const findUp = require('../findup')
const {resolve} = require('path')

test('immediate', t=>{
  t.equal(
    findUp( resolve('..'), __dirname, 'test-findup.js'),
    __filename
  )
  t.equal(
    findUp( resolve('..'), __dirname, 'test-foobar.js'),
    false
  )
  t.end()
})

test('/', t=>{
  t.equal(
    findUp( '/', __dirname, 'etc'),
    '/etc'
  )
  t.equal(
    findUp( '/', __dirname, 'aisdfsaiddit'),
    false
  )
  t.end()
})
