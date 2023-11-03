module.exports = bin =>
`USAGE

  ${require('./usage')(bin)}

DESCRIPTION

  ${bin} bundles a javascript application using browserify, wraps it in a script tag and minimal html with a <head> tag containig meta data. The resulting html is written to STDOUT. Meta data by default is taken from the closest package.json file. An alternative JSON file can be provided, and indiviual meta fields can be specified on the command line. Use your app's package.json to add and configure any needed browserify transforms, such as brfs, bricons or browserify-swap.

  ${bin} calculates the sha-256 hash of the generated <script> tag and puts it into the html output as http-equiv meta tag, which should be parsed and enforced by browsers.

  MAINJS              name of the apps main javascript file (typically index.js)
  [--no-meta]         don't use meta data (author, title, description etc) from  package.json
  [--no-indexhtmlify] produce a javascript file instead of html, implies --no-meta 
  [--meta JSONFILE]   read meta data from JSONFILE instead of the package,json closest to MAINJS
  [--help]

META DATA OVERRIDES

  These options override any meta data fields provided by either package.json or JSONFILE

  [--keywords KEYWORDS]  comma-separated list of keywords to add to meta data
  [--description DESC]   adds or overrides description
  [--title TITLE]        adds or overrides title tag content
  [--author AUTHOR]      adds or overrides author field in meta data
  [--manifest MANIFEST]  adds or overrides manifest field in meta data
  [--theme-color CSSCOL] adds or overrides theme-color field in meta data

FILES

  Looks for pacage.json, either in the same directory as MAINJS or any directory above of MAINJS. package.json provides default meta data and the browserify configuration. See browserify and html-inject-meta on npm for details.
  
EXAMPLE

  ${bin} index.js --tutle Demo --keywords foo,bar > app.html
`
