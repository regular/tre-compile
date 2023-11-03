#!/usr/bin/env node

const fs = require('fs')
const {dirname, resolve, relative} = require('path')
const pull = require('pull-stream')
const {stdout} = require('pull-stdio')
const minimist = require('minimist')
const pkgUp = require('pkg-up')
const compileSource = require('.')
const {workingDirIsClean, gitInfo} = require('./git-meta')
const debug = require('debug')('cli')

const argv = minimist(process.argv.slice(2))
debug('argv', argv)

async function main(argv) {
  if (argv._.length<1 || argv.help) {
    const bin = argv['run-by-tre-cli'] ? 'tre compile' : 'tre-compile'
    if (argv.help) {
      console.log(require('./help')(bin))
      process.exit(0)
    } else {
      console.error('Missing argument\nUsage: ' + require('./usage')(bin))
      process.exit(1)
    }
  }
  const filename = argv._[0]
  const metadata = applyOverrides(await getMetaData(filename, argv), argv)
  execute(filename, metadata, argv)
}

main(argv)

function execute(filename, metadata, argv) {
  const sourceFile = resolve(filename)
  //console.error('source:', sourceFile)
  const repoPath = dirname(sourceFile)
  console.error('repository path:', repoPath)
  const main = relative(repoPath, sourceFile)
  console.error('main:', main)

  workingDirIsClean(repoPath, err=>{
    if (err && !argv.force) {
      console.error(err.message)
      process.exit(1)
    } else if (err) {
      console.error('Working directory is not clean -- forced to continue anyway')
    }
    gitInfo(repoPath, (err, gitinfo) =>{
      if (err) {
        console.error(err.message)
        process.exit(1)
      }
      compileToStdout(filename, {
        "html-inject-meta": Object.assign({}, metadata, gitinfo),
        main,
        indexhtmlify: argv.indexhtmlify
      })
    })
  })
}

function compileToStdout(filename, opts) {
  pull(
    compileSource(filename, opts),
    stdout(err=>{
      if (err) {
        console.error(err.message)
        process.exit(1)
      }
    })
  )
}

// -- util

async function getMetaData(filename, argv) {
  if (argv.meta === false || argv.indexhtmlify == false) return {}
  const metafile = argv.meta || await pkgUp({cwd: dirname(filename)})
  return JSON.parse(fs.readFileSync(metafile))
}

function applyOverrides(pkg, argv) {
  pkg = Object.assign({}, pkg, pkg['html-inject-meta'] || pkg.metadataify || {})
  const metadata = {}

  function setField(inField, outField) {
    if (!outField) outField = inField
    const value = argv[inField] || pkg[inField]
    if (value == undefined) return
    if (!['string', 'number'].includes(typeof value) && !Array.isArray(value)) throw new Error(`${inField} must be string, number or array`)
    metadata[outField] = value
  }

  setField('description')
  setField('name')
  setField('author')
  setField('keywords')
  setField('base')
  setField('manifest')
  setField('url')

  return metadata
}

