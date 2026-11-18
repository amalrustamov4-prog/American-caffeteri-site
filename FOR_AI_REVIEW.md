# American Caffetteria — Project Specification & AI Review Guide

Этот документ подготовлен для ИИ-ассистента (ChatGPT, Claude, Gemini, Cursor и др.) для проведения полного независимого аудита проекта.

---

## 1. Обзор проекта
- **Название:** American Caffetteria (Термез, Узбекистан).
- **Тип проекта:** Веб-приложение (PWA) + мобильное приложение (Capacitor Android) + Telegram Mini App + Telegram-бот с панелью администратора.
- **Стек:**
  - **Фронтенд:** Vanilla JavaScript (ES6+), HTML5, CSS3, Tabler Icons, Canvas Confetti.
  - **Бэкенд:** Python 3.11+, `aiohttp` (асинхронный HTTP/REST API), `aiogram 3.x` (Telegram Bot framework).
  - **База данных:** SQLite (`cafe_bot.db`) с пулом соединений и транзакционной обработкой заказов.
  - **Мобильное окружение:** Capacitor 6 / Android WebView.
  - **Локализация:** 3 языка (`uz` — узбекский по умолчанию, `ru` — русский, `en` — английский).

---

## 2. Структура файлов проекта
```
American/
├── index.html               # Основной веб-интерфейс (каталог, корзина, модалки, I18N, анимации)
├── menu_data.js             # Официальный каталог блюд (73 позиции, 10 категорий, мультиязычность)
├── app.js                   # Расширенный клиентский скрипт (события, интеграция с Telegram WebApp)
├── style.css                # Глобальные стили, темы (#073B3A), адаптивная верстка, анимации
├── admin.html               # Веб-панель администратора
├── admin.js                 # Логика панели администратора (SSE real-time stream, смена статусов)
├── admin.css                # Стили панели управления
├── sw.js                    # Service Worker для офлайн-режима и кэширования
├── manifest.json            # PWA-манифест мобильного приложения
├── capacitor.config.json    # Конфигурация Android Capacitor
├── sync_web.py              # Скрипт синхронизации файлов в www/ и Android assets
├── images/
│   ├── food/                # 73 фотографии блюд (2K, студийные, фон #073B3A, без водяных знаков)
│   ├── logo.png             # Логотип заведения
│   ├── icon-192.png         # Иконка PWA (192x192)
│   └── icon-512.png         # Иконка PWA (512x512)
└── telegram_bot/
    ├── bot.py               # Асинхронный сервер aiohttp + Telegram-бот
    ├── .env                 # Переменные окружения (BOT_TOKEN, DELIVERY_FEE=10000 и др.)
    ├── .env.example         # Пример конфигурации
    ├── requirements.txt     # Зависимости (aiogram, aiohttp)
    └── cafe_bot.db          # База данных заказов
```

---

## 3. Каталог блюд (menu_data.js)
Всего **73 блюда** в **10 категориях**:
1. `burgers` (7 позиций: Gamburger, Chizburger, Big Burger, Big Chiz, American Burger, Mini Gamburger, Mini Chicken).
2. `pizza` (13 позиций с размерами `28 sm` и `34 sm`: Qazili, Miks, Peperoni, Sosiska, Tovuqli, Mujskoy, Monaco, Margarita, Chicago, Las Vegas, Miami, New York, Xanter).
3. `pide` (4 позиции: Go'shtli, Qazili, Asalli, Pepperoni).
4. `lavash` (7 позиций: Lavash Classic, Lavash Sirli, Tandir Lavash Classic, Tandir Lavash Sirli, Donar Box, Pitta Sandwich [100g/120g/140g], American Doner Beef [Kichik/Katta]).
5. `hotdogs` (5 позиций: Classic, Korolevskiy, American, Go'shtli, Club Sandwich).
6. `snacks` (5 позиций: Strips 3 dona, Strips 5 dona, Fri Classic, Fri Derevenskiy, KFC Bayts).
7. `salads` (8 позиций: Istanbul, Pineapple, Grecheskiy, Sezar, Apple, Barf, Mujskoy Kapriz, American).
8. `sushi` (5 позиций: Filadelfiya, Californiya, Filadelfiya Zapechenniy, Chicken Tempura, Set American).
9. `desserts` (9 позиций: 3 вафли + 6 чизкейков San Sebastian).
10. `drinks` (10 позиций: 4 чая в чайниках, карамельный шейк, газированные напитки и вода).

---

## 4. Логика работы бэкенда (`telegram_bot/bot.py`)
- **Порт сервера:** `http://127.0.0.1:8080`.
- **API заказов:** `POST /api/orders`
  - Валидация имени (2-100 символов), телефона (от 7 до 15 цифр), адреса (при доставке).
  - Сверка цен всех позиций по актуальному каталогу `menu_data.js`.
  - Поддержка размеров: ключи вида `pizza_qazili_28`, `pizza_qazili_34`, `pitta_sandwich_0`, `pitta_sandwich_1` и др.
  - Расчет доставки: при сумме < 100 000 сум — доставка `10 000 сум`, от 100 000 сум — бесплатная (`0 сум`). При самовывозе — `0 сум`.
  - Транзакционная запись в SQLite.
  - Мгновенное оповещение администраторов в Telegram-группу и по SSE (`/api/admin/stream`).
- **Панель администратора:**
  - Авторизация: `POST /api/admin/login` (куки сессии с `HttpOnly`, `SameSite=Lax`).
  - Статусы заказа: `new` ➔ `confirmed` ➔ `cooking` ➔ `delivering` ➔ `done` (или `cancelled`).

---

## 5. Вопросы для проверки ИИ-ассистентом (Checklist)
Пожалуйста, проверь проект по следующим пунктам и напиши свои замечания:
1. Есть ли потенциальные уязвимости или ошибки в `index.html` и `app.js` (обработка корзины, очистка полей, отправка запроса)?
2. Корректно ли Service Worker (`sw.js`) и PWA-манифест (`manifest.json`) обрабатывают кэширование и запуск приложения?
3. Полностью ли согласованы цены и идентификаторы блюд между `menu_data.js` и сервером `bot.py`?
4. Есть ли места для улучшения UX/UI или производительности при медленном мобильном интернете в Узбекистане?
5. Что ещё можно добавить или оптимизировать перед релизом?
