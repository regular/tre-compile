const hyperstream = require('hyperstream')

module.exports = htmlInjectCSP

function extractInputData(output, data) {
  const {csp, generator, keywords, repositoryUrl, repositoryBranch, commit, main} = data
  if (csp) {
    output['http-equiv']['Content-Security-Policy'] = csp
  }
  if (generator) {
    output.name.generator = generator
  }
  if (repositoryUrl) {
    output.name['tre:repository-url'] = repositoryUrl
  }
  if (repositoryBranch) {
    output.name['tre:repository-branch'] = repositoryBranch
  }
  if (commit) {
    output.name[`tre:commit`] = commit
  }
  if (main) {
    output.name[`tre:main`] = main
  }
  if (keywords) {
    const kws = Array.isArray(keywords) ? keywords.join(',') : `${keywords}`
    output.name.keywords = kws
  }
}

function extractMetadataifyData(output, data) {
  if (!data) return
  extractInputData(output, data)
}

function fieldsToChanges(fields) {
  const changes = {}
  const metaprops = 'name property http-equiv'.split(' ')
  let metaTagsContent = ''

  for (let metaprop of metaprops) {
    const props = fields[metaprop]

    for (let [name, value] of Object.entries(props)) {
      const n = crappilyEscapedEntities(name).replace('&colon;', ':')
      const v = crappilyEscapedEntities(value)
      metaTagsContent += `<meta ${metaprop}="${n}" content="${v}">\n`
    }
  }

  if (metaTagsContent.length > 0) {
    changes.head = {_appendHtml: metaTagsContent}
  }

  return changes
}

function htmlInjectCSP(data) {
  data = data || {}
  const fields = {name: {}, property: {}, link: {}, 'http-equiv': {} }
  fields.name.referrer = 'same-origin'

  extractInputData(fields, data)
  extractMetadataifyData(fields, data['html-inject-meta'])
  return hyperstream(fieldsToChanges(fields));
}

// -- util

function crappilyEscapedEntities (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

