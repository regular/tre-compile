const {spawn} = require('child_process')
const BufferList = require('bl');
const multicb = require('multicb')

module.exports = {workingDirIsClean, gitInfo, exec}

function exec(cmdline, opts, cb) {
  let [cmd, ...args] = cmdline.split(' ')
  if (cmd == 'git' && process.env.GIT_EXECUTABLE_PATH) {
    cmd = process.env.GIT_EXECUTABLE_PATH
  }
  const done = multicb({pluck: 1, spread: true})
  const git = spawn(cmd, args, opts)
  git.stdout.pipe(BufferList(done()))
  git.stderr.pipe(process.stderr)
  const cb2 = done()
  git.on('close', code=>{
    if (code !== 0) return cb2(new Error(`${cmd} excitied with code ${code}`), code)
    cb2(null)
  })

  done ((err, output, code)=>{
    if (err) return cb(err)
    cb(null, output.toString('utf-8'))
  })
}

async function workingDirIsClean(cwd) {
  return new Promise( (resolve, reject)=>{
    exec('git status --porcelain', {cwd}, (err, status) => {
      if (err) {
        err = new Error('git status failed: ' + err.message)
        return rejet(err)
      }
      if (status.replace(/\n/g,'').length) {
        return resolve(false)
      }
      resolve(true)
    })
  })
}

function gitInfo(cwd, cb) {
  return new Promise( (resolve, reject)=>{
    const done = multicb({pluck: 1, spread: true})

    exec('git describe --dirty --always', {cwd}, done())
    exec('git remote get-url origin', {cwd}, done())
    exec('git symbolic-ref --short HEAD', {cwd}, done())

    done( (err, ref, url, branch) => {
      if (err) return reject(err)
      resolve({
        commit: ref.replace(/\n/,''),
        repositoryUrl: url.replace(/\n/,''),
        repositoryBranch: branch.replace(/\n/,'')
      })
    })
  })
}

