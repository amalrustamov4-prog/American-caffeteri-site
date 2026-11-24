import asyncio
import hashlib
import hmac
import html
import json
import logging
import os
import re
import secrets
import shutil
import sqlite3
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
try:
    import aiohttp
    from aiohttp import web
except ImportError:
    aiohttp = None
    class _DummyWeb:
        Request = Any
        Response = Any
        StreamResponse = Any
        FileResponse = Any
        Application = Any
        HTTPException = Exception
        HTTPFound = Exception
        @staticmethod
        def middleware(f): return f
        @staticmethod
        def json_response(data=None, status=200): return {"data": data, "status": status}
    web = _DummyWeb()
try:
    from aiogram import Bot, Dispatcher, F, types
    from aiogram.filters import Command
    from aiogram.types import FSInputFile, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, MenuButtonWebApp, ReplyKeyboardMarkup, WebAppInfo
except ImportError:
    Bot = Any
    FSInputFile = Any
    InlineKeyboardButton = Any
    InlineKeyboardMarkup = Any
    KeyboardButton = Any
    MenuButtonWebApp = Any
    ReplyKeyboardMarkup = Any
    WebAppInfo = Any
    class _DummyTypes:
        Message = Any
        ChatMemberUpdated = Any
        CallbackQuery = Any
    types = _DummyTypes()
    class _DummyF:
        new_chat_members = "new_chat_members"
        contact = "contact"
        web_app_data = "web_app_data"
        class data:
            @staticmethod
            def startswith(s): return s
    F = _DummyF()
    def Command(*args): return args
    class Dispatcher:
        def my_chat_member(self, *a, **kw): return lambda f: f
        def message(self, *a, **kw): return lambda f: f
        def callback_query(self, *a, **kw): return lambda f: f
try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*a, **kw): pass
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
WWW_DIR = PROJECT_ROOT / "www"
STATIC_ROOT = PROJECT_ROOT

# Muhit o'zgaruvchilarini yuklash (.env)
for _p in (BASE_DIR / ".env", PROJECT_ROOT / ".env", Path.cwd() / ".env"):
    if _p.exists():
        load_dotenv(_p, override=False)

_custom_db = os.getenv("DB_PATH")
if _custom_db:
    DB_PATH = Path(_custom_db)
elif (BASE_DIR / "data").exists():
    DB_PATH = BASE_DIR / "data" / "cafe_bot.db"
elif (BASE_DIR / "cafe_bot.db").exists():
    DB_PATH = BASE_DIR / "cafe_bot.db"
else:
    DB_PATH = BASE_DIR / "data" / "cafe_bot.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
if not DB_PATH.exists() and (BASE_DIR / "cafe_bot.db").exists() and DB_PATH != (BASE_DIR / "cafe_bot.db"):
    try:
        shutil.copy2(BASE_DIR / "cafe_bot.db", DB_PATH)
    except Exception:
        pass
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("american_caffetteria")
BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
API_ID = os.getenv("API_ID", "").strip()
API_HASH = os.getenv("API_HASH", "").strip()
GROUP_CHAT_ID = os.getenv("GROUP_CHAT_ID", "").strip()
ADMIN_USER_ID = (os.getenv("ADMIN_USER_ID", "") or os.getenv("TELEGRAM_ADMIN_ID", "")).strip()
WEBAPP_URL = os.getenv("WEBAPP_URL", "http://localhost:8080").strip()
HOST = os.getenv("HOST", "0.0.0.0").strip()
PORT = int(os.getenv("PORT", "8080"))
ADMIN_USERNAME = (os.getenv("ADMIN_USERNAME") or "admin").strip()
ADMIN_PASSWORD = (os.getenv("ADMIN_PASSWORD") or "admin123!").strip()
ADMIN_SESSION_SECRET = (os.getenv("ADMIN_SESSION_SECRET") or "american_caffetteria_secret_2026").strip()
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", "43200"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

# Xodimlar rollari va tezkor 4-raqamli PIN-kodlar
STAFF_PINS = {
    os.getenv("PIN_OWNER", "7777"): {"role": "admin", "name": "Egasi (Admin)"},
    os.getenv("PIN_CASHIER", "1111"): {"role": "cashier", "name": "Kassir"},
    os.getenv("PIN_WAITER", "2222"): {"role": "waiter", "name": "Ofitsiant"},
    os.getenv("PIN_KITCHEN", "3333"): {"role": "kitchen", "name": "Oshpaz"},
    os.getenv("PIN_COURIER", "4444"): {"role": "courier", "name": "Kuryer"},
}
ALLOWED_ORIGINS = {
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8080,http://127.0.0.1:8080,capacitor://localhost,http://localhost,https://american11.vercel.app,https://american11-fullforever.vercel.app",
    ).split(",")
    if o.strip()
}
DELIVERY_FEE = int(os.getenv("DELIVERY_FEE", "10000"))
FREE_DELIVERY_FROM = int(os.getenv("FREE_DELIVERY_FROM", "100000"))
VALID_STATUSES = {
    "new": "Yangi / Новый",
    "accepted": "Qabul qilindi / Принят",
    "preparing": "Oshxonada / Готовится",
    "cooking": "Oshxonada / Готовится",
    "ready": "Tayyor / Готов",
    "delivering": "Kuryerda / Доставка",
    "completed": "Yetkazildi / Завершен",
    "cancelled": "Bekor qilindi / Отменен",
}
PROMO_CODES = {
    "AMERICAN10": 0.10,
    "HALAL5": 0.05,
    "SUPER2026": 0.15,
    "BLEST10": 0.10,
}
VALID_DELIVERY_TYPES = {
    "delivery": "Dostavka / Доставка",
    "pickup": "Olib ketish / Самовывоз",
    "dine_in": "Zalda / В зале",
}
# SSE mijozlari navbati (Admin va Ommaviy alohida)
ADMIN_SSE_CLIENTS: Set[asyncio.Queue] = set()
PUBLIC_SSE_CLIENTS: Set[asyncio.Queue] = set()
# Rate limiting (IP bo'yicha)
LOGIN_ATTEMPTS: Dict[str, List[float]] = {}
MAX_LOGIN_ATTEMPTS = 50
LOGIN_WINDOW_SECONDS = 300
# =====================================================================
# MENYU KATALOGI VA NARX TEKSHIRUVI
# =====================================================================
def load_menu_catalog() -> Dict[str, Dict[str, Any]]:
    """Yordamchi funksiya"""
    catalog: Dict[str, Dict[str, Any]] = {}
    candidates = [PROJECT_ROOT / "menu_data.js", WWW_DIR / "menu_data.js"]
    menu_file = next((p for p in candidates if p.exists()), None)
    if not menu_file:
        logger.warning("menu_data.js topilmadi!")
        return catalog
    content = menu_file.read_text(encoding="utf-8", errors="ignore")
        # 1. Menyu massivini tahlil qilish
    array_m = re.search(r"window\.(?:menuItems|MENU_DATA)\s*=\s*(\[.*?\])\s*;", content, re.DOTALL)
    if array_m:
        try:
            s_clean = re.sub(r"^\s*//.*$", "", array_m.group(1), flags=re.MULTILINE)
            items_list = json.loads(s_clean)
            for idx, it in enumerate(items_list):
                item_id = str(it.get("id", "")).strip()
                if not item_id:
                    continue
                name_val = it.get("name", "")
                if isinstance(name_val, dict):
                    name_str = name_val.get("ru") or name_val.get("uz") or name_val.get("en") or item_id
                else:
                    name_str = str(name_val or item_id)
                price_val = int(it.get("price", 0))
                catalog[item_id] = {"id": item_id, "name": name_str, "price": price_val}
                catalog[str(idx)] = {"id": item_id, "name": name_str, "price": price_val}
                # Izoh
                sizes = it.get("sizes")
                if isinstance(sizes, list):
                    for s_idx, sz in enumerate(sizes):
                        s_key = str(sz.get("key", s_idx))
                        s_price = int(sz.get("price", price_val))
                        lbl_obj = sz.get("label", s_key)
                        if isinstance(lbl_obj, dict):
                            s_label = lbl_obj.get("ru") or lbl_obj.get("uz") or lbl_obj.get("en") or s_key
                        else:
                            s_label = str(lbl_obj)
                        entry = {
                            "id": f"{item_id}_{s_key}",
                            "name": f"{name_str} ({s_label})",
                            "price": s_price,
                        }
                        catalog[f"{item_id}_{s_key}"] = entry
                        catalog[f"{item_id}_{s_idx}"] = entry
                        if s_idx == 0:
                            catalog[f"{item_id}_small"] = entry
                            catalog[f"{item_id}_28"] = entry
                        elif s_idx == 1:
                            catalog[f"{item_id}_large"] = entry
                            catalog[f"{item_id}_34"] = entry
                # Izoh
                prices_arr = it.get("prices")
                if isinstance(prices_arr, list) and not isinstance(sizes, list):
                    for s_idx, p_val in enumerate(prices_arr):
                        p_int = int(p_val)
                        entry = {
                            "id": f"{item_id}_{s_idx}",
                            "name": f"{name_str} (#{s_idx + 1})",
                            "price": p_int,
                        }
                        catalog[f"{item_id}_{s_idx}"] = entry
                        if it.get("category") == "pizza":
                            sz_code = "34" if s_idx == 1 else "28"
                            catalog[f"{item_id}_{sz_code}"] = entry
            logger.info("Menyu fayl o'qildi: %s, taomlar soni: %s", menu_file.name, len(catalog))
        except Exception as e:
            logger.warning("Menyu o'qishda xatolik: %s", e)
    logger.info("Jami katalogda: %s taom", len(catalog))
    return catalog
MENU_CATALOG = load_menu_catalog()
# =====================================================================
# Izoh
# =====================================================================
def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def create_sqlite_backup_file(dest_path: Path) -> bool:
    """Safely dumps SQLite database (including WAL journals) using sqlite3.Connection.backup."""
    if not DB_PATH.exists():
        return False
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with sqlite3.connect(DB_PATH) as src_conn:
            try:
                src_conn.execute("PRAGMA wal_checkpoint(PASSIVE)")
            except Exception:
                pass
            with sqlite3.connect(dest_path) as dst_conn:
                src_conn.backup(dst_conn)
        return True
    except Exception as exc:
        logger.warning("Baza zaxira nusxasini olishda xatolik: %s", exc)
        return False
def init_and_migrate_db() -> None:
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                full_name TEXT,
                phone TEXT,
                address TEXT,
                language TEXT DEFAULT 'ru',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                order_data TEXT,
                total_price INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        # Izoh
        cur_u = conn.execute("PRAGMA table_info(users)")
        existing_u_cols = {row["name"] for row in cur_u.fetchall()}
        user_migrations = {
            "username": "TEXT DEFAULT ''",
            "lat": "TEXT DEFAULT ''",
            "lng": "TEXT DEFAULT ''",
            "source": "TEXT DEFAULT 'web'",
            "updated_at": "TEXT DEFAULT CURRENT_TIMESTAMP"
        }
        for col, col_def in user_migrations.items():
            if col not in existing_u_cols:
                conn.execute(f"ALTER TABLE users ADD COLUMN {col} {col_def}")
        # Izoh
        cur = conn.execute("PRAGMA table_info(orders)")
        existing_cols = {row["name"] for row in cur.fetchall()}
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                table_name TEXT DEFAULT '1-Stol',
                hall TEXT DEFAULT 'Asosiy Zal',
                guests INTEGER DEFAULT 2,
                res_date TEXT DEFAULT '',
                res_time TEXT DEFAULT '',
                comment TEXT DEFAULT '',
                status TEXT DEFAULT 'new',
                created_at_utc TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stoplist (
                item_id TEXT PRIMARY KEY,
                updated_at_utc TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cash_operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shift_date TEXT NOT NULL,
                op_type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                reason TEXT DEFAULT '',
                operator TEXT DEFAULT 'admin',
                created_at_utc TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        migrations = {
            "idempotency_key": "TEXT",
            "created_at_utc": "TEXT",
            "updated_at_utc": "TEXT",
            "customer_name": "TEXT DEFAULT ''",
            "phone": "TEXT DEFAULT ''",
            "delivery_type": "TEXT DEFAULT 'delivery'",
            "address": "TEXT DEFAULT ''",
            "comment": "TEXT DEFAULT ''",
            "items_json": "TEXT DEFAULT '[]'",
            "subtotal": "INTEGER DEFAULT 0",
            "discount": "INTEGER DEFAULT 0",
            "promo_code": "TEXT DEFAULT ''",
            "delivery_fee": "INTEGER DEFAULT 0",
            "service_fee_percent": "INTEGER DEFAULT 0",
            "service_fee": "INTEGER DEFAULT 0",
            "total": "INTEGER DEFAULT 0",
            "source": "TEXT DEFAULT 'web'",
            "payment_method": "TEXT DEFAULT 'cash'",
            "payment_status": "TEXT DEFAULT 'pending'",
            "waiter_name": "TEXT DEFAULT ''",
            "kitchen_status": "TEXT DEFAULT 'waiting'",
            "delivery_mode": "TEXT DEFAULT 'own_courier'",
            "courier_name": "TEXT DEFAULT ''",
            "courier_phone": "TEXT DEFAULT ''",
            "courier_paid_upfront": "INTEGER DEFAULT 0",
            "cancel_reason": "TEXT DEFAULT ''",
            "group_message_id": "INTEGER DEFAULT NULL",
        }
        for col_name, col_def in migrations.items():
            if col_name not in existing_cols:
                logger.info("Adding column to orders: %s", col_name)
                conn.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_def}")
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL"
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_utc ON orders(created_at_utc DESC)")
        conn.commit()
def serialize_order_row(row: sqlite3.Row) -> Dict[str, Any]:
    items = []
    raw_items = row["items_json"] or "[]"
    try:
        items = json.loads(raw_items)
    except Exception:
        pass
    created_utc = row["created_at_utc"] or row["created_at"] or ""
    total_val = row["total"] if row["total"] else (row["total_price"] or 0)
    status_code = row["status"] if row["status"] in VALID_STATUSES else "new"
    row_keys = set(row.keys())
    discount_val = int(row["discount"] or 0) if "discount" in row_keys else 0
    promo_val = str(row["promo_code"] or "") if "promo_code" in row_keys else ""
    return {
        "id": row["id"],
        "order_code": f"#AC-{1000 + int(row['id'])}",
        "created_at_utc": created_utc,
        "updated_at_utc": row["updated_at_utc"] or created_utc,
        "status": status_code,
        "status_label": VALID_STATUSES.get(status_code, status_code),
        "customer_name": row["customer_name"] or "Mijoz",
        "phone": row["phone"] or "",
        "delivery_type": row["delivery_type"] or "delivery",
        "delivery_type_label": VALID_DELIVERY_TYPES.get(row["delivery_type"] or "delivery", "Dostavka"),
        "address": row["address"] or "",
        "comment": row["comment"] or "",
        "items": items,
        "subtotal": row["subtotal"] or total_val,
        "discount": discount_val,
        "promo_code": promo_val,
        "delivery_fee": row["delivery_fee"] or 0,
        "service_fee_percent": int(row["service_fee_percent"] or 0) if "service_fee_percent" in row_keys else 0,
        "service_fee": int(row["service_fee"] or 0) if "service_fee" in row_keys else 0,
        "total": total_val,
        "total_amount": total_val,
        "source": row["source"] or "web",
        "payment_method": row["payment_method"] if "payment_method" in row_keys else "cash",
        "payment_status": row["payment_status"] if "payment_status" in row_keys else "pending",
        "waiter_name": str(row["waiter_name"] or "") if "waiter_name" in row_keys else "",
        "kitchen_status": str(row["kitchen_status"] or "waiting") if "kitchen_status" in row_keys else "waiting",
        "delivery_mode": str(row["delivery_mode"] or "own_courier") if "delivery_mode" in row_keys else "own_courier",
        "courier_name": str(row["courier_name"] or "") if "courier_name" in row_keys else "",
        "courier_phone": str(row["courier_phone"] or "") if "courier_phone" in row_keys else "",
        "courier_paid_upfront": int(row["courier_paid_upfront"] or 0) if "courier_paid_upfront" in row_keys else 0,
        "cancel_reason": str(row["cancel_reason"] or "") if "cancel_reason" in row_keys else "",
        "group_message_id": row["group_message_id"] if "group_message_id" in row_keys else None,
    }
# =====================================================================
# Izoh
# =====================================================================
PHONE_RE = re.compile(r"^\+?[0-9\s\-\(\)]{7,20}$")
def validate_and_build_order(payload: Dict[str, Any], default_source: str = "web", is_staff: bool = False) -> Dict[str, Any]:
    customer_name = str(payload.get("customer_name") or payload.get("name") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    delivery_type = str(payload.get("delivery_type") or "delivery").strip().lower()
    address = str(payload.get("address") or "").strip()
    comment = str(payload.get("comment") or "").strip()
    idempotency_key = str(payload.get("idempotency_key") or "").strip() or None
    source = str(payload.get("source") or default_source).strip()[:32]
    user_id = payload.get("user_id")

    if not customer_name or len(customer_name) < 2 or len(customer_name) > 100:
        raise ValueError("Ismni to'g'ri kiriting (2 dan 100 ta belgichagacha). / Укажите корректное имя.")
    digits_only = re.sub(r"\D", "", phone)
    if not PHONE_RE.match(phone) or len(digits_only) < 7 or len(digits_only) > 15:
        raise ValueError("Telefon raqamini to'g'ri kiriting. / Укажите корректный номер телефона.")
    if delivery_type not in VALID_DELIVERY_TYPES:
        delivery_type = "delivery"
    if delivery_type == "delivery" and (not address or len(address) < 4):
        raise ValueError("Yetkazib berish uchun manzilni kiriting. / Для доставки укажите адрес.")
    if len(address) > 300:
        raise ValueError("Manzil juda uzun (maksimal 300 ta belgi).")
    if len(comment) > 500:
        raise ValueError("Izoh juda uzun (maksimal 500 ta belgi).")
    raw_items = payload.get("items")
    if not isinstance(raw_items, list) or len(raw_items) == 0:
        raise ValueError("Savat bo'sh. Kamida bitta taom tanlang. / Корзина пуста.")
    if len(raw_items) > 50:
        raise ValueError("Bitta buyurtmada taomlar soni juda ko'p.")

    global MENU_CATALOG
    if not MENU_CATALOG:
        MENU_CATALOG = load_menu_catalog()

    # Stop-list tekshiruvi: bazada to'xtatilgan taomlar buyurtmaga kirmaydi
    stopped_ids = set()
    try:
        with get_db_connection() as conn:
            stop_rows = conn.execute("SELECT item_id FROM stoplist").fetchall()
            stopped_ids = {r["item_id"] for r in stop_rows}
    except Exception as e:
        logger.warning("Stoplistni tekshirishda xatolik: %s", e)

    validated_items = []
    subtotal = 0
    for idx, item in enumerate(raw_items):
        if not isinstance(item, dict):
            raise ValueError(f"Noto'g'ri taom formati #{idx + 1}.")
        item_id = str(item.get("id") or "").strip()
        base_id = item_id.rsplit("_", 1)[0] if "_" in item_id else item_id
        if item_id in stopped_ids or base_id in stopped_ids:
            item_label = str(item.get("name") or item_id)
            raise ValueError(f"'{item_label}' taomi vaqtincha sotuvda mavjud emas (Stop-List). / Блюдо временно недоступно.")
        try:
            qty = int(item.get("qty") or item.get("quantity") or 0)
        except (ValueError, TypeError):
            qty = 0
        if qty < 1 or qty > 99:
            raise ValueError(f"Noto'g'ri miqdor #{idx + 1} (1 dan 99 gacha).")
        if MENU_CATALOG:
            if item_id not in MENU_CATALOG:
                raise ValueError(f"'{item_id}' kodi bo'yicha taom menyuda topilmadi.")
            menu_entry = MENU_CATALOG[item_id]
            unit_price = int(menu_entry["price"])
            item_name = str(menu_entry.get("name") or item.get("name") or item_id).strip()[:120]
        else:
            unit_price = int(item.get("price") or 0)
            item_name = str(item.get("name") or f"Taom {item_id}").strip()[:120]
            if unit_price <= 0:
                raise ValueError(f"Taom narxi noto'g'ri: '{item_name}'.")
        line_total = unit_price * qty
        subtotal += line_total
        validated_items.append(
            {
                "id": item_id,
                "name": item_name,
                "qty": qty,
                "price": unit_price,
                "line_total": line_total,
            }
        )
    promo_code = str(payload.get("promo_code") or "").strip().upper()
    discount_rate = PROMO_CODES.get(promo_code, 0.0)
    # Xavfsizlik: chegirma faqat serverdagi tasdiqlangan promo-kod orqali hisoblanadi
    discount = int(round(subtotal * discount_rate)) if discount_rate > 0 else 0
    discount = max(0, min(discount, subtotal))
    discounted_subtotal = max(0, subtotal - discount)
    if delivery_type == "delivery":
        delivery_fee = 0 if (FREE_DELIVERY_FROM > 0 and discounted_subtotal >= FREE_DELIVERY_FROM) else DELIVERY_FEE
    else:
        delivery_fee = 0

    service_fee_percent = 10 if delivery_type == "dine_in" else 0
    service_fee = int(round(discounted_subtotal * service_fee_percent / 100)) if service_fee_percent > 0 else 0
    total = discounted_subtotal + delivery_fee + service_fee
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    raw_pay_m = str(payload.get("payment_method") or "cash").strip().lower()
    if raw_pay_m in ("card_terminal", "terminal_courier", "courier_terminal"):
        payment_method = "card_terminal"
    elif raw_pay_m in ("terminal", "humo", "uzcard"):
        payment_method = "card"
    elif raw_pay_m in ("click", "payme", "online"):
        payment_method = "online"
    elif raw_pay_m in ("unpaid", "postpaid", "exit", "chiqishda"):
        payment_method = "unpaid"
    elif delivery_type == "dine_in" and raw_pay_m not in ("card", "online"):
        payment_method = "unpaid"
    else:
        payment_method = "cash"

    if not is_staff:
        # 1.1: agar so'rov ommaviy kelsa (is_staff=False), payment_status va status majburiy yangilanadi
        initial_status = "new"
        payment_status = "awaiting_confirmation" if payment_method == "online" else "pending"
    else:
        raw_pay_st = str(payload.get("payment_status") or ("pending" if payment_method == "unpaid" else "pending")).strip().lower()
        payment_status = "pending" if payment_method == "unpaid" else (raw_pay_st if raw_pay_st in ("pending", "paid", "awaiting_confirmation") else "pending")
        raw_st = str(payload.get("status") or "").strip().lower()
        if raw_st in VALID_STATUSES:
            initial_status = raw_st
        else:
            initial_status = "cooking" if (delivery_type == "dine_in" and source == "kassa") else "new"

    kitchen_status = "cooking" if initial_status == "cooking" else "waiting"
    waiter_name = str(payload.get("waiter_name") or "").strip()
    delivery_mode = str(payload.get("delivery_mode") or "own_courier").strip().lower()
    if delivery_mode not in ("own_courier", "external_buyout"):
        delivery_mode = "own_courier"
    courier_name = str(payload.get("courier_name") or "").strip()
    courier_phone = str(payload.get("courier_phone") or "").strip()
    courier_paid_upfront = 1 if payload.get("courier_paid_upfront") in (1, True, "1", "true") else 0
    cancel_reason = str(payload.get("cancel_reason") or "").strip()

    if courier_paid_upfront and is_staff:
        payment_status = "paid"
        payment_method = "cash"

    return {
        "user_id": int(user_id) if str(user_id or "").isdigit() else None,
        "idempotency_key": idempotency_key[:100] if idempotency_key else None,
        "created_at_utc": now_utc,
        "updated_at_utc": now_utc,
        "status": initial_status,
        "customer_name": customer_name,
        "phone": phone,
        "delivery_type": delivery_type,
        "address": address,
        "comment": comment,
        "items": validated_items,
        "subtotal": subtotal,
        "discount": discount,
        "promo_code": promo_code if discount > 0 else "",
        "delivery_fee": delivery_fee,
        "service_fee_percent": service_fee_percent,
        "service_fee": service_fee,
        "total": total,
        "source": source,
        "payment_method": payment_method,
        "payment_status": payment_status,
        "waiter_name": waiter_name,
        "kitchen_status": kitchen_status,
        "delivery_mode": delivery_mode,
        "courier_name": courier_name,
        "courier_phone": courier_phone,
        "courier_paid_upfront": courier_paid_upfront,
        "cancel_reason": cancel_reason,
    }
def save_order_transactional(order_dict: Dict[str, Any]) -> tuple[Dict[str, Any], bool]:
    """
    Buyurtmani tranzaksion saqlaydi.
    Возвращает (словарь_заказа, is_new). Если idempotency_key уже существует, возвращает существующий заказ.
    """
    idem_key = order_dict.get("idempotency_key")
    with get_db_connection() as conn:
        conn.execute("BEGIN IMMEDIATE")
        try:
            if idem_key:
                cur = conn.execute(
                    "SELECT * FROM orders WHERE idempotency_key = ?",
                    (idem_key,),
                )
                existing = cur.fetchone()
                if existing:
                    conn.rollback()
                    return serialize_order_row(existing), False
            items_json = json.dumps(order_dict["items"], ensure_ascii=False)
            summary_text = ", ".join(f"{i['name']} x{i['qty']}" for i in order_dict["items"])
            cur = conn.execute(
                """
                INSERT INTO orders (
                    user_id, order_data, total_price, status, created_at,
                    idempotency_key, created_at_utc, updated_at_utc,
                    customer_name, phone, delivery_type, address, comment,
                    items_json, subtotal, discount, promo_code, delivery_fee,
                    service_fee_percent, service_fee,
                    total, source, payment_method, payment_status,
                    waiter_name, kitchen_status, delivery_mode,
                    courier_name, courier_phone, courier_paid_upfront, cancel_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    order_dict["user_id"],
                    summary_text,
                    order_dict["total"],
                    order_dict["status"],
                    order_dict["created_at_utc"],
                    idem_key,
                    order_dict["created_at_utc"],
                    order_dict["updated_at_utc"],
                    order_dict["customer_name"],
                    order_dict["phone"],
                    order_dict["delivery_type"],
                    order_dict["address"],
                    order_dict["comment"],
                    items_json,
                    order_dict["subtotal"],
                    order_dict.get("discount", 0),
                    order_dict.get("promo_code", ""),
                    order_dict["delivery_fee"],
                    order_dict.get("service_fee_percent", 0),
                    order_dict.get("service_fee", 0),
                    order_dict["total"],
                    order_dict["source"],
                    order_dict.get("payment_method", "cash"),
                    order_dict.get("payment_status", "pending"),
                    order_dict.get("waiter_name", ""),
                    order_dict.get("kitchen_status", "waiting"),
                    order_dict.get("delivery_mode", "own_courier"),
                    order_dict.get("courier_name", ""),
                    order_dict.get("courier_phone", ""),
                    order_dict.get("courier_paid_upfront", 0),
                    order_dict.get("cancel_reason", ""),
                ),
            )
            order_id = cur.lastrowid
            row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
            conn.commit()
            return serialize_order_row(row), True
        except Exception:
            conn.rollback()
            raise

def append_items_to_order_transactional(order_id: int, new_items: List[Dict[str, Any]], additional_comment: str = "") -> Dict[str, Any]:
    """Qo'shimcha taomlarni (Do-zakaz) mavjud buyurtmaga tranzaksion qo'shadi."""
    with get_db_connection() as conn:
        conn.execute("BEGIN IMMEDIATE")
        try:
            row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
            if not row:
                conn.rollback()
                raise ValueError("Buyurtma topilmadi / Заказ не найден.")

            if row["status"] in ("completed", "cancelled"):
                conn.rollback()
                raise ValueError("Yopilgan yoki bekor qilingan buyurtmaga taom qo'shib bo'lmaydi")

            existing_items = []
            try:
                existing_items = json.loads(row["items_json"] or "[]")
            except Exception:
                existing_items = []

            for ni in new_items:
                existing_items.append(ni)

            new_subtotal = sum(int(it.get("price", 0)) * int(it.get("qty", 1)) for it in existing_items)
            discount_val = int(row["discount"] or 0)
            delivery_fee_val = int(row["delivery_fee"] or 0)
            discounted = max(0, new_subtotal - discount_val)

            row_keys = set(row.keys())
            fee_pct = int(row["service_fee_percent"] if ("service_fee_percent" in row_keys and row["service_fee_percent"] is not None) else (10 if row["delivery_type"] == "dine_in" else 0))
            new_service_fee = int(round(discounted * fee_pct / 100)) if fee_pct > 0 else 0
            new_total = discounted + delivery_fee_val + new_service_fee

            now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            items_json = json.dumps(existing_items, ensure_ascii=False)
            summary_text = ", ".join(f"{i['name']} x{i['qty']}" for i in existing_items)

            old_comment = row["comment"] or ""
            updated_comment = old_comment
            if additional_comment:
                updated_comment = f"{old_comment} | {additional_comment}".strip(" |")

            # Yangi taom qo'shilgach, oshxona statusi yangilanadi (cooking)
            new_status = "cooking" if row["status"] not in ("completed", "cancelled") else row["status"]
            new_kitchen_status = "cooking"

            conn.execute(
                """
                UPDATE orders SET
                    order_data = ?,
                    items_json = ?,
                    subtotal = ?,
                    service_fee = ?,
                    total = ?,
                    total_price = ?,
                    comment = ?,
                    status = ?,
                    kitchen_status = ?,
                    updated_at_utc = ?
                WHERE id = ?
                """,
                (summary_text, items_json, new_subtotal, new_service_fee, new_total, new_total, updated_comment, new_status, new_kitchen_status, now_utc, order_id),
            )
            updated_row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
            conn.commit()
            return serialize_order_row(updated_row)
        except Exception:
            conn.rollback()
            raise

def pay_and_complete_order_transactional(order_id: int, payment_method: str = "cash", operator: str = "admin") -> Dict[str, Any]:
    """Chiqishda to'lovni qabul qilib, buyurtmani to'langan va yakunlangan holatga o'tkazadi."""
    pm_raw = str(payment_method or "cash").strip().lower()
    if pm_raw in ("card_terminal", "terminal"):
        norm_method = "card_terminal"
    elif pm_raw in ("click", "payme", "online"):
        norm_method = "online"
    elif pm_raw in ("card", "uzcard", "humo"):
        norm_method = "card"
    else:
        norm_method = "cash"

    with get_db_connection() as conn:
        conn.execute("BEGIN IMMEDIATE")
        try:
            row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
            if not row:
                conn.rollback()
                raise ValueError("Buyurtma topilmadi.")

            if row["status"] == "cancelled":
                conn.rollback()
                raise ValueError("Bekor qilingan buyurtmaga to'lov qabul qilib bo'lmaydi")

            if row["payment_status"] == "paid":
                conn.rollback()
                res = serialize_order_row(row)
                res["already_paid"] = True
                return res

            now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            row_keys = set(row.keys())
            kitchen_st = "served" if row["delivery_type"] == "dine_in" else (row["kitchen_status"] if "kitchen_status" in row_keys else "ready")
            conn.execute(
                """
                UPDATE orders SET
                    status = 'completed',
                    payment_status = 'paid',
                    payment_method = ?,
                    kitchen_status = ?,
                    updated_at_utc = ?
                WHERE id = ?
                """,
                (norm_method, kitchen_st, now_utc, order_id),
            )
            updated_row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
            conn.commit()
            return serialize_order_row(updated_row)
        except Exception:
            conn.rollback()
            raise
# =====================================================================
# Izoh
# =====================================================================
def format_order_telegram_html(order: Dict[str, Any]) -> str:
    """Форматирует HTML-карточку заказа для Telegram."""
    safe_name = html.escape(str(order.get("customer_name") or "Mijoz"))
    safe_phone = html.escape(str(order.get("phone") or "—"))
    safe_type = html.escape(str(order.get("delivery_type_label") or "Zalda"))
    safe_address = html.escape(str(order.get("address") or "—"))
    safe_comment = html.escape(str(order.get("comment") or "—"))
    safe_source = html.escape(str(order.get("source") or "web"))
    lines = [
        f"🍔 <b>YANGI BUYURTMA #{order['id']}</b> (<code>{safe_source}</code>)",
        f"🕒 <b>Vaqt:</b> {html.escape(str(order.get('created_at_utc') or ''))}",
        f"👤 <b>Mijoz:</b> {safe_name}",
        f"📞 <b>Telefon:</b> <code>{safe_phone}</code>",
        f"📦 <b>Turi:</b> {safe_type}",
    ]
    if order.get("delivery_type") == "delivery" or (order.get("address") and order.get("address") != "—"):
        lines.append(f"📍 <b>Manzil:</b> {safe_address}")
    if order.get("comment") and order.get("comment") != "—":
        lines.append(f"💬 <b>Izoh:</b> {safe_comment}")
    lines.append("")
    lines.append("🍽️ <b>Buyurtma tarkibi:</b>")
    for idx, item in enumerate(order.get("items", []), start=1):
        iname = html.escape(str(item.get("name", "Taom")))
        iqty = int(item.get("qty", 1))
        iprice = int(item.get("price", 0))
        iline = int(item.get("line_total", iqty * iprice))
        lines.append(f"{idx}. {iname} × {iqty} = <b>{iline:,} so'm</b>".replace(",", " "))
    subtot = int(order.get("subtotal", 0))
    dfee = int(order.get("delivery_fee", 0))
    sfee = int(order.get("service_fee", 0))
    sfee_pct = int(order.get("service_fee_percent", 0))
    tot = int(order.get("total", 0))
    raw_pm = str(order.get("payment_method") or "cash").lower()
    pay_st = str(order.get("payment_status") or "pending").lower()
    if raw_pm == "card_terminal":
        pay_label = "💳 Kuryerda terminal (Карта курьеру)"
    elif raw_pm == "card":
        pay_label = "💳 Karta / Terminal (Карта)"
    elif raw_pm in ("online", "click", "payme"):
        pay_label = "📱 Click / Payme (Онлайн)"
    elif raw_pm in ("unpaid", "postpaid", "exit", "chiqishda"):
        pay_label = "⏳ Chiqishda to'lash (Kassada / Пост-оплата)"
    else:
        pay_label = "💵 Naqd pul (Наличные)"

    if pay_st == "paid":
        st_badge = "🟢 To'langan"
    elif pay_st == "awaiting_confirmation":
        st_badge = "⏳ Tekshirilmoqda (Click/Payme)"
    else:
        st_badge = "🟡 To'lanmagan (Chiqishda to'lanadi)"

    lines.append("")
    lines.append(f"💵 <b>Taomlar summasi:</b> {subtot:,} so'm".replace(",", " "))
    if sfee > 0:
        lines.append(f"☕ <b>Xizmat haqi ({sfee_pct}%):</b> {sfee:,} so'm".replace(",", " "))
    if dfee > 0 or order.get("delivery_type") == "delivery":
        lines.append(f"🛵 <b>Yetkazib berish:</b> {dfee:,} so'm".replace(",", " "))
    lines.append(f"💳 <b>To'lov turi:</b> {pay_label} · <b>{st_badge}</b>")
    lines.append(f"💰 <b>JAMI TO'LOV: {tot:,} so'm</b>".replace(",", " "))
    return chr(10).join(lines)
async def send_telegram_group_notification(bot_instance: Optional[Bot], order: Dict[str, Any]) -> bool:
    if not BOT_TOKEN or not GROUP_CHAT_ID:
        logger.info("BOT_TOKEN yoki GROUP_CHAT_ID belgilanmagan. Buyurtma #%s Telegramga yuborilmadi.", order.get("id"))
        return False
    text = format_order_telegram_html(order)
    oid = order["id"]
    reply_markup_dict = {
        "inline_keyboard": [
            [
                {"text": "✅ Qabul qilish", "callback_data": f"ordst:{oid}:accepted"},
                {"text": "👨‍🍳 Oshxonada", "callback_data": f"ordst:{oid}:cooking"},
            ],
            [
                {"text": "🛵 Kuryerda", "callback_data": f"ordst:{oid}:delivering"},
                {"text": "🟢 Yetkazildi", "callback_data": f"ordst:{oid}:completed"},
            ],
            [
                {"text": "❌ Bekor qilish", "callback_data": f"ordst:{oid}:cancelled"},
            ],
        ]
    }
    try:
        if bot_instance:
            kb = InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(text="✅ Qabul qilish", callback_data=f"ordst:{oid}:accepted"),
                        InlineKeyboardButton(text="👨‍🍳 Oshxonada", callback_data=f"ordst:{oid}:cooking"),
                    ],
                    [
                        InlineKeyboardButton(text="🛵 Kuryerda", callback_data=f"ordst:{oid}:delivering"),
                        InlineKeyboardButton(text="🟢 Yetkazildi", callback_data=f"ordst:{oid}:completed"),
                    ],
                    [
                        InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"ordst:{oid}:cancelled"),
                    ],
                ]
            )
            msg = await bot_instance.send_message(chat_id=GROUP_CHAT_ID, text=text, parse_mode="HTML", reply_markup=kb)
            if msg and hasattr(msg, "message_id"):
                with get_db_connection() as conn:
                    conn.execute("UPDATE orders SET group_message_id = ? WHERE id = ?", (msg.message_id, oid))
                    conn.commit()
        else:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json={"chat_id": GROUP_CHAT_ID, "text": text, "parse_mode": "HTML", "reply_markup": reply_markup_dict},
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    if resp.status != 200:
                        body = await resp.text()
                        logger.error("Telegram API xatosi (%s): %s", resp.status, body)
                        return False
                    resp_data = await resp.json()
                    if resp_data.get("ok") and "result" in resp_data:
                        mid = resp_data["result"].get("message_id")
                        if mid:
                            with get_db_connection() as conn:
                                conn.execute("UPDATE orders SET group_message_id = ? WHERE id = ?", (mid, oid))
                                conn.commit()
        return True
    except Exception as exc:
        logger.exception("Buyurtma #%s ni Telegram guruhga yuborishda xatolik: %s", order.get("id"), exc)
        return False

async def send_telegram_customer_receipt(bot_instance: Optional[Bot], order: Dict[str, Any]) -> bool:
    user_id = order.get("user_id")
    if not BOT_TOKEN or not user_id:
        return False
    safe_name = html.escape(str(order.get("customer_name") or "Mijoz"))
    safe_type = html.escape(str(order.get("delivery_type_label") or "Zalda"))
    lines = [
        f"✅ <b>Sizning buyurtmangiz #{order['id']} qabul qilindi!</b>",
        f"👤 <b>Mijoz:</b> {safe_name}",
        f"📦 <b>Turi:</b> {safe_type}",
    ]
    if order.get("delivery_type") == "delivery" and order.get("address"):
        lines.append(f"📍 <b>Manzil:</b> {html.escape(str(order['address']))}")
    lines.append("")
    lines.append("🍽️ <b>Sizning chekingiz:</b>")
    for idx, item in enumerate(order.get("items", []), start=1):
        iname = html.escape(str(item.get("name", "Taom")))
        iqty = int(item.get("qty", 1))
        iprice = int(item.get("price", 0))
        iline = int(item.get("line_total", iqty * iprice))
        lines.append(f"{idx}. {iname} × {iqty} = <b>{iline:,} so'm</b>".replace(",", " "))
    
    subtot = int(order.get("subtotal", 0))
    dfee = int(order.get("delivery_fee", 0))
    sfee = int(order.get("service_fee", 0))
    sfee_pct = int(order.get("service_fee_percent", 0))
    tot = int(order.get("total", 0))
    raw_pm = str(order.get("payment_method") or "cash").lower()
    pay_st = str(order.get("payment_status") or "pending").lower()
    if raw_pm == "card_terminal":
        pay_label = "💳 Kuryerda terminal (Карта курьеру)"
    elif raw_pm == "card":
        pay_label = "💳 Karta / Terminal (Карта)"
    elif raw_pm in ("online", "click", "payme"):
        pay_label = "📱 Click / Payme (Онлайн)"
    elif raw_pm in ("unpaid", "postpaid", "exit", "chiqishda"):
        pay_label = "⏳ Chiqishda to'lash (Kassada / Пост-оплата)"
    else:
        pay_label = "💵 Naqd pul (Наличные)"

    if pay_st == "paid":
        st_badge = "🟢 To'langan"
    elif pay_st == "awaiting_confirmation":
        st_badge = "⏳ Tekshirilmoqda (Click/Payme)"
    else:
        st_badge = "🟡 To'lanmagan (Chiqishda to'lanadi)"

    lines.append("")
    lines.append(f"💵 <b>Taomlar summasi:</b> {subtot:,} so'm".replace(",", " "))
    if sfee > 0:
        lines.append(f"☕ <b>Xizmat haqi ({sfee_pct}%):</b> {sfee:,} so'm".replace(",", " "))
    if dfee > 0 or order.get("delivery_type") == "delivery":
        lines.append(f"🛵 <b>Yetkazib berish:</b> {dfee:,} so'm".replace(",", " "))
    lines.append(f"💳 <b>To'lov turi:</b> {pay_label} · <b>{st_badge}</b>")
    lines.append(f"💰 <b>JAMI TO'LOV: {tot:,} so'm</b>".replace(",", " "))
    lines.append("")
    lines.append("<b>American Caffetteria</b> ni tanlaganingiz uchun tashakkur!")
    text = chr(10).join(lines)
    try:
        if bot_instance:
            await bot_instance.send_message(chat_id=int(user_id), text=text, parse_mode="HTML")
        return True
    except Exception as exc:
        logger.warning("Telegram mijozga chek yuborishda xatolik %s: %s", user_id, exc)
        return False
async def broadcast_sse_event(event_type: str, data: Dict[str, Any]) -> None:
    message = f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    
    # Ommaviy hodisalar (faqat stoplist yangilanishi) mijozlar oqimiga ham yuboriladi
    if event_type == "stoplist_updated":
        dead_public = []
        for q in list(PUBLIC_SSE_CLIENTS):
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                dead_public.append(q)
        for q in dead_public:
            PUBLIC_SSE_CLIENTS.discard(q)

    # Barcha hodisalar (buyurtmalar, mijozlar, statistika) faqat avtorizatsiyadan o'tgan adminga yuboriladi
    dead_admin = []
    for q in list(ADMIN_SSE_CLIENTS):
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            dead_admin.append(q)
    for q in dead_admin:
        ADMIN_SSE_CLIENTS.discard(q)
# =====================================================================
# Izoh
# =====================================================================
COOKIE_NAME = "ac_admin_session"
def get_signing_secret() -> bytes:
    if ADMIN_SESSION_SECRET:
        return ADMIN_SESSION_SECRET.encode("utf-8")
    # Maxfiy kalit fallback
    return hashlib.sha256(f"fallback_{ADMIN_PASSWORD}_{BOT_TOKEN}".encode("utf-8")).digest()
def create_session_token(username: str) -> str:
    exp = int(time.time()) + SESSION_TTL_SECONDS
    nonce = secrets.token_hex(8)
    payload = f"{username}|{exp}|{nonce}"
    sig = hmac.new(get_signing_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"
def verify_session_token(token: Optional[str]) -> Optional[str]:
    if not token:
        return None
    parts = token.split("|")
    if len(parts) != 4:
        return None
    username, exp_str, nonce, sig = parts
    try:
        exp = int(exp_str)
    except ValueError:
        return None
    if time.time() > exp:
        return None
    payload = f"{username}|{exp_str}|{nonce}"
    expected_sig = hmac.new(get_signing_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        return None
    return username
def get_authenticated_user_info(request: web.Request) -> Tuple[Optional[str], Optional[str]]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:].strip()
    if not token:
        token = request.query.get("token")
    raw_ident = verify_session_token(token)
    if not raw_ident:
        return None, None
    role = "admin"
    username = raw_ident
    if ":" in raw_ident:
        role, username = raw_ident.split(":", 1)
    return role, username

def is_admin_authenticated(request: web.Request) -> bool:
    role, _ = get_authenticated_user_info(request)
    return role is not None

def is_login_rate_limited(ip: str) -> bool:
    now = time.time()
    history = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < 60.0]
    LOGIN_ATTEMPTS[ip] = history
    return len(history) >= 5

def record_failed_login(ip: str) -> None:
    now = time.time()
    history = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < 60.0]
    history.append(now)
    LOGIN_ATTEMPTS[ip] = history

def get_tashkent_shift_date() -> str:
    """Toshkent vaqti (UTC+5) bo'yicha kassa smenasini qaytaradi.
    Tungi smena soat 05:00 gacha davom etadi (00:00-04:59 oldingi kunga tegishli)."""
    tashkent_now = datetime.now(timezone.utc) + timedelta(hours=5)
    if tashkent_now.hour < 5:
        return (tashkent_now - timedelta(days=1)).strftime("%Y-%m-%d")
    return tashkent_now.strftime("%Y-%m-%d")

def get_order_shift_date(date_str: str) -> str:
    """Buyurtma sanasini Toshkent kassa smenasiga o'tkazadi."""
    if not date_str:
        return ""
    try:
        clean_str = date_str[:19].replace("Z", "")
        dt = datetime.strptime(clean_str, "%Y-%m-%dT%H:%M:%S")
        tashkent_dt = dt + timedelta(hours=5)
        if tashkent_dt.hour < 5:
            return (tashkent_dt - timedelta(days=1)).strftime("%Y-%m-%d")
        return tashkent_dt.strftime("%Y-%m-%d")
    except Exception:
        return date_str[:10]

# =====================================================================
# HTTP API HANDLERS (AIOHTTP)
# =====================================================================
CORS_ORIGIN_REGEX = re.compile(
    r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|http://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?|http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?|capacitor://localhost|https?://([a-zA-Z0-9-]+\.)*vercel\.app|https?://([a-zA-Z0-9-]+\.)*telegram\.org)$"
)

def check_csrf_protection(request: web.Request) -> bool:
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return True
    if request.headers.get("X-Requested-With") or request.headers.get("Authorization"):
        return True
    origin = request.headers.get("Origin") or ""
    if origin and (origin in ALLOWED_ORIGINS or CORS_ORIGIN_REGEX.match(origin)):
        return True
    referer = request.headers.get("Referer") or ""
    if referer:
        host = request.headers.get("Host", "")
        if host and (host in referer or "localhost" in referer or "127.0.0.1" in referer or "vercel.app" in referer):
            return True
    return False

BLOCKED_PATH_PREFIXES = ("/.", "/telegram_bot", "/android", "/tests", "/node_modules")
BLOCKED_EXTENSIONS = (".env", ".py", ".pyc", ".db", ".db-wal", ".db-shm", ".bat", ".sh", ".md", ".apk", ".log")

@web.middleware
async def cors_and_security_middleware(request: web.Request, handler):
    if request.path.startswith("/http://") or request.path.startswith("/https://"):
        raise web.HTTPFound("/")
    req_path_lower = request.path.lower()
    if (
        any(req_path_lower.startswith(p) for p in BLOCKED_PATH_PREFIXES)
        or any(req_path_lower.endswith(ext) for ext in BLOCKED_EXTENSIONS)
        or "/." in req_path_lower
    ):
        return web.json_response({"ok": False, "error": "Forbidden"}, status=403)
    origin = request.headers.get("Origin", "")
    is_allowed_origin = (origin in ALLOWED_ORIGINS or bool(CORS_ORIGIN_REGEX.match(origin))) if origin else False
    if request.method == "OPTIONS":
        resp = web.Response(status=204)
    else:
        try:
            resp = await handler(request)
        except web.HTTPException as ex:
            resp = ex
        except Exception as exc:
            logger.exception("Server log", exc)
            resp = web.json_response({"ok": False, "error": "Внутренняя ошибка сервера"}, status=500)
    if is_allowed_origin and origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With, Authorization"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Content-Security-Policy"] = "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org;"
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp
async def api_register_client(request: web.Request) -> web.Response:
    """
    # Mijoz royxatdan otish endpointi
    Foydalanuvchini saqlaydi va Telegram guruhiga bildirishnoma yuboradi.
    """
    try:
        payload = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Noto'g'ri JSON so'rov / Некорректный запрос."}, status=400)
    first_name = str(payload.get("firstName") or payload.get("first_name") or "").strip()
    last_name = str(payload.get("lastName") or payload.get("last_name") or "").strip()
    phone = str(payload.get("phone") or "").strip()
    username = str(payload.get("username") or "").strip()
    location = str(payload.get("location") or payload.get("address") or "").strip()
    lat = str(payload.get("lat") or "").strip()
    lng = str(payload.get("lng") or "").strip()
    source = str(payload.get("source") or "web").strip()
    user_id = payload.get("user_id")
    if len(first_name) < 2 or len(phone) < 7:
        return web.json_response(
            {"ok": False, "error": "Iltimos, ism va telefon raqamini to'g'ri kiriting. / Укажите имя и корректный номер."},
            status=400,
        )
    full_name = f"{first_name} {last_name}".strip()
        # 1. Menyu massivini tahlil qilish
    try:
        with get_db_connection() as conn:
            if user_id:
                conn.execute(
                    """
                    INSERT INTO users (user_id, full_name, phone, address, username, lat, lng, source, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(user_id) DO UPDATE SET
                        full_name=excluded.full_name,
                        phone=excluded.phone,
                        address=excluded.address,
                        username=excluded.username,
                        lat=excluded.lat,
                        lng=excluded.lng,
                        source=excluded.source,
                        updated_at=CURRENT_TIMESTAMP
                    """,
                    (user_id, full_name, phone, location, username, lat, lng, source),
                )
            else:
                conn.execute(
                    """
                    INSERT INTO users (full_name, phone, address, username, lat, lng, source, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """,
                    (full_name, phone, location, username, lat, lng, source),
                )
            conn.commit()
    except Exception as db_err:
        logger.exception("Server log", db_err)
    # 2. Telegram guruhga kartochka yuborish
    source_map = {
        "web": "🌐 Rasmiy sayt (Web)",
        "android_app": "📱 Mobil ilova (Android)",
        "tg_miniapp": "🤖 Telegram Mini App",
        "bot": "💬 Telegram Bot",
    }
    source_title = source_map.get(source, f"📱 {source}")
    now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
    card_lines = [
        "🆕 <b>YANGI MIJOZ RO'YXATDAN O'TDI</b>",
        "──────────────────────────────",
        f"👤 <b>Mijoz:</b> {html.escape(full_name)}",
        f"📞 <b>Telefon:</b> <code>{html.escape(phone)}</code>",
        f"🔗 <b>Telegram:</b> {html.escape(username) if username and username != '@mavjud_emas' else '<i>mavjud emas</i>'}",
        f"📍 <b>Manzil / Joylashuv:</b> {html.escape(location) if location else 'Termiz shahar'}",
    ]
    if lat and lng and lat != "0" and lng != "0":
        card_lines.append(f'🗺️ <b>GPS:</b> <a href="https://maps.google.com/?q={lat},{lng}">{lat}, {lng}</a>')
    card_lines.append(f"📱 <b>Manba:</b> {source_title}")
    card_lines.append(f"🕒 <b>Vaqt:</b> {now_str}")
    card_lines.append("──────────────────────────────")
    card_lines.append("✅ Mijoz American Caffetteria bazasiga muvaffaqiyatli saqlandi!")
    card_text = chr(10).join(card_lines)

    # 3. Guruhga yuborish
    bot_instance: Optional[Bot] = request.app.get("bot")
    group_sent = False
    if bot_instance and GROUP_CHAT_ID:
        try:
            await bot_instance.send_message(chat_id=GROUP_CHAT_ID, text=card_text, parse_mode="HTML")
            group_sent = True
            logger.info("Mijoz kartasi guruhga yuborildi: %s -> %s", full_name, GROUP_CHAT_ID)
        except Exception as notify_err:
            logger.exception("Guruhga yuborishda xatolik %s: %s", GROUP_CHAT_ID, notify_err)

    # 4. SSE bildirishnoma
    await broadcast_sse_event("new_client", {
        "full_name": full_name,
        "phone": phone,
        "address": location,
        "source": source,
        "created_at": now_str,
    })
    return web.json_response({
        "ok": True,
        "group_notified": group_sent,
        "message": "Ro'yxatdan o'tish muvaffaqiyatli qabul qilindi!",
    })
async def handle_order_append_logic(request: web.Request, order_id: int, payload: Dict[str, Any]) -> web.Response:
    """Mavjud buyurtmaga (stoldagi buyurtmaga) yangi taomlarni qo'shadi (Do-zakaz)."""
    raw_items = payload.get("items")
    if not isinstance(raw_items, list) or len(raw_items) == 0:
        return web.json_response({"ok": False, "error": "Qo'shish uchun taomlar tanlanmagan."}, status=400)

    global MENU_CATALOG
    if not MENU_CATALOG:
        MENU_CATALOG = load_menu_catalog()

    with get_db_connection() as conn:
        stop_rows = conn.execute("SELECT item_id FROM stoplist").fetchall()
        stopped_ids = {r["item_id"] for r in stop_rows}

    validated_new_items = []
    for it in raw_items:
        iid = str(it.get("id") or "").strip()
        base_id = iid.rsplit("_", 1)[0] if "_" in iid else iid
        if iid in stopped_ids or base_id in stopped_ids:
            return web.json_response({"ok": False, "error": f"'{it.get('name', iid)}' taomi stop-listda."}, status=400)
        qty = max(1, min(99, int(it.get("qty") or it.get("quantity") or 1)))
        price = int(it.get("price") or 0)
        cat_dish = MENU_CATALOG.get(iid) or MENU_CATALOG.get(base_id)
        if cat_dish:
            cd_name = cat_dish.get("name")
            if isinstance(cd_name, dict):
                name = cd_name.get("uz") or cd_name.get("ru") or iid
            else:
                name = str(cd_name or it.get("name") or iid)
            if price <= 0:
                price = int(cat_dish["price"])
        else:
            name = str(it.get("name") or iid)
        validated_new_items.append({
            "id": iid,
            "name": name,
            "price": price,
            "qty": qty,
            "line_total": price * qty,
            "added_at": datetime.now(timezone.utc).strftime("%H:%M"),
        })

    try:
        updated_order = append_items_to_order_transactional(
            order_id,
            validated_new_items,
            additional_comment=str(payload.get("comment") or "").strip(),
        )
    except ValueError as ve:
        return web.json_response({"ok": False, "error": str(ve)}, status=404)
    except Exception as exc:
        logger.exception("Append items error: %s", exc)
        return web.json_response({"ok": False, "error": "Taomlarni qo'shishda xatolik."}, status=500)

    await broadcast_sse_event("order_updated", {"order": updated_order, "new_items": validated_new_items})

    bot_instance = request.app.get("bot")
    if bot_instance and GROUP_CHAT_ID:
        tbl_label = updated_order.get("address") or updated_order.get("customer_name") or "Zalda"
        lines = [
            f"➕ <b>QO'SHIMCHA BUYURTMA (DO-ZAKAZ)!</b>",
            f"━━━━━━━━━━━━━━━━━━━━━",
            f"🪑 <b>Joy / Stol:</b> {html.escape(tbl_label)} ({updated_order.get('order_code')})",
            f"📋 <b>Yangi qo'shilgan taomlar:</b>",
        ]
        for idx, it in enumerate(validated_new_items, 1):
            lines.append(f"{idx}. {html.escape(it['name'])} × {it['qty']} = <b>{it['line_total']:,} so'm</b>".replace(",", " "))
        lines.append(f"━━━━━━━━━━━━━━━━━━━━━")
        lines.append(f"💰 <b>Yangilangan jami hisob: {updated_order['total']:,} so'm</b>".replace(",", " "))
        lines.append(f"🕒 <b>Vaqt:</b> {datetime.now(timezone.utc).strftime('%H:%M:%S')} UTC")
        asyncio.create_task(bot_instance.send_message(
            chat_id=GROUP_CHAT_ID,
            text=chr(10).join(lines),
            parse_mode="HTML",
        ))

    return web.json_response({"ok": True, "order": updated_order, "added_items": validated_new_items})

async def api_order_append(request: web.Request) -> web.Response:
    if not is_admin_authenticated(request):
        return web.json_response({"ok": False, "error": "Ruxsat berilmagan / Unauthorized."}, status=401)
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    order_id = request.match_info.get("id", "")
    if not order_id.isdigit():
        return web.json_response({"ok": False, "error": "Noto'g'ri buyurtma ID."}, status=400)
    try:
        payload = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Noto'g'ri JSON."}, status=400)
    return await handle_order_append_logic(request, int(order_id), payload)

async def api_order_pay(request: web.Request) -> web.Response:
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Ruxsat berilmagan / Unauthorized."}, status=401)
    if role not in ("admin", "owner", "cashier"):
        return web.json_response({"ok": False, "error": "Faqat kassir va boshqaruvchi to'lovni qabul qila oladi."}, status=403)
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    order_id = request.match_info.get("id", "")
    if not order_id.isdigit():
        return web.json_response({"ok": False, "error": "Noto'g'ri buyurtma ID."}, status=400)
    try:
        body = await request.json()
    except Exception:
        body = {}
    pay_m = str(body.get("payment_method") or "cash").strip().lower()
    if pay_m in ("card_terminal", "terminal"):
        pay_m = "card_terminal"
    elif pay_m in ("card", "humo", "uzcard"):
        pay_m = "card"
    elif pay_m in ("click", "payme", "online"):
        pay_m = "online"
    else:
        pay_m = "cash"

    operator = username or str(body.get("operator") or "admin").strip()
    try:
        updated_order = pay_and_complete_order_transactional(int(order_id), payment_method=pay_m, operator=operator)
    except ValueError as ve:
        return web.json_response({"ok": False, "error": str(ve)}, status=400)

    await broadcast_sse_event("order_updated", {"order": updated_order})

    bot_instance = request.app.get("bot")
    group_mid = updated_order.get("group_message_id")
    if bot_instance and GROUP_CHAT_ID and group_mid:
        try:
            status_text = format_order_telegram_html(updated_order) + f"\n\n🏷️ <b>Holati:</b> <b>✅ Yakunlandi (To'lov qabul qilindi: {pay_m.upper()})</b>"
            await bot_instance.edit_message_text(
                chat_id=GROUP_CHAT_ID,
                message_id=int(group_mid),
                text=status_text,
                parse_mode="HTML",
            )
        except Exception:
            pass

    return web.json_response({"ok": True, "order": updated_order})

async def api_create_order(request: web.Request) -> web.Response:
    try:
        payload = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Noto'g'ri JSON so'rov / Некорректный запрос."}, status=400)

    is_staff = is_admin_authenticated(request)
    append_order_id = payload.get("append_to_order_id")

    # 1.1: ruxsat etilmagan mijozlar boshqa ID ga to'g'ridan-to'g'ri qo'sha olmaydi
    if append_order_id and not is_staff:
        return web.json_response({"ok": False, "error": "Faqat xodimlar buyurtmaga to'g'ridan-to'g'ri qo'sha oladi."}, status=403)

    # mijoz uchun append_if_active faqat ochiq dine_in buyurtmasiga do-zakaz beradi
    if not append_order_id and payload.get("delivery_type") == "dine_in" and payload.get("append_if_active"):
        tbl_addr = str(payload.get("address") or payload.get("customer_name") or "").strip()
        if tbl_addr:
            with get_db_connection() as conn:
                cur = conn.execute(
                    "SELECT id FROM orders WHERE delivery_type = 'dine_in' AND status NOT IN ('completed', 'cancelled') AND (address = ? OR customer_name = ?) ORDER BY id DESC LIMIT 1",
                    (tbl_addr, tbl_addr),
                )
                active_row = cur.fetchone()
                if active_row:
                    append_order_id = active_row["id"]

    if append_order_id and str(append_order_id).isdigit():
        return await handle_order_append_logic(request, int(append_order_id), payload)

    try:
        order_dict = validate_and_build_order(payload, default_source="web", is_staff=is_staff)
        saved_order, is_new = save_order_transactional(order_dict)
    except ValueError as ve:
        return web.json_response({"ok": False, "error": str(ve)}, status=400)
    except Exception as exc:
        logger.exception("Server log", exc)
        return web.json_response(
            {"ok": False, "error": "Buyurtmani saqlashda xatolik / Не удалось сохранить заказ."},
            status=500,
        )
    telegram_sent = False
    if is_new:
        await broadcast_sse_event("new_order", {"order": saved_order})
        bot_instance: Optional[Bot] = request.app.get("bot")
        if bot_instance and GROUP_CHAT_ID:
            asyncio.create_task(send_telegram_group_notification(bot_instance, saved_order))
            telegram_sent = True
        if saved_order.get("user_id") and bot_instance:
            asyncio.create_task(send_telegram_customer_receipt(bot_instance, saved_order))
    return web.json_response(
        {
            "ok": True,
            "duplicate": not is_new,
            "telegram_notified": telegram_sent,
            "order": saved_order,
        },
        status=201 if is_new else 200,
    )
async def api_admin_login(request: web.Request) -> web.Response:
    client_ip = request.remote or "unknown"
    if is_login_rate_limited(client_ip):
        logger.warning("Bloklangan brute-force urinish: IP=%s", client_ip)
        return web.json_response(
            {"ok": False, "error": "Juda ko'p xato urinishlar. 1 daqiqa kuting. / Слишком много попыток. Подождите 1 минуту."},
            status=429,
        )

    try:
        body = await request.json()
    except Exception:
        body = {}

    pin_input = str(body.get("pin") or "").strip()
    role = "admin"
    display_name = "admin"

    if pin_input:
        if pin_input in STAFF_PINS:
            staff_info = STAFF_PINS[pin_input]
            role = staff_info["role"]
            display_name = staff_info["name"]
        else:
            record_failed_login(client_ip)
            logger.warning("PIN xato: IP=%s", client_ip)
            return web.json_response(
                {"ok": False, "error": "Noto'g'ri PIN-kod / Неверный PIN-код."},
                status=401,
            )
    else:
        username = str(body.get("username") or "admin").strip().lower()
        password = str(body.get("password") or "").strip()
        valid_passwords = {ADMIN_PASSWORD}
        valid_users = {ADMIN_USERNAME.lower(), "admin", "operator", "kassa"}
        pass_matches = password in valid_passwords
        user_matches = username in valid_users

        if not (user_matches and pass_matches):
            record_failed_login(client_ip)
            logger.warning("Kirishda xatolik: username='%s', IP=%s", username, client_ip)
            return web.json_response(
                {"ok": False, "error": "Login yoki parol noto'g'ri / Неверный логин или пароль."},
                status=401,
            )
        role = "admin"
        display_name = username

    LOGIN_ATTEMPTS.pop(client_ip, None)
    token = create_session_token(f"{role}:{display_name}")
    resp = web.json_response({"ok": True, "username": display_name, "role": role, "token": token})
    resp.set_cookie(
        COOKIE_NAME,
        token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="Lax",
        path="/",
    )
    logger.info("Kassaga muvaffaqiyatli kirildi: role='%s', user='%s'", role, display_name)
    return resp
async def api_admin_logout(request: web.Request) -> web.Response:
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    resp = web.json_response({"ok": True})
    resp.del_cookie(COOKIE_NAME, path="/")
    return resp
async def api_admin_me(request: web.Request) -> web.Response:
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "authenticated": False}, status=401)
    return web.json_response({"ok": True, "authenticated": True, "username": username, "role": role})
def compute_stats(orders: List[Dict[str, Any]], target_date: str) -> Dict[str, Any]:
    new_count = 0
    in_work_count = 0
    completed_count = 0
    day_revenue = 0
    in_work_statuses = {"accepted", "cooking", "ready", "delivering"}
    for o in orders:
        st = o["status"]
        created_date = (o["created_at_utc"] or "")[:10]
        is_target_day = (not target_date) or (created_date == target_date)
        if st == "new":
            new_count += 1
        elif st in in_work_statuses:
            in_work_count += 1
        if is_target_day and st == "completed":
            completed_count += 1
            day_revenue += int(o["total"] or 0)
    return {
        "new_count": new_count,
        "in_work_count": in_work_count,
        "completed_count": completed_count,
        "day_revenue": day_revenue,
        "date": target_date,
    }

async def api_public_orders_status(request: web.Request) -> web.Response:
    raw_ids = request.query.get("ids", "").strip()
    if not raw_ids:
        return web.json_response({"ok": True, "orders": []})
    id_list = [int(x) for x in raw_ids.split(",") if x.strip().isdigit()][:20]
    if not id_list:
        return web.json_response({"ok": True, "orders": []})
    placeholders = ",".join("?" for _ in id_list)
    with get_db_connection() as conn:
        rows = conn.execute(
            f"SELECT id, status, total, total_price, delivery_type, created_at_utc, updated_at_utc FROM orders WHERE id IN ({placeholders}) ORDER BY id DESC",
            tuple(id_list),
        ).fetchall()
    result = []
    for r in rows:
        st = r["status"] if r["status"] in VALID_STATUSES else "new"
        tot = r["total"] if r["total"] else (r["total_price"] or 0)
        result.append({
            "id": r["id"],
            "order_code": f"#AC-{1000 + int(r['id'])}",
            "status": st,
            "status_label": VALID_STATUSES.get(st, st),
            "delivery_type": r["delivery_type"] or "delivery",
            "total": tot,
            "created_at_utc": r["created_at_utc"] or "",
            "updated_at_utc": r["updated_at_utc"] or "",
        })
    return web.json_response({"ok": True, "orders": result})

async def api_admin_list_orders(request: web.Request) -> web.Response:
    if not is_admin_authenticated(request):
        return web.json_response({"ok": False, "error": "Требуется авторизация."}, status=401)
    status_filter = request.query.get("status", "all").strip().lower()
    date_filter = request.query.get("date", "").strip()
    search_q = request.query.get("q", "").strip().lower()
    limit = min(int(request.query.get("limit", "300")), 1000)
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM orders ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    all_orders = [serialize_order_row(r) for r in rows]
    today_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    stats = compute_stats(all_orders, date_filter or today_utc)
    filtered = []
    for o in all_orders:
        if status_filter and status_filter != "all":
            if status_filter == "in_work":
                if o["status"] not in {"accepted", "cooking", "ready", "delivering"}:
                    continue
            elif o["status"] != status_filter:
                continue
        if date_filter:
            if not (o["created_at_utc"] or "").startswith(date_filter):
                continue
        if search_q:
            haystack = f"#{o['id']} {o['customer_name']} {o['phone']} {o['address']}".lower()
            if search_q not in haystack:
                continue
        filtered.append(o)
    return web.json_response({"ok": True, "orders": filtered, "stats": stats})
async def api_admin_get_order(request: web.Request) -> web.Response:
    if not is_admin_authenticated(request):
        return web.json_response({"ok": False, "error": "Требуется авторизация."}, status=401)
    order_id = request.match_info.get("id", "")
    if not order_id.isdigit():
        return web.json_response({"ok": False, "error": "Noto'g'ri buyurtma ID / Некорректный ID заказа."}, status=400)
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (int(order_id),)).fetchone()
    if not row:
        return web.json_response({"ok": False, "error": "Заказ не найден."}, status=404)
    return web.json_response({"ok": True, "order": serialize_order_row(row)})
async def api_admin_update_status(request: web.Request) -> web.Response:
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Требуется авторизация."}, status=401)
    order_id = request.match_info.get("id", "")
    if not order_id.isdigit():
        return web.json_response({"ok": False, "error": "Noto'g'ri buyurtma ID / Некорректный ID заказа."}, status=400)
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Noto'g'ri JSON / Некорректный JSON."}, status=400)
    new_status = str(body.get("status") or "").strip().lower()
    new_pay_st = str(body.get("payment_status") or "").strip().lower()
    new_pay_m = str(body.get("payment_method") or "").strip().lower()
    new_kitchen_st = str(body.get("kitchen_status") or "").strip().lower()
    new_deliv_mode = str(body.get("delivery_mode") or "").strip().lower()
    new_courier_name = str(body.get("courier_name") or "").strip()
    new_courier_phone = str(body.get("courier_phone") or "").strip()
    courier_paid_upfront = body.get("courier_paid_upfront")
    cancel_reason = str(body.get("cancel_reason") or "").strip()

    if new_status and new_status not in VALID_STATUSES:
        return web.json_response({"ok": False, "error": "Noto'g'ri buyurtma holati / Недопустимый статус."}, status=400)
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with get_db_connection() as conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (int(order_id),)).fetchone()
        if not row:
            conn.rollback()
            return web.json_response({"ok": False, "error": "Заказ не найден."}, status=404)

        current_status = str(row["status"] or "new").lower()
        order_delivery_type = str(row["delivery_type"] or "delivery").lower()

        # RBAC Ruxsatlar tekshiruvi
        if role == "kitchen":
            if new_pay_st or new_pay_m or courier_paid_upfront is not None or new_status in ("completed", "cancelled") or cancel_reason or new_deliv_mode or new_courier_name or new_courier_phone:
                conn.rollback()
                return web.json_response({"ok": False, "error": "Oshpaz faqat oshxona holatini (cooking/ready) o'zgartira oladi."}, status=403)
            if new_status and new_status not in ("cooking", "ready"):
                conn.rollback()
                return web.json_response({"ok": False, "error": "Oshpaz uchun ruxsat etilmagan holat."}, status=403)

        elif role == "courier":
            if order_delivery_type != "delivery":
                conn.rollback()
                return web.json_response({"ok": False, "error": "Kuryer faqat yetkazib berish buyurtmalarini boshqara oladi."}, status=403)
            if new_status == "cancelled" or cancel_reason or new_kitchen_st:
                conn.rollback()
                return web.json_response({"ok": False, "error": "Kuryer buyurtmani bekor qila olmaydi yoki oshxona holatini o'zgartira olmaydi."}, status=403)
            if new_status and new_status not in ("delivering", "completed"):
                conn.rollback()
                return web.json_response({"ok": False, "error": "Kuryer faqat 'delivering' yoki 'completed' holatini o'rnata oladi."}, status=403)

        elif role == "waiter":
            if new_status in ("completed", "cancelled") or cancel_reason or new_pay_st == "paid" or courier_paid_upfront in (1, True, "1", "true"):
                conn.rollback()
                return web.json_response({"ok": False, "error": "Ofitsiant buyurtmani bekor qila olmaydi yoki to'lov holatini o'zgartira olmaydi."}, status=403)

        if (new_status == "cancelled" or cancel_reason) and role not in ("admin", "owner", "cashier"):
            conn.rollback()
            return web.json_response({"ok": False, "error": "Faqat kassir va boshqaruvchi buyurtmani bekor qila oladi."}, status=403)

        if (new_pay_st == "paid" or courier_paid_upfront in (1, True, "1", "true")) and role not in ("admin", "owner", "cashier", "courier"):
            conn.rollback()
            return web.json_response({"ok": False, "error": "Faqat kassir yoki kuryer to'lov holatini o'zgartira oladi."}, status=403)

        if not new_status and not new_pay_st and not new_pay_m and not new_kitchen_st and not new_deliv_mode and not new_courier_name and not new_courier_phone and courier_paid_upfront is None and not cancel_reason:
            conn.rollback()
            return web.json_response({"ok": True, "order": serialize_order_row(row)})

        if current_status in ("completed", "cancelled") and new_pay_st != "paid":
            conn.rollback()
            return web.json_response(
                {"ok": False, "error": f"Buyurtma allaqachon yakunlangan ({current_status}). Holatni o'zgartirib bo'lmaydi."},
                status=400,
            )

        set_clauses = ["updated_at_utc = ?"]
        set_params = [now_utc]

        target_status = new_status
        if new_kitchen_st == "ready" and not target_status:
            target_status = "ready"
        elif new_pay_st == "paid" and not target_status:
            target_status = "completed"

        if target_status and target_status in VALID_STATUSES:
            set_clauses.append("status = ?")
            set_params.append(target_status)
            if target_status == "ready" and not new_kitchen_st:
                new_kitchen_st = "ready"
            elif target_status == "cooking" and not new_kitchen_st:
                new_kitchen_st = "cooking"

        if new_kitchen_st in ("waiting", "cooking", "ready", "served"):
            set_clauses.append("kitchen_status = ?")
            set_params.append(new_kitchen_st)

        if new_deliv_mode in ("own_courier", "external_buyout"):
            set_clauses.append("delivery_mode = ?")
            set_params.append(new_deliv_mode)

        if new_courier_name:
            set_clauses.append("courier_name = ?")
            set_params.append(new_courier_name)

        if new_courier_phone:
            set_clauses.append("courier_phone = ?")
            set_params.append(new_courier_phone)

        if courier_paid_upfront is not None:
            cpu_val = 1 if courier_paid_upfront in (1, True, "1", "true") else 0
            set_clauses.append("courier_paid_upfront = ?")
            set_params.append(cpu_val)
            if cpu_val == 1:
                set_clauses.append("payment_status = 'paid'")
                set_clauses.append("payment_method = 'cash'")

        if cancel_reason:
            set_clauses.append("cancel_reason = ?")
            set_params.append(cancel_reason)

        if new_pay_st in ("pending", "paid", "awaiting_confirmation") and courier_paid_upfront != 1:
            set_clauses.append("payment_status = ?")
            set_params.append(new_pay_st)

        if new_pay_m and courier_paid_upfront != 1:
            if new_pay_m in ("card_terminal", "courier_terminal"):
                new_pay_m = "card_terminal"
            elif new_pay_m in ("terminal", "humo", "uzcard"):
                new_pay_m = "card"
            elif new_pay_m in ("click", "payme", "online"):
                new_pay_m = "online"
            elif new_pay_m in ("unpaid", "postpaid", "exit", "chiqishda"):
                new_pay_m = "unpaid"
            if new_pay_m in ("cash", "card", "card_terminal", "online", "unpaid"):
                set_clauses.append("payment_method = ?")
                set_params.append(new_pay_m)

        set_params.append(int(order_id))
        conn.execute(
            f"UPDATE orders SET {', '.join(set_clauses)} WHERE id = ?",
            tuple(set_params),
        )
        updated_row = conn.execute("SELECT * FROM orders WHERE id = ?", (int(order_id),)).fetchone()
        conn.commit()
    serialized = serialize_order_row(updated_row)
    await broadcast_sse_event("order_updated", {"order": serialized})

    bot_instance: Optional[Bot] = request.app.get("bot")
    row_keys = set(row.keys())
    group_mid = row["group_message_id"] if "group_message_id" in row_keys else None
    final_status = target_status or current_status
    status_label = VALID_STATUSES.get(final_status, final_status)
    if bot_instance and GROUP_CHAT_ID and group_mid:
        try:
            new_text = format_order_telegram_html(serialized) + f"\n\n🏷️ <b>Holati:</b> <b>{html.escape(status_label)}</b>"
            kb = None
            if final_status not in ("completed", "cancelled"):
                kb = InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(text="✅ Qabul qilish", callback_data=f"ordst:{order_id}:accepted"),
                            InlineKeyboardButton(text="👨‍🍳 Oshxonada", callback_data=f"ordst:{order_id}:cooking"),
                        ],
                        [
                            InlineKeyboardButton(text="🛵 Kuryerda", callback_data=f"ordst:{order_id}:delivering"),
                            InlineKeyboardButton(text="🟢 Yetkazildi", callback_data=f"ordst:{order_id}:completed"),
                        ],
                        [
                            InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"ordst:{order_id}:cancelled"),
                        ],
                    ]
                )
            await bot_instance.edit_message_text(
                chat_id=GROUP_CHAT_ID,
                message_id=int(group_mid),
                text=new_text,
                parse_mode="HTML",
                reply_markup=kb,
            )
        except Exception as e:
            logger.warning("Telegram guruhdagi xabarni tahrirlashda xatolik #%s: %s", order_id, e)

    user_id = row["user_id"] if "user_id" in row_keys else None
    if bot_instance and user_id:
        try:
            await bot_instance.send_message(
                chat_id=int(user_id),
                text=f"📦 <b>Buyurtmangiz #{order_id} holati o'zgardi:</b>\n\n👉 <b>{html.escape(status_label)}</b>\n\nAmerican Caffetteria ☕",
                parse_mode="HTML",
            )
        except Exception as e:
            logger.warning("Mijozga status bildirishnomasini yuborishda xatolik #%s: %s", order_id, e)

    # Anti-frod: Buyurtma bekor qilinganda egasiga/guruhga tezkor ogohlantirish
    if (final_status == "cancelled" or cancel_reason) and bot_instance:
        alert_target = ADMIN_USER_ID or GROUP_CHAT_ID
        if alert_target:
            try:
                ord_code = serialized.get("order_code") or f"#{order_id}"
                cust_or_table = serialized.get("customer_name") or serialized.get("address") or "Zal"
                tot = serialized.get("total") or serialized.get("total_amount") or 0
                reason_txt = cancel_reason or "Sabab ko'rsatilmadi"
                staff_name = serialized.get("waiter_name") or "Kassir / Operator"
                alert_msg = (
                    f"🚨 <b>DIQQAT: BUYURTMA BEKOR QILINDI (Anti-Frod)!</b>\n\n"
                    f"🔢 <b>Buyurtma:</b> <code>{html.escape(ord_code)}</code>\n"
                    f"🪑 <b>Stol / Mijoz:</b> {html.escape(str(cust_or_table))}\n"
                    f"💰 <b>Summa:</b> {tot:,.0f} so'm\n"
                    f"👤 <b>Xodim:</b> {html.escape(str(staff_name))}\n"
                    f"⚠️ <b>Sabab:</b> <b>{html.escape(reason_txt)}</b>\n"
                    f"⏰ <b>Vaqt:</b> {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}"
                )
                await bot_instance.send_message(chat_id=int(alert_target), text=alert_msg, parse_mode="HTML")
            except Exception as e:
                logger.warning("Admin egasiga bekor qilish ogohlantirishini yuborishda xatolik: %s", e)

    return web.json_response({"ok": True, "order": serialized})
async def api_admin_stats(request: web.Request) -> web.Response:
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi / Требуется авторизация."}, status=401)
    if role not in ("admin", "owner", "cashier"):
        return web.json_response({"ok": False, "error": "Faqat boshqaruvchi va kassir hisobotlarni ko'ra oladi."}, status=403)
    target_shift = request.query.get("date") or get_tashkent_shift_date()
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM orders ORDER BY id DESC").fetchall()
        cash_ops = conn.execute(
            "SELECT * FROM cash_operations WHERE shift_date = ? ORDER BY id DESC",
            (target_shift,),
        ).fetchall()
        total_revenue = 0
        cash_revenue = 0
        card_revenue = 0
        online_revenue = 0
        unpaid_open_tables_revenue = 0
        unpaid_open_tables_count = 0
        valid_orders = 0
        shift_orders_count = 0
        status_counts = {"new": 0, "preparing": 0, "cooking": 0, "delivering": 0, "completed": 0, "cancelled": 0}
        dish_sales: Dict[str, Dict[str, Any]] = {}
        waiter_sales: Dict[str, Dict[str, Any]] = {}
        for r in rows:
            order_date_str = r["created_at_utc"] or r["created_at"] or ""
            order_shift = get_order_shift_date(order_date_str)
            if order_shift != target_shift:
                continue
            shift_orders_count += 1
            st = str(r["status"] or "new").lower()
            norm_st = "preparing" if st in ("cooking", "accepted") else st
            status_counts[norm_st] = status_counts.get(norm_st, 0) + 1
            tot = int(r["total"] if r["total"] else (r["total_price"] or 0))
            if st != "cancelled":
                row_keys = set(r.keys())
                pay_st = str(r["payment_status"] or "pending").lower() if "payment_status" in row_keys else "pending"
                pay_m = str(r["payment_method"] or "cash").lower() if "payment_method" in row_keys else "cash"
                deliv_type = str(r["delivery_type"] or "delivery").lower()
                comm = str(r["comment"] or "").lower()

                # Faqatgina dine_in (Zal) stollari hisoblanadi (yetkazib berishdagi card_terminal adashtirilmaydi)
                if deliv_type == "dine_in" and pay_st != "paid" and st not in ("completed", "cancelled"):
                    unpaid_open_tables_revenue += tot
                    unpaid_open_tables_count += 1
                elif pay_st == "paid":
                    total_revenue += tot
                    valid_orders += 1
                    if pay_m in ("card", "terminal", "card_terminal", "humo", "uzcard") or any(k in comm for k in ("karta", "terminal", "card", "humo", "uzcard")):
                        card_revenue += tot
                    elif pay_m in ("online", "click", "payme") or any(k in comm for k in ("click", "payme", "online")):
                        online_revenue += tot
                    else:
                        cash_revenue += tot

                    # Ofitsiantlar hisoboti
                    row_waiter = str(r["waiter_name"] or "").strip() if "waiter_name" in row_keys else ""
                    if not row_waiter:
                        row_waiter = "Kassa / Umumiy"
                    if row_waiter not in waiter_sales:
                        waiter_sales[row_waiter] = {"waiter_name": row_waiter, "orders_count": 0, "total_sales": 0, "service_fee": 0}
                    waiter_sales[row_waiter]["orders_count"] += 1
                    waiter_sales[row_waiter]["total_sales"] += tot
                    row_sfee = int(r["service_fee"] or 0) if "service_fee" in row_keys else 0
                    waiter_sales[row_waiter]["service_fee"] += row_sfee
                try:
                    items = json.loads(r["items_json"] or "[]")
                    for it in items:
                        iname = str(it.get("name") or it.get("id") or "Taom")
                        iqty = int(it.get("qty") or 1)
                        iprice = int(it.get("price") or 0)
                        if iname not in dish_sales:
                            dish_sales[iname] = {"name": iname, "qty": 0, "revenue": 0}
                        dish_sales[iname]["qty"] += iqty
                        dish_sales[iname]["revenue"] += iqty * iprice
                except Exception:
                    pass

        cash_in_total = sum(int(op["amount"]) for op in cash_ops if op["op_type"] == "cash_in")
        cash_out_total = sum(int(op["amount"]) for op in cash_ops if op["op_type"] == "cash_out")
        cash_in_drawer = cash_revenue + cash_in_total - cash_out_total
        top_dishes = sorted(dish_sales.values(), key=lambda x: (x["qty"], x["revenue"]), reverse=True)[:5]
        waiter_stats = sorted(waiter_sales.values(), key=lambda x: x["total_sales"], reverse=True)
        return web.json_response({
            "ok": True,
            "today": target_shift,
            "shift_date": target_shift,
            "orders_count": shift_orders_count,
            "valid_orders": valid_orders,
            "total_revenue": total_revenue,
            "cash_revenue": cash_revenue,
            "card_revenue": card_revenue,
            "online_revenue": online_revenue,
            "unpaid_open_tables_revenue": unpaid_open_tables_revenue,
            "unpaid_open_tables_count": unpaid_open_tables_count,
            "cash_in_total": cash_in_total,
            "cash_out_total": cash_out_total,
            "cash_in_drawer": cash_in_drawer,
            "avg_check": int(total_revenue / max(1, valid_orders)),
            "status_counts": status_counts,
            "top_dishes": top_dishes,
            "waiter_stats": waiter_stats,
            "cash_operations": [dict(op) for op in cash_ops],
        })
async def api_create_reservation(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Invalid JSON"}, status=400)
    customer_name = str(body.get("customer_name") or body.get("name") or "").strip()
    phone = str(body.get("phone") or "").strip()
    table_name = str(body.get("table_name") or body.get("table") or "1-Stol").strip()
    hall = str(body.get("hall") or "Asosiy Zal").strip()
    guests = int(body.get("guests") or 2)
    res_date = str(body.get("res_date") or body.get("date") or datetime.now().strftime("%Y-%m-%d")).strip()
    res_time = str(body.get("res_time") or body.get("time") or "19:00").strip()
    comment = str(body.get("comment") or "").strip()
    if len(customer_name) < 2 or len(phone) < 7:
        return web.json_response({"ok": False, "error": "Ism va telefon raqamni kiriting."}, status=400)
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with get_db_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO reservations (customer_name, phone, table_name, hall, guests, res_date, res_time, comment, status, created_at_utc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
            """,
            (customer_name, phone, table_name, hall, guests, res_date, res_time, comment, now_utc),
        )
        res_id = cur.lastrowid
        conn.commit()
    res_obj = {
        "id": res_id,
        "customer_name": customer_name,
        "phone": phone,
        "table_name": table_name,
        "hall": hall,
        "guests": guests,
        "res_date": res_date,
        "res_time": res_time,
        "comment": comment,
        "status": "new",
        "created_at_utc": now_utc,
    }
    await broadcast_sse_event("new_reservation", {"reservation": res_obj})
    bot_instance: Optional[Bot] = request.app.get("bot")
    if bot_instance and GROUP_CHAT_ID:
        try:
            res_lines = [
                f"📅 <b>YANGI STOL BRONI #{res_id}</b>",
                "──────────────────────────────",
                f"👤 <b>Mijoz:</b> {html.escape(customer_name)}",
                f"📞 <b>Telefon:</b> <code>{html.escape(phone)}</code>",
                f"🛋️ <b>Zal / Stol:</b> {html.escape(hall)} ({html.escape(table_name)})",
                f"👥 <b>Mehmonlar soni:</b> {guests} kishi",
                f"🕒 <b>Sana va vaqt:</b> {html.escape(res_date)} {html.escape(res_time)}",
            ]
            if comment:
                res_lines.append(f"💬 <b>Izoh:</b> {html.escape(comment)}")
            msg_text = chr(10).join(res_lines)
            asyncio.create_task(bot_instance.send_message(chat_id=GROUP_CHAT_ID, text=msg_text, parse_mode="HTML"))
        except Exception as e:
            logger.warning("Reservation TG notify error: %s", e)
    return web.json_response({"ok": True, "reservation": res_obj}, status=201)
async def api_list_reservations(request: web.Request) -> web.Response:
    if not is_admin_authenticated(request):
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi / Требуется авторизация."}, status=401)
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM reservations ORDER BY id DESC LIMIT 100").fetchall()
    items = [dict(r) for r in rows]
    return web.json_response({"ok": True, "reservations": items})
async def api_update_reservation_status(request: web.Request) -> web.Response:
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi / Требуется авторизация."}, status=401)
    if role not in ("admin", "owner", "cashier", "waiter"):
        return web.json_response({"ok": False, "error": "Ruxsat berilmagan / Forbidden."}, status=403)
    res_id = request.match_info.get("id", "")
    if not res_id.isdigit():
        return web.json_response({"ok": False, "error": "Invalid ID"}, status=400)
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Invalid JSON"}, status=400)
    new_status = str(body.get("status") or "confirmed").strip().lower()
    with get_db_connection() as conn:
        conn.execute("UPDATE reservations SET status = ? WHERE id = ?", (new_status, int(res_id)))
        row = conn.execute("SELECT * FROM reservations WHERE id = ?", (int(res_id),)).fetchone()
        conn.commit()
    if not row:
        return web.json_response({"ok": False, "error": "Not found"}, status=404)
    res_obj = dict(row)
    await broadcast_sse_event("reservation_updated", {"reservation": res_obj})
    return web.json_response({"ok": True, "reservation": res_obj})
async def api_get_stoplist(request: web.Request) -> web.Response:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT item_id FROM stoplist").fetchall()
    stopped = [r["item_id"] for r in rows]
    return web.json_response({"ok": True, "stoplist": stopped})
async def api_toggle_stoplist(request: web.Request) -> web.Response:
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi / Требуется авторизация."}, status=401)
    if role not in ("admin", "owner", "cashier", "kitchen"):
        return web.json_response({"ok": False, "error": "Faqat oshxona, kassir va boshqaruvchi stop-listni o'zgartira oladi."}, status=403)
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Invalid JSON"}, status=400)
    item_id = str(body.get("item_id") or "").strip()
    if not item_id:
        return web.json_response({"ok": False, "error": "item_id required"}, status=400)
    action = body.get("stopped")
    with get_db_connection() as conn:
        exists = conn.execute("SELECT 1 FROM stoplist WHERE item_id = ?", (item_id,)).fetchone()
        if action is True or (action is None and not exists):
            conn.execute("INSERT OR REPLACE INTO stoplist (item_id) VALUES (?)", (item_id,))
            is_stopped = True
        else:
            conn.execute("DELETE FROM stoplist WHERE item_id = ?", (item_id,))
            is_stopped = False
        rows = conn.execute("SELECT item_id FROM stoplist").fetchall()
        conn.commit()
    stopped_list = [r["item_id"] for r in rows]
    await broadcast_sse_event("stoplist_updated", {"stoplist": stopped_list, "item_id": item_id, "stopped": is_stopped})
    return web.json_response({"ok": True, "item_id": item_id, "stopped": is_stopped, "stoplist": stopped_list})
async def api_admin_get_cash_operations(request: web.Request) -> web.Response:
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi"}, status=401)
    if role not in ("admin", "owner", "cashier"):
        return web.json_response({"ok": False, "error": "Faqat boshqaruvchi va kassir ruxsatga ega."}, status=403)
    shift_date = request.query.get("date") or get_tashkent_shift_date()
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM cash_operations WHERE shift_date = ? ORDER BY id DESC",
            (shift_date,),
        ).fetchall()
        ops = [dict(r) for r in rows]
    return web.json_response({"ok": True, "operations": ops, "shift_date": shift_date})

async def api_admin_add_cash_operation(request: web.Request) -> web.Response:
    if not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi"}, status=401)
    if role not in ("admin", "owner", "cashier"):
        return web.json_response({"ok": False, "error": "Faqat boshqaruvchi va kassir ruxsatga ega."}, status=403)
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Noto'g'ri JSON"}, status=400)
    op_type = str(body.get("type") or body.get("op_type") or "").strip().lower()
    if op_type not in ("cash_in", "cash_out"):
        return web.json_response({"ok": False, "error": "Operatsiya turi noto'g'ri (cash_in yoki cash_out)"}, status=400)
    try:
        amount = int(body.get("amount") or 0)
    except (ValueError, TypeError):
        amount = 0
    if amount <= 0 or amount > 500_000_000:
        return web.json_response({"ok": False, "error": "Summa noto'g'ri (1 dan 500 000 000 gacha)"}, status=400)
    reason = str(body.get("reason") or "").strip()[:200]
    operator = username or str(body.get("operator") or "admin").strip()[:50]
    shift_date = get_tashkent_shift_date()
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with get_db_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO cash_operations (shift_date, op_type, amount, reason, operator, created_at_utc)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (shift_date, op_type, amount, reason, operator, now_utc),
        )
        op_id = cur.lastrowid
        conn.commit()
    return web.json_response({
        "ok": True,
        "operation": {
            "id": op_id,
            "shift_date": shift_date,
            "op_type": op_type,
            "amount": amount,
            "reason": reason,
            "operator": operator,
            "created_at_utc": now_utc,
        },
    })

async def api_admin_sse_stream(request: web.Request) -> web.StreamResponse:
    if not is_admin_authenticated(request):
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi / Требуется авторизация."}, status=401)
    response = web.StreamResponse(
        status=200,
        reason="OK",
        headers={
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
    await response.prepare(request)
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    ADMIN_SSE_CLIENTS.add(queue)
    try:
        await response.write(b"event: connected\ndata: {\"ok\": true, \"channel\": \"admin\"}\n\n")
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                await response.write(msg.encode("utf-8"))
            except asyncio.TimeoutError:
                await response.write(b": keepalive\n\n")
    except (asyncio.CancelledError, ConnectionResetError):
        pass
    finally:
        ADMIN_SSE_CLIENTS.discard(queue)
    return response

async def api_public_sse_stream(request: web.Request) -> web.StreamResponse:
    response = web.StreamResponse(
        status=200,
        reason="OK",
        headers={
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
    await response.prepare(request)
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    PUBLIC_SSE_CLIENTS.add(queue)
    try:
        await response.write(b"event: connected\ndata: {\"ok\": true, \"channel\": \"public\"}\n\n")
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                await response.write(msg.encode("utf-8"))
            except asyncio.TimeoutError:
                await response.write(b": keepalive\n\n")
    except (asyncio.CancelledError, ConnectionResetError):
        pass
    finally:
        PUBLIC_SSE_CLIENTS.discard(queue)
    return response

async def serve_index(request: web.Request) -> web.FileResponse:
    return web.FileResponse(
        STATIC_ROOT / "index.html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
    )
async def serve_admin(request: web.Request) -> web.FileResponse:
    return web.FileResponse(
        STATIC_ROOT / "admin.html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
    )
# =====================================================================
# TELEGRAM BOT HANDLERS (AIOGRAM)
# =====================================================================
def update_env_group_id(new_chat_id: Union[int, str]):
    global GROUP_CHAT_ID
    GROUP_CHAT_ID = str(new_chat_id).strip()
    env_paths = [
        BASE_DIR / ".env",
        PROJECT_ROOT / ".env",
    ]
    for p in env_paths:
        if p.exists():
            try:
                txt = p.read_text(encoding="utf-8")
                if "GROUP_CHAT_ID=" in txt:
                    txt = re.sub(r"GROUP_CHAT_ID=.*", f"GROUP_CHAT_ID={GROUP_CHAT_ID}", txt)
                else:
                    txt += f"\nGROUP_CHAT_ID={GROUP_CHAT_ID}\n"
                p.write_text(txt, encoding="utf-8")
                logger.info("GROUP_CHAT_ID yangilandi: %s (%s)", GROUP_CHAT_ID, p)
            except Exception as err:
                logger.warning(".env ga yozishda xatolik %s: %s", p, err)
dp = Dispatcher()


@dp.callback_query(F.data.startswith("ordst:"))
async def handle_order_status_callback(callback: types.CallbackQuery):
    try:
        parts = (callback.data or "").split(":")
        if len(parts) != 3:
            await callback.answer("Noto'g'ri ma'lumot")
            return
        _, order_id_str, new_status = parts
        if not order_id_str.isdigit() or new_status not in VALID_STATUSES:
            await callback.answer("Noto'g'ri status")
            return

        now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        with get_db_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            row = conn.execute("SELECT * FROM orders WHERE id = ?", (int(order_id_str),)).fetchone()
            if not row:
                conn.rollback()
                await callback.answer("Zakaz topilmadi", show_alert=True)
                return

            current_status = str(row["status"] or "new").lower()
            if current_status == new_status:
                conn.rollback()
                await callback.answer(f"Holati allaqachon '{VALID_STATUSES.get(new_status, new_status)}'")
                return

            if current_status in ("completed", "cancelled"):
                conn.rollback()
                await callback.answer("Buyurtma allaqachon yakunlangan yoki bekor qilingan!", show_alert=True)
                return

            conn.execute(
                "UPDATE orders SET status = ?, updated_at_utc = ? WHERE id = ?",
                (new_status, now_utc, int(order_id_str)),
            )
            updated_row = conn.execute("SELECT * FROM orders WHERE id = ?", (int(order_id_str),)).fetchone()
            conn.commit()

        serialized = serialize_order_row(updated_row)
        await broadcast_sse_event("order_updated", {"order": serialized})
        status_label = VALID_STATUSES.get(new_status, new_status)
        await callback.answer(f"Buyurtma #{order_id_str} holati: {status_label}")

        if callback.message:
            new_text = format_order_telegram_html(serialized) + f"\n\n🏷️ <b>Holati:</b> <b>{html.escape(status_label)}</b>"
            kb = callback.message.reply_markup if new_status not in ("completed", "cancelled") else None
            try:
                await callback.message.edit_text(
                    text=new_text,
                    parse_mode="HTML",
                    reply_markup=kb,
                )
            except Exception as edit_err:
                logger.warning("Telegram callback edit error: %s", edit_err)

        user_id = row["user_id"] if "user_id" in row.keys() else None
        if user_id and callback.bot:
            try:
                await callback.bot.send_message(
                    chat_id=int(user_id),
                    text=f"📦 <b>Buyurtmangiz #{order_id_str} holati o'zgardi:</b>\n\n👉 <b>{html.escape(status_label)}</b>\n\nAmerican Caffetteria ☕",
                    parse_mode="HTML",
                )
            except Exception as e:
                logger.warning("Mijozga status xabarini yuborishda xatolik: %s", e)
    except Exception as exc:
        logger.warning("Order status callback error: %s", exc)


@dp.my_chat_member()
async def on_my_chat_member(event: types.ChatMemberUpdated):
    if event.new_chat_member.status in ("member", "administrator"):
        chat_id = event.chat.id
        title = event.chat.title or "Menejerlar guruhi"
        update_env_group_id(chat_id)
        try:
            msg = (
                "🎉 <b>American Caffetteria Bot muvaffaqiyatli ulandi!</b>\n"
                f"🏷️ <b>Guruh:</b> {html.escape(title)}\n"
                f"🔑 <b>Chat ID:</b> <code>{chat_id}</code>\n"
                "🔔 <b>Bu yerga avtomatik keladi:</b>\n"
                "1. Sayt va ilovadan yangi buyurtmalar\n"
                "2. Stol bronlari va mijozlar ma'lumotlari"
            )
            await event.bot.send_message(
                chat_id=chat_id,
                text=msg,
                parse_mode="HTML",
            )
        except Exception as e:
            logger.warning("Guruhga salom xabari yuborilmadi: %s", e)


@dp.message(F.new_chat_members)
async def on_new_chat_members(message: types.Message):
    me = await message.bot.get_me()
    for m in message.new_chat_members:
        if m.id == me.id:
            chat_id = message.chat.id
            title = message.chat.title or "Guruh"
            update_env_group_id(chat_id)
            msg = (
                f"🎉 <b>American Caffetteria Bot guruhga qo'shildi: {html.escape(title)}!</b>\n"
                f"🔑 <b>Chat ID:</b> <code>{chat_id}</code> saqlandi.\n"
                "Buyurtmalar va stol bronlari shu yerga real-time rejimda keladi!"
            )
            await message.reply(msg, parse_mode="HTML")


@dp.message(Command("set_group", "connect_group", "id", "chat_id"))
async def cmd_set_group(message: types.Message):
    chat_type = message.chat.type
    chat_id = message.chat.id
    chat_title = html.escape(message.chat.title or message.chat.full_name or "Guruh")
    if chat_type in ("group", "supergroup"):
        update_env_group_id(chat_id)
        msg = (
            "✅ <b>Guruh muvaffaqiyatli ulandi!</b>\n"
            f"🏷️ Nomi: <b>{chat_title}</b>\n"
            f"🔑 <b>Chat ID:</b> <code>{chat_id}</code> (.env da saqlandi)\n"
            "🔔 Barcha buyurtma va stol bronlari ushbu guruhga keladi!"
        )
        await message.reply(msg, parse_mode="HTML")
    else:
        msg = (
            "ℹ️ <b>Chat ma'lumotlari:</b>\n"
            f"🏷️ Nomi: <b>{chat_title}</b>\n"
            f"📌 Turi: <code>{chat_type}</code>\n"
            f"🔑 <b>ID:</b> <code>{chat_id}</code>\n"
            "<i>Guruhni ulash uchun ushbu botni guruhga qo'shing va /set_group buyrug'ini yuboring.</i>"
        )
        await message.reply(msg, parse_mode="HTML")


@dp.message(Command("register", "auth", "login"))
async def cmd_register(message: types.Message):
    from aiogram.types import KeyboardButton, ReplyKeyboardMarkup

    contact_kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Telefon raqamimni yuborish", request_contact=True)],
            (
                [KeyboardButton(text="🍔 Menyu", web_app=WebAppInfo(url=WEBAPP_URL))]
                if WEBAPP_URL.startswith("https://")
                else [KeyboardButton(text="🍔 Menyu ochish")]
            ),
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    msg = (
        "📝 <b>American Caffetteria da ro'yxatdan o'tish</b>\n"
        "Buyurtma berish uchun quyidagi <b>«📱 Telefon raqamimni yuborish»</b> tugmasini bosing:"
    )
    await message.answer(msg, reply_markup=contact_kb, parse_mode="HTML")


@dp.message(F.contact)
async def handle_user_contact(message: types.Message, bot: Bot):
    c = message.contact
    full_name = f"{c.first_name or ''} {c.last_name or ''}".strip() or message.from_user.full_name or "Mijoz"
    phone = c.phone_number
    if not phone.startswith("+"):
        phone = f"+{phone}"
    username = f"@{message.from_user.username}" if message.from_user.username else ""

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO users (user_id, full_name, phone, address, username, source, updated_at)
            VALUES (?, ?, ?, ?, ?, 'bot', CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                full_name=excluded.full_name,
                phone=excluded.phone,
                username=excluded.username,
                source=excluded.source,
                updated_at=CURRENT_TIMESTAMP
            """,
            (message.from_user.id, full_name, phone, "Termiz shahar", username),
        )
        conn.commit()

    if GROUP_CHAT_ID:
        card = (
            "🆕 <b>YANGI MIJOZ RO'YXATDAN O'TDI (TELEGRAM)</b>\n"
            "──────────────────────────────\n"
            f"👤 <b>Mijoz:</b> {html.escape(full_name)}\n"
            f"📞 <b>Telefon:</b> <code>{html.escape(phone)}</code>\n"
            f"🔗 <b>Telegram:</b> {html.escape(username) if username else '<i>mavjud emas</i>'}\n"
            "📱 <b>Manba:</b> Telegram Bot (@americancaffeteri_bot)\n"
            f"🕒 <b>Vaqt:</b> {datetime.now().strftime('%d.%m.%Y %H:%M')}\n"
            "──────────────────────────────"
        )
        try:
            await bot.send_message(chat_id=GROUP_CHAT_ID, text=card, parse_mode="HTML")
        except Exception as e:
            logger.warning("Mijoz kartasini guruhga yuborishda xatolik: %s", e)

    msg = (
        f"✅ <b>Rahmat, {html.escape(full_name)}!</b>\n"
        f"Telefon raqamingiz: <code>{html.escape(phone)}</code> muvaffaqiyatli saqlandi.\n"
        "Endi siz American Caffetteria taomlarini osongina buyurtma qilishingiz mumkin!"
    )
    await message.answer(msg, parse_mode="HTML")


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    safe_full_name = html.escape(message.from_user.full_name or "Mehmon")
    if WEBAPP_URL.startswith("https://"):
        inline_kb = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🍔 Menyu ochish (American Caffetteria)",
                        web_app=WebAppInfo(url=WEBAPP_URL),
                    )
                ]
            ]
        )
        reply_kb = ReplyKeyboardMarkup(
            keyboard=[
                [
                    KeyboardButton(
                        text="🍔 Menyu",
                        web_app=WebAppInfo(url=WEBAPP_URL),
                    )
                ]
            ],
            resize_keyboard=True,
        )
        msg = (
            f"Xush kelibsiz <b>American Caffetteria</b> ga, {safe_full_name}!\n"
            "Menyuni ko'rish va buyurtma berish uchun quyidagi tugmani bosing:"
        )
        await message.answer(msg, reply_markup=inline_kb, parse_mode="HTML")
        await message.answer(
            "Tezkor menyu tugmasi klaviaturangizda ham joylashtirildi 👇",
            reply_markup=reply_kb,
        )
    else:
        msg = (
            f"Xush kelibsiz <b>American Caffetteria</b> ga, {safe_full_name}!\n"
            f"🌐 Menyu manzili: {html.escape(WEBAPP_URL)}"
        )
        await message.answer(msg, parse_mode="HTML")


@dp.message(F.web_app_data)
async def handle_webapp_data(message: types.Message, bot: Bot):
    """
    Telegram Mini App sendData orqali yuborilgan buyurtmalarni qabul qiluvchi handler.
    """
    raw_data = message.web_app_data.data
    try:
        parsed = json.loads(raw_data)
    except Exception:
        parsed = {
            "customer_name": message.from_user.full_name or "Telegram User",
            "phone": "+998000000000",
            "delivery_type": "pickup",
            "comment": raw_data[:400],
            "items": [{"id": "custom", "name": "Telegram Mini App buyurtmasi", "qty": 1, "price": 1000}],
        }

    if parsed.get("already_saved_via_http") and parsed.get("order_id"):
        safe_id = html.escape(str(parsed.get("order_id")))
        await message.answer(
            f"✅ Sizning buyurtmangiz <b>#{safe_id}</b> qabul qilindi va oshxonaga yuborildi!",
            parse_mode="HTML",
        )
        return

    try:
        parsed["user_id"] = message.from_user.id
        order_dict = validate_and_build_order(parsed, default_source="tg_webapp")
        saved_order, is_new = save_order_transactional(order_dict)
        if is_new:
            await broadcast_sse_event("new_order", {"order": saved_order})
            await send_telegram_group_notification(bot, saved_order)

        tot_formatted = f"{saved_order['total']:,}".replace(",", " ")
        msg = (
            f"✅ Sizning buyurtmangiz <b>#{saved_order['id']}</b> qabul qilindi!\n"
            f"💰 To'lov summasi: <b>{tot_formatted} so'm</b>"
        )
        await message.answer(msg, parse_mode="HTML")
    except Exception as exc:
        logger.exception("web_app_data xatosi: %s", exc)
        await message.answer("⚠️ Buyurtmani qabul qilishda xatolik yuz berdi. Iltimos, saytdan qayta urinib ko'ring.")


async def api_admin_trigger_backup(request: web.Request) -> web.Response:
    if request.method == "POST" and not check_csrf_protection(request):
        return web.json_response({"ok": False, "error": "Sessiya xavfsizlik tekshiruvi / CSRF check failed."}, status=403)
    role, username = get_authenticated_user_info(request)
    if not role:
        return web.json_response({"ok": False, "error": "Avtorizatsiya talab qilinadi."}, status=401)
    if role not in ("admin", "owner"):
        return web.json_response({"ok": False, "error": "Faqat boshqaruvchi (admin) baza zaxira nusxasini yuklab olishi mumkin."}, status=403)
    if not DB_PATH.exists():
        return web.json_response({"ok": False, "error": "Baza fayli topilmadi."}, status=404)
    download = request.query.get("download") == "1"
    bot_instance = request.app.get("bot")
    tashkent_now = datetime.now(timezone(timedelta(hours=5)))
    backup_filename = f"cafe_bot_{tashkent_now.strftime('%Y%m%d_%H%M%S')}.db"
    backup_dir = BASE_DIR / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_file = backup_dir / backup_filename

    success = create_sqlite_backup_file(backup_file)
    use_file = backup_file if (success and backup_file.exists()) else DB_PATH

    if download:
        return web.FileResponse(
            path=str(use_file),
            headers={"Content-Disposition": f'attachment; filename="{backup_filename}"'}
        )
    target_chat = ADMIN_USER_ID or GROUP_CHAT_ID
    if bot_instance and target_chat:
        try:
            doc = FSInputFile(str(use_file), filename=backup_filename)
            await bot_instance.send_document(
                chat_id=int(target_chat),
                document=doc,
                caption=f"📦 <b>Zaxira nusxasi (cafe_bot.db)</b>\n📅 Sana: {tashkent_now.strftime('%Y-%m-%d %H:%M:%S')}\n☕ American Caffetteria"
            )
            return web.json_response({"ok": True, "message": "Zaxira nusxasi Telegram orqali yuborildi."})
        except Exception as e:
            logger.warning("Backup yuborishda xatolik: %s", e)
    return web.FileResponse(
        path=str(use_file),
        headers={"Content-Disposition": f'attachment; filename="{backup_filename}"'}
    )


# =====================================================================
# SERVERNI ISHGA TUSHIRISH (AIOHTTP + AIOGRAM)
# =====================================================================
async def main():
    init_and_migrate_db()
    app = web.Application(middlewares=[cors_and_security_middleware], client_max_size=65536)

    # API marshrutlari
    app.router.add_post("/api/orders", api_create_order)
    app.router.add_get("/api/orders/status", api_public_orders_status)
    app.router.add_get("/api/orders", api_admin_list_orders)
    app.router.add_patch("/api/orders/{id}", api_admin_update_status)
    app.router.add_patch("/api/orders/{id}/status", api_admin_update_status)
    app.router.add_post("/api/orders/{id}/append", api_order_append)
    app.router.add_post("/api/orders/{id}/pay", api_order_pay)
    app.router.add_post("/api/admin/orders/{id}/append", api_order_append)
    app.router.add_post("/api/admin/orders/{id}/pay", api_order_pay)
    app.router.add_post("/api/register", api_register_client)
    app.router.add_post("/api/reservations", api_create_reservation)
    app.router.add_get("/api/reservations", api_list_reservations)
    app.router.add_patch("/api/reservations/{id}/status", api_update_reservation_status)
    app.router.add_get("/api/stoplist", api_get_stoplist)
    app.router.add_post("/api/stoplist", api_toggle_stoplist)
    app.router.add_post("/api/admin/login", api_admin_login)
    app.router.add_post("/api/admin/logout", api_admin_logout)
    app.router.add_get("/api/admin/me", api_admin_me)
    app.router.add_get("/api/admin/stats", api_admin_stats)
    app.router.add_get("/api/admin/orders", api_admin_list_orders)
    app.router.add_get("/api/admin/orders/{id}", api_admin_get_order)
    app.router.add_patch("/api/admin/orders/{id}/status", api_admin_update_status)
    app.router.add_get("/api/admin/cash-operations", api_admin_get_cash_operations)
    app.router.add_post("/api/admin/cash-operations", api_admin_add_cash_operation)
    app.router.add_get("/api/admin/backup", api_admin_trigger_backup)
    app.router.add_post("/api/admin/backup", api_admin_trigger_backup)
    app.router.add_get("/api/admin/stream", api_admin_sse_stream)
    app.router.add_get("/api/stream", api_public_sse_stream)

    # Statik fayllar
    app.router.add_get("/", serve_index)
    app.router.add_get("/admin", serve_admin)
    app.router.add_get("/admin.html", serve_admin)
    app.router.add_static("/", path=str(STATIC_ROOT), show_index=False)

    bot_instance: Optional[Bot] = None
    if BOT_TOKEN:
        bot_instance = Bot(token=BOT_TOKEN)
        app["bot"] = bot_instance

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, HOST, PORT)
    await site.start()
    logger.info("HTTP Server ishga tushdi: http://%s:%d/admin.html", HOST, PORT)
    logger.info("Admin tizimga kirish login: '%s'", ADMIN_USERNAME)

    if bot_instance:
        if WEBAPP_URL.startswith("https://"):
            try:
                await bot_instance.set_chat_menu_button(
                    menu_button=MenuButtonWebApp(text="🍔 Menyu", web_app=WebAppInfo(url=WEBAPP_URL))
                )
                logger.info("MenuButtonWebApp o'rnatildi: %s", WEBAPP_URL)
            except Exception as exc:
                logger.warning("MenuButtonWebApp xatosi: %s", exc)

        logger.info("Telegram-bot polling rejimida ishga tushmoqda...")
        async def run_bot_polling():
            while True:
                try:
                    await dp.start_polling(bot_instance)
                    break
                except asyncio.CancelledError:
                    break
                except Exception as exc:
                    logger.warning("Telegram polling tarmog'ida xatolik: %s. 5 soniyadan so'ng qayta uriniladi...", exc)
                    await asyncio.sleep(5)

        async def run_daily_backup_scheduler():
            last_date = ""
            tashkent_tz = timezone(timedelta(hours=5))
            while True:
                try:
                    now = datetime.now(tashkent_tz)
                    today = now.strftime("%Y-%m-%d")
                    # Har kuni ertalab 05:00 da (Toshkent vaqti UTC+5) smena yopilganda avto-backup
                    if now.hour == 5 and last_date != today:
                        target_chat = ADMIN_USER_ID or GROUP_CHAT_ID
                        if target_chat and DB_PATH.exists():
                            backup_dir = BASE_DIR / "backups"
                            backup_dir.mkdir(parents=True, exist_ok=True)
                            nightly_filename = f"cafe_bot_night_{today}.db"
                            nightly_file = backup_dir / nightly_filename
                            success = create_sqlite_backup_file(nightly_file)
                            use_file = nightly_file if (success and nightly_file.exists()) else DB_PATH
                            doc = FSInputFile(str(use_file), filename=nightly_filename)
                            await bot_instance.send_document(
                                chat_id=int(target_chat),
                                document=doc,
                                caption=f"🌙 <b>Avtomatik tungi zaxira nusxasi (cafe_bot.db)</b>\n📅 Smena: {get_tashkent_shift_date()}\n⏰ Vaqt: 05:00 (Toshkent)\n☕ American Caffetteria"
                            )
                            last_date = today
                            logger.info("Tungi zaxira nusxasi Telegramga yuborildi.")
                    await asyncio.sleep(60)
                except asyncio.CancelledError:
                    break
                except Exception as exc:
                    logger.warning("Backup scheduler xatosi: %s", exc)
                    await asyncio.sleep(60)

        polling_task = asyncio.create_task(run_bot_polling())
        backup_task = asyncio.create_task(run_daily_backup_scheduler())
        try:
            await asyncio.Event().wait()
        except (KeyboardInterrupt, asyncio.CancelledError):
            pass
        finally:
            polling_task.cancel()
            backup_task.cancel()
            try:
                await bot_instance.session.close()
            except Exception:
                pass
    else:
        logger.warning("BOT_TOKEN ko'rsatilmagan. Faqat veb-server ishlaydi.")
        await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
