import fs from 'fs';
import path from 'path';

function loadServerMenuPrices() {
  const catalog = {};
  try {
    const p = path.join(process.cwd(), 'menu_data.js');
    const content = fs.readFileSync(p, 'utf-8');
    const m = content.match(/window\.(?:menuItems|MENU_DATA)\s*=\s*(\[[\s\S]*?\])\s*;/);
    if (m) {
      const cleaned = m[1].replace(/^\s*\/\/.*$/gm, '');
      const list = JSON.parse(cleaned);
      for (const it of list) {
        if (!it || !it.id) continue;
        const basePrice = Number(it.price || 0);
        const nameRu = (it.name && (it.name.ru || it.name.uz)) || it.id;
        catalog[it.id] = { price: basePrice, name: nameRu };
        if (Array.isArray(it.sizes)) {
          it.sizes.forEach((sz, idx) => {
            const sKey = String(sz.key ?? idx);
            const sPrice = Number(sz.price || basePrice);
            const sLbl = (sz.label && (sz.label.ru || sz.label.uz)) || sKey;
            const entry = { price: sPrice, name: `${nameRu} (${sLbl})` };
            catalog[`${it.id}_${sKey}`] = entry;
            catalog[`${it.id}_${idx}`] = entry;
          });
        }
      }
    }
  } catch (_) {}
  return catalog;
}

const SERVER_CATALOG = loadServerMenuPrices();

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
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    if (rawItems.length === 0 || rawItems.length > 50) {
      return res.status(400).json({ ok: false, error: "Savat bo'sh yoki taomlar soni juda ko'p." });
    }

    const items = [];
    for (const it of rawItems) {
      const id = String(it.id || '').trim().slice(0, 60);
      const q = Math.max(1, Math.min(99, Number(it.qty || it.quantity || 1)));
      const catEntry = SERVER_CATALOG[id];
      const p = catEntry ? catEntry.price : Math.max(1000, Number(it.price || 0));
      const itemName = catEntry ? catEntry.name : String(it.name || 'Taom').trim().slice(0, 100);
      items.push({
        id,
        name: itemName,
        qty: q,
        price: p,
        line_total: p * q,
      });
    }

    const customer = payload.customer || {};
    const customerName = String(payload.customer_name || customer.name || customer.fullName || 'Mijoz').trim().slice(0, 100);
    const phone = String(payload.phone || customer.phone || '').trim().slice(0, 25);
    const address = String(payload.address || customer.address || customer.location || '').trim().slice(0, 300);
    const deliveryType = String(payload.delivery_type || customer.deliveryType || 'delivery').trim().slice(0, 30);
    const comment = String(payload.comment || customer.comment || '').trim().slice(0, 300);
    const promoCode = String(payload.promo_code || '').trim().toUpperCase();

    const rawPayMethod = String(payload.payment_method || customer.payment_method || 'cash').trim().toLowerCase();
    let paymentMethod = 'cash';
    let payMethodLabel = "💵 Naqd pul (Наличные)";
    if (['card', 'terminal', 'humo', 'uzcard'].includes(rawPayMethod)) {
      paymentMethod = 'card';
      payMethodLabel = "💳 Karta / Terminal (Карта)";
    } else if (['online', 'click', 'payme'].includes(rawPayMethod)) {
      paymentMethod = 'online';
      payMethodLabel = "📱 Click / Payme (Онлайн)";
    }

    const PROMOS = { AMERICAN10: 0.10, HALAL5: 0.05, SUPER2026: 0.15, BLEST10: 0.10 };
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = PROMOS[promoCode] ? Math.round(subtotal * PROMOS[promoCode]) : 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const deliveryFee = deliveryType === 'delivery' ? (afterDiscount >= 100000 ? 0 : 10000) : 0;
    const totalAmount = afterDiscount + deliveryFee;

    const nowUtc = new Date().toISOString();
    const idempotencyKey = String(payload.idempotency_key || '').trim().slice(0, 100) || null;
    const numericId = Math.floor(1000 + (Date.now() % 9000));
    const orderCode = `#AC-${numericId}`;

    const botToken = (process.env.BOT_TOKEN || '9019814630:AAG7-0N0tbjiuWINPaiVJLNCYJhly9I_gyg').trim();
    const groupId = (process.env.GROUP_CHAT_ID || '-1004439148911').trim();

    let orderCard = `🛍 <b>YANGI BUYURTMA ${escapeHtml(orderCode)} — AMERICAN CAFFETTERIA</b>\n`;
    orderCard += `━━━━━━━━━━━━━━━━━━━━━\n`;
    orderCard += `👤 <b>Mijoz:</b> ${escapeHtml(customerName)}\n`;
    orderCard += `📞 <b>Telefon:</b> <code>${escapeHtml(phone)}</code>\n`;
    orderCard += `🚚 <b>Turi:</b> ${deliveryType === 'pickup' ? 'Olib ketish' : (deliveryType === 'dine_in' ? 'Zalda' : 'Yetkazib berish')}\n`;
    if (address) orderCard += `📍 <b>Manzil:</b> ${escapeHtml(address)}\n`;
    if (comment) orderCard += `💬 <b>Izoh:</b> <i>${escapeHtml(comment)}</i>\n`;
    orderCard += `\n📋 <b>Buyurtma tarkibi:</b>\n`;
    items.forEach((it, idx) => {
      orderCard += `${idx + 1}. <b>${escapeHtml(it.name)}</b> x${it.qty} — ${(it.price * it.qty).toLocaleString('ru-RU')} so'm\n`;
    });
    orderCard += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (discount > 0) {
      orderCard += `🎁 <b>Chegirma (${escapeHtml(promoCode)}):</b> -${discount.toLocaleString('ru-RU')} so'm\n`;
    }
    if (deliveryFee > 0) {
      orderCard += `🛵 <b>Yetkazib berish:</b> ${deliveryFee.toLocaleString('ru-RU')} so'm\n`;
    } else if (deliveryType === 'delivery') {
      orderCard += `🛵 <b>Yetkazib berish:</b> Bepul (Aksiya)\n`;
    }
    orderCard += `💳 <b>To'lov turi:</b> ${escapeHtml(payMethodLabel)}\n`;
    orderCard += `💰 <b>JAMI TO'LOV:</b> <b>${totalAmount.toLocaleString('ru-RU')} so'm</b>\n`;
    orderCard += `🕒 <b>Vaqt:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`;

    let groupNotified = false;
    if (botToken && groupId) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: groupId,
            text: orderCard,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Qabul qilish', callback_data: `ordst:${numericId}:accepted` },
                  { text: '👨‍🍳 Oshxonada', callback_data: `ordst:${numericId}:cooking` }
                ],
                [
                  { text: '🛵 Kuryerda', callback_data: `ordst:${numericId}:delivering` },
                  { text: '🟢 Yetkazildi', callback_data: `ordst:${numericId}:completed` }
                ],
                [
                  { text: '❌ Bekor qilish', callback_data: `ordst:${numericId}:cancelled` }
                ]
              ]
            }
          })
        });
        const tgData = await tgRes.json();
        groupNotified = tgData.ok === true;
      } catch (e) {
        console.error('Telegram API notification error:', e);
      }
    }

    const savedOrder = {
      id: numericId,
      order_code: orderCode,
      idempotency_key: idempotencyKey,
      customer_name: customerName,
      phone,
      delivery_type: deliveryType,
      address,
      comment,
      payment_method: paymentMethod,
      items,
      subtotal,
      discount,
      promo_code: promoCode,
      delivery_fee: deliveryFee,
      total: totalAmount,
      total_amount: totalAmount,
      status: 'new',
      created_at_utc: nowUtc,
    };

    return res.status(201).json({
      ok: true,
      order_id: orderCode,
      order: savedOrder,
      group_notified: groupNotified,
      message: 'Buyurtma qabul qilindi va oshxonaga uzatildi!'
    });
  } catch (err) {
    console.error('Order handler error:', err);
    return res.status(500).json({ ok: false, error: 'Server xatosi' });
  }
}
