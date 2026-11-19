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
  const isAllowedOrigin = /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?|http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?|http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?|capacitor:\/\/localhost|https?:\/\/([a-zA-Z0-9-]+\.)*telegram\.org)$/.test(origin);
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

    if (firstName.length < 2 || phone.length < 7) {
      return res.status(400).json({ ok: false, error: 'Пожалуйста, укажите имя и номер телефона.' });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const botToken = (process.env.BOT_TOKEN || '').trim();
    const groupId = (process.env.GROUP_CHAT_ID || '').trim();

    let card = `👤 <b>НОВАЯ РЕГИСТРАЦИЯ КЛИЕНТА</b>\n`;
    card += `━━━━━━━━━━━━━━━━━━━━━\n`;
    card += `🏷 <b>Имя:</b> ${escapeHtml(fullName)}\n`;
    card += `📞 <b>Телефон:</b> <code>${escapeHtml(phone)}</code>\n`;
    if (username) {
      card += `✈️ <b>Telegram:</b> @${escapeHtml(username.replace('@', ''))}\n`;
    }
    if (location) {
      card += `📍 <b>Адрес:</b> ${escapeHtml(location)}\n`;
    }
    if (lat && lng) {
      card += `🗺 <b>GPS:</b> <a href="https://maps.google.com/?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}">Открыть на карте</a>\n`;
    }
    card += `📱 <b>Источник:</b> ${escapeHtml(source.toUpperCase())}\n`;
    card += `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`;

    let groupNotified = false;
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

    return res.status(200).json({
      ok: true,
      group_notified: groupNotified,
      message: 'Регистрация успешно принята!'
    });
  } catch (err) {
    console.error('Register handler error:', err);
    return res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера' });
  }
}

