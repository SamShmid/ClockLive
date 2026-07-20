// ClockLive web server: serves the Expo web export (dist/) and a tasks API
// backed by SQLite (node:sqlite, built into Node 22.5+ — zero dependencies).
// Run: npm run web:build && npm run web:serve
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const DATA_DIR = join(ROOT, 'server', 'data');
const PORT = Number(process.env.PORT) || 3000;

await mkdir(DATA_DIR, { recursive: true });
const db = new DatabaseSync(join(DATA_DIR, 'clocklive.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_minutes INTEGER NOT NULL,
    end_minutes INTEGER NOT NULL,
    date TEXT,
    color TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0
  );
`);

const rowToTask = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  startMinutes: row.start_minutes,
  endMinutes: row.end_minutes,
  date: row.date ?? undefined,
  color: row.color,
  isCompleted: row.is_completed !== 0,
});

const listTasks = () =>
  db
    .prepare('SELECT * FROM tasks ORDER BY start_minutes, id')
    .all()
    .map(rowToTask);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
};

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

const newTaskId = () =>
  Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);

async function handleApi(req, res, url) {
  const completeMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);

  if (url.pathname === '/api/health') {
    return json(res, 200, { ok: true });
  }
  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    return json(res, 200, listTasks());
  }
  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    const input = await readBody(req);
    if (
      typeof input.name !== 'string' ||
      !Number.isInteger(input.startMinutes) ||
      !Number.isInteger(input.endMinutes) ||
      typeof input.color !== 'string'
    ) {
      return json(res, 400, { error: 'invalid task input' });
    }
    const task = {
      id: newTaskId(),
      name: input.name,
      description: typeof input.description === 'string' ? input.description : '',
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
      date: typeof input.date === 'string' ? input.date : null,
      color: input.color,
      isCompleted: false,
    };
    db.prepare(
      `INSERT INTO tasks (id, name, description, start_minutes, end_minutes, date, color, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    ).run(
      task.id,
      task.name,
      task.description,
      task.startMinutes,
      task.endMinutes,
      task.date,
      task.color
    );
    return json(res, 201, { ...task, date: task.date ?? undefined });
  }
  if (completeMatch && req.method === 'POST') {
    db.prepare('UPDATE tasks SET is_completed = 1 WHERE id = ?').run(
      completeMatch[1]
    );
    return json(res, 200, { ok: true });
  }
  if (url.pathname === '/api/tasks' && req.method === 'DELETE') {
    db.prepare('DELETE FROM tasks').run();
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'not found' });
}

async function serveStatic(res, pathname) {
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST, safePath);
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end();
  }
  if (!existsSync(filePath) || safePath === '/') {
    filePath = join(DIST, 'index.html'); // SPA fallback
  }
  try {
    const content = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(res, url.pathname);
    }
  } catch (err) {
    console.error(err);
    json(res, 500, { error: 'internal error' });
  }
}).listen(PORT, () => {
  console.log(`ClockLive server on http://localhost:${PORT} (db: ${join(DATA_DIR, 'clocklive.db')})`);
});
