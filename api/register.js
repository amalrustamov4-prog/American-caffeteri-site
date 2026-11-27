function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const isAllowedOrigin = !origin || /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?|http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?|http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?|capacitor:\/\/localhost|https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app|https?:\/\/([a-zA-Z0-9-]+\.)*telegram\.org)$/.test(origin);
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    const firstName = String(payload.firstName || payload.first_name || '').trim().slice(0, 50);
    const lastName = String(payload.lastName || payload.last_name || '').trim().slice(0, 50);
    const phone = String(payload.phone || '').trim().slice(0, 25);
    const username = String(payload.username || '').trim().slice(0, 50);
    const location = String(payload.location || payload.address || '').trim().slice(0, 200);
    const lat = String(payload.lat || '').trim().slice(0, 30);
    const lng = String(payload.lng || '').trim().slice(0, 30);
    const source = String(payload.source || 'web_vercel').trim().slice(0, 30);

    const digitsOnly = phone.replace(/\D/g, '');
    if (firstName.length < 2 || digitsOnly.length < 7) {
      return res.status(400).json({ ok: false, error: 'Iltimos, ism va telefon raqamingizni kiriting / Укажите имя и телефон.' });
    }

    const posBackendUrl = (process.env.POS_BACKEND_URL || '').trim().replace(/\/+$/, '');
    if (posBackendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const proxyRes = await fetch(`${posBackendUrl}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          return res.status(200).json(proxyData);
        }
        if (proxyRes.status >= 400 && proxyRes.status < 500) {
          const errData = await proxyRes.json().catch(() => ({ ok: false, error: "Ro'yxatdan o'tish ma'lumotlari noto'g'ri" }));
          return res.status(proxyRes.status).json(errData);
        }
      } catch (proxyErr) {
        console.warn('POS_BACKEND_URL unreachable for register, falling back to direct Telegram notification:', proxyErr.message);
      }
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const botToken = (process.env.BOT_TOKEN || '').trim();
    const groupId = (process.env.GROUP_CHAT_ID || '').trim();

    let card = `👤 <b>YANGI MIJOZ RO'YXATDAN O'TDI / РЕГИСТРАЦИЯ</b>\n`;
    card += `━━━━━━━━━━━━━━━━━━━━━\n`;
    card += `🏷 <b>Ism:</b> ${escapeHtml(fullName)}\n`;
    card += `📞 <b>Telefon:</b> <code>${escapeHtml(phone)}</code>\n`;
    if (username) {
      card += `✈️ <b>Telegram:</b> @${escapeHtml(username.replace('@', ''))}\n`;
    }
    if (location) {
      card += `📍 <b>Manzil:</b> ${escapeHtml(location)}\n`;
    }
    if (lat && lng) {
      card += `🗺 <b>GPS:</b> <a href="https://maps.google.com/?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}">Xaritada ochish</a>\n`;
    }
    card += `📱 <b>Manba:</b> ${escapeHtml(source.toUpperCase())}\n`;
    card += `🕒 <b>Vaqt:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`;

    let groupNotified = false;
    if (botToken && groupId) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: groupId,
            text: card,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        });
        const tgData = await tgRes.json();
        groupNotified = tgData.ok === true;
      } catch (e) {
        console.error('Telegram API notification error:', e);
      }
    } else {
      console.warn('BOT_TOKEN or GROUP_CHAT_ID is not configured in process.env, skipping Telegram notification.');
    }

    return res.status(200).json({
      ok: true,
      group_notified: groupNotified,
      message: "Ro'yxatdan o'tish muvaffaqiyatli qabul qilindi / Регистрация принята!"
    });
  } catch (err) {
    console.error('Register handler error:', err);
    return res.status(500).json({ ok: false, error: 'Server xatosi / Внутренняя ошибка сервера' });
  }
}
