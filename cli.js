//#! /usr/bin/env node

const fs = require('fs')
const pull = require('pull-stream')
const {stdout} = require('pull-stdio')
const minimist = require('minimist')
const pkgUp = require('pkg-up')
const compileSource = require('./')

const opts = minimist(process.argv.slice(2));
const filename = opts._[0]
if (!filename) {
  printUsageAndExit()
}

function execute(opts) {
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

if (opts.meta) {
  // input is specified:
  fs.readFile(opts.meta, processMeta)
} else if (opts.meta === false) {
  // --no-meta flag was deliberately passed:
  execute(applyOverrides({}, opts))
} else {
  // meta is not specified:
  pkgUp().then( pkgpath => {
    if (!pkgpath) printUsageAndExit()
    fs.readFile(pkgpath, processMetaFile)
  })
}

// -- adapted from html-inject-meta/cli.js 

function printUsageAndExit () {
  console.error('USAGE: tre-compile index.js [--no-meta] > webapp.html')
  process.exit(1)
}

function applyOverrides (data, opts) {
  data['html-inject-meta'] = data['html-inject-meta'] || data.metadataify || {};

  function setField (inField, outField) {
    if (!outField) {
      outField = inField;
    }
    const value = opts[inField]

    if (typeof value !== 'string') {
      return
    }

    data['html-inject-meta'][outField] = value
  }

  setField('description')
  setField('title', 'name')
  setField('author')
  setField('url')

  return data
}

function processMetaFile(err, data) {
  let parsedData

  if (err) {
    console.error(err)
    printUsageAndExit()
  }

  try {
    parsedData = JSON.parse(data)
  } catch (e) {
    console.error(e)
    printUsageAndExit()
  }
  execute(applyOverrides(parsedData, opts))
}
