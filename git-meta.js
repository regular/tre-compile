const {exec} = require('child_process')
const multicb = require('multicb')

module.exports = {workingDirIsClean, gitInfo}

function workingDirIsClean(cwd, cb) {
  exec('git status --porcelain', {cwd}, (err, status) => {
    if (err) {
      err = new Error('git status failed: ' + err.message)
      return cb(err)
    }
    if (status.replace(/\n/g,''.length)) {
      const msg = 
        `Working directory is not clean: ${cwd}\n` +
        `${status}\n` +
        `Please commit and try again.\n`
      return cb(new Error(msg))
    }
    cb(null, true)
  })
}

function gitInfo(cwd, cb) {
  const done = multicb({pluck: 1, spread: true})

  exec('git describe --dirty --always', {cwd}, done())
  exec('git remote get-url origin', {cwd}, done())
  exec('git symbolic-ref --short HEAD', {cwd}, done())

  done( (err, ref, url, branch) => {
    if (err) return cb(err)
    cb(null, {
      commit: ref.replace(/\n/,''),
      repositoryUrl: url.replace(/\n/,''),
      repositoryBranch: branch.replace(/\n/,'')
    })
  })
}

