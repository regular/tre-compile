module.exports = bin =>
  `${bin} MAINJS ` +
  '[--no-indexhtmlify] ' +
  '[--no-meta] ' +
  '[--meta JSONFILE] ' +
  '[--keywords KEYWORD1,KEYWORD2,...] ' +
  '[--description DESC] ' +
  '[--title TITLE] ' +
  '[--author AUTHOR] ' +
  '[--help]'
