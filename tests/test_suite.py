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
    conn.close()
            
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
