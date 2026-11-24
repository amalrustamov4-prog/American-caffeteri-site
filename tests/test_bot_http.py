import os
import sys
import time
import json
import io
import zipfile
import tempfile
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def req_json(url, method="GET", data=None, headers=None):
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    body = json.dumps(data).encode("utf-8") if data is not None else None
    r = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(r, timeout=8) as resp:
            content_type = resp.headers.get("Content-Type", "")
            raw = resp.read()
            if "application/json" in content_type:
                return resp.status, json.loads(raw.decode("utf-8")), resp.headers
            return resp.status, raw, resp.headers
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw.decode("utf-8")), e.headers
        except Exception:
            return e.code, {"error": raw.decode("utf-8", errors="ignore")}, e.headers


def main():
    print("\n=== RUNNING FULL INTEGRATION TEST ON LIVE bot.py (aiohttp) ===")
    test_port = 8099
    base = f"http://127.0.0.1:{test_port}"
    temp_dir = tempfile.mkdtemp(prefix="cafe_test_")
    temp_db = os.path.join(temp_dir, "test_cafe.db")

    env = os.environ.copy()
    env["PORT"] = str(test_port)
    env["HOST"] = "127.0.0.1"
    env["DB_PATH"] = temp_db
    env["BOT_TOKEN"] = ""  # Run only HTTP web-server
    env["ADMIN_PASSWORD"] = "admin123!"
    env["ADMIN_SESSION_SECRET"] = "integration_test_secret_32bytes_long!"
    env["PIN_OWNER"] = "7777"
    env["PIN_CASHIER"] = "1111"
    env["PIN_WAITER"] = "2222"
    env["PIN_KITCHEN"] = "3333"
    env["PIN_COURIER"] = "4444"

    proc = subprocess.Popen(
        [sys.executable, str(ROOT / "telegram_bot" / "bot.py")],
        cwd=str(ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        # Wait for server to start with polling retry (up to 15 seconds)
        started = False
        t_start = time.time()
        while time.time() - t_start < 15:
            if proc.poll() is not None:
                out, err = proc.communicate()
                raise RuntimeError(f"bot.py exited prematurely with code {proc.returncode}:\nSTDOUT:\n{out.decode()}\nSTDERR:\n{err.decode()}")
            try:
                st_h, d_h, _ = req_json(f"{base}/api/health", "GET")
                if st_h == 200:
                    started = True
                    break
            except Exception:
                time.sleep(0.3)
        if not started:
            raise RuntimeError("bot.py failed to start and respond on /api/health within 15 seconds")

        # 1. GET /api/health
        st_h, d_h, _ = req_json(f"{base}/api/health", "GET")
        assert st_h == 200 and d_h.get("ok") and d_h.get("db") == "ok", f"Healthcheck failed: {st_h} {d_h}"
        print("1. GET /api/health -> SUCCESS (db: ok, bot_configured: False)")

        # 2. POST /api/admin/login
        st_l, d_l, hdrs_l = req_json(f"{base}/api/admin/login", "POST", {"username": "admin", "password": "admin123!"})
        assert st_l == 200 and d_l.get("ok") and d_l.get("token"), f"Admin login failed: {st_l} {d_l}"
        token = d_l["token"]
        auth_hdr = {
            "Authorization": f"Bearer {token}",
            "X-Requested-With": "XMLHttpRequest",
        }
        print("2. POST /api/admin/login -> SUCCESS (Admin JWT token received)")

        # 3. POST /api/orders (Dine-in Order with Catalog Items)
        st_o, d_o, _ = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "customer_name": "Integration Tester",
                "phone": "+998901234567",
                "delivery_type": "dine_in",
                "address": "VIP-1",
                "payment_method": "unpaid",
                "payment_status": "paid",  # Client attempts to spoof paid status
                "items": [{"id": "burger_gamburger", "name": "Gamburger", "price": 35000, "qty": 1}],
            },
        )
        assert st_o in (200, 201) and d_o.get("ok"), f"Create order failed: {st_o} {d_o}"
        order = d_o["order"]
        ord_id = order["id"]
        assert order["payment_status"] == "pending", f"Security violation: non-admin request forged paid status: {order}"
        assert order["service_fee"] == 3500, f"Expected 3500 service fee for 10% dine-in: {order}"
        print(f"3. POST /api/orders (#{order.get('order_code')}) -> SUCCESS (Dine-in & Security Clamp)")

        # 4. POST /api/orders/:id/append — Price Spoofing Prevention
        # Client tries to inject price: 1 UZS for Coca-Cola 0.5L (real price is 8000 UZS)
        st_app, d_app, _ = req_json(
            f"{base}/api/orders/{ord_id}/append",
            "POST",
            {
                "items": [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 1, "qty": 1}],
                "comment": "Qo'shimcha cola",
            },
            auth_hdr,
        )
        assert st_app == 200 and d_app.get("ok"), f"Append failed: {st_app} {d_app}"
        app_order = d_app["order"]
        # Find appended item and check price
        appended_item = [it for it in app_order["items"] if it.get("id") == "coca_cola_05"][0]
        assert appended_item["price"] == 10000, f"PRICE SPOOFING VULNERABILITY! Expected 10000, got: {appended_item['price']}"
        assert app_order["subtotal"] == 45000, f"Expected subtotal 45000, got {app_order['subtotal']}"
        assert app_order["service_fee"] == 4500, f"Expected service fee 4500, got {app_order['service_fee']}"
        assert app_order["total"] == 49500, f"Expected total 49500, got {app_order['total']}"
        print("4. POST /api/orders/:id/append -> SUCCESS (Price spoofing blocked! Forced 10000 UZS catalog price)")

        # 5. Role-Based Access Control (RBAC) on /append
        # Login as Courier (PIN 4444)
        st_cp, d_cp, _ = req_json(f"{base}/api/admin/login", "POST", {"pin": "4444"})
        assert st_cp == 200 and d_cp.get("role") == "courier", f"Courier login failed: {d_cp}"
        courier_hdr = {
            "Authorization": f"Bearer {d_cp['token']}",
            "X-Requested-With": "XMLHttpRequest",
        }
        st_c_app, _, _ = req_json(f"{base}/api/orders/{ord_id}/append", "POST", {"items": [{"id": "coca_cola_05", "qty": 1}]}, courier_hdr)
        assert st_c_app == 403, f"Expected 403 for courier appending, got {st_c_app}"

        # Login as Waiter (PIN 2222)
        st_wp, d_wp, _ = req_json(f"{base}/api/admin/login", "POST", {"pin": "2222"})
        assert st_wp == 200 and d_wp.get("role") == "waiter", f"Waiter login failed: {d_wp}"
        waiter_hdr = {
            "Authorization": f"Bearer {d_wp['token']}",
            "X-Requested-With": "XMLHttpRequest",
        }
        st_w_app, d_w_app, _ = req_json(f"{base}/api/orders/{ord_id}/append", "POST", {"items": [{"id": "drink_fanta_05", "name": "Fanta 0.5L", "qty": 1}]}, waiter_hdr)
        assert st_w_app == 200 and d_w_app.get("ok"), f"Expected 200 for waiter appending, got {st_w_app}"
        print("5. RBAC on /append -> SUCCESS (Courier 403 Forbidden, Waiter 200 OK)")

        # 6. KDS Status Update to 'ready'
        st_r, d_r, _ = req_json(
            f"{base}/api/admin/orders/{ord_id}/status",
            "PATCH",
            {"kitchen_status": "ready"},
            auth_hdr,
        )
        assert st_r == 200 and d_r.get("ok"), f"KDS ready status failed: {st_r} {d_r}"
        assert d_r["order"]["kitchen_status"] == "ready", f"Expected kitchen_status 'ready': {d_r}"
        print("6. PATCH /api/admin/orders/:id/status (KDS ready) -> SUCCESS")

        # 7. Database Backup Download
        req_bk = urllib.request.Request(f"{base}/api/admin/backup?download=1", headers=auth_hdr)
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(req_bk, timeout=5) as bk_resp:
            assert bk_resp.status == 200, f"Expected 200 for backup download, got {bk_resp.status}"
            magic_bytes = bk_resp.read(16)
            assert b"SQLite format 3" in magic_bytes, f"Expected SQLite format 3, got {magic_bytes}"
        print("7. GET /api/admin/backup?download=1 -> SUCCESS (Valid SQLite format 3 database)")

        # 8. Excel Export Injection Protection
        st_inj, d_inj, _ = req_json(f"{base}/api/admin/export-excel?date=2026-11-24'__import__('os')", "GET", None, auth_hdr)
        assert st_inj == 400 and not d_inj.get("ok"), f"Expected 400 for malicious date parameter, got {st_inj}: {d_inj}"
        print("8. Injection Protection in /api/admin/export-excel -> SUCCESS (Returned 400 Bad Request)")

        # 9. Excel (.xlsx) Report Generation and OOXML Validation
        req_xl = urllib.request.Request(f"{base}/api/admin/export-excel?date=2026-11-24", headers=auth_hdr)
        with opener.open(req_xl, timeout=8) as xl_resp:
            assert xl_resp.status == 200, f"Expected 200 for Excel export, got {xl_resp.status}"
            ct = xl_resp.headers.get("Content-Type", "")
            assert "openxmlformats" in ct, f"Expected openxmlformats Content-Type, got {ct}"
            xl_bytes = xl_resp.read()
            assert xl_bytes.startswith(b"PK\x03\x04"), f"Excel file does not have zip magic bytes: {xl_bytes[:10]}"
            with zipfile.ZipFile(io.BytesIO(xl_bytes)) as zf:
                names = zf.namelist()
                assert "[Content_Types].xml" in names, "Missing [Content_Types].xml"
                assert "xl/workbook.xml" in names, "Missing xl/workbook.xml"
                assert "xl/styles.xml" in names, "Missing xl/styles.xml"
                for i in range(1, 7):
                    assert f"xl/worksheets/sheet{i}.xml" in names, f"Missing xl/worksheets/sheet{i}.xml"
        print("9. GET /api/admin/export-excel -> SUCCESS (Pure Python 6-sheet OOXML .xlsx valid)")

        print("\n==============================================================")
        print("  ALL 9 LIVE bot.py (aiohttp) INTEGRATION TESTS PASSED (100%) ")
        print("==============================================================\n")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        if os.path.exists(temp_dir):
            try:
                import shutil
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass


if __name__ == "__main__":
    main()
