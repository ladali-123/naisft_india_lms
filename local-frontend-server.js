const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.FRONTEND_PORT || 5501);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.pdf':'application/pdf', '.ico':'image/x-icon' };

http.createServer((req, res) => {
  let requestUrl;
  let pathname;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  }
  catch { res.writeHead(400); return res.end('Bad request'); }
  const legacyDashboardRoute = pathname.match(/^\/student-dashboard\.html\/(dashboard|courses|documents|payments|certificate|identity-card)\/?$/);
  if (legacyDashboardRoute) {
    res.writeHead(301, { Location: `/student-dashboard/${legacyDashboardRoute[1]}${requestUrl.search}` });
    return res.end();
  }
  if (pathname === '/index.html' || pathname === '/home.html' || pathname.endsWith('.html')) {
    const cleanPath = pathname === '/index.html' || pathname === '/home.html' ? '/home' : pathname.slice(0, -5);
    res.writeHead(301, { Location: `${cleanPath}${requestUrl.search}` });
    return res.end();
  }
  if (pathname === '/' || pathname === '/home' || pathname === '/home/') pathname = '/index.html';
  else if (/^\/student-dashboard\/(dashboard|courses|documents|payments|certificate|identity-card)\/?$/.test(pathname)) pathname = '/student-dashboard.html';
  else if (!path.extname(pathname)) {
    const extensionlessFile = path.resolve(root, `.${pathname.replace(/\/$/, '')}.html`);
    if (extensionlessFile.startsWith(root) && fs.existsSync(extensionlessFile) && fs.statSync(extensionlessFile).isFile()) pathname = `${pathname.replace(/\/$/, '')}.html`;
  }
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`NAISFT frontend: http://127.0.0.1:${port}`));
