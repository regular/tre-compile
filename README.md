tre-compile
---

Compile javascript to static web-executable (to a single HTML file)

## USAGE

``` bash
tre-compile index.js [options] > app.html
```

browserifies index.js and wraps it into minimal html, containing metadata taken from the package.json closest to index.js. (see [html-inject-meta](htps://npmjs.com/package/html-inject-meta) for details for options)

Also calculates the script tag's sha256 hash and puts it as Content-Security-Policy http-equiv meta tag into the html output. This tells browsers not to execute any other js on the page and guarantees the script tag's integrity.

NOTE: line endings (EOL) are normalized before the hash is calculated. That's also what browsers do! tre-compile calculates to correct hash even if the input contains Windows-style EOLs (CRLF) rahter than Unix-style (LF). Most other CSP-hashing modules get this wrong.

If the string `</script>` is encountered in the input (or in one of its (transitive) dependencies, it is replaced with `<\/script>` and a warning is displayed. This prevents the inline `<script>` tag from being closed early. Browsers do not prse JS while building the DOM, so they are not aware that a closing script tag is inside a JS string literal and therefore should not be considered part of the HTML input!

License: MIT
