import json
import subprocess
import time
import urllib.request
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def req_json(url, method="GET", data=None, headers=None):
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    body = json.dumps(data).encode("utf-8") if data is not None else None
    r = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(r, timeout=5) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))


def main():
    print("\n=== RUNNING 11/11 REAL-TIME POS & API ENDPOINT TESTS ===")
    proc = subprocess.Popen(
        ["node", str(ROOT / "local_preview.js")],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(1.0)
    base = "http://127.0.0.1:3456"

    try:
        # 1. POST /api/admin/login
        st, d1 = req_json(f"{base}/api/admin/login", "POST", {"username": "admin", "password": "admin123!"})
        assert st == 200 and d1.get("ok") and d1.get("token"), f"Login failed: {d1}"
        token = d1["token"]
        auth_hdr = {"Authorization": f"Bearer {token}"}
        print("1. POST /api/admin/login -> SUCCESS (JWT/Session token)")

        # 2. POST /api/orders (#AC-1015 - Dine-in Unpaid / Postpaid)
        st, d2 = req_json(
            f"{base}/api/orders",
            "POST",
            {
                "customer_name": "Rustamov Amal",
                "phone": "+998908220101",
                "delivery_type": "dine_in",
                "address": "1-Stol",
                "payment_method": "unpaid",
                "payment_status": "pending",
                "promo_code": "AMERICAN10",
                "items": [{"id": "burger_gamburger", "name": "Gamburger", "price": 39000, "qty": 2}],
            },
        )
        assert st in (200, 201) and d2.get("ok") and d2["order"]["order_code"].startswith("#AC-"), f"Order failed: {d2}"
        ord_id = d2["order"]["id"]
        assert d2["order"]["payment_status"] == "pending", f"Expected pending payment: {d2}"
        print(f"2. POST /api/orders ({d2['order']['order_code']} - Dine-in Unpaid) -> SUCCESS (Zero-F5)")

        # 3. POST /api/orders/:id/append (Do-zakaz - Qo'shimcha taom qo'shish)
        st_app, d_app = req_json(
            f"{base}/api/orders/{ord_id}/append",
            "POST",
            {
                "items": [{"id": "coca_cola_05", "name": "Coca-Cola 0.5L", "price": 8000, "qty": 2}],
                "comment": "Do-zakaz",
            },
            auth_hdr,
        )
        assert st_app == 200 and d_app.get("ok") and len(d_app["order"]["items"]) == 2, f"Append failed: {d_app}"
        print(f"3. POST /api/orders/{ord_id}/append (Do-zakaz) -> SUCCESS ({len(d_app['order']['items'])} xil taom)")

        # 4. POST /api/orders/:id/pay (Chiqishda to'lash / Kassada hisob-kitob)
        st_pay, d_pay = req_json(
            f"{base}/api/orders/{ord_id}/pay",
            "POST",
            {"payment_method": "click", "operator": "kassir"},
            auth_hdr,
        )
        assert st_pay == 200 and d_pay.get("ok") and d_pay["order"]["payment_status"] == "paid" and d_pay["order"]["status"] == "completed", f"Pay failed: {d_pay}"
        print(f"4. POST /api/orders/{ord_id}/pay (Chiqishda to'lash) -> SUCCESS (paid & completed)")

        # 5. PATCH /api/orders/:id ('cooking')
        st, d3 = req_json(f"{base}/api/orders/{ord_id}", "PATCH", {"status": "cooking"}, auth_hdr)
        assert st == 200 and d3.get("ok") and d3["order"]["status"] == "cooking", f"Patch order failed: {d3}"
        print(f"5. PATCH /api/orders/{ord_id} ('cooking') -> SUCCESS")

        # 6. POST /api/reservations (VIP Xona)
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
        print("6. POST /api/reservations (VIP Xona) -> SUCCESS")

        # 7. GET /api/reservations
        st, d5 = req_json(f"{base}/api/reservations", "GET", None, auth_hdr)
        assert st == 200 and d5.get("ok") and len(d5.get("reservations", [])) >= 1, f"List reservations failed: {d5}"
        print("7. GET /api/reservations -> SUCCESS")

        # 8. PATCH /api/reservations/:id/status
        st, d6 = req_json(f"{base}/api/reservations/{res_id}/status", "PATCH", {"status": "confirmed"}, auth_hdr)
        assert st == 200 and d6.get("ok") and d6["reservation"]["status"] == "confirmed", f"Patch reservation failed: {d6}"
        print(f"8. PATCH /api/reservations/{res_id}/status -> SUCCESS")

        # 9. GET & POST /api/stoplist
        st, d7_post = req_json(f"{base}/api/stoplist", "POST", {"item_id": "pizza_peperoni", "stopped": True}, auth_hdr)
        st2, d7_get = req_json(f"{base}/api/stoplist", "GET", None, auth_hdr)
        assert st == 200 and "pizza_peperoni" in d7_get.get("stoplist", []), f"Stoplist failed: {d7_get}"
        req_json(f"{base}/api/stoplist", "POST", {"item_id": "pizza_peperoni", "stopped": False}, auth_hdr)
        print("9. GET & POST /api/stoplist -> SUCCESS")

        # 10. GET /api/admin/stats (Shift Report + TOP-5 Dishes)
        st, d8 = req_json(f"{base}/api/admin/stats", "GET", None, auth_hdr)
        assert st == 200 and d8.get("ok") and "top_dishes" in d8 and d8.get("total_revenue", 0) > 0, f"Stats failed: {d8}"
        print("10. GET /api/admin/stats (Shift Report & TOP-5) -> SUCCESS")

        # 11. GET /api/stream (SSE Stream)
        req_sse = urllib.request.Request(f"{base}/api/stream", headers=auth_hdr)
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(req_sse, timeout=5) as sse_resp:
            ctype = sse_resp.headers.get("Content-Type", "")
            first_chunk = sse_resp.readline().decode("utf-8")
            assert "text/event-stream" in ctype and "event: connected" in first_chunk, f"SSE failed: {ctype} {first_chunk}"
        print("11. GET /api/stream (SSE Stream) -> SUCCESS (text/event-stream)")

        print("\n==========================================")
        print("  NATIJA: 11/11 PASS (100% SUCCESS)       ")
        print("==========================================\n")
    finally:
        proc.terminate()
        proc.wait(timeout=3)


if __name__ == "__main__":
    main()
