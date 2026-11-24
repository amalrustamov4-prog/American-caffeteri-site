# 🚀 American Caffetteria — Production Deployment Guide (100% Boevaya Gotovnost)

Инструкция по развертыванию серверной инфраструктуры, Telegram-бота, кассы (POS), веб-витрины и мобильных приложений American Caffetteria на боевом VPS сервере.

---

## 🇺🇿 O'zbekcha / 🇷🇺 Русский

---

### 1. VPS Server Talablari / Требования к VPS

- **OS:** Ubuntu 22.04 LTS yoki Ubuntu 24.04 LTS
- **CPU / RAM:** 1-2 vCPU, 2GB RAM, 20GB SSD
- **Dasturlar:** Docker & Docker Compose (`docker compose version >= 2.20`)
- **Ochiq portlar:** 80 (HTTP), 443 (HTTPS), 8080 (agar to'g'ridan-to'g'ri kirilsa)

---

### 2. O'rnatish va Sozlash / Установка и Настройка

#### 2.1. Serverga Docker o'rnatish:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### 2.2. Loyihani yuklash va `.env` faylini sozlash:
```bash
cd /opt
git clone https://github.com/amalrustamov4-prog/American-caffeteri-site.git american11
cd american11

# Namuna konfiguratsiyadan .env nusxalash
cp telegram_bot/.env.example telegram_bot/.env
nano telegram_bot/.env
```

**⚠️ MUHIM (Xavfsizlik):** `.env` faylida quyidagi parametrlarni o'zgartiring:
- `BOT_TOKEN` — `@BotFather` bergan Telegram bot tokeni.
- `ADMIN_PASSWORD` — Boshqaruvchi uchun kuchli parol (hech qachon `admin123!` qoldirmang).
- `ADMIN_SESSION_SECRET` — 32+ belgili tasodifiy satr.
- `PIN_OWNER`, `PIN_CASHIER`, `PIN_WAITER`, `PIN_KITCHEN`, `PIN_COURIER` — Ishchi xodimlar uchun shaxsiy 4-raqamli PIN-kodlar.

---

### 3. Ishga tushirish (Docker Compose) / Запуск

```bash
# Konteynerlarni yig'ish va fonda ishga tushirish
docker compose up -d --build

# Loglarni ko'rish
docker compose logs -f app
```

#### Sog'lomlikni tekshirish (Healthcheck):
```bash
curl http://127.0.0.1:8080/api/health
# Natija: {"ok": true, "db": "ok", "bot_configured": true, "time_tashkent": "..."}
```

---

### 4. Telegram Guruhni Ulash / Подключение Telegram-группы

1. Telegramda kafe xodimlari uchun guruh yarating (masalan: `American Caffetteria — Buyurtmalar`).
2. Yaratgan botingizni guruhga **Admin** huquqi bilan qo'shing.
3. Guruh ichida `/set_group` komandasini yuboring.
4. Bot javob beradi: `✅ Guruh muvaffaqiyatli biriktirildi! ID: -100xxxxxxxxxx`.
5. Barcha yangi buyurtmalar, oshxona bildirishnomalari (`🔔 OSHXONADAN TAYYOR!`), bekor qilish sabablari va har kuni ertalab 05:00 da avtomatik zaxira bazasi (`cafe_bot.db`) shu guruhga keladi.
6. Qo'lda zaxira nusxasi olish uchun: `/backup`.

---

### 5. HTTPS & Domen (Caddy yoki Nginx) / Домен и SSL

Loyiha ichidagi `deploy/Caddyfile` orqali bepul Let's Encrypt SSL sertifikatlarini avtomatik olish mumkin:

```bash
# Caddy o'rnatish
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy -y

# Caddy konfiguratsiyasini nusxalash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
# Caddyfile ichida domeningizni yozing (masalan pos.americancaffetteria.uz)
sudo nano /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

*Eslatma:* Server-Sent Events (SSE `/api/stream` va `/api/admin/stream`) oqimi uzilmasligi uchun `flush_interval -1` yoki Nginx'da `proxy_buffering off;` o'rnatilgan.

---

### 6. Mobil Ilovalar (Android & iOS) / Мобильные приложения

#### 📱 Android APK:
- Tayyor yig'ilgan APK loyihaning ildizida: `American_Caffetteria.apk`.
- Qayta yig'ish uchun:
  ```bash
  python sync_web.py
  npx cap sync android
  cd android && ./gradlew assembleDebug
  ```

#### 🍏 iOS (iPhone & iPad):
1. **PWA (Ilovani App Store'siz o'rnatish):**
   - Saytni Safari brauzerida oching (`https://pos.americancaffetteria.uz`).
   - "Поделиться" (Share) tugmasini bosing -> **"На экран Домой" (Add to Home Screen)**.
   - Ilova to'liq ekranda, safe-area (Dynamic Island / Notch) qo'llab-quvvatlovi bilan ishlaydi.
2. **Capacitor Native iOS:**
   - macOS kompyuterda yoki GitHub Actions (`.github/workflows/build-ios.yml`) orqali:
     ```bash
     python3 sync_web.py
     npx cap sync ios
     npx cap open ios
     ```
   - Xcode'da loyiha ochiladi, imzolash sertifikati tanlanib, App Store yoki TestFlight'ga yuklanadi.
