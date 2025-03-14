module.exports = bin =>
  `${bin} MAINJS ` +
  '[--no-indexhtmlify] ' +
  '[--no-csp] ' +
  '[--no-meta] ' +
  '[--meta JSONFILE] ' +
  '[--meta-tag.NAME VALUE] ' +
  '[--keywords KEYWORD1,KEYWORD2,...] ' +
  '[--description DESC] ' +
  '[--title TITLE] ' +
  '[--author AUTHOR] ' +
  '[--manifest MANIFEST] ' +
  '[--theme-color CSSCOLOR] ' +
  '[--help]'
