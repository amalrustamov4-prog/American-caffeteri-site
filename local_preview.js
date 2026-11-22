/**
 * American Caffetteria — Local Preview & Real-Time POS Server
 * Port: 3456 (Default)
 *
 * Features:
 * - Safe buffered proxy to Python backend (http://127.0.0.1:8080) without losing POST body stream
 * - Full Standalone Real-Time Engine (when bot.py on 8080 is offline):
 *   Supports all 9 endpoints (/api/admin/login, /api/orders, /api/orders/:id/status,
 *   /api/reservations, /api/stoplist, /api/admin/stats, /api/stream & /api/admin/stream SSE)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT || '3456', 10);
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '8080', 10);
const ROOT_DIR = __dirname;

try {
  const envPath = fs.existsSync(path.join(ROOT_DIR, 'telegram_bot', '.env'))
    ? path.join(ROOT_DIR, 'telegram_bot', '.env')
    : path.join(ROOT_DIR, '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of envLines) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim();
      }
    }
  }
} catch (_) {}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.apk': 'application/vnd.android.package-archive',
};

const PROMO_CODES = {
  AMERICAN10: 0.10,
  HALAL5: 0.05,
  SUPER2026: 0.15,
  BLEST10: 0.10,
};

const sseClients = new Set();
let mockOrders = [];
let mockReservations = [];
let mockCashOps = [];
let mockStoplist = new Set();
let nextOrderId = 15;
let nextReservationId = 4;

function broadcastSSE(eventName, payloadObj) {
  const msg = `event: ${eventName}\ndata: ${JSON.stringify(payloadObj)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(msg);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Keepalive ping every 15s for all SSE clients
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 15000).unref();

function collectRequestBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    let totalLen = 0;
    const MAX_SIZE = 65536;
    req.on('data', (chunk) => {
      totalLen += chunk.length;
      if (totalLen <= MAX_SIZE) {
        chunks.push(chunk);
      } else {
        req.destroy(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => resolve(Buffer.alloc(0)));
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const origin = req.headers.origin || '';
  const isAllowedOrigin = /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?|http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?|http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?|capacitor:\/\/localhost|https?:\/\/([a-zA-Z0-9-]+\.)*telegram\.org)$/.test(origin);
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org;");
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname.startsWith('/api/')) {
    const bodyBuffer = await collectRequestBody(req);

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${BACKEND_PORT}`,
          'content-length': bodyBuffer.length,
        },
      },
      (proxyRes) => {
        if (proxyRes.statusCode === 404 || proxyRes.statusCode >= 502) {
          proxyRes.resume();
          handleStandaloneApi(pathname, req, res, bodyBuffer.toString('utf-8'));
          return;
        }
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => {
      handleStandaloneApi(pathname, req, res, bodyBuffer.toString('utf-8'));
    });

    if (bodyBuffer.length > 0) {
      proxyReq.write(bodyBuffer);
    }
    proxyReq.end();
    return;
  }

  // Static File Serving with Security Filter
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relativePath === 'admin') relativePath = 'admin.html';

  const relLower = relativePath.toLowerCase();
  const isBlockedStatic =
    relLower.startsWith('.') ||
    relLower.includes('/.') ||
    relLower.startsWith('telegram_bot/') ||
    relLower.startsWith('android/') ||
    relLower.startsWith('tests/') ||
    relLower.startsWith('api/') ||
    /\.(env|py|pyc|db|db-wal|db-shm|bat|sh|md|apk|log)$/i.test(relLower);

  if (isBlockedStatic) {
    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'Forbidden' }));
    return;
  }

  let filePath = path.join(ROOT_DIR, relativePath);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const wwwPath = path.join(ROOT_DIR, 'www', relativePath);
      if (fs.existsSync(wwwPath) && fs.statSync(wwwPath).isFile()) {
        filePath = wwwPath;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found — American Caffetteria');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

function handleStandaloneApi(pathname, req, res, rawBody) {
  let body = {};
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch (_) {}
  }

  const parsedReqUrl = url.parse(req.url, true);
  const queryToken = String((parsedReqUrl.query && parsedReqUrl.query.token) || '');
  const authHeader = req.headers.authorization || '';
  const cookieHeader = req.headers.cookie || '';
  const isAdminAuthed =
    authHeader.startsWith('Bearer ac_jwt_') ||
    cookieHeader.includes('ac_admin_session=ac_jwt_') ||
    queryToken.startsWith('ac_jwt_');

  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const pin = String(body.pin || '').trim();
    let user = 'admin';
    let role = 'admin';

    const STAFF_PINS = {
      '7777': { role: 'admin', name: 'Egasi (Admin)' },
      '1111': { role: 'cashier', name: 'Kassir' },
      '2222': { role: 'waiter', name: 'Ofitsiant' },
      '3333': { role: 'kitchen', name: 'Oshpaz' },
      '4444': { role: 'courier', name: 'Kuryer' },
    };

    if (pin) {
      if (STAFF_PINS[pin]) {
        role = STAFF_PINS[pin].role;
        user = STAFF_PINS[pin].name;
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: "Noto'g'ri PIN-kod" }));
        return;
      }
    } else {
      user = String(body.username || 'admin').trim();
      const pass = String(body.password || '').trim();
      const expectedPass = process.env.ADMIN_PASSWORD || 'admin123!';
      if (!pass || (pass !== expectedPass && pass !== 'admin123!' && pass !== 'admin')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Parol xato / Неверный пароль' }));
        return;
      }
      role = 'admin';
    }

    const token = 'ac_jwt_' + Buffer.from(`${role}:${user}:${Date.now()}`).toString('base64');
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': `ac_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax`,
    });
    res.end(JSON.stringify({ ok: true, username: user, role, token }));
    return;
  }

  if (pathname === '/api/admin/logout') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === '/api/admin/me') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, authenticated: false }));
      return;
    }
    let role = 'admin';
    let user = 'admin';
    const authH = req.headers.authorization || '';
    const cookH = req.headers.cookie || '';
    let rawTok = authH.startsWith('Bearer ac_jwt_') ? authH.slice(14) : '';
    if (!rawTok && cookH.includes('ac_admin_session=ac_jwt_')) {
      const m = cookH.match(/ac_admin_session=ac_jwt_([^;]+)/);
      if (m) rawTok = m[1];
    }
    if (rawTok) {
      try {
        const decoded = Buffer.from(rawTok, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length >= 2) {
          role = parts[0];
          user = parts[1];
        }
      } catch (_) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, authenticated: true, username: user, role }));
    return;
  }

  if (pathname === '/api/admin/backup') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const isDownload = parsedReqUrl.query && parsedReqUrl.query.download === '1';
    let dbPath = path.join(__dirname, 'telegram_bot', 'cafe_bot.db');
    if (!fs.existsSync(dbPath)) {
      dbPath = path.join(__dirname, 'cafe_bot.db');
    }
    if (isDownload && fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      res.writeHead(200, {
        'Content-Type': 'application/x-sqlite3',
        'Content-Length': stats.size,
        'Content-Disposition': `attachment; filename="cafe_bot_${Date.now()}.db"`,
      });
      fs.createReadStream(dbPath).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: 'Baza zaxira nusxasi yaratildi (Preview)' }));
    return;
  }

  if (pathname === '/api/admin/stream') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
    });
    res.write('event: connected\ndata: {"ok": true, "mode": "admin_sse"}\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (pathname === '/api/stream' || pathname === '/api/orders/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
    });
    res.write('event: connected\ndata: {"ok": true, "mode": "public_sse"}\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    const appendId = body.append_to_order_id;
    if (appendId) {
      if (!isAdminAuthed) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: "Faqat xodimlar to'g'ridan-to'g'ri buyurtma ID bo'yicha taom qo'shishi mumkin" }));
        return;
      }
      let target = mockOrders.find((o) => o.id === Number(appendId));
      if (target) {
        if (target.status === 'completed' || target.status === 'cancelled') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: "Yopilgan yoki bekor qilingan buyurtmaga taom qo'shib bo'lmaydi" }));
          return;
        }
        const newItems = Array.isArray(body.items) ? body.items : [];
        target.items = [...target.items, ...newItems];
        target.subtotal = target.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
        const disc = Number(target.discount || 0);
        const afterDisc = Math.max(0, target.subtotal - disc);
        const sfPercent = Number(target.service_fee_percent || (target.delivery_type === 'dine_in' ? 10 : 0));
        target.service_fee_percent = sfPercent;
        target.service_fee = Math.round(afterDisc * (sfPercent / 100));
        target.total = afterDisc + target.service_fee + Number(target.delivery_fee || 0);
        target.total_amount = target.total;
        target.kitchen_status = 'cooking';
        target.updated_at_utc = new Date().toISOString();
        broadcastSSE('order_updated', { order: target, new_items: newItems });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, order: target, duplicate: false }));
        return;
      }
    }

    if (body.append_if_active && body.delivery_type === 'dine_in') {
      const comm = String(body.comment || '');
      const targetTable = (comm.match(/Stol:\s*([^\n,]+)/i) || [])[1];
      const ph = String(body.phone || '').trim();
      let activeOrder = mockOrders.find((o) => {
        if (o.delivery_type !== 'dine_in') return false;
        if (['completed', 'cancelled'].includes(o.status)) return false;
        if (targetTable && String(o.comment || '').includes(targetTable)) return true;
        if (ph && o.phone === ph) return true;
        return false;
      });
      if (activeOrder) {
        const newItems = Array.isArray(body.items) ? body.items : [];
        activeOrder.items = [...activeOrder.items, ...newItems];
        activeOrder.subtotal = activeOrder.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
        const disc = Number(activeOrder.discount || 0);
        const afterDisc = Math.max(0, activeOrder.subtotal - disc);
        const sfPercent = Number(activeOrder.service_fee_percent || 10);
        activeOrder.service_fee_percent = sfPercent;
        activeOrder.service_fee = Math.round(afterDisc * (sfPercent / 100));
        activeOrder.total = afterDisc + activeOrder.service_fee + Number(activeOrder.delivery_fee || 0);
        activeOrder.total_amount = activeOrder.total;
        activeOrder.kitchen_status = 'cooking';
        activeOrder.updated_at_utc = new Date().toISOString();
        broadcastSSE('order_updated', { order: activeOrder, new_items: newItems });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, order: activeOrder, duplicate: false, appended: true }));
        return;
      }
    }

    const id = nextOrderId++;
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0) || Number(body.subtotal || body.totalAmount || 50000);
    const promoCode = String(body.promo_code || '').trim().toUpperCase();
    const rate = PROMO_CODES[promoCode] || 0;
    const discount = rate > 0 ? Math.round(subtotal * rate) : Number(body.discount || 0);
    const afterDisc = Math.max(0, subtotal - discount);
    const delivType = String(body.delivery_type || 'delivery').toLowerCase();
    const serviceFeePercent = delivType === 'dine_in' ? 10 : 0;
    const serviceFee = Math.round(afterDisc * (serviceFeePercent / 100));
    const delivFee = delivType === 'delivery' ? (afterDisc >= 100000 ? 0 : 10000) : 0;
    const total = afterDisc + serviceFee + delivFee;
    const nowUtc = new Date().toISOString();
    const rawPayMethod = String(body.payment_method || 'cash').trim().toLowerCase();
    let paymentMethod = 'cash';
    if (rawPayMethod === 'click' || rawPayMethod === 'payme' || rawPayMethod === 'online') {
      paymentMethod = 'online';
    } else if (rawPayMethod === 'card_terminal') {
      paymentMethod = 'card_terminal';
    } else if (['card', 'terminal', 'humo', 'uzcard'].includes(rawPayMethod)) {
      paymentMethod = 'card';
    } else if (['unpaid', 'postpaid', 'exit', 'chiqishda'].includes(rawPayMethod) || (delivType === 'dine_in' && rawPayMethod !== 'cash')) {
      paymentMethod = 'unpaid';
    } else if (delivType === 'dine_in') {
      paymentMethod = rawPayMethod === 'cash' && body.source === 'kassa' && body.payment_status === 'paid' ? 'cash' : 'unpaid';
    }

    let payStatus = (paymentMethod === 'unpaid') ? 'pending' : (String(body.payment_status || 'pending').toLowerCase());
    let orderStatus = body.status || (delivType === 'dine_in' && body.source === 'kassa' ? 'cooking' : 'new');

    if (!isAdminAuthed) {
      payStatus = 'pending';
      orderStatus = 'new';
    }

    const order = {
      id,
      order_code: `#AC-${1000 + id}`,
      customer_name: body.customer_name || body.name || 'Mijoz',
      phone: body.phone || '+998908220101',
      delivery_type: delivType,
      delivery_type_label: delivType === 'pickup' ? 'Olib ketish' : (delivType === 'dine_in' ? 'Zalda' : 'Yetkazib berish'),
      address: body.address || '',
      comment: body.comment || '',
      payment_method: paymentMethod,
      payment_status: payStatus,
      source: body.source || 'web',
      items,
      subtotal,
      discount,
      promo_code: promoCode,
      service_fee_percent: serviceFeePercent,
      service_fee: serviceFee,
      delivery_fee: delivFee,
      total,
      total_amount: total,
      status: orderStatus,
      waiter_name: body.waiter_name || '',
      kitchen_status: body.kitchen_status || (delivType === 'dine_in' && body.source === 'kassa' ? 'cooking' : 'waiting'),
      delivery_mode: body.delivery_mode || 'own_courier',
      courier_name: body.courier_name || '',
      courier_phone: body.courier_phone || '',
      courier_paid_upfront: body.courier_paid_upfront ? 1 : 0,
      cancel_reason: '',
      created_at_utc: nowUtc,
      updated_at_utc: nowUtc,
    };

    mockOrders.unshift(order);
    broadcastSSE('new_order', { order });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, order }));
    return;
  }

  const orderAppendMatch = pathname.match(/^\/api\/(?:admin\/)?orders\/(\d+)\/append$/);
  if (orderAppendMatch && req.method === 'POST') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const ordId = parseInt(orderAppendMatch[1], 10);
    let target = mockOrders.find((o) => o.id === ordId);
    if (!target) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Buyurtma topilmadi' }));
      return;
    }
    if (target.status === 'completed' || target.status === 'cancelled') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: "Yopilgan yoki bekor qilingan buyurtmaga taom qo'shib bo'lmaydi" }));
      return;
    }
    const newItems = Array.isArray(body.items) ? body.items : [];
    target.items = [...target.items, ...newItems];
    target.subtotal = target.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
    const disc = Number(target.discount || 0);
    const afterDisc = Math.max(0, target.subtotal - disc);
    const sfPercent = Number(target.service_fee_percent || (target.delivery_type === 'dine_in' ? 10 : 0));
    target.service_fee_percent = sfPercent;
    target.service_fee = Math.round(afterDisc * (sfPercent / 100));
    target.total = afterDisc + target.service_fee + Number(target.delivery_fee || 0);
    target.total_amount = target.total;
    target.kitchen_status = 'cooking';
    target.updated_at_utc = new Date().toISOString();
    broadcastSSE('order_updated', { order: target, new_items: newItems });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, order: target, added_items: newItems }));
    return;
  }

  const orderPayMatch = pathname.match(/^\/api\/(?:admin\/)?orders\/(\d+)\/pay$/);
  if (orderPayMatch && req.method === 'POST') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const ordId = parseInt(orderPayMatch[1], 10);
    let target = mockOrders.find((o) => o.id === ordId);
    if (!target) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Buyurtma topilmadi' }));
      return;
    }
    if (target.status === 'cancelled') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: "Bekor qilingan buyurtma to'lanmaydi" }));
      return;
    }
    if (target.payment_status === 'paid') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, order: target, already_paid: true }));
      return;
    }
    const payM = String(body.payment_method || 'cash').toLowerCase();
    target.payment_status = 'paid';
    target.payment_method = payM === 'card_terminal' ? 'card_terminal' : (['card', 'terminal', 'humo'].includes(payM) ? 'card' : (['online', 'click', 'payme'].includes(payM) ? 'online' : 'cash'));
    target.status = 'completed';
    target.updated_at_utc = new Date().toISOString();
    broadcastSSE('order_updated', { order: target });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, order: target }));
    return;
  }

  if ((pathname === '/api/orders' || pathname === '/api/admin/orders') && req.method === 'GET') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, orders: mockOrders }));
    return;
  }

  const orderStatusMatch = pathname.match(/^\/api\/(?:admin\/)?orders\/(\d+)(?:\/status)?$/);
  if (orderStatusMatch && req.method === 'PATCH') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const ordId = parseInt(orderStatusMatch[1], 10);
    let target = mockOrders.find((o) => o.id === ordId);
    if (!target) {
      target = {
        id: ordId,
        order_code: `#AC-${1000 + ordId}`,
        customer_name: 'Mijoz',
        phone: '+998908220101',
        delivery_type: 'dine_in',
        items: [],
        subtotal: 49000,
        total: 49000,
        total_amount: 49000,
        status: body.status || 'cooking',
        created_at_utc: new Date().toISOString(),
      };
      mockOrders.unshift(target);
    }
    if (body.payment_status) target.payment_status = String(body.payment_status).toLowerCase();
    if (body.payment_method) {
      const pm = String(body.payment_method).toLowerCase();
      target.payment_method = pm === 'card_terminal' ? 'card_terminal' : (['card', 'terminal', 'humo'].includes(pm) ? 'card' : (['online', 'click', 'payme'].includes(pm) ? 'online' : (pm === 'unpaid' ? 'unpaid' : 'cash')));
    }
    if (body.kitchen_status) target.kitchen_status = String(body.kitchen_status).toLowerCase();
    if (body.delivery_mode) target.delivery_mode = String(body.delivery_mode);
    if (body.courier_name !== undefined) target.courier_name = String(body.courier_name);
    if (body.courier_phone !== undefined) target.courier_phone = String(body.courier_phone);
    if (body.courier_paid_upfront !== undefined) target.courier_paid_upfront = body.courier_paid_upfront ? 1 : 0;
    if (body.cancel_reason !== undefined) target.cancel_reason = String(body.cancel_reason);
    if (body.delivery_mode === 'external_buyout' && target.courier_paid_upfront) {
      target.payment_status = 'paid';
      target.payment_method = 'cash';
    }
    if (body.status) {
      target.status = String(body.status).toLowerCase();
    } else if (body.payment_status === 'paid' && target.status !== 'delivering') {
      target.status = 'completed';
    }
    target.updated_at_utc = new Date().toISOString();
    broadcastSSE('order_updated', { order: target });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, order: target }));
    return;
  }

  if (pathname === '/api/reservations' && req.method === 'POST') {
    const id = nextReservationId++;
    const resObj = {
      id,
      customer_name: body.customer_name || body.name || 'Mehmon',
      phone: body.phone || '+998908220101',
      table_name: body.table_name || body.table || 'VIP 1 Oila',
      hall: body.hall || 'VIP Xona',
      guests: Number(body.guests || 4),
      res_date: body.res_date || body.date || new Date().toISOString().slice(0, 10),
      res_time: body.res_time || body.time || '19:00',
      comment: body.comment || '',
      status: 'new',
      created_at_utc: new Date().toISOString(),
    };
    mockReservations.unshift(resObj);
    broadcastSSE('new_reservation', { reservation: resObj });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, reservation: resObj }));
    return;
  }

  if (pathname === '/api/reservations' && req.method === 'GET') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, reservations: mockReservations }));
    return;
  }

  const resStatusMatch = pathname.match(/^\/api\/reservations\/(\d+)\/status$/);
  if (resStatusMatch && req.method === 'PATCH') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const rId = parseInt(resStatusMatch[1], 10);
    const st = String(body.status || 'confirmed').toLowerCase();
    let rObj = mockReservations.find((r) => r.id === rId);
    if (!rObj) {
      rObj = { id: rId, customer_name: 'Mehmon', phone: '+998908220101', table_name: '1-Stol', hall: 'Asosiy Zal', guests: 4, status: st };
      mockReservations.unshift(rObj);
    } else {
      rObj.status = st;
    }
    broadcastSSE('reservation_updated', { reservation: rObj });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, reservation: rObj }));
    return;
  }

  if (pathname === '/api/stoplist' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, stoplist: Array.from(mockStoplist) }));
    return;
  }

  if (pathname === '/api/stoplist' && req.method === 'POST') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const itemId = String(body.item_id || '').trim();
    let stopped = false;
    if (itemId) {
      if (body.stopped === true || (body.stopped === undefined && !mockStoplist.has(itemId))) {
        mockStoplist.add(itemId);
        stopped = true;
      } else {
        mockStoplist.delete(itemId);
        stopped = false;
      }
    }
    const list = Array.from(mockStoplist);
    broadcastSSE('stoplist_updated', { stoplist: list, item_id: itemId, stopped });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, item_id: itemId, stopped, stoplist: list }));
    return;
  }

  if (pathname === '/api/admin/cash-operations' && req.method === 'GET') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, operations: mockCashOps, shift_date: new Date().toISOString().slice(0, 10) }));
    return;
  }

  if (pathname === '/api/admin/cash-operations' && req.method === 'POST') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    const op = {
      id: mockCashOps.length + 1,
      shift_date: new Date().toISOString().slice(0, 10),
      op_type: String(body.type || body.op_type || 'cash_in'),
      amount: Number(body.amount || 0),
      reason: String(body.reason || ''),
      operator: String(body.operator || 'admin'),
      created_at_utc: new Date().toISOString(),
    };
    mockCashOps.unshift(op);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, operation: op }));
    return;
  }

  if (pathname === '/api/orders/status' && req.method === 'GET') {
    const rawIds = String((parsedReqUrl.query && parsedReqUrl.query.ids) || '');
    const idList = rawIds.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x)).slice(0, 20);
    const result = mockOrders
      .filter(o => idList.includes(o.id))
      .map(o => ({
        id: o.id,
        order_code: o.order_code,
        status: o.status,
        status_label: o.status === 'cooking' ? 'Oshxonada' : (o.status === 'delivering' ? 'Kuryerda' : (o.status === 'completed' ? 'Yetkazildi' : 'Qabul qilindi')),
        delivery_type: o.delivery_type || 'delivery',
        total: o.total || o.total_amount || 0,
        created_at_utc: o.created_at_utc || '',
        updated_at_utc: o.updated_at_utc || '',
      }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, orders: result }));
    return;
  }

  if (pathname === '/api/admin/stats') {
    if (!isAdminAuthed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Avtorizatsiya talab qilinadi' }));
      return;
    }
    let totalRev = 0, cashRev = 0, cardRev = 0, onlineRev = 0, validCount = 0;
    let unpaidOpenTablesCount = 0, unpaidOpenTablesRevenue = 0;
    const statusCounts = { new: 0, preparing: 0, cooking: 0, delivering: 0, completed: 0, cancelled: 0 };
    const dishMap = {};
    const waiterMap = {};

    mockOrders.forEach((o) => {
      const st = String(o.status || 'new').toLowerCase();
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      const tot = Number(o.total_amount || o.total || 0);
      const isPaid = String(o.payment_status || '').toLowerCase() === 'paid';

      if (o.delivery_type === 'dine_in' && !isPaid && !['completed', 'cancelled'].includes(st)) {
        unpaidOpenTablesCount++;
        unpaidOpenTablesRevenue += tot;
      }

      if (st !== 'cancelled' && isPaid) {
        totalRev += tot;
        validCount++;
        const payM = String(o.payment_method || '').toLowerCase();
        const comm = String(o.comment || '').toLowerCase();
        if (payM === 'card' || payM === 'card_terminal' || comm.includes('card') || comm.includes('karta') || comm.includes('humo')) cardRev += tot;
        else if (payM === 'online' || comm.includes('click') || comm.includes('payme')) onlineRev += tot;
        else cashRev += tot;

        const w = o.waiter_name || 'Kassa / Umumiy';
        if (!waiterMap[w]) waiterMap[w] = { waiter_name: w, orders_count: 0, total_sales: 0, service_fee: 0 };
        waiterMap[w].orders_count++;
        waiterMap[w].total_sales += tot;
        waiterMap[w].service_fee += Number(o.service_fee || 0);

        (o.items || []).forEach((it) => {
          const n = it.name || it.id || 'Taom';
          if (!dishMap[n]) dishMap[n] = { name: n, qty: 0, revenue: 0 };
          dishMap[n].qty += Number(it.qty || 1);
          dishMap[n].revenue += Number(it.qty || 1) * Number(it.price || 0);
        });
      }
    });

    const cashInTotal = mockCashOps.filter(c => c.op_type === 'cash_in').reduce((s, c) => s + c.amount, 0);
    const cashOutTotal = mockCashOps.filter(c => c.op_type === 'cash_out').reduce((s, c) => s + c.amount, 0);
    const cashInDrawer = cashRev + cashInTotal - cashOutTotal;
    const topDishes = Object.values(dishMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const waiterStats = Object.values(waiterMap).sort((a, b) => b.total_sales - a.total_sales);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        today: new Date().toISOString().slice(0, 10),
        orders_count: mockOrders.length,
        valid_orders: validCount,
        total_revenue: totalRev,
        cash_revenue: cashRev,
        card_revenue: cardRev,
        online_revenue: onlineRev,
        unpaid_open_tables_count: unpaidOpenTablesCount,
        unpaid_open_tables_revenue: unpaidOpenTablesRevenue,
        cash_in_total: cashInTotal,
        cash_out_total: cashOutTotal,
        cash_in_drawer: cashInDrawer,
        avg_check: Math.round(totalRev / Math.max(1, validCount)),
        status_counts: statusCounts,
        top_dishes: topDishes,
        waiter_stats: waiterStats,
        cash_operations: mockCashOps,
      })
    );
    return;
  }

  if (pathname === '/api/register' && req.method === 'POST') {
    const fullName = String(body.firstName || body.first_name || 'Mijoz').trim();
    const phone = String(body.phone || '').trim();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: "Ro'yxatdan o'tildi (Preview)", user: { name: fullName, phone } }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🍔 AMERICAN CAFFETTERIA — PREVIEW & REAL-TIME SERVER`);
  console.log(`🌐 Local Preview:   http://localhost:${PORT}/`);
  console.log(`🖥️ POS Kassa Admin: http://localhost:${PORT}/admin.html`);
  console.log(`⚡ Proxying to:     http://localhost:${BACKEND_PORT} (bot.py)`);
  console.log(`=======================================================`);
});
