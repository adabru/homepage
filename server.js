http = require('http')
fs = require('fs')
path = require('path')
url = require('url')

port = process.argv[2] || 8080

const CONTENTTYPES = {
  '.css': 'text/css',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.jpg': 'image/jpg',
  '.js': 'application/javascript',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.styl': 'text/css',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
}

let server = http.createServer((req, res) => {
  try {
    if (req.url != path.normalize(req.url)) {
      res.writeHead(400)
      res.end('invalid path')
    } else {
      if (req.url.endsWith('/')) req.url += 'index.txt'
      var pathname = url.parse(req.url).pathname
      fs.createReadStream(`.${pathname}`)
        .on('error', () => {
          res.writeHead(404)
          res.end('not found')
        })
        .on('open', () => {
          // 'Content-Type': 'text/html; charset=utf-8'
          res.writeHead(200, { 'Content-Type': CONTENTTYPES[path.extname(pathname)] || 'text/plain' })
        })
        .pipe(res)
    }
  } catch (e) {
    console.error(e)
    try {
      if (!res.headersSent) res.writeHead(500)
      res.end('server error\n')
    } catch (e) {}
  }
})

server.on('error', (e) => {
  console.log('An error occured while serving: ' + e)
  server.close()
  setTimeout(() => {
    server.listen(config.port, config.host)
  }, 1000)
})

process.on('SIGINT', function () {
  try {
    server.close()
    console.log('server interrupted with ^C')
    process.exit()
  } catch (e) {}
})

server.listen(port, '::1', () => console.log(`Server running at http://::1:${port}/`))
