#!/usr/bin/env node

const fs = require('fs')
const {dirname, resolve} = require('path')
const pull = require('pull-stream')
const {stdout} = require('pull-stdio')
const minimist = require('minimist')
const pkgUp = require('pkg-up')
const compileSource = require('./')
const {workingDirIsClean, gitInfo} = require('./git-meta')

const argv = minimist(process.argv.slice(2))

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

if (argv.meta) {
  // input is specified:
  fs.readFile(argv.meta, processMetaFile)
} else if (argv.meta === false) {
  // --no-meta flag was deliberately passed:
  execute(applyOverrides({}, argv))
} else {
  // meta is not specified:
  pkgUp({cwd: dirname(filename)}).then( pkgpath => {
    if (!pkgpath) {
      console.error('No package.json found.')
      process.exit(1)
    }
    fs.readFile(pkgpath, processMetaFile)
  })
}

// -- adapted from html-inject-meta/cli.js 

function applyOverrides(data, opts) {
  data['html-inject-meta'] = data['html-inject-meta'] || data.metadataify || {};

  function setField (inField, outField) {
    if (!outField) {
      outField = inField;
    }
    const value = opts[inField]

    if (value == undefined) return

    if (!['string', 'number'].includes(typeof value) && !Array.isArray(value)) {
      console.error(`${inField} must be string, number or array`)
      process.exit(1)
    }

    data['html-inject-meta'][outField] = value
  }

  setField('description')
  setField('title', 'name')
  setField('author')
  setField('keywords')
  setField('url')

  return data
}

function processMetaFile(err, data) {
  let parsedData

  if (err) {
    console.error(err.message)
    process.exit(1)
  }

  try {
    parsedData = JSON.parse(data)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
  execute(applyOverrides(parsedData, argv))
}

function execute(opts) {
  const sourceFile = resolve(filename)
  console.error('source:', sourceFile)
  const repoPath = dirname(sourceFile)
  console.error('repository path:', repoPath)

  workingDirIsClean(repoPath, err=>{
    if (err && !argv.force) {
      console.error(err.message)
      process.exit(1)
    } else if (err) {
      console.error('Working directory is not clean -- forced to continue anyway')
    }
    gitInfo(repoPath, (err, info) =>{
      if (err) {
      console.error(err.message)
        process.exit(1)
      }
      compileToStdout(filename, Object.assign({}, opts, info))
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
