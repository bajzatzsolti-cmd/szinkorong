// Egyszerű kiszolgáló a kész build (alapból a .play mappa) helyi hálózati kipróbálásához, naplózással.
// Használat:  node scripts/play-server.mjs [mappa] [port]
//
// Minden kérést kiír (idő, kérő gép címe, útvonal, böngésző), így látszik, hogy az iPad egyáltalán
// eléri-e a gépet. A kiszolgált index.html-be egy kis hibafigyelőt is beilleszt: ha a játék az iPaden
// hibára fut vagy nem jelenik meg, a hiba szövege megjelenik a képernyőn ÉS ebben a naplóban.
// (A hibafigyelő csak ebben a kiszolgálóban van, az éles buildben nincs.)
import http from 'node:http';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(projectRoot, process.argv[2] ?? '.play');
const port = Number(process.argv[3] ?? 5180);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
};

const REPORTER = `<script>
(function () {
  function send(kind, msg) {
    try {
      var x = new XMLHttpRequest();
      x.open('POST', '/__log?kind=' + kind, true);
      x.send(String(msg).slice(0, 1500));
    } catch (e) {}
  }
  function show(msg) {
    send('HIBA', msg);
    var d = document.createElement('pre');
    d.style.cssText = 'position:fixed;left:8px;top:8px;right:8px;z-index:99999;background:#fff;color:#b00020;padding:10px;font:14px monospace;white-space:pre-wrap;border-radius:8px';
    d.textContent = msg;
    (document.body || document.documentElement).appendChild(d);
  }
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) show('Nem toltodott be: ' + (t.src || t.href));
    else show('JS hiba: ' + e.message + ' @ ' + (e.filename || '?') + ':' + e.lineno + ':' + e.colno);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    show('Promise hiba: ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason));
  });
  send('INDUL', navigator.userAgent + ' | ' + innerWidth + 'x' + innerHeight + ' | dpr ' + devicePixelRatio);
  setTimeout(function () {
    var app = document.getElementById('app');
    var tiles = document.querySelectorAll('.tile').length;
    var r = app ? app.getBoundingClientRect() : null;
    var first = document.querySelector('.tile');
    var fr = first ? first.getBoundingClientRect() : null;
    send(app && app.children.length ? 'MEGJELENT' : 'URES',
      'csempek: ' + tiles + ' | #app: ' + (r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'nincs') +
      ' | elso csempe: ' + (fr ? Math.round(fr.left) + ',' + Math.round(fr.top) + ' ' + Math.round(fr.width) + 'x' + Math.round(fr.height) : 'nincs') +
      ' | ablak: ' + innerWidth + 'x' + innerHeight);
    if (!(app && app.children.length)) show('A jatek nem jelent meg (a #app ures).');
  }, 2500);
})();
</script>`;

// A napló a konzolra és a .play.log fájlba is megy.
const logFile = path.join(projectRoot, '.play.log');
const log = (line) => {
  console.log(line);
  appendFile(logFile, line + '\n').catch(() => undefined);
};

const stamp = () => new Date().toTimeString().slice(0, 8);
const shortUa = (ua = '') => {
  const os = /(iPad|iPhone|Macintosh|Windows|Android)[^)]*/.exec(ua)?.[0] ?? '';
  const ver = /Version\/([\d.]+)/.exec(ua)?.[1];
  return `${os}${ver ? ` Safari ${ver}` : ''}`.slice(0, 90) || ua.slice(0, 90);
};

const server = http.createServer(async (req, res) => {
  const ip = (req.socket.remoteAddress ?? '').replace('::ffff:', '');
  const url = new URL(req.url ?? '/', 'http://x');

  if (url.pathname === '/__log') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      log(`${stamp()} ${ip} >>> ${url.searchParams.get('kind')}: ${body}`);
      res.writeHead(204).end();
    });
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(root, '.' + rel);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    let data = await readFile(file);
    const ext = path.extname(file);
    if (ext === '.html') data = Buffer.from(data.toString('utf8').replace('<head>', '<head>' + REPORTER), 'utf8');
    res.writeHead(200, { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
    log(`${stamp()} ${ip} ${req.method} ${url.pathname} 200 ${ext === '.html' ? '| ' + shortUa(req.headers['user-agent']) : ''}`);
  } catch {
    res.writeHead(404).end('nincs ilyen fajl');
    log(`${stamp()} ${ip} ${req.method} ${url.pathname} 404`);
  }
});

server.listen(port, () => log(`Szinkorong kiszolgalo: ${root} -> http://<a gep IP-cime>:${port}/`));
