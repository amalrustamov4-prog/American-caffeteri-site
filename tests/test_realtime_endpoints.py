import json
import subprocess
import time
import urllib.request
import urllib.error
import sys
import io
import zipfile
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
        with opener.open(r, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except Exception:
            return e.code, {"error": str(e)}


def main():
    print("\n=== RUNNING V3 REAL-TIME POS & API ENDPOINT TESTS ===")
    proc = subprocess.Popen(
        ["node", str(ROOT / "local_preview.js")],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(1.0)
    base = "http://127.0.0.1:3456"

    try:
        # 0. GET /api/health (Healthcheck verification)
        st_h, d_h = req_json(f"{base}/api/health", "GET")
        assert st_h == 200 and d_h.get("ok") and d_h.get("db") == "ok", f"Healthcheck failed: {d_h}"
        print("0. GET /api/health -> SUCCESS (db: ok, 200 OK)")

        # 1. POST /api/admin/login
        st, d1 = req_json(f"{base}/api/admin/login", "POST", {"username": "admin", "password": "admin123!"})
        assert st == 200 and d1.get("ok") and d1.get("token"), f"Login failed: {d1}"
        token = d1["token"]
        auth_hdr = {"Authorization": f"Bearer {token}"}
        print("1. POST /api/admin/login -> SUCCESS (JWT/Session token)")

        # 2. POST /api/orders (Dine-in with 10% Service Fee & Unpaid Exit Pay)
        st, d2 = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "customer_name": "Rustamov Amal",
                "phone": "+998908220101",
                "delivery_type": "dine_in",
                "address": "1-Stol",
                "payment_method": "unpaid",
                "payment_status": "paid",  # Client attempts to fake paid status
                "promo_code": "AMERICAN10",
                "items": [{"id": "burger_gamburger", "name": "Gamburger", "price": 35000, "qty": 2}],
            },
        )
        assert st in (200, 201) and d2.get("ok") and d2["order"]["order_code"].startswith("#AC-"), f"Order failed: {d2}"
        ord_id = d2["order"]["id"]
        # Security clamp: non-admin request cannot forge paid status
        assert d2["order"]["payment_status"] == "pending", f"Expected pending payment: {d2}"
        # 10% Service Fee for Dine-in: (70000 - 7000) * 10% = 6300
        assert d2["order"]["service_fee"] == 6300, f"Expected 6300 service fee: {d2['order']}"
        assert d2["order"]["total"] == 69300, f"Expected 69300 total: {d2['order']}"
        print(f"2. POST /api/orders ({d2['order']['order_code']} - 10% Service Fee & Security Clamp) -> SUCCESS")

        # 3. Security: POST /api/orders/:id/append without auth -> 401
        st_noauth, d_noauth = req_json(
            f"{base}/api/orders/{ord_id}/append",
            "POST",
            {"items": [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 8000, "qty": 1}]},
        )
        assert st_noauth == 401, f"Expected 401 for unauthorized append: {st_noauth}"
        print("3. Security check: POST /append without Auth -> 401 Unauthorized (PROTECTED)")

        # 4. Security: POST /api/orders/:id/pay without auth -> 401
        st_pay_noauth, d_pay_noauth = req_json(
            f"{base}/api/orders/{ord_id}/pay",
            "POST",
            {"payment_method": "cash"},
        )
        assert st_pay_noauth == 401, f"Expected 401 for unauthorized pay: {st_pay_noauth}"
        print("4. Security check: POST /pay without Auth -> 401 Unauthorized (PROTECTED)")

        # 5. POST /api/orders/:id/append (Do-zakaz with Auth - recalculates service fee)
        st_app, d_app = req_json(
            f"{base}/api/orders/{ord_id}/append",
            "POST",
            {
                "items": [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 8000, "qty": 2}],
                "comment": "Do-zakaz",
            },
            auth_hdr,
        )
        assert st_app == 200 and d_app.get("ok"), f"Append failed: {d_app}"
        # (86000 - 7000) * 10% = 7900 service fee, total = 79000 + 7900 = 86900
        assert d_app["order"]["service_fee"] == 7900, f"Expected recalculated 7900 service fee: {d_app['order']}"
        assert d_app["order"]["total"] == 86900, f"Expected recalculated 86900 total: {d_app['order']}"
        print(f"5. POST /api/orders/{ord_id}/append (Do-zakaz + Service Fee Recalc) -> SUCCESS (Total: {d_app['order']['total']} UZS)")

        # 6. Kitchen KDS status update
        st_k, d_k = req_json(f"{base}/api/orders/{ord_id}", "PATCH", {"kitchen_status": "ready"}, auth_hdr)
        assert st_k == 200 and d_k.get("ok") and d_k["order"]["kitchen_status"] == "ready", f"Kitchen status failed: {d_k}"
        print(f"6. PATCH /api/orders/{ord_id} (kitchen_status: 'ready') -> SUCCESS (KDS Ready)")

        # 7. POST /api/orders/:id/pay (Chiqishda to'lash: Card Terminal)
        st_pay, d_pay = req_json(
            f"{base}/api/orders/{ord_id}/pay",
            "POST",
            {"payment_method": "card_terminal", "operator": "kassir"},
            auth_hdr,
        )
        assert st_pay == 200 and d_pay.get("ok") and d_pay["order"]["payment_status"] == "paid" and d_pay["order"]["status"] == "completed", f"Pay failed: {d_pay}"
        assert d_pay["order"]["payment_method"] == "card_terminal"
        print(f"7. POST /api/orders/{ord_id}/pay (card_terminal) -> SUCCESS (paid & completed)")

        # 8. Idempotent pay check
        st_repay, d_repay = req_json(
            f"{base}/api/orders/{ord_id}/pay",
            "POST",
            {"payment_method": "card_terminal"},
            auth_hdr,
        )
        assert st_repay == 200 and d_repay.get("already_paid") is True, f"Expected already_paid: {d_repay}"
        print("8. POST /pay on already paid order -> SUCCESS (already_paid: True, no double charge)")

        # 9. Prohibition: append to closed/completed order -> 400 error
        st_bad_app, d_bad_app = req_json(
            f"{base}/api/orders/{ord_id}/append",
            "POST",
            {"items": [{"id": "coca_cola_05", "name": "Cola", "price": 8000, "qty": 1}]},
            auth_hdr,
        )
        assert st_bad_app == 400, f"Expected 400 for append to completed order: {st_bad_app}"
        print("9. Append to completed order -> 400 Bad Request (BLOCKED)")

        # 10. External courier buyout dispatch & stats verification
        st_c, d_c = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "customer_name": "Delivery Client",
                "phone": "+998909998877",
                "delivery_type": "delivery",
                "address": "Navoiy ko'chasi 12",
                "payment_method": "cash",
                "items": [{"id": "burger_gamburger", "name": "Gamburger", "price": 35000, "qty": 1}],
            },
        )
        c_ord_id = d_c["order"]["id"]
        # Dispatch with external buyout
        st_disp, d_disp = req_json(
            f"{base}/api/orders/{c_ord_id}",
            "PATCH",
            {
                "status": "delivering",
                "delivery_mode": "external_buyout",
                "courier_name": "Yandex Ali",
                "courier_phone": "+998901112233",
                "courier_paid_upfront": 1,
            },
            auth_hdr,
        )
        assert st_disp == 200 and d_disp["order"]["payment_status"] == "paid", f"Buyout failed: {d_disp}"
        # Complete courier delivery
        st_c_done, d_c_done = req_json(f"{base}/api/orders/{c_ord_id}", "PATCH", {"status": "completed"}, auth_hdr)
        assert st_c_done == 200 and d_c_done["order"]["status"] == "completed"

        # Check stats: revenue counted without double counting
        st_stats, d_stats = req_json(f"{base}/api/admin/stats", "GET", None, auth_hdr)
        assert st_stats == 200 and d_stats.get("ok"), f"Stats failed: {d_stats}"
        expected_rev = d_pay["order"]["total"] + d_c_done["order"]["total"]
        assert d_stats["total_revenue"] == expected_rev, f"Expected total rev {expected_rev}, got {d_stats['total_revenue']}"
        print(f"10. External courier buyout & stats revenue (no duplicate) -> SUCCESS ({d_stats['total_revenue']} UZS)")

        # 11. POST /api/reservations (VIP Xona)
        st, d4 = req_json(
            f"{base}/api/reservations",
            "POST",
            {
                "customer_name": "Amal",
                "phone": "+998908220101",
                "hall": "VIP Xona",
                "table_name": "VIP 1 Oila",
                "guests": 6,
                "res_date": "2026-11-14",
                "res_time": "19:30",
            },
        )
        assert st in (200, 201) and d4.get("ok") and d4.get("reservation"), f"Create reservation failed: {d4}"
        res_id = d4["reservation"]["id"]
        print("11. POST /api/reservations (VIP Xona) -> SUCCESS")

        # 12. GET /api/reservations & PATCH /api/reservations/:id/status
        st, d5 = req_json(f"{base}/api/reservations", "GET", None, auth_hdr)
        assert st == 200 and d5.get("ok") and len(d5.get("reservations", [])) >= 1, f"List reservations failed: {d5}"
        st, d6 = req_json(f"{base}/api/reservations/{res_id}/status", "PATCH", {"status": "confirmed"}, auth_hdr)
        assert st == 200 and d6.get("ok") and d6["reservation"]["status"] == "confirmed", f"Patch reservation failed: {d6}"
        print(f"12. GET & PATCH /api/reservations/{res_id}/status -> SUCCESS")

        # 13. GET & POST /api/stoplist
        st, d7_post = req_json(f"{base}/api/stoplist", "POST", {"item_id": "pizza_peperoni", "stopped": True}, auth_hdr)
        st2, d7_get = req_json(f"{base}/api/stoplist", "GET", None, auth_hdr)
        assert st == 200 and "pizza_peperoni" in d7_get.get("stoplist", []), f"Stoplist failed: {d7_get}"
        req_json(f"{base}/api/stoplist", "POST", {"item_id": "pizza_peperoni", "stopped": False}, auth_hdr)
        print("13. GET & POST /api/stoplist -> SUCCESS")

        # 14. GET /api/stream (SSE Stream)
        req_sse = urllib.request.Request(f"{base}/api/stream", headers=auth_hdr)
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(req_sse, timeout=5) as sse_resp:
            ctype = sse_resp.headers.get("Content-Type", "")
            first_chunk = sse_resp.readline().decode("utf-8")
            assert "text/event-stream" in ctype and "event: connected" in first_chunk, f"SSE failed: {ctype} {first_chunk}"
        print("14. GET /api/stream (SSE Stream) -> SUCCESS (text/event-stream)")

        # 15. Fast 4-digit PIN Logins (Role checks)
        st_pin, d_pin = req_json(f"{base}/api/admin/login", "POST", {"pin": "7777"})
        assert st_pin == 200 and d_pin.get("ok") and d_pin.get("role") in ("admin", "owner"), f"Owner PIN login failed: {d_pin}"
        st_pin_c, d_pin_c = req_json(f"{base}/api/admin/login", "POST", {"pin": "4444"})
        assert st_pin_c == 200 and d_pin_c.get("ok") and d_pin_c.get("role") == "courier", f"Courier PIN login failed: {d_pin_c}"
        print("15. POST /api/admin/login (PIN 7777 admin & PIN 4444 courier) -> SUCCESS")

        # 16. Cancellation with cancel_reason
        st_can_ord, d_can_ord = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "items": [{"id": "coca_cola_05", "qty": 1}],
                "delivery_type": "dine_in",
                "customer_name": "Test Cancel Order",
                "phone": "+998 90 123 45 67",
                "payment_status": "pending",
                "source": "kassa",
                "waiter_name": "Jasur",
            },
            auth_hdr,
        )
        assert st_can_ord in (200, 201) and d_can_ord.get("ok"), f"Create order to cancel failed: {d_can_ord}"
        can_ord_id = d_can_ord["order"]["id"]
        st_canc, d_canc = req_json(
            f"{base}/api/admin/orders/{can_ord_id}/status",
            "PATCH",
            {"status": "cancelled", "cancel_reason": "Mijoz fikridan qaytdi"},
            auth_hdr,
        )
        assert st_canc == 200 and d_canc.get("ok") and d_canc["order"]["cancel_reason"] == "Mijoz fikridan qaytdi", f"Cancel reason failed: {d_canc}"
        print(f"16. PATCH /api/admin/orders/{can_ord_id}/status (cancelled with reason) -> SUCCESS")

        # 17. Database Backup download
        req_bk = urllib.request.Request(f"{base}/api/admin/backup?download=1", headers=auth_hdr)
        with opener.open(req_bk, timeout=5) as bk_resp:
            assert bk_resp.status == 200, f"Backup download failed with status {bk_resp.status}"
            bk_data = bk_resp.read(16)
            assert b"SQLite format 3" in bk_data, f"Backup content is not SQLite: {bk_data}"
        print("17. GET /api/admin/backup?download=1 (SQLite verification) -> SUCCESS")

        # 18. Stats with waiter accounting & open tables verification
        st_st, d_st = req_json(f"{base}/api/admin/stats", "GET", None, auth_hdr)
        assert st_st == 200 and d_st.get("ok"), f"Stats failed: {d_st}"
        assert "waiter_stats" in d_st, f"waiter_stats missing in stats: {d_st}"
        assert "unpaid_open_tables_count" in d_st, f"unpaid_open_tables_count missing in stats: {d_st}"
        print("18. GET /api/admin/stats (waiter_stats & unpaid_open_tables_count) -> SUCCESS")

        # 19. Backend Role-Based Access Control (RBAC) Enforcement
        courier_hdr = {"Authorization": f"Bearer {d_pin_c['token']}"}
        # Courier cannot download backup (403 Forbidden)
        st_c_bk, d_c_bk = req_json(f"{base}/api/admin/backup?download=1", "GET", None, courier_hdr)
        assert st_c_bk == 403, f"Expected 403 for courier downloading backup, got {st_c_bk}: {d_c_bk}"

        # Courier cannot view stats (403 Forbidden)
        st_c_st, d_c_st = req_json(f"{base}/api/admin/stats", "GET", None, courier_hdr)
        assert st_c_st == 403, f"Expected 403 for courier viewing stats, got {st_c_st}: {d_c_st}"

        # Waiter login and attempting to pay order (403 Forbidden)
        st_pin_w, d_pin_w = req_json(f"{base}/api/admin/login", "POST", {"pin": "2222"})
        assert st_pin_w == 200 and d_pin_w.get("role") == "waiter", f"Waiter login failed: {d_pin_w}"
        waiter_hdr = {"Authorization": f"Bearer {d_pin_w['token']}"}
        st_w_pay, d_w_pay = req_json(f"{base}/api/orders/{can_ord_id}/pay", "POST", {"payment_method": "cash"}, waiter_hdr)
        assert st_w_pay == 403, f"Expected 403 for waiter paying order, got {st_w_pay}: {d_w_pay}"
        print("19. Backend RBAC checks (courier backup/stats 403 & waiter pay 403) -> SUCCESS")

        # 20. RBAC PATCH /status bypass prevention tests
        # Courier cannot cancel orders via PATCH /status (403)
        st_c_canc, _ = req_json(f"{base}/api/admin/orders/{ord_id}/status", "PATCH", {"status": "cancelled", "cancel_reason": "Hack"}, courier_hdr)
        assert st_c_canc == 403, f"Expected 403 for courier cancelling via PATCH /status, got {st_c_canc}"

        # Waiter cannot confirm payment via PATCH /status (403)
        st_w_pay_st, _ = req_json(f"{base}/api/admin/orders/{ord_id}/status", "PATCH", {"payment_status": "paid"}, waiter_hdr)
        assert st_w_pay_st == 403, f"Expected 403 for waiter marking paid via PATCH /status, got {st_w_pay_st}"

        # Kitchen login (PIN 3333) and attempting to cancel or mark paid via PATCH /status (403)
        st_pin_k, d_pin_k = req_json(f"{base}/api/admin/login", "POST", {"pin": "3333"})
        assert st_pin_k == 200 and d_pin_k.get("role") == "kitchen", f"Kitchen login failed: {d_pin_k}"
        kitchen_hdr = {"Authorization": f"Bearer {d_pin_k['token']}"}
        st_k_canc, _ = req_json(f"{base}/api/admin/orders/{ord_id}/status", "PATCH", {"status": "cancelled"}, kitchen_hdr)
        assert st_k_canc == 403, f"Expected 403 for kitchen cancelling order, got {st_k_canc}"
        st_k_pay, _ = req_json(f"{base}/api/admin/orders/{ord_id}/status", "PATCH", {"payment_status": "paid"}, kitchen_hdr)
        assert st_k_pay == 403, f"Expected 403 for kitchen marking paid, got {st_k_pay}"
        print("20. RBAC PATCH /status bypass prevention (kitchen/courier/waiter restricted) -> SUCCESS")

        # 21. RBAC on Order Append (/api/orders/:id/append)
        st_app_ord, d_app_ord = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "customer_name": "Append Test",
                "phone": "+998901112233",
                "delivery_type": "dine_in",
                "address": "2-Stol",
                "payment_method": "unpaid",
                "items": [{"id": "burger_gamburger", "name": "Gamburger", "price": 35000, "qty": 1}],
            },
        )
        assert st_app_ord in (200, 201) and d_app_ord.get("ok"), f"Create order for append failed: {d_app_ord}"
        app_ord_id = d_app_ord["order"]["id"]

        st_c_app, _ = req_json(f"{base}/api/orders/{app_ord_id}/append", "POST", {"items": [{"name": "Cola", "price": 10000, "quantity": 1}]}, courier_hdr)
        assert st_c_app == 403, f"Expected 403 for courier appending, got {st_c_app}"
        st_k_app, _ = req_json(f"{base}/api/orders/{app_ord_id}/append", "POST", {"items": [{"name": "Cola", "price": 10000, "quantity": 1}]}, kitchen_hdr)
        assert st_k_app == 403, f"Expected 403 for kitchen appending, got {st_k_app}"
        st_w_app, d_w_app = req_json(f"{base}/api/orders/{app_ord_id}/append", "POST", {"items": [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 1, "qty": 1}]}, waiter_hdr)
        assert st_w_app == 200 and d_w_app.get("ok"), f"Expected 200 for waiter appending, got {st_w_app}: {d_w_app}"
        print("21. RBAC Order Append (courier/kitchen 403, waiter 200) -> SUCCESS")

        # 22. Excel (.xlsx) Report Export RBAC & OOXML Structure
        st_c_xl, _ = req_json(f"{base}/api/admin/export-excel", "GET", None, courier_hdr)
        assert st_c_xl == 403, f"Expected 403 for courier exporting excel, got {st_c_xl}"

        # 23. Export Excel with query date & Injection Protection
        st_inj, d_inj = req_json(f"{base}/api/admin/export-excel?date=2026-11-24'__import__('os')", "GET", None, auth_hdr)
        assert st_inj == 400 and not d_inj.get("ok"), f"Expected 400 for malicious date parameter, got {st_inj}: {d_inj}"

        req_xl = urllib.request.Request(f"{base}/api/admin/export-excel?date=2026-11-24", headers=auth_hdr)
        with opener.open(req_xl, timeout=5) as xl_resp:
            assert xl_resp.status == 200, f"Expected 200 for admin exporting excel, got {xl_resp.status}"
            ct = xl_resp.headers.get("Content-Type", "")
            assert "openxmlformats" in ct, f"Expected openxmlformats Content-Type, got {ct}"
            xl_bytes = xl_resp.read()
            assert xl_bytes.startswith(b"PK\x03\x04"), f"Excel file does not have zip magic bytes: {xl_bytes[:10]}"
            with zipfile.ZipFile(io.BytesIO(xl_bytes)) as zf:
                names = zf.namelist()
                assert "[Content_Types].xml" in names, "Missing [Content_Types].xml"
                assert "xl/workbook.xml" in names, "Missing xl/workbook.xml"
                for i in range(1, 7):
                    assert f"xl/worksheets/sheet{i}.xml" in names, f"Missing xl/worksheets/sheet{i}.xml"
        print("22-23. GET /api/admin/export-excel (RBAC 403 for courier, injection 400, 200 & valid 6-sheet .xlsx for admin) -> SUCCESS")

        print("\n==========================================")
        print("  NATIJA: 23/23 PASS (100% SUCCESS)       ")
        print("==========================================\n")
    finally:
        proc.terminate()
        proc.wait(timeout=3)


if __name__ == "__main__":
    main()
