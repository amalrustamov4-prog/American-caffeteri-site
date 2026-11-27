import os
import sys
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def test_menu_data():
    print("\n--- [TEST 1] Проверка menu_data.js и картинок ---")
    menu_file = ROOT / "menu_data.js"
    assert menu_file.exists(), "menu_data.js не найден!"
    
    content = menu_file.read_text(encoding="utf-8")
    
    cat_match = re.search(r'window\.menuCategories\s*=\s*(\[.*?\]);', content, re.DOTALL)
    item_match = re.search(r'window\.menuItems\s*=\s*(\[.*?\]);', content, re.DOTALL)
    
    assert cat_match, "window.menuCategories не найден!"
    assert item_match, "window.menuItems не найден!"
    
    categories = json.loads(cat_match.group(1))
    items = json.loads(item_match.group(1))
    
    print(f"Категорий: {len(categories)}")
    print(f"Блюд в меню: {len(items)}")
    
    assert len(categories) >= 10, f"Ожидалось не менее 10 категорий, получено {len(categories)}"
    assert len(items) >= 70, f"Ожидалось не менее 70 позиций, получено {len(items)}"
    
    missing_images = []
    item_ids = set()
    for item in items:
        iid = item.get("id")
        assert iid, f"У блюда отсутствует id: {item}"
        assert iid not in item_ids, f"Дубликат id: {iid}"
        item_ids.add(iid)
        
        name = item.get("name")
        assert isinstance(name, dict) and "ru" in name and "uz" in name, f"Неверное поле name у {iid}: {name}"
        
        price = item.get("price")
        assert isinstance(price, (int, float)) and price > 0, f"Неверная цена у {iid}: {price}"
        
        img_rel = item.get("image")
        assert img_rel, f"Отсутствует image у {iid}"
        img_path = ROOT / img_rel
        if not img_path.exists():
            missing_images.append((iid, img_rel))
            
    if missing_images:
        print(f"ВНИМАНИЕ: Не найдены картинки ({len(missing_images)}): {missing_images[:5]}")
        assert False, f"Отсутствуют файлы картинок: {len(missing_images)}"
    else:
        print(f"Все {len(items)} блюд имеют существующие фотографии на диске!")
        
    print("-> ТЕСТ 1 УСПЕШНО ПРОЙДЕН")


def test_bot_database_and_logic():
    print("\n--- [TEST 2] Проверка базы данных и логики telegram_bot/bot.py ---")
    sys.path.insert(0, str(ROOT / "telegram_bot"))
    import bot
    
    bot.init_and_migrate_db()
    assert bot.DB_PATH.exists(), f"База данных {bot.DB_PATH} не существует!"
    
    conn = sqlite3.connect(bot.DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cursor.fetchall()]
    print("Таблицы в БД:", tables)
    assert "orders" in tables, "Таблица orders не найдена!"
    assert "users" in tables, "Таблица users не найдена!"

    cursor.execute("PRAGMA table_info(orders);")
    columns = [col[1] for col in cursor.fetchall()]
    expected_cols = [
        "service_fee_percent",
        "service_fee",
        "waiter_name",
        "kitchen_status",
        "delivery_mode",
        "courier_name",
        "courier_phone",
        "courier_paid_upfront",
        "cancel_reason",
    ]
    for c in expected_cols:
        assert c in columns, f"Колонка {c} отсутствует в таблице orders!"
    conn.close()

    # Test transactional logic
    items_sample = [{"id": "burger_gamburger", "name": "Gamburger", "price": 35000, "qty": 1}]
    payload = {
        "customer_name": "Test Mehmon",
        "phone": "+998901234567",
        "comment": "Stol: 1-Stol",
        "delivery_type": "dine_in",
        "payment_method": "cash",
        "source": "kassa",
        "payment_status": "pending",
        "waiter_name": "Jasur",
        "items": items_sample,
    }
    built_order = bot.validate_and_build_order(payload, default_source="kassa", is_staff=True)
    created, is_new = bot.save_order_transactional(built_order)
    assert created.get("id"), "Не удалось создать заказ в транзакции"
    assert created.get("service_fee") == 3500, f"Неверный service_fee: {created.get('service_fee')}"

    # Test append items to active order
    append_items = [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 8000, "qty": 1}]
    appended = bot.append_items_to_order_transactional(created["id"], append_items)
    assert appended.get("subtotal") == 43000, f"Subtotal после дозаказа: {appended.get('subtotal')}"
    assert appended.get("service_fee") == 4300, f"Service fee после дозаказа: {appended.get('service_fee')}"
    assert appended.get("total") == 47300, f"Total после дозаказа: {appended.get('total')}"

    # Test pay order
    paid = bot.pay_and_complete_order_transactional(created["id"], "card_terminal")
    assert paid.get("payment_status") == "paid" and paid.get("status") == "completed"
    assert paid.get("payment_method") == "card_terminal"

    # Test pay idempotency
    repaid = bot.pay_and_complete_order_transactional(created["id"], "card_terminal")
    assert repaid.get("already_paid") is True, "Ожидался флаг already_paid"

    # Test append to completed order raises ValueError
    try:
        bot.append_items_to_order_transactional(created["id"], append_items)
        assert False, "Должна быть ошибка при дозаказе в закрытый заказ"
    except ValueError as e:
        print("Запрет дозаказа в закрытый заказ проверен успешно:", e)
            
    print("-> ТЕСТ 2 УСПЕШНО ПРОЙДЕН")


def test_html_and_assets():
    print("\n--- [TEST 3] Проверка файлов фронтенда и PWA ---")
    index_file = ROOT / "index.html"
    assert index_file.exists(), "index.html отсутствует!"
    idx_content = index_file.read_text(encoding="utf-8")
    
    assert "cart-drawer" in idx_content or "cart" in idx_content, "Корзина не найдена в index.html"
    assert "menu_data.js" in idx_content, "Скрипт menu_data.js не подключен в index.html"
    assert "app.js" in idx_content, "Скрипт app.js не подключен в index.html"
    assert "style.css" in idx_content, "Стиль style.css не подключен в index.html"
    assert "cart-service-fee-row" in idx_content, "cart-service-fee-row отсутствует в index.html"
    assert "card_terminal" in idx_content, "card_terminal отсутствует в index.html"

    admin_file = ROOT / "admin.html"
    assert admin_file.exists(), "admin.html отсутствует!"
    admin_content = admin_file.read_text(encoding="utf-8")
    assert "tab-btn-kitchen" in admin_content, "tab-btn-kitchen отсутствует в admin.html"
    assert "tab-btn-courier" in admin_content, "tab-btn-courier отсутствует в admin.html"
    assert "courier-dispatch-modal" in admin_content, "courier-dispatch-modal отсутствует в admin.html"

    courier_file = ROOT / "courier.html"
    assert courier_file.exists(), "courier.html отсутствует!"
    cour_content = courier_file.read_text(encoding="utf-8")

    privacy_file = ROOT / "privacy.html"
    assert privacy_file.exists(), "privacy.html отсутствует!"
    priv_content = privacy_file.read_text(encoding="utf-8")
    assert "Maxfiylik siyosati" in priv_content, "Maxfiylik siyosati отсутствует в privacy.html"

    # Check iOS PWA / Notch / Dynamic Island meta tags across all HTML files
    for fname, html_doc in [("index.html", idx_content), ("admin.html", admin_content), ("courier.html", cour_content), ("privacy.html", priv_content)]:
        assert "viewport-fit=cover" in html_doc, f"viewport-fit=cover missing in {fname}"
        assert "apple-mobile-web-app-capable" in html_doc, f"apple-mobile-web-app-capable missing in {fname}"
        assert "apple-mobile-web-app-status-bar-style" in html_doc, f"apple-mobile-web-app-status-bar-style missing in {fname}"
        assert "apple-touch-icon" in html_doc, f"apple-touch-icon missing in {fname}"
    print("iOS PWA & Safe-area meta tags verified across index.html, admin.html and courier.html")
    
    manifest_file = ROOT / "manifest.json"
    assert manifest_file.exists(), "manifest.json отсутствует!"
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    assert manifest.get("name"), "Имя приложения в manifest.json не задано"
    
    sw_file = ROOT / "sw.js"
    assert sw_file.exists(), "sw.js отсутствует!"
    
    print("-> ТЕСТ 3 УСПЕШНО ПРОЙДЕН")


if __name__ == "__main__":
    test_menu_data()
    test_bot_database_and_logic()
    test_html_and_assets()
    print("\n==========================================")
    print("  ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ (3/3 PASS)   ")
    print("==========================================\n")
