#!/usr/bin/env node

const fs = require('fs')
const {dirname, resolve, relative} = require('path')
const pull = require('pull-stream')
const {stdout} = require('pull-stdio')
const minimist = require('minimist')
const findup = require('./findup')
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
  await execute(argv)
}

main(argv)

async function execute(argv) {
  const filename = argv._[0]
  const sourceFile = resolve(filename)
  debug('sourcefile', sourceFile)
  const sourceDir = dirname(sourceFile)
  debug('sourceDir', sourceDir)

  //console.error('source:', sourceFile)
  const dotGit = findup('/', sourceDir, '.git')
  let repoPath
  if (dotGit) {
    debug('Found .git at %s', dotGit)
    repoPath = dirname(dotGit)
    console.error('repository path:', repoPath)
  } else {
    console.error('Did not find .git')
    const packageJSON = findup('/', sourceDir, 'package.json')
    if (!packageJSON) {
      console.error('Neither .git nor package.json were found in any parent dir -- giving uo.')
      process.exit(1)
    }
    repoPath = dirname(packageJSON)
    console.error('assuming repository path (based on location of package.json):', repoPath)
  }
  const main = relative(repoPath, sourceFile)
  console.error('main:', main)

  const skipGit = argv.git == false
  if (skipGit) console.error('Will not use git.')

  const metadata = applyOverrides(getMetaData(sourceFile, argv), argv)
  debug('metadata: %O', metadata)

  const isClean = skipGit ? true : await workingDirIsClean(repoPath)
  
  if (!isClean) {
    if (!argv.force) {
      const msg = 
        `Working directory is not clean: ${repoPath}\n` +
        `Please commit and try again, or use --force.\n`
      console.error(msg)
      process.exit(1)
    } else {
      console.error('Working directory is not clean -- forced to continue anyway')
    }
  }

  const gitinfo = skipGit ? {} : await gitInfo(repoPath)
  compileToStdout(filename, {
    "html-inject-meta": Object.assign({}, metadata, gitinfo),
    main,
    indexhtmlify: argv.indexhtmlify,
    insertCSP: argv.csp,
    'meta-tag': argv['meta-tag']
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

function getMetaData(sourceFile, argv) {
  if (argv.meta === false || argv.indexhtmlify == false) return {}
  const metafile = argv.meta || findup('/', dirname(sourceFile), 'package.json')
  if (!metafile) return {}
  try {
    return JSON.parse(fs.readFileSync(metafile))
  } catch(err) {
    console.error(`Unable to read ${metafile}: ${err.message}`)
    process.exit(1)
  }
}
 
function applyOverrides(pkg, argv) {
  pkg = Object.assign({}, pkg, pkg['html-inject-meta'] || pkg.metadataify || {})
  const metadata = {}

  const fields = 'description name author keywords base manifest theme-color url'.split(' ')
  fields.forEach( name=>{
    const value = argv[name] !== undefined ? argv[name] : pkg[name]
    if (value !== undefined && !['string', 'number'].includes(typeof value) && !Array.isArray(value)) throw new Error(`${name} must be string, number or array`)
    metadata[name] = value
  })

  return metadata
}

