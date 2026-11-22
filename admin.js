/**
 * American Caffetteria — iikoFront POS Kassa Terminal, KDS & Live Dispatcher
 * Zero-F5 Real-Time Engine: SSE (/api/stream) + BroadcastChannel + 2.5s Polling
 */

(function () {
  "use strict";

  const TABLES_LIST = [
    { id: "1-Stol", name: "1-Stol", hall: "Asosiy Zal", seats: 4 },
    { id: "2-Stol", name: "2-Stol", hall: "Asosiy Zal", seats: 4 },
    { id: "3-Stol", name: "3-Stol", hall: "Asosiy Zal", seats: 4 },
    { id: "4-Stol", name: "4-Stol", hall: "Asosiy Zal", seats: 6 },
    { id: "5-Stol", name: "5-Stol", hall: "Asosiy Zal", seats: 4 },
    { id: "6-Stol", name: "6-Stol", hall: "Asosiy Zal", seats: 6 },
    { id: "7-Stol", name: "7-Stol", hall: "Asosiy Zal", seats: 4 },
    { id: "8-Stol", name: "8-Stol", hall: "Asosiy Zal", seats: 8 },
    { id: "VIP Xona", name: "VIP Xona", hall: "VIP", seats: 10 },
  ];

  // ==================== STATE ====================
  const state = {
    token: localStorage.getItem("ac_admin_token") || "",
    username: localStorage.getItem("ac_admin_user") || "admin",
    currentTab: "pos", // "pos" | "orders" | "tables" | "stoplist" | "report"
    lang: localStorage.getItem("ac_pos_lang") || "uz", // "uz" | "ru"
    soundEnabled: localStorage.getItem("ac_pos_sound") !== "false",
    autoPrint: localStorage.getItem("ac_admin_autoprint") === "true",
    slaTimerInterval: null,
    audioCtx: null,
    sse: null,
    bc: null,
    pollTimer: null,
    orders: [],
    reservations: [],
    stoplist: new Set(JSON.parse(localStorage.getItem("ac_stoplist") || "[]")),
    knownOrderIds: new Set(),
    orderStatusSignature: "",
    activeFilter: "all",

    // POS Cart State
    posCategory: "all",
    posSearch: "",
    stoplistSearch: "",
    posOrderType: "dine_in", // "dine_in" | "pickup" | "delivery"
    selectedSizes: {}, // { [itemId]: sizeKey }
    posCart: [], // [{ id, name, price, qty, image }]
    activeTableAppendOrderId: null, // order id to append items to (Do-zakaz)
    payingOrder: null, // order being paid upon exit

    // Payment Modal State
    payMethod: "cash", // "cash" | "card" | "click"
    cashGiven: 0,

    // Daily Stats
    stats: null,
  };

  // ==================== TRANSLATIONS (UZ / RU) ====================
  const i18n = {
    uz: {
      login_title: "Kassaga kirish",
      login_sub: "Termiz sh. · Tezkor kassa va buyurtmalar terminali",
      login_user_lbl: "Operator logini",
      login_pass_lbl: "Parol",
      btn_login: "Kassaga kirish",
      tab_pos: "Kassa (POS)",
      tab_orders: "Jonli Buyurtmalar",
      tab_tables: "Zaldagi Stollar",
      tab_stoplist: "Stop-List",
      tab_report: "Kassa Hisoboti",
      ticket_title: "Joriy Chek",
      btn_clear: "Tozalash",
      type_dine: "Zalda",
      type_pickup: "Olib ketish",
      type_deliv: "Dostavka",
      subtotal_lbl: "Taomlar summasi:",
      deliv_lbl: "Yetkazib berish:",
      total_lbl: "Jami to'lov:",
      btn_pay: "To'lov va Chek chiqarish",
      kpi_new: "Yangi buyurtmalar",
      kpi_prep: "Oshxonada",
      kpi_deliv: "Yo'lda / Kuryerda",
      kpi_rev: "Bugungi tushum",
      flt_all: "Barchasi",
      flt_new: "🟡 Yangi",
      flt_prep: "🟠 Tayyorlanmoqda",
      flt_deliv: "🔵 Yetkazilmoqda",
      flt_done: "🟢 Tugallandi",
      flt_cancel: "🔴 Bekor qilingan",
      btn_sync: "Yangilash",
      rep_title: "Kassa Smenasi Hisoboti (X / Z-Report)",
      rep_sub: "American Caffetteria Termiz · Real-time ma'lumotlar",
      btn_xrep: "X-Hisobot chop etish",
      btn_zrep: "Z-Report (Smenani yopish)",
      rep_orders: "Jami buyurtmalar:",
      rep_total: "Umumiy tushum:",
      rep_avg: "O'rtacha chek:",
      rep_cash: "Naqd pul tushumi:",
      rep_card: "Karta / Terminal:",
      rep_click: "Click / Payme:",
      modal_pay_title: "To'lovni qabul qilish",
      pay_cash: "Naqd pul",
      pay_card: "Karta / Humo",
      pay_click: "Click / Payme",
      lbl_cash_given: "Mijoz bergan summa:",
      lbl_change: "Qaytim (Сдача):",
      btn_confirm_pay: "To'lovni tasdiqlash va Chek chiqarish",
      sound_on: "Ovoz: Yoniq",
      sound_off: "Ovoz: O'chiq",
      empty_cart: "Chek bo'sh. Taom tanlang.",
      act_to_kitchen: "▶️ Oshxonaga berish",
      act_to_courier: "🛵 Tayyor / Kuryerga",
      act_to_done: "✅ Yetkazildi / Yopish",
      act_print: "🖨 Chek",
      act_cancel: "Bekor qilish",
      table_placeholder: "1-Stol (yoki raqam)",
      cust_name_placeholder: "Mijoz ismi",
      cust_phone_placeholder: "+998 90 ...",
      cust_addr_placeholder: "Yetkazib berish manzili...",
    },
    ru: {
      login_title: "Вход в кассу",
      login_sub: "г. Термез · Экспресс-касса и терминал заказов",
      login_user_lbl: "Логин оператора",
      login_pass_lbl: "Пароль",
      btn_login: "Войти в кассу",
      tab_pos: "Касса (POS)",
      tab_orders: "Живые Заказы",
      tab_tables: "Столы в зале",
      tab_stoplist: "Стоп-Лист",
      tab_report: "Отчет смены",
      ticket_title: "Текущий Чек",
      btn_clear: "Очистить",
      type_dine: "В зале",
      type_pickup: "С собой",
      type_deliv: "Доставка",
      subtotal_lbl: "Сумма блюд:",
      deliv_lbl: "Доставка:",
      total_lbl: "Итого к оплате:",
      btn_pay: "Оплата и печать чека",
      kpi_new: "Новые заказы",
      kpi_prep: "На кухне",
      kpi_deliv: "В пути / Курьер",
      kpi_rev: "Выручка за сегодня",
      flt_all: "Все заказы",
      flt_new: "🟡 Новые",
      flt_prep: "🟠 Готовятся",
      flt_deliv: "🔵 Доставляются",
      flt_done: "🟢 Завершены",
      flt_cancel: "🔴 Отменены",
      btn_sync: "Обновить",
      rep_title: "Отчет смены кассы (X / Z-Report)",
      rep_sub: "American Caffetteria Termiz · Real-time данные",
      btn_xrep: "Печать X-Отчета",
      btn_zrep: "Z-Отчет (Закрытие смены)",
      rep_orders: "Всего заказов:",
      rep_total: "Общая выручка:",
      rep_avg: "Средний чек:",
      rep_cash: "Наличные:",
      rep_card: "Карта / Терминал:",
      rep_click: "Click / Payme:",
      modal_pay_title: "Прием оплаты",
      pay_cash: "Наличные",
      pay_card: "Карта / Uzcard",
      pay_click: "Click / Payme",
      lbl_cash_given: "Внесено клиентом:",
      lbl_change: "Сдача клиенту:",
      btn_confirm_pay: "Подтвердить оплату и распечатать чек",
      sound_on: "Звук: Вкл",
      sound_off: "Звук: Выкл",
      empty_cart: "Чек пуст. Выберите блюда.",
      act_to_kitchen: "▶️ Отдать на кухню",
      act_to_courier: "🛵 Готов / Курьеру",
      act_to_done: "✅ Доставлен / Закрыть",
      act_print: "🖨 Чек",
      act_cancel: "Отменить",
      table_placeholder: "1-Стол",
      cust_name_placeholder: "Имя клиента",
      cust_phone_placeholder: "+998 90 ...",
      cust_addr_placeholder: "Адрес доставки...",
    },
  };

  function t(key) {
    const dict = i18n[state.lang] || i18n.uz;
    return dict[key] || key;
  }

  // ==================== SAFE LOCALIZED DISH NAME / DESC HELPERS ====================
  function getDishName(item, langOverride) {
    if (!item) return "";
    const l = langOverride || state.lang || "uz";
    if (typeof item.name === "object" && item.name !== null) {
      return item.name[l] || item.name.uz || item.name.ru || item.name.en || item.id || "";
    }
    return String(item.name || item.id || "");
  }

  function getDishDesc(item, langOverride) {
    if (!item) return "";
    const l = langOverride || state.lang || "uz";
    const d = item.desc || item.description;
    if (typeof d === "object" && d !== null) {
      return d[l] || d.uz || d.ru || d.en || "";
    }
    return String(d || "");
  }

  function formatSizeLabel(sz) {
    if (!sz) return "";
    if (typeof sz.label === "object" && sz.label !== null) {
      return sz.label[state.lang] || sz.label.uz || sz.label.ru || sz.label.en || String(sz.key || "");
    }
    return String(sz.label || sz.key || "");
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getOrderTotal(ord) {
    if (!ord) return 0;
    return Number(ord.total_amount ?? ord.total ?? ord.total_price ?? 0) || 0;
  }

  function getOrderCode(ord) {
    if (!ord) return "#1";
    if (ord.order_code) return ord.order_code;
    return `#${ord.id}`;
  }

  function normalizeStatus(st) {
    const s = String(st || "new").toLowerCase();
    if (s === "cooking" || s === "accepted" || s === "ready") return "preparing";
    return s;
  }

  // ==================== AUDIO NOTIFICATION CHIME ====================
  function playOrderChime() {
    if (!state.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!state.audioCtx) {
        state.audioCtx = new AudioContextClass();
      }
      if (state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }

      const now = state.audioCtx.currentTime;

      // Tone 1: 880 Hz (A5)
      const osc1 = state.audioCtx.createOscillator();
      const gain1 = state.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(state.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: 1320 Hz (E6)
      const osc2 = state.audioCtx.createOscillator();
      const gain2 = state.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      gain2.gain.setValueAtTime(0.45, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(state.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  document.addEventListener(
    "click",
    function initAudio() {
      if (state.soundEnabled && !state.audioCtx) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) state.audioCtx = new AudioContextClass();
        } catch (e) {}
      }
    },
    { once: true }
  );

  // ==================== FLASH BANNER ====================
  function showNewOrderBanner(order) {
    const banner = document.getElementById("new-order-flash-banner");
    const txt = document.getElementById("new-order-flash-text");
    if (!banner || !txt) return;
    const code = getOrderCode(order);
    const cust = order.customer_name || "Mijoz";
    const tot = getOrderTotal(order).toLocaleString("ru-RU");
    txt.innerHTML = `🔔 <strong>YANGI BUYURTMA KELDI!</strong> ${escapeHtml(code)} · ${escapeHtml(cust)} (${tot} so'm) · Oshxonaga uzatildi`;
    banner.hidden = false;
  }

  // ==================== INITIALIZATION ====================
  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    applyLanguage();
    checkAuth();
  });

  function bindEvents() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      document.getElementById("btn-fill-creds")?.addEventListener("click", () => {
        const u = document.getElementById("login-username");
        const p = document.getElementById("login-password");
        if (u) u.value = "admin";
        if (p) p.value = "admin123!";
      });
      loginForm.addEventListener("submit", handleLogin);
    }

    // Mode Tabs
    document.getElementById("tab-btn-pos")?.addEventListener("click", () => switchTab("pos"));
    document.getElementById("tab-btn-orders")?.addEventListener("click", () => switchTab("orders"));
    document.getElementById("tab-btn-kitchen")?.addEventListener("click", () => switchTab("kitchen"));
    document.getElementById("tab-btn-courier")?.addEventListener("click", () => switchTab("courier"));
    document.getElementById("tab-btn-tables")?.addEventListener("click", () => switchTab("tables"));
    document.getElementById("tab-btn-stoplist")?.addEventListener("click", () => switchTab("stoplist"));
    document.getElementById("tab-btn-report")?.addEventListener("click", () => switchTab("report"));

    // Flash Banner actions
    document.getElementById("btn-flash-open-orders")?.addEventListener("click", () => {
      document.getElementById("new-order-flash-banner").hidden = true;
      switchTab("orders");
    });
    document.getElementById("btn-flash-dismiss")?.addEventListener("click", () => {
      document.getElementById("new-order-flash-banner").hidden = true;
    });

    // Sound toggle
    document.getElementById("sound-toggle-btn")?.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem("ac_pos_sound", state.soundEnabled);
      updateSoundUI();
      if (state.soundEnabled) playOrderChime();
    });

    // Auto-Print toggle
    document.getElementById("autoprint-toggle-btn")?.addEventListener("click", () => {
      state.autoPrint = !state.autoPrint;
      localStorage.setItem("ac_admin_autoprint", String(state.autoPrint));
      updateAutoPrintUI();
    });

    // Fullscreen toggle
    document.getElementById("fullscreen-btn")?.addEventListener("click", toggleFullscreen);

    // Language toggle
    document.getElementById("lang-toggle-btn")?.addEventListener("click", () => {
      state.lang = state.lang === "uz" ? "ru" : "uz";
      localStorage.setItem("ac_pos_lang", state.lang);
      applyLanguage();
      initPOSCategories();
      renderPOSMenu();
      renderPOSTicket();
      renderLiveOrders();
      renderTablesAndReservations();
      renderStoplistView();
      renderStats();
    });

    // Logout
    document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

    // POS Search & Clear
    document.getElementById("pos-search-input")?.addEventListener("input", (e) => {
      state.posSearch = (e.target.value || "").toLowerCase().trim();
      renderPOSMenu();
    });

    document.getElementById("stoplist-search-input")?.addEventListener("input", (e) => {
      state.stoplistSearch = (e.target.value || "").toLowerCase().trim();
      renderStoplistView();
    });

    document.getElementById("btn-clear-cart")?.addEventListener("click", clearPOSCart);

    // POS Mobile Tabs Toggle (<= 900px)
    const mobBtnMenu = document.getElementById("pos-mob-btn-menu");
    const mobBtnTicket = document.getElementById("pos-mob-btn-ticket");
    const mobBtnGoTicket = document.getElementById("pos-mob-btn-go-ticket");
    const mobBtnBackMenu = document.getElementById("pos-mob-back-menu-btn");
    const posMenuSec = document.getElementById("pos-menu-section");
    const posTicketSec = document.getElementById("pos-ticket-sidebar");

    function setPOSMobileView(view) {
      if (!posMenuSec || !posTicketSec) return;
      if (view === "ticket") {
        posMenuSec.classList.add("pos-mob-hidden");
        posTicketSec.classList.add("pos-mob-active");
        mobBtnMenu?.classList.remove("active");
        mobBtnTicket?.classList.add("active");
      } else {
        posMenuSec.classList.remove("pos-mob-hidden");
        posTicketSec.classList.remove("pos-mob-active");
        mobBtnTicket?.classList.remove("active");
        mobBtnMenu?.classList.add("active");
      }
    }

    mobBtnMenu?.addEventListener("click", () => setPOSMobileView("menu"));
    mobBtnTicket?.addEventListener("click", () => setPOSMobileView("ticket"));
    mobBtnGoTicket?.addEventListener("click", () => setPOSMobileView("ticket"));
    mobBtnBackMenu?.addEventListener("click", () => setPOSMobileView("menu"));

    // POS Order Types
    document.querySelectorAll(".order-type-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".order-type-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.posOrderType = btn.dataset.type;
        handleOrderTypeChange();
      });
    });

    // POS Pay & Kitchen Send Triggers
    document.getElementById("pos-pay-btn")?.addEventListener("click", () => openPaymentModal(null));
    document.getElementById("pos-kitchen-send-btn")?.addEventListener("click", executeSendToKitchen);
    document.getElementById("btn-close-pay-modal")?.addEventListener("click", closePaymentModal);

    const posTableSelect = document.getElementById("pos-table-select");
    if (posTableSelect) {
      posTableSelect.addEventListener("change", () => {
        const nameInput = document.getElementById("pos-cust-name");
        if (nameInput) nameInput.value = posTableSelect.value;
        updatePOSTableBanner();
      });
    }

    // Payment Methods
    document.querySelectorAll(".pay-method-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".pay-method-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.payMethod = btn.dataset.method;
        const cashSection = document.getElementById("cash-calc-section");
        if (cashSection) {
          cashSection.style.display = state.payMethod === "cash" ? "flex" : "none";
        }
      });
    });

    // Cash Given Input & Quick Bills
    const cashInput = document.getElementById("input-cash-given");
    if (cashInput) cashInput.addEventListener("input", calculateChange);

    document.querySelectorAll(".quick-bill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const amt = btn.dataset.amount;
        const total = getActivePayingTotal();
        if (amt === "exact") {
          cashInput.value = total;
        } else {
          const val = Number(amt) || 0;
          cashInput.value = (Number(cashInput.value) || 0) + val;
        }
        calculateChange();
      });
    });

    // Confirm Payment
    document.getElementById("btn-confirm-payment")?.addEventListener("click", executePaymentAndPrint);

    // Status Filters in Orders View
    document.querySelectorAll(".status-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".status-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeFilter = btn.dataset.status;
        renderLiveOrders();
      });
    });

    // Manual Sync
    document.getElementById("btn-manual-sync")?.addEventListener("click", () => {
      fetchOrders();
      fetchReservations();
      fetchStats();
    });

    document.getElementById("btn-refresh-reservations")?.addEventListener("click", () => {
      fetchReservations();
    });

    // Print X-Report & Z-Report
    document.getElementById("btn-print-x-report")?.addEventListener("click", () => printShiftReport("X"));
    document.getElementById("btn-open-z-report")?.addEventListener("click", openZReportModal);
    document.getElementById("btn-cash-in")?.addEventListener("click", () => promptCashOperation("cash_in"));
    document.getElementById("btn-cash-out")?.addEventListener("click", () => promptCashOperation("cash_out"));
    document.getElementById("btn-close-z-modal")?.addEventListener("click", () => {
      document.getElementById("z-report-modal").style.display = "none";
    });
    document.getElementById("btn-confirm-z-report")?.addEventListener("click", () => {
      document.getElementById("z-report-modal").style.display = "none";
      printShiftReport("Z");
    });

    // Courier Dispatch Modal events
    document.getElementById("btn-close-courier-modal")?.addEventListener("click", () => {
      document.getElementById("courier-dispatch-modal").style.display = "none";
    });
    document.getElementById("btn-cdm-cancel")?.addEventListener("click", () => {
      document.getElementById("courier-dispatch-modal").style.display = "none";
    });
    document.getElementById("btn-cdm-confirm")?.addEventListener("click", confirmCourierDispatch);

    document.querySelectorAll("input[name='cdm_delivery_mode']").forEach((radio) => {
      radio.addEventListener("change", () => {
        const isExternal = document.getElementById("cdm-mode-external")?.checked;
        const buyoutSec = document.getElementById("cdm-buyout-section");
        if (buyoutSec) buyoutSec.style.display = isExternal ? "block" : "none";
      });
    });
  }

  function applyLanguage() {
    const setTxt = (id, k) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(k);
    };
    const langLbl = document.getElementById("lang-label");
    if (langLbl) langLbl.textContent = state.lang.toUpperCase();

    setTxt("txt-login-title", "login_title");
    setTxt("txt-login-sub", "login_sub");
    setTxt("txt-login-user-lbl", "login_user_lbl");
    setTxt("txt-login-pass-lbl", "login_pass_lbl");
    setTxt("txt-btn-login", "btn_login");

    setTxt("txt-tab-pos", "tab_pos");
    setTxt("txt-tab-orders", "tab_orders");
    setTxt("txt-tab-tables", "tab_tables");
    setTxt("txt-tab-stoplist", "tab_stoplist");
    setTxt("txt-tab-report", "tab_report");

    setTxt("txt-ticket-title", "ticket_title");
    setTxt("txt-btn-clear", "btn_clear");
    setTxt("txt-type-dine", "type_dine");
    setTxt("txt-type-pickup", "type_pickup");
    setTxt("txt-type-deliv", "type_deliv");
    setTxt("txt-subtotal-lbl", "subtotal_lbl");
    setTxt("txt-deliv-lbl", "deliv_lbl");
    setTxt("txt-total-lbl", "total_lbl");
    setTxt("txt-btn-pay", "btn_pay");

    setTxt("kpi-lbl-new", "kpi_new");
    setTxt("kpi-lbl-prep", "kpi_prep");
    setTxt("kpi-lbl-deliv", "kpi_deliv");
    setTxt("kpi-lbl-rev", "kpi_rev");
    setTxt("btn-flt-all", "flt_all");
    setTxt("btn-flt-new", "flt_new");
    setTxt("btn-flt-prep", "flt_prep");
    setTxt("btn-flt-deliv", "flt_deliv");
    setTxt("btn-flt-done", "flt_done");
    setTxt("btn-flt-cancel", "flt_cancel");
    setTxt("txt-btn-sync", "btn_sync");

    setTxt("txt-rep-title", "rep_title");
    setTxt("txt-rep-sub", "rep_sub");
    setTxt("txt-btn-xrep", "btn_xrep");
    setTxt("txt-btn-zrep", "btn_zrep");
    setTxt("rep-lbl-orders", "rep_orders");
    setTxt("rep-lbl-total", "rep_total");
    setTxt("rep-lbl-avg", "rep_avg");
    setTxt("rep-lbl-cash", "rep_cash");
    setTxt("rep-lbl-card", "rep_card");
    setTxt("rep-lbl-click", "rep_click");

    setTxt("txt-modal-pay-title", "modal_pay_title");
    setTxt("txt-pay-cash", "pay_cash");
    setTxt("txt-pay-card", "pay_card");
    setTxt("txt-pay-click", "pay_click");
    setTxt("txt-lbl-cash-given", "lbl_cash_given");
    setTxt("txt-lbl-change", "lbl_change");
    setTxt("txt-btn-confirm-pay", "btn_confirm_pay");

    updateSoundUI();
    updateAutoPrintUI();
  }

  function updateAutoPrintUI() {
    const btn = document.getElementById("autoprint-toggle-btn");
    const lbl = document.getElementById("autoprint-label");
    if (!btn) return;
    if (state.autoPrint) {
      btn.classList.add("active");
      if (lbl) lbl.textContent = state.lang === "uz" ? "Avto-Chek: Yoniq" : "Авто-Чек: Вкл";
    } else {
      btn.classList.remove("active");
      if (lbl) lbl.textContent = state.lang === "uz" ? "Avto-Chek: O'chiq" : "Авто-Чек: Выкл";
    }
  }

  function updateSoundUI() {
    const btn = document.getElementById("sound-toggle-btn");
    const icon = document.getElementById("sound-icon");
    const lbl = document.getElementById("sound-label");
    if (!btn) return;
    if (state.soundEnabled) {
      btn.classList.add("active");
      if (icon) icon.className = "ti ti-volume";
      if (lbl) lbl.textContent = t("sound_on");
    } else {
      btn.classList.remove("active");
      if (icon) icon.className = "ti ti-volume-off";
      if (lbl) lbl.textContent = t("sound_off");
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ==================== AUTHENTICATION & API BASE ====================
  function getAdminApiUrl(endpoint) {
    const base = (typeof window !== "undefined" && window.ADMIN_API_BASE_URL) ||
                 (typeof window !== "undefined" && window.API_BASE_URL) ||
                 ((typeof localStorage !== "undefined") && localStorage.getItem("pos_api_base_url")) || "";
    const cleanBase = base ? String(base).replace(/\/+$/, "") : "";
    const cleanEp = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    return cleanBase + cleanEp;
  }

  async function checkAuth() {
    if (state.token) {
      try {
        const res = await fetch(getAdminApiUrl("/api/admin/me"), { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            showAdminUI();
            return;
          }
        }
      } catch (e) {}
    }

    showLoginUI();
  }

  function getAuthHeaders() {
    const h = { "X-Requested-With": "XMLHttpRequest" };
    if (state.token) {
      h["Authorization"] = "Bearer " + state.token;
    }
    return h;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const errBox = document.getElementById("login-error");
    if (errBox) errBox.hidden = true;

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(getAdminApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        state.token = data.token || "";
        state.username = data.username || "admin";
        localStorage.setItem("ac_admin_token", state.token);
        localStorage.setItem("ac_admin_user", state.username);
        showAdminUI();
      } else {
        if (errBox) {
          if (res.status === 404) {
            errBox.textContent = "Server topilmadi (404). Agar Vercel yoki alohida domenda bo'lsangiz, asosiy POS server (bot.py) manzilini ko'rsating.";
          } else {
            errBox.textContent = data.error || "Login yoki parol xato.";
          }
          errBox.hidden = false;
        }
      }
    } catch (err) {
      if (errBox) {
        errBox.textContent = "Server bilan aloqa yo'q. bot.py yoki local_preview.js ni yoqing.";
        errBox.hidden = false;
      }
    }
  }

  async function handleLogout() {
    try {
      await fetch(getAdminApiUrl("/api/admin/logout"), { method: "POST", headers: getAuthHeaders() });
    } catch (e) {}
    state.token = "";
    localStorage.removeItem("ac_admin_token");
    if (state.sse) state.sse.close();
    if (state.pollTimer) clearInterval(state.pollTimer);
    showLoginUI();
  }

  function showLoginUI() {
    if (state.slaTimerInterval) {
      clearInterval(state.slaTimerInterval);
      state.slaTimerInterval = null;
    }
    document.getElementById("login-view").hidden = false;
    document.getElementById("admin-view").hidden = true;
  }

  function showAdminUI() {
    document.getElementById("login-view").hidden = true;
    document.getElementById("admin-view").hidden = false;
    updateAutoPrintUI();
    initRealTime();
    initPOSCategories();
    fetchStoplist();
    renderPOSMenu();
    renderPOSTicket();
    fetchOrders();
    fetchReservations();
    fetchStats();
    if (!state.slaTimerInterval) {
      state.slaTimerInterval = setInterval(updateAllSlaTimers, 1000);
    }
  }

  function switchTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll(".mode-tab-btn").forEach((b) => b.classList.remove("active"));

    const views = ["pos", "orders", "kitchen", "courier", "tables", "stoplist", "report"];
    views.forEach((v) => {
      const el = document.getElementById("view-" + v);
      if (el) el.style.display = v === tab ? "flex" : "none";
    });

    const activeBtn = document.getElementById("tab-btn-" + tab);
    if (activeBtn) activeBtn.classList.add("active");

    if (tab === "pos") {
      renderPOSMenu();
      updatePOSTableBanner();
    }
    else if (tab === "orders") renderLiveOrders();
    else if (tab === "kitchen") renderKitchenView();
    else if (tab === "courier") renderCourierView();
    else if (tab === "tables") {
      fetchReservations();
      renderTablesAndReservations();
    } else if (tab === "stoplist") renderStoplistView();
    else if (tab === "report") fetchStats();
  }

  // ==================== REAL-TIME ENGINE (SSE + BROADCASTCHANNEL + POLLING) ====================
  function initRealTime() {
    if (state.sse) state.sse.close();
    if (state.pollTimer) clearInterval(state.pollTimer);

    // 1. BroadcastChannel for instant 0ms cross-tab sync
    if ("BroadcastChannel" in window && !state.bc) {
      try {
        state.bc = new BroadcastChannel("american_caffetteria_realtime");
        state.bc.onmessage = (ev) => {
          const msg = ev.data || {};
          if (msg.type === "new_order" && msg.order) {
            handleIncomingOrder(msg.order);
          } else if (msg.type === "order_updated" && msg.order) {
            updateOrderInList(msg.order);
          } else if (msg.type === "new_reservation" && msg.reservation) {
            handleIncomingReservation(msg.reservation);
          } else if (msg.type === "stoplist_updated" && Array.isArray(msg.stoplist)) {
            state.stoplist = new Set(msg.stoplist);
            localStorage.setItem("ac_stoplist", JSON.stringify(msg.stoplist));
            updateStoplistBadge();
            renderPOSMenu();
            renderStoplistView();
          }
        };
      } catch (e) {}
    }

    // 2. Server-Sent Events (SSE) — Connect to authenticated admin stream
    const sseUrl = getAdminApiUrl("/api/admin/stream?token=" + encodeURIComponent(state.token));
    try {
      state.sse = new EventSource(sseUrl);

      state.sse.onopen = () => {
        updateConnIndicator(true, "LIVE (0s)");
      };

      state.sse.addEventListener("new_order", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.order) handleIncomingOrder(data.order);
        } catch (err) {}
      });

      state.sse.addEventListener("order_updated", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.order) updateOrderInList(data.order);
        } catch (err) {}
      });

      state.sse.addEventListener("new_reservation", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.reservation) handleIncomingReservation(data.reservation);
        } catch (err) {}
      });

      state.sse.addEventListener("reservation_updated", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.reservation) {
            const idx = state.reservations.findIndex((r) => r.id === data.reservation.id);
            if (idx !== -1) state.reservations[idx] = data.reservation;
            renderTablesAndReservations();
          }
        } catch (err) {}
      });

      state.sse.addEventListener("stoplist_updated", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && Array.isArray(data.stoplist)) {
            state.stoplist = new Set(data.stoplist);
            localStorage.setItem("ac_stoplist", JSON.stringify(data.stoplist));
            updateStoplistBadge();
            renderPOSMenu();
            renderStoplistView();
          }
        } catch (err) {}
      });

      state.sse.onerror = () => {
        updateConnIndicator(false, "Reconnect...");
      };
    } catch (e) {
      console.warn("EventSource setup failed:", e);
    }

    // 3. Continuous 2.5s polling fallback
    state.pollTimer = setInterval(() => {
      fetchOrdersSilently();
    }, 2500);
  }

  function updateConnIndicator(isLive, label) {
    const ind = document.getElementById("sse-indicator");
    const txt = document.getElementById("sse-status-text");
    if (txt) txt.textContent = label;
    if (!ind) return;
    if (isLive) {
      ind.style.borderColor = "rgba(16, 185, 129, 0.4)";
      ind.style.color = "#34d399";
    } else {
      ind.style.borderColor = "rgba(245, 158, 11, 0.4)";
      ind.style.color = "#fbbf24";
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch(getAdminApiUrl("/api/admin/orders?limit=100"), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.orders)) {
          processFetchedOrders(data.orders);
        }
      }
    } catch (e) {}
  }

  async function fetchOrdersSilently() {
    try {
      const res = await fetch(getAdminApiUrl("/api/admin/orders?limit=50"), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.orders)) {
          let newestOrder = null;
          data.orders.forEach((ord) => {
            if (!state.knownOrderIds.has(ord.id)) {
              state.knownOrderIds.add(ord.id);
              if (!newestOrder) newestOrder = ord;
            }
          });

          const newSig = data.orders.map((o) => `${o.id}:${o.status}`).join("|");
          if (newestOrder || newSig !== state.orderStatusSignature) {
            state.orderStatusSignature = newSig;
            state.orders = data.orders;
            if (newestOrder) {
              playOrderChime();
              showNewOrderBanner(newestOrder);
            }
            renderLiveOrders();
            renderTablesAndReservations();
            updateKPIs();
          }
        }
      }
    } catch (e) {}
  }

  function processFetchedOrders(ordersList) {
    const isFirstLoad = state.knownOrderIds.size === 0;
    let brandNewOrder = null;

    ordersList.forEach((ord) => {
      if (!state.knownOrderIds.has(ord.id)) {
        if (!isFirstLoad && !brandNewOrder) brandNewOrder = ord;
        state.knownOrderIds.add(ord.id);
      }
    });

    state.orders = ordersList;
    state.orderStatusSignature = ordersList.map((o) => `${o.id}:${o.status}`).join("|");
    if (brandNewOrder) {
      playOrderChime();
      showNewOrderBanner(brandNewOrder);
    }
    renderLiveOrders();
    renderTablesAndReservations();
    updateKPIs();
    updatePOSTableBanner();
  }

  function handleIncomingOrder(order) {
    if (!state.knownOrderIds.has(order.id)) {
      state.knownOrderIds.add(order.id);
      state.orders.unshift(order);
      state.orderStatusSignature = state.orders.map((o) => `${o.id}:${o.status}`).join("|");
      playOrderChime();
      showNewOrderBanner(order);
      renderLiveOrders();
      renderTablesAndReservations();
      updateKPIs();
      updatePOSTableBanner();
      if (state.autoPrint) {
        setTimeout(() => {
          printOrderReceipt(order);
        }, 300);
      }
    }
  }

  function updateOrderInList(order) {
    const idx = state.orders.findIndex((o) => o.id === order.id);
    if (idx !== -1) {
      state.orders[idx] = order;
    } else {
      state.orders.unshift(order);
    }
    state.orderStatusSignature = state.orders.map((o) => `${o.id}:${o.status}`).join("|");
    renderLiveOrders();
    renderTablesAndReservations();
    updateKPIs();
    updatePOSTableBanner();
  }

  function updateKPIs() {
    let countNew = 0,
      countPrep = 0,
      countDeliv = 0,
      totalRev = 0;

    state.orders.forEach((o) => {
      const st = normalizeStatus(o.status);
      if (st === "new") countNew++;
      else if (st === "preparing") countPrep++;
      else if (st === "delivering") countDeliv++;

      if (st !== "cancelled") {
        totalRev += getOrderTotal(o);
      }
    });

    document.getElementById("kpi-val-new").textContent = countNew;
    document.getElementById("kpi-val-prep").textContent = countPrep;
    document.getElementById("kpi-val-deliv").textContent = countDeliv;
    document.getElementById("kpi-val-rev").textContent = totalRev.toLocaleString("ru-RU") + " so'm";

    const badge = document.getElementById("badge-new-orders");
    if (badge) {
      if (countNew > 0) {
        badge.textContent = countNew;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }
  }

  // ==================== POS: CATEGORIES & MENU (WITH SIZES & STOPLIST) ====================
  function initPOSCategories() {
    const container = document.getElementById("pos-categories-list");
    if (!container) return;
    container.innerHTML = "";

    const cats = window.menuCategories || [
      { id: "all", uz: "Barchasi", ru: "Все меню" },
      { id: "burgers", uz: "Burgerlar", ru: "Бургеры" },
      { id: "pizza", uz: "Pitsa", ru: "Пицца" },
      { id: "lavash", uz: "Lavash", ru: "Лаваш" },
      { id: "pide", uz: "Pide", ru: "Пиде" },
      { id: "hotdogs", uz: "Xot-dog", ru: "Хот-доги" },
      { id: "snacks", uz: "Gazaklar", ru: "Снэки" },
      { id: "salads", uz: "Salatlar", ru: "Салаты" },
      { id: "sushi", uz: "Sushi", ru: "Суши" },
      { id: "desserts", uz: "Shirinliklar", ru: "Десерты" },
      { id: "tea", uz: "Choylar", ru: "Чай" },
      { id: "drinks", uz: "Ichimliklar", ru: "Напитки" },
    ];

    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pos-cat-btn" + (cat.id === state.posCategory ? " active" : "");
      btn.dataset.id = cat.id;
      btn.textContent = state.lang === "uz" ? cat.uz || cat.name : cat.ru || cat.name;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".pos-cat-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.posCategory = cat.id;
        renderPOSMenu();
      });
      container.appendChild(btn);
    });
  }

  function renderPOSMenu() {
    const grid = document.getElementById("pos-food-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const items = window.menuItems || [];
    const search = state.posSearch;
    const cat = state.posCategory;

    const filtered = items.filter((it) => {
      if (cat !== "all" && it.category !== cat) return false;
      if (search) {
        const titleUz = getDishName(it, "uz").toLowerCase();
        const titleRu = getDishName(it, "ru").toLowerCase();
        const descUz = getDishDesc(it, "uz").toLowerCase();
        const descRu = getDishDesc(it, "ru").toLowerCase();
        const idStr = String(it.id || "").toLowerCase();
        if (
          !titleUz.includes(search) &&
          !titleRu.includes(search) &&
          !descUz.includes(search) &&
          !descRu.includes(search) &&
          !idStr.includes(search)
        ) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--ink-dim); padding: 50px 20px;">
        <i class="ti ti-search" style="font-size: 38px; color: var(--ink-dim);"></i>
        <p style="margin-top: 10px; font-weight: 700; font-size: 15px; color: var(--ink-muted);">Hech qanday taom topilmadi</p>
      </div>`;
      return;
    }

    filtered.forEach((item) => {
      const isStopped = state.stoplist.has(item.id);
      const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
      const chosenSizeKey = hasSizes
        ? state.selectedSizes[item.id] !== undefined
          ? state.selectedSizes[item.id]
          : item.sizes[0].key
        : null;
      const chosenSizeObj = hasSizes
        ? item.sizes.find((s) => String(s.key) === String(chosenSizeKey)) || item.sizes[0]
        : null;

      const cartId = chosenSizeObj ? `${item.id}_${chosenSizeObj.key}` : item.id;
      const cartItem = state.posCart.find((c) => c.id === cartId);
      const inCartQty = cartItem ? cartItem.qty : 0;

      const displayPrice = chosenSizeObj ? Number(chosenSizeObj.price) : Number(item.price || 0);
      const priceFmt = displayPrice.toLocaleString("ru-RU") + " so'm";
      const dishTitle = getDishName(item);
      const imgSrc = item.image || "images/food/burger_big.jpg";
      const badgeText = item.badge || (item.is_hit ? "HIT" : (item.is_new ? "YANGI" : ""));
      const weightText = chosenSizeObj && chosenSizeObj.weight ? chosenSizeObj.weight : (item.weight || "");

      const card = document.createElement("div");
      card.className = "pos-food-card" + (isStopped ? " is-stopped" : "") + (inCartQty > 0 ? " in-cart" : "");

      let sizesHtml = "";
      if (hasSizes) {
        sizesHtml = `<div class="pos-size-pills">
          ${item.sizes
            .map((sz) => {
              const activeCls = String(sz.key) === String(chosenSizeObj.key) ? " active" : "";
              return `<button type="button" class="pos-size-pill${activeCls}" data-size-key="${sz.key}">${formatSizeLabel(sz)}</button>`;
            })
            .join("")}
        </div>`;
      }

      let inCartBadgeHtml = "";
      if (inCartQty > 0) {
        inCartBadgeHtml = `<div class="pos-in-cart-indicator"><span class="dot"></span> ${inCartQty} ta chekda</div>`;
      }

      let actionControlHtml = "";
      if (inCartQty > 0) {
        actionControlHtml = `
          <div class="pos-card-stepper" onclick="event.stopPropagation()">
            <button type="button" class="pos-card-stepper-btn btn-card-dec" title="Kamaytirish">-</button>
            <span class="pos-card-stepper-val">${inCartQty}</span>
            <button type="button" class="pos-card-stepper-btn btn-card-inc" title="Ko'paytirish">+</button>
          </div>
        `;
      } else {
        actionControlHtml = `
          <button type="button" class="pos-food-add-btn btn-card-add">
            <i class="ti ti-plus"></i> <span>Qo'shish</span>
          </button>
        `;
      }

      card.innerHTML = `
        ${isStopped ? `<span class="pos-stopped-badge">🚫 STOP-LIST</span>` : ""}
        <div class="pos-food-img-wrap">
          <img src="${imgSrc}" alt="${dishTitle}" class="pos-food-img" onerror="this.onerror=null; this.src='images/logo.png';" />
          ${badgeText ? `<span class="pos-badge">${badgeText}</span>` : ""}
          ${weightText ? `<span class="pos-weight-badge">${weightText}</span>` : ""}
          ${inCartBadgeHtml}
        </div>
        <div class="pos-food-info">
          <div>
            <h4 class="pos-food-title" title="${dishTitle}">${dishTitle}</h4>
            ${sizesHtml}
          </div>
          <div class="pos-food-price-row">
            <span class="pos-food-price">${priceFmt}</span>
            ${actionControlHtml}
          </div>
        </div>
      `;

      // Size pill clicks
      card.querySelectorAll(".pos-size-pill").forEach((pill) => {
        pill.addEventListener("click", (ev) => {
          ev.stopPropagation();
          state.selectedSizes[item.id] = pill.dataset.sizeKey;
          renderPOSMenu();
        });
      });

      // Stepper clicks inside card
      card.querySelector(".btn-card-dec")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        updateCartItemQty(cartId, -1);
      });
      card.querySelector(".btn-card-inc")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        updateCartItemQty(cartId, 1);
      });

      // Add button click
      card.querySelector(".btn-card-add")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (isStopped) {
          alert(`"${dishTitle}" hozirda Stop-Listda (vaqtincha tugagan)!`);
          return;
        }
        addToPOSCart(item, chosenSizeObj);
      });

      // Clicking anywhere on card also adds or increments
      card.addEventListener("click", () => {
        if (isStopped) {
          alert(`"${dishTitle}" hozirda Stop-Listda (vaqtincha tugagan)!`);
          return;
        }
        addToPOSCart(item, chosenSizeObj);
      });

      grid.appendChild(card);
    });
  }

  // ==================== POS: TICKET / CART LOGIC ====================
  function addToPOSCart(item, sizeObj) {
    const cartId = sizeObj ? `${item.id}_${sizeObj.key}` : item.id;
    const baseName = getDishName(item);
    const fullName = sizeObj ? `${baseName} (${formatSizeLabel(sizeObj)})` : baseName;
    const unitPrice = sizeObj ? Number(sizeObj.price) : Number(item.price || 0);
    const thumbImg = item.image || "images/logo.png";

    const existing = state.posCart.find((i) => i.id === cartId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.posCart.push({
        id: cartId,
        baseId: item.id,
        name: fullName,
        price: unitPrice,
        qty: 1,
        image: thumbImg,
      });
    }
    renderPOSTicket();
    renderPOSMenu();
  }

  function updateCartItemQty(id, delta) {
    const idx = state.posCart.findIndex((i) => i.id === id);
    if (idx !== -1) {
      state.posCart[idx].qty += delta;
      if (state.posCart[idx].qty <= 0) {
        state.posCart.splice(idx, 1);
      }
    }
    renderPOSTicket();
    renderPOSMenu();
  }

  function removeCartItem(id) {
    state.posCart = state.posCart.filter((i) => i.id !== id);
    renderPOSTicket();
    renderPOSMenu();
  }

  function clearPOSCart() {
    state.posCart = [];
    renderPOSTicket();
    renderPOSMenu();
  }

  function handleOrderTypeChange() {
    const addrInput = document.getElementById("pos-cust-addr");
    const nameInput = document.getElementById("pos-cust-name");
    const delivFeeRow = document.getElementById("pos-deliv-fee-row");
    const tableSelectWrap = document.getElementById("pos-table-select-wrap");
    const kitchenBtn = document.getElementById("pos-kitchen-send-btn");
    const payBtn = document.getElementById("pos-pay-btn");

    if (state.posOrderType === "delivery") {
      if (addrInput) addrInput.style.display = "block";
      if (tableSelectWrap) tableSelectWrap.style.display = "none";
      if (kitchenBtn) kitchenBtn.style.display = "none";
      if (payBtn) payBtn.style.display = "flex";
      if (nameInput) {
        nameInput.placeholder = t("cust_name_placeholder");
        if (nameInput.value.includes("Stol")) nameInput.value = "";
      }
      if (delivFeeRow) delivFeeRow.style.display = "flex";
    } else if (state.posOrderType === "pickup") {
      if (addrInput) addrInput.style.display = "none";
      if (tableSelectWrap) tableSelectWrap.style.display = "none";
      if (kitchenBtn) kitchenBtn.style.display = "none";
      if (payBtn) payBtn.style.display = "flex";
      if (nameInput) {
        nameInput.placeholder = t("cust_name_placeholder");
        if (nameInput.value.includes("Stol")) nameInput.value = "";
      }
      if (delivFeeRow) delivFeeRow.style.display = "none";
    } else {
      if (addrInput) addrInput.style.display = "none";
      if (tableSelectWrap) tableSelectWrap.style.display = "block";
      if (kitchenBtn) kitchenBtn.style.display = "flex";
      if (payBtn) payBtn.style.display = "flex";
      const tableSelect = document.getElementById("pos-table-select");
      if (nameInput) {
        nameInput.placeholder = t("table_placeholder");
        nameInput.value = tableSelect ? tableSelect.value : "1-Stol";
      }
      if (delivFeeRow) delivFeeRow.style.display = "none";
      updatePOSTableBanner();
    }
    renderPOSTicket();
  }

  function getPOSSubtotal() {
    return state.posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getPOSDeliveryFee() {
    if (state.posOrderType !== "delivery") return 0;
    const subtotal = getPOSSubtotal();
    if (subtotal >= 100000) return 0;
    return subtotal > 0 ? 10000 : 0;
  }

  function getPOSTotal() {
    return getPOSSubtotal() + getPOSDeliveryFee();
  }

  function getActivePayingTotal() {
    if (state.payingOrder) return getOrderTotal(state.payingOrder);
    return getPOSTotal();
  }

  function updatePOSTableBanner() {
    const tableSelect = document.getElementById("pos-table-select");
    const banner = document.getElementById("pos-table-status-banner");
    const kitchenBtnTxt = document.getElementById("txt-btn-kitchen");
    if (!tableSelect || !banner) return;

    if (state.posOrderType !== "dine_in") {
      banner.style.display = "none";
      return;
    }

    const selectedTable = tableSelect.value;
    const activeOrder = state.orders.find(
      (o) =>
        o.delivery_type === "dine_in" &&
        normalizeStatus(o.status) !== "completed" &&
        normalizeStatus(o.status) !== "cancelled" &&
        (String(o.customer_name || "").toLowerCase().includes(selectedTable.toLowerCase()) ||
          String(o.address || "").toLowerCase().includes(selectedTable.toLowerCase()))
    );

    if (activeOrder) {
      state.activeTableAppendOrderId = activeOrder.id;
      banner.style.display = "block";
      banner.style.background = "rgba(245, 158, 11, 0.15)";
      banner.style.borderColor = "#f59e0b";
      banner.style.color = "#b45309";
      const ordTot = getOrderTotal(activeOrder).toLocaleString("ru-RU");
      banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>🔴 <b>${selectedTable}</b> band · Buyurtma: <b>${getOrderCode(activeOrder)}</b></span>
          <span style="font-weight:900;">${ordTot} so'm</span>
        </div>
        <div style="font-size:11px; margin-top:3px; color:#92400e;">
          ⚡ Yangi taomlar tanlansa, oshxonaga <b>Do-zakaz</b> cheki chiqadi va stol hisobiga qo'shiladi.
        </div>
      `;
      if (kitchenBtnTxt) {
        kitchenBtnTxt.textContent = "Oshxonaga uzatish (Do-zakaz qo'shish)";
      }
    } else {
      state.activeTableAppendOrderId = null;
      banner.style.display = "block";
      banner.style.background = "rgba(16, 185, 129, 0.12)";
      banner.style.borderColor = "#10b981";
      banner.style.color = "#047857";
      banner.innerHTML = `🟢 <b>${selectedTable}</b> bo'sh · Yangi buyurtma oshxonaga yuboriladi, to'lov chiqishda olinadi.`;
      if (kitchenBtnTxt) {
        kitchenBtnTxt.textContent = "Oshxonaga uzatish (Chiqishda to'lash)";
      }
    }
  }

  function renderPOSTicket() {
    const container = document.getElementById("pos-ticket-items");
    if (!container) return;
    container.innerHTML = "";

    if (state.posCart.length === 0) {
      container.innerHTML = `
        <div class="pos-empty-cart">
          <i class="ti ti-shopping-cart-x"></i>
          <span>${t("empty_cart")}</span>
        </div>
      `;
      document.getElementById("pos-subtotal-val").textContent = "0 so'm";
      document.getElementById("pos-deliv-val").textContent = "0 so'm";
      document.getElementById("pos-total-val").textContent = "0 so'm";
      document.getElementById("pos-pay-btn").disabled = true;
      const kitchenBtn = document.getElementById("pos-kitchen-send-btn");
      if (kitchenBtn) kitchenBtn.disabled = true;

      // Reset Mobile Elements
      const badgeMob = document.getElementById("pos-mob-ticket-badge");
      if (badgeMob) {
        badgeMob.textContent = "0";
        badgeMob.style.display = "none";
      }
      const floatBar = document.getElementById("pos-mob-floating-bar");
      if (floatBar) floatBar.style.display = "none";
      return;
    }

    state.posCart.forEach((it) => {
      const lineTotal = it.price * it.qty;
      const row = document.createElement("div");
      row.className = "ticket-item-row";
      const thumb = it.image || "images/logo.png";
      row.innerHTML = `
        <img src="${thumb}" class="ticket-item-thumb" onerror="this.onerror=null; this.src='images/logo.png';" alt="${it.name}" />
        <div class="ticket-item-name-box">
          <div class="ticket-item-title" title="${it.name}">${it.name}</div>
          <div class="ticket-item-price-unit">${it.price.toLocaleString("ru-RU")} so'm</div>
        </div>
        <div class="ticket-item-stepper">
          <button type="button" class="stepper-btn btn-dec" title="Kamaytirish">-</button>
          <span class="stepper-val">${it.qty}</span>
          <button type="button" class="stepper-btn btn-inc" title="Ko'paytirish">+</button>
        </div>
        <div class="ticket-item-total">${lineTotal.toLocaleString("ru-RU")} so'm</div>
        <button type="button" class="ticket-item-del" title="O'chirish">&times;</button>
      `;

      row.querySelector(".btn-dec").addEventListener("click", () => updateCartItemQty(it.id, -1));
      row.querySelector(".btn-inc").addEventListener("click", () => updateCartItemQty(it.id, 1));
      row.querySelector(".ticket-item-del").addEventListener("click", () => removeCartItem(it.id));

      container.appendChild(row);
    });

    const subtotal = getPOSSubtotal();
    const fee = getPOSDeliveryFee();
    const total = subtotal + fee;

    document.getElementById("pos-subtotal-val").textContent = subtotal.toLocaleString("ru-RU") + " so'm";
    document.getElementById("pos-deliv-val").textContent =
      fee === 0 ? "Bepul (0 so'm)" : fee.toLocaleString("ru-RU") + " so'm";
    document.getElementById("pos-total-val").textContent = total.toLocaleString("ru-RU") + " so'm";
    document.getElementById("pos-pay-btn").disabled = false;
    const kitchenBtn = document.getElementById("pos-kitchen-send-btn");
    if (kitchenBtn) kitchenBtn.disabled = false;

    // Update Mobile POS Elements
    const totalQty = state.posCart.reduce((sum, item) => sum + item.qty, 0);
    const badgeMob = document.getElementById("pos-mob-ticket-badge");
    if (badgeMob) {
      badgeMob.textContent = totalQty;
      badgeMob.style.display = totalQty > 0 ? "inline-block" : "none";
    }

    const floatBar = document.getElementById("pos-mob-floating-bar");
    if (floatBar) {
      if (totalQty > 0) {
        floatBar.style.display = "flex";
        const floatQty = document.getElementById("pos-mob-float-qty");
        const floatTot = document.getElementById("pos-mob-float-total");
        if (floatQty) floatQty.textContent = `${totalQty} taom`;
        if (floatTot) floatTot.textContent = total.toLocaleString("ru-RU") + " so'm";
      } else {
        floatBar.style.display = "none";
      }
    }
  }

  // ==================== PAYMENT & RECEIPT PRINT ====================
  function openPaymentModal(targetOrder = null) {
    if (targetOrder) {
      state.payingOrder = targetOrder;
    } else {
      state.payingOrder = null;
      if (state.posCart.length === 0) return;
    }

    const total = getActivePayingTotal();
    const modalTitle = document.querySelector("#payment-modal h3");
    if (modalTitle) {
      modalTitle.textContent = state.payingOrder
        ? `To'lov: ${getOrderCode(state.payingOrder)} (${state.payingOrder.customer_name || state.payingOrder.address || "Stol"})`
        : "To'lovni qabul qilish";
    }

    document.getElementById("modal-pay-total").textContent = total.toLocaleString("ru-RU") + " so'm";

    const cashInput = document.getElementById("input-cash-given");
    if (cashInput) {
      cashInput.value = total;
    }
    calculateChange();

    document.getElementById("payment-modal").style.display = "flex";
  }

  function closePaymentModal() {
    state.payingOrder = null;
    const modal = document.getElementById("payment-modal");
    if (modal) modal.style.display = "none";
  }

  function calculateChange() {
    const total = getActivePayingTotal();
    const given = Number(document.getElementById("input-cash-given").value) || 0;
    const change = Math.max(0, given - total);
    document.getElementById("modal-change-val").textContent = change.toLocaleString("ru-RU") + " so'm";
  }

  async function executeSendToKitchen() {
    if (state.posCart.length === 0) {
      alert("Iltimos, avval taomlarni tanlang!");
      return;
    }

    const tableSelect = document.getElementById("pos-table-select");
    const tableName = tableSelect ? tableSelect.value : (document.getElementById("pos-cust-name")?.value.trim() || "1-Stol");
    const custPhone = document.getElementById("pos-cust-phone")?.value.trim() || "+998 90 822 01 01";
    const subtotal = getPOSSubtotal();

    const kitchenBtn = document.getElementById("pos-kitchen-send-btn");
    if (kitchenBtn) kitchenBtn.disabled = true;

    try {
      const activeOrder = state.activeTableAppendOrderId
        ? state.orders.find((o) => o.id === state.activeTableAppendOrderId)
        : state.orders.find(
            (o) =>
              o.delivery_type === "dine_in" &&
              normalizeStatus(o.status) !== "completed" &&
              normalizeStatus(o.status) !== "cancelled" &&
              (String(o.customer_name || "").toLowerCase().includes(tableName.toLowerCase()) ||
                String(o.address || "").toLowerCase().includes(tableName.toLowerCase()))
          );

      if (activeOrder) {
        // DO-ZAKAZ (APPEND)
        const appendPayload = {
          items: state.posCart.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          comment: "⚡ Qo'shimcha buyurtma (Do-zakaz)",
        };

        const res = await fetch(getAdminApiUrl(`/api/admin/orders/${activeOrder.id}/append`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(appendPayload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          alert(data.error || "Do-zakazni saqlashda xatolik yuz berdi!");
          return;
        }

        const cartSnapshot = [...state.posCart];
        clearPOSCart();

        printKitchenTicket({
          id: activeOrder.id,
          order_code: getOrderCode(activeOrder),
          delivery_type: "dine_in",
          customer_name: tableName,
          items: cartSnapshot,
          comment: "⚡ QO'SHIMCHA BUYURTMA (DO-ZAKAZ)",
          created_at_utc: new Date().toISOString(),
        });

        alert(`✅ ${tableName} hisobiga qo'shimcha taomlar qo'shildi va oshxonaga uzatildi!`);
        await fetchOrders();
        await fetchStats();
        updatePOSTableBanner();
      } else {
        // NEW DINE-IN ORDER
        const orderPayload = {
          idempotency_key: "pos_dine_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
          customer_name: tableName,
          phone: custPhone,
          delivery_type: "dine_in",
          address: tableName,
          comment: "Zalda · To'lov chiqishda",
          payment_method: "unpaid",
          payment_status: "pending",
          status: "cooking",
          source: "kassa",
          items: state.posCart.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          totalAmount: subtotal,
          subtotal: subtotal,
          delivery_fee: 0,
        };

        const res = await fetch(getAdminApiUrl("/api/orders"), {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok || !data.order) {
          alert(data.error || "Buyurtmani saqlashda xatolik yuz berdi!");
          return;
        }

        const savedOrder = data.order;
        clearPOSCart();

        printKitchenTicket(savedOrder);

        alert(`✅ ${tableName} uchun buyurtma ochildi va oshxonaga uzatildi! (To'lov chiqishda)`);
        await fetchOrders();
        await fetchStats();
        updatePOSTableBanner();
      }
    } catch (e) {
      console.warn("Send to kitchen error:", e);
      alert("Server bilan aloqa uzildi! Qayta urinib ko'ring.");
    } finally {
      if (kitchenBtn) kitchenBtn.disabled = false;
    }
  }

  async function executePaymentAndPrint() {
    const confirmBtn = document.getElementById("btn-confirm-payment");
    if (confirmBtn) confirmBtn.disabled = true;

    try {
      if (state.payingOrder) {
        // SETTLING AN EXISTING OPEN ORDER (E.G. DINE-IN AT EXIT)
        const ord = state.payingOrder;
        const total = getOrderTotal(ord);
        const cashGiven = Number(document.getElementById("input-cash-given").value) || total;
        const change = Math.max(0, cashGiven - total);
        const payMethod = (state.payMethod === "click" || state.payMethod === "payme") ? "online" : (state.payMethod || "cash");

        const res = await fetch(getAdminApiUrl(`/api/admin/orders/${ord.id}/pay`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            payment_method: payMethod,
            operator: state.username || "kassir",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok || !data.order) {
          alert(data.error || "To'lovni saqlashda xatolik! Qayta urinib ko'ring.");
          return;
        }

        const paidOrder = data.order;
        closePaymentModal();

        printThermalReceipt({
          orderId: getOrderCode(paidOrder),
          orderType: paidOrder.delivery_type || "dine_in",
          custName: paidOrder.customer_name || "Mijoz",
          custPhone: paidOrder.phone || "+998 90 ...",
          custAddr: paidOrder.address || "",
          items: paidOrder.items || [],
          subtotal: paidOrder.subtotal || total,
          discount: paidOrder.discount || 0,
          delivFee: paidOrder.delivery_fee || 0,
          total: total,
          payMethod: state.payMethod,
          cashGiven: cashGiven,
          change: change,
          date: new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" }),
        });

        alert(`✅ To'lov muvaffaqiyatli qabul qilindi! Stol bo'shatildi.`);
        await fetchOrders();
        await fetchReservations();
        await fetchStats();
        updatePOSTableBanner();
        return;
      }

      // STANDARD POS CART CHECKOUT
      const custName =
        document.getElementById("pos-cust-name").value.trim() ||
        (state.posOrderType === "dine_in" ? "1-Stol" : "Mijoz");
      const custPhone = document.getElementById("pos-cust-phone").value.trim() || "+998 90 822 01 01";
      const custAddr = document.getElementById("pos-cust-addr").value.trim();
      const subtotal = getPOSSubtotal();
      const delivFee = getPOSDeliveryFee();
      const total = subtotal + delivFee;
      const cashGiven = Number(document.getElementById("input-cash-given").value) || total;
      const change = Math.max(0, cashGiven - total);

      const orderPayload = {
        idempotency_key: "pos_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
        customer_name: custName,
        phone: custPhone,
        delivery_type: state.posOrderType,
        address: custAddr || (state.posOrderType === "dine_in" ? custName : "Termiz sh."),
        comment: `To'lov: ${state.payMethod.toUpperCase()} (Kassa)`,
        payment_method: (state.payMethod === "click" || state.payMethod === "payme") ? "online" : (state.payMethod || "cash"),
        payment_status: "paid",
        source: "kassa",
        items: state.posCart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        totalAmount: total,
        subtotal: subtotal,
        delivery_fee: delivFee,
      };

      const res = await fetch(getAdminApiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.order) {
        alert(data.error || "Buyurtmani saqlashda xatolik! Server bilan aloqani tekshiring.");
        return;
      }

      const savedOrder = data.order;
      const cartSnapshot = [...state.posCart];
      closePaymentModal();
      clearPOSCart();

      printThermalReceipt({
        orderId: getOrderCode(savedOrder),
        orderType: state.posOrderType,
        custName: custName,
        custPhone: custPhone,
        custAddr: custAddr,
        items: cartSnapshot,
        subtotal: subtotal,
        discount: 0,
        delivFee: delivFee,
        total: total,
        payMethod: state.payMethod,
        cashGiven: cashGiven,
        change: change,
        date: new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" }),
      });

      await fetchOrders();
      await fetchStats();
      updatePOSTableBanner();
    } catch (e) {
      console.warn("Kassa order sync error:", e);
      alert("Server bilan aloqa uzildi! Buyurtma saqlanmadi, qayta urinib ko'ring.");
    } finally {
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  function printThermalReceipt(data) {
    const area = document.getElementById("thermal-receipt-print-area");
    if (!area) return;

    let typeName = "ZALDA";
    if (data.orderType === "pickup") typeName = "OLIB KETISH (С СОБОЙ)";
    else if (data.orderType === "delivery") typeName = "YETKAZIB BERISH (ДОСТАВКА)";

    let itemsHtml = "";
    (data.items || []).forEach((it, idx) => {
      const itemName = typeof it.name === "object" ? getDishName(it) : it.name;
      const lineTot = Number(it.price || 0) * Number(it.qty || 1);
      itemsHtml += `
        <tr>
          <td style="padding: 2px 0;">${idx + 1}. ${escapeHtml(itemName)}</td>
          <td style="text-align:center;">x${it.qty || 1}</td>
          <td style="text-align:right;">${lineTot.toLocaleString("ru-RU")}</td>
        </tr>
      `;
    });

    let payMethodName = "NAQD PUL";
    if (data.payMethod === "card") payMethodName = "KARTA / HUMO / UZCARD";
    else if (data.payMethod === "click") payMethodName = "CLICK / PAYME (ONLINE)";

    area.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <img src="images/logo_3x4.png" alt="Logo" style="width: 48px; height: 64px; object-fit: cover; border-radius: 6px; margin: 0 auto 4px; display: block;" />
        <h2 style="margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 1px;">AMERICAN CAFFETTERIA</h2>
        <div style="font-size: 11px;">Termiz sh., 100% Halol</div>
        <div style="font-size: 11px;">Tel: +998 90 822 01 01</div>
      </div>

      <div style="font-size: 11px; margin-bottom: 6px;">
        <div><b>Chek:</b> ${escapeHtml(data.orderId)}</div>
        <div><b>Sana:</b> ${escapeHtml(data.date)}</div>
        <div><b>Turi:</b> <b>${escapeHtml(typeName)}</b></div>
        <div><b>Mijoz:</b> ${escapeHtml(data.custName)} (${escapeHtml(data.custPhone || "")})</div>
        ${data.custAddr ? `<div><b>Manzil:</b> ${escapeHtml(data.custAddr)}</div>` : ""}
        <div><b>Kassir:</b> ${escapeHtml(state.username)}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 6px; border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
        <thead>
          <tr style="border-bottom: 1px dotted #000;">
            <th style="text-align:left; padding: 3px 0;">Taom</th>
            <th style="text-align:center;">Soni</th>
            <th style="text-align:right;">Summa</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="font-size: 11.5px; margin-bottom: 6px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Taomlar:</span>
          <span>${Number(data.subtotal || data.total || 0).toLocaleString("ru-RU")} so'm</span>
        </div>
        ${
          data.discount > 0
            ? `<div style="display:flex; justify-content:space-between;">
                <span>Chegirma:</span>
                <span>-${Number(data.discount).toLocaleString("ru-RU")} so'm</span>
              </div>`
            : ""
        }
        ${
          data.delivFee > 0
            ? `<div style="display:flex; justify-content:space-between;">
                <span>Yetkazib berish:</span>
                <span>${Number(data.delivFee).toLocaleString("ru-RU")} so'm</span>
              </div>`
            : ""
        }
        <div style="display:flex; justify-content:space-between; font-size: 14px; font-weight: 900; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
          <span>JAMI:</span>
          <span>${Number(data.total || 0).toLocaleString("ru-RU")} UZS</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 11px; margin-top: 4px;">
          <span>To'lov usuli:</span>
          <span><b>${payMethodName}</b></span>
        </div>
        ${
          data.payMethod === "cash" && data.cashGiven > data.total
            ? `<div style="display:flex; justify-content:space-between; font-size: 11px;">
                <span>Berildi:</span>
                <span>${Number(data.cashGiven).toLocaleString("ru-RU")} UZS</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size: 11px; font-weight: bold;">
                <span>Qaytim:</span>
                <span>${Number(data.change).toLocaleString("ru-RU")} UZS</span>
              </div>`
            : ""
        }
      </div>

      <div style="text-align: center; border-top: 1px dashed #000; padding-top: 6px; font-size: 10.5px;">
        <div>Xaridingiz uchun rahmat!</div>
        <div>Yoqimli ishtaha! (100% Halol)</div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  }

  // ==================== LIVE ORDERS VIEW (KDS) ====================
  function renderLiveOrders() {
    const grid = document.getElementById("orders-live-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const flt = state.activeFilter;
    const orders = state.orders.filter((o) => {
      if (flt === "all") return true;
      return normalizeStatus(o.status) === flt;
    });

    if (orders.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 50px;">
        <i class="ti ti-inbox" style="font-size: 38px;"></i>
        <p style="margin-top: 8px;">Ushbu bo'limda buyurtmalar yo'q</p>
      </div>`;
      return;
    }

    orders.forEach((ord) => {
      const card = document.createElement("div");
      card.className = "order-live-card";

      const src = (ord.source || "web").toLowerCase();
      let srcBadge = `<span class="order-source-tag src-web">🌐 SAYT</span>`;
      if (src.includes("bot") || src.includes("tg")) srcBadge = `<span class="order-source-tag src-tg">🤖 BOT</span>`;
      else if (src === "kassa") srcBadge = `<span class="order-source-tag src-kassa">🖥️ KASSA</span>`;
      else if (src.includes("app") || src.includes("android")) srcBadge = `<span class="order-source-tag src-app">📱 ILOVA</span>`;

      const isDineIn = ord.delivery_type === "dine_in";
      const st = normalizeStatus(ord.status);
      const isReadyFromKitchen = ord.kitchen_status === "ready" || st === "ready";
      let actionButtons = "";
      if (st === "new") {
        actionButtons = `
          <button type="button" class="btn-action-status btn-status-prep" data-id="${ord.id}" data-st="cooking">
            ${t("act_to_kitchen")}
          </button>
        `;
      } else if (!isDineIn) {
        if (st === "preparing" || st === "ready") {
          actionButtons = `
            <button type="button" class="btn-action-courier-modal btn-status-deliv" data-id="${ord.id}">
              ${t("act_to_courier")}
            </button>
          `;
        } else if (st === "delivering") {
          actionButtons = `
            <button type="button" class="btn-action-status btn-status-done" data-id="${ord.id}" data-st="completed">
              ${t("act_to_done")}
            </button>
          `;
        }
      } else if (isDineIn && isReadyFromKitchen) {
        actionButtons = `
          <button type="button" class="btn-action-served btn-status-done" data-id="${ord.id}" style="background:#059669; border-color:#047857; color:#fff; font-weight:800; padding:6px 10px; font-size:12px;">
            🍽️ Stolga berildi
          </button>
        `;
      }

      let itemsLines = "";
      if (Array.isArray(ord.items)) {
        ord.items.forEach((it) => {
          const rawNm = typeof it.name === "object" ? getDishName(it) : (it.name || "Taom");
          const nm = escapeHtml(rawNm);
          const itemMatch = window.menuItems?.find((m) => m.id === it.id || getDishName(m) === rawNm);
          const thumb = it.image || itemMatch?.image || "images/logo.png";
          const lineCost = ((it.price || 0) * (it.qty || 1)).toLocaleString("ru-RU");
          itemsLines += `
            <div class="order-item-line" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:4px 0; border-bottom:1px dashed rgba(35,36,36,0.12);">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <img src="${thumb}" class="order-item-thumb" onerror="this.onerror=null; this.src='images/logo.png';" alt="${nm}" />
                <span style="font-size:13px; font-weight:700; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${nm} <strong style="color:var(--red); font-size:13.5px;">× ${it.qty || 1}</strong>
                </span>
              </div>
              <span style="font-weight:800; font-size:13px; color:var(--ink); white-space:nowrap;">${lineCost} so'm</span>
            </div>
          `;
        });
      } else if (ord.items_summary) {
        itemsLines = `<div style="font-size:13px; font-weight:700; color:var(--ink); padding:4px 0;">${ord.items_summary}</div>`;
      }
      const ordTotal = getOrderTotal(ord);
      const ordCode = getOrderCode(ord);

      const isUnpaidDineIn =
        isDineIn &&
        (ord.payment_status === "pending" || ord.payment_method === "unpaid") &&
        st !== "completed" &&
        st !== "cancelled";

      const payBadge = isUnpaidDineIn
        ? `<span style="display:inline-block; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:800; background:#fef3c7; color:#d97706; border:1px solid #f59e0b; margin-left:6px;">🟡 Chiqishda to'lanadi</span>`
        : (ord.payment_status === "paid" ? `<span style="display:inline-block; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:800; background:#d1fae5; color:#065f46; border:1px solid #10b981; margin-left:6px;">🟢 To'langan</span>` : "");

      const readyAlert = (isDineIn && isReadyFromKitchen)
        ? `<div style="background:#10b981; color:#fff; font-weight:900; font-size:12px; padding:5px 8px; border-radius:5px; text-align:center; margin-bottom:8px; animation:pulse 1.5s infinite;">🔔 TAYYOR — Olib keting!</div>`
        : "";

      card.innerHTML = `
        <div class="order-card-header">
          <div class="order-num-box">
            <span class="order-num">${ordCode}</span>
            ${srcBadge}
          </div>
          <div class="order-timing-box">
            <span class="sla-timer-badge" data-created="${ord.created_at_utc || ord.created_at_local || ""}" data-status="${st}">
              <i class="ti ti-clock"></i> <span class="sla-text">00:00</span>
            </span>
            <span class="order-time-ago">${formatTime(ord.created_at_utc || ord.created_at_local)}</span>
          </div>
        </div>

        ${readyAlert}

        <div class="order-customer-box">
          <div class="order-customer-name">👤 ${escapeHtml(ord.customer_name || "Mijoz")}</div>
          <div class="order-customer-phone">📞 <a href="tel:${escapeHtml(ord.phone || "")}">${escapeHtml(ord.phone || "")}</a></div>
          ${ord.address ? `<div class="order-customer-addr">📍 <a href="https://maps.google.com/?q=${encodeURIComponent(ord.address)}" target="_blank" style="color:var(--blue); text-decoration:underline; font-weight:700;">${escapeHtml(ord.address)}</a></div>` : ""}
          ${ord.comment ? `<div style="font-size:12px; color:#f59e0b; margin-top:2px;">💬 ${escapeHtml(ord.comment)}</div>` : ""}
        </div>

        <div class="order-items-preview">
          ${itemsLines}
        </div>

        <div class="order-card-total-row">
          <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
            <span style="font-size:13px; color:var(--text-muted);">${(ord.delivery_type || "delivery").toUpperCase()}</span>
            ${payBadge}
          </div>
          <span class="order-total-sum">${ordTotal.toLocaleString("ru-RU")} so'm</span>
        </div>

        <div class="order-actions-row">
          ${isUnpaidDineIn ? `
            <button type="button" class="btn-action-pay-exit btn-pay-exit-ord" data-id="${ord.id}" title="Chiqishda to'lovni qabul qilish" style="background:#10b981; border-color:#059669; color:#fff; font-weight:800; padding:6px 10px; font-size:12px; cursor:pointer;">
              💳 Chiqishda to'lov
            </button>
            <button type="button" class="btn-action-print btn-print-precheck" data-id="${ord.id}" title="Predchek chiqarish" style="background:rgba(245,158,11,0.2); border-color:rgba(245,158,11,0.5); color:#f59e0b; font-weight:700; padding:6px 10px; font-size:12px; cursor:pointer;">
              🧾 Predchek
            </button>
          ` : ""}
          ${actionButtons}
          <button type="button" class="btn-action-print btn-print-kitchen" data-id="${ord.id}" title="Oshxona cheki (Без цен)" style="background:rgba(245,158,11,0.2); border-color:rgba(245,158,11,0.5); color:#f59e0b; font-weight:700; padding:6px 10px; font-size:12px;">
            🍳 Oshxona
          </button>
          <button type="button" class="btn-action-print btn-print-ord" data-id="${ord.id}" title="${t("act_print")}">
            <i class="ti ti-printer"></i>
          </button>
          ${
            st !== "cancelled" && st !== "completed"
              ? `<button type="button" class="btn-action-print btn-cancel-ord" data-id="${ord.id}" style="color:#ef4444;" title="${t("act_cancel")}">
                  <i class="ti ti-x"></i>
                </button>`
              : ""
          }
        </div>
      `;

      card.querySelectorAll(".btn-action-status").forEach((b) => {
        b.addEventListener("click", () => updateOrderStatus(b.dataset.id, b.dataset.st));
      });

      card.querySelectorAll(".btn-action-served").forEach((b) => {
        b.addEventListener("click", () => updateOrderKitchenStatus(ord.id, "served"));
      });

      card.querySelectorAll(".btn-action-courier-modal").forEach((b) => {
        b.addEventListener("click", () => openCourierDispatchModal(ord));
      });

      const payExitBtn = card.querySelector(".btn-pay-exit-ord");
      if (payExitBtn) {
        payExitBtn.addEventListener("click", () => openPaymentModal(ord));
      }

      const precheckBtn = card.querySelector(".btn-print-precheck");
      if (precheckBtn) {
        precheckBtn.addEventListener("click", () => printPrecheck(ord));
      }

      const kitchenBtn = card.querySelector(".btn-print-kitchen");
      if (kitchenBtn) {
        kitchenBtn.addEventListener("click", () => printKitchenTicket(ord));
      }

      const printBtn = card.querySelector(".btn-print-ord");
      if (printBtn) {
        printBtn.addEventListener("click", () => printOrderReceipt(ord));
      }

      const cancelBtn = card.querySelector(".btn-cancel-ord");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (confirm("Buyurtmani bekor qilishni tasdiqlaysizmi?")) {
            updateOrderStatus(ord.id, "cancelled");
          }
        });
      }

      grid.appendChild(card);
    });
    updateAllSlaTimers();
  }

  function updateAllSlaTimers() {
    const badges = document.querySelectorAll(".sla-timer-badge");
    const now = Date.now();
    badges.forEach((badge) => {
      const createdStr = badge.dataset.created;
      const st = (badge.dataset.status || "").toLowerCase();
      if (!createdStr || st === "completed" || st === "cancelled") {
        badge.style.display = "none";
        return;
      }
      badge.style.display = "inline-flex";

      let tDate = new Date(createdStr);
      if (isNaN(tDate.getTime())) {
        tDate = new Date(createdStr.replace(" ", "T") + "Z");
      }
      if (isNaN(tDate.getTime())) return;

      const elapsedSec = Math.max(0, Math.floor((now - tDate.getTime()) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const textSpan = badge.querySelector(".sla-text");
      const icon = badge.querySelector("i");
      const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      badge.classList.remove("sla-ok", "sla-warning", "sla-danger", "pulse-urgent");
      if (elapsedSec < 600) {
        badge.classList.add("sla-ok");
        if (icon) icon.className = "ti ti-clock";
        if (textSpan) textSpan.textContent = timeStr;
      } else if (elapsedSec < 900) {
        badge.classList.add("sla-warning");
        if (icon) icon.className = "ti ti-alert-triangle";
        if (textSpan) textSpan.textContent = timeStr;
      } else {
        badge.classList.add("sla-danger", "pulse-urgent");
        if (icon) icon.className = "ti ti-flame";
        if (textSpan) textSpan.textContent = `${timeStr} 🔥 KECHIKMOQDA!`;
      }
    });
  }

  function printOrderReceipt(ord) {
    if (!ord) return;
    const tot = getOrderTotal(ord);
    printThermalReceipt({
      orderId: getOrderCode(ord),
      orderType: ord.delivery_type || "delivery",
      custName: ord.customer_name || "Mijoz",
      custPhone: ord.phone || "",
      custAddr: ord.address || "",
      items: Array.isArray(ord.items)
        ? ord.items
        : [{ name: ord.items_summary || "Buyurtma", price: tot, qty: 1 }],
      subtotal: ord.subtotal || tot,
      discount: ord.discount || 0,
      delivFee: ord.delivery_fee || 0,
      total: tot,
      payMethod: (function() {
        const pm = String(ord.payment_method || "").toLowerCase();
        if (pm === "card") return "card";
        if (pm === "online" || pm === "click" || pm === "payme") return "click";
        const comm = String(ord.comment || "").toLowerCase();
        if (comm.includes("karta") || comm.includes("card") || comm.includes("terminal")) return "card";
        if (comm.includes("click") || comm.includes("payme") || comm.includes("online")) return "click";
        return "cash";
      })(),
      cashGiven: tot,
      change: 0,
      date: ord.created_at_utc || new Date().toLocaleString("ru-RU"),
    });
  }

  function printKitchenTicket(ord) {
    if (!ord) return;
    const area = document.getElementById("thermal-receipt-print-area");
    if (!area) return;

    let typeName = "ZALDA";
    if (ord.delivery_type === "pickup") typeName = "OLIB KETISH (С СОБОЙ)";
    else if (ord.delivery_type === "delivery") typeName = "YETKAZIB BERISH (ДОСТАВКА)";
    else if (ord.delivery_type === "dine_in") {
      typeName = `ZALDA (${escapeHtml(ord.customer_name || ord.address || "Stol")})`;
    }

    const items = Array.isArray(ord.items)
      ? ord.items
      : [{ name: ord.items_summary || "Buyurtma", qty: 1 }];

    let itemsHtml = "";
    items.forEach((it) => {
      const itemName = typeof it.name === "object" ? getDishName(it) : it.name;
      const qty = it.qty || 1;
      itemsHtml += `
        <div style="font-size: 16px; font-weight: 800; padding: 4px 0; border-bottom: 1px dashed #444; display: flex; justify-content: space-between;">
          <span>${escapeHtml(itemName)}</span>
          <span style="font-size: 18px; font-weight: 900; margin-left: 8px;">×${qty}</span>
        </div>
      `;
    });

    const timeStr = ord.created_at_utc
      ? new Date(ord.created_at_utc).toLocaleTimeString("ru-RU", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString("ru-RU", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit" });

    area.innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 8px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px;">🍳 OSHXONA CHEKI (KITCHEN)</h2>
        <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">American Caffetteria</div>
      </div>

      <div style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
        <div style="font-size: 18px; font-weight: 900;"><b>Buyurtma:</b> ${escapeHtml(getOrderCode(ord))}</div>
        <div><b>Vaqt:</b> ${escapeHtml(timeStr)}</div>
        <div style="font-size: 15px; font-weight: 800; background: #eee; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 2px;">
          ${escapeHtml(typeName)}
        </div>
      </div>

      <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px 0; margin-bottom: 8px;">
        ${itemsHtml}
      </div>

      ${
        ord.comment
          ? `<div style="font-size: 14px; font-weight: 800; border: 2px dashed #000; padding: 6px; border-radius: 4px; background: #fffbe8;">
              💬 Izoh (Eslatma):<br/>
              <span style="font-size: 15px; font-weight: 900; color: #000;">${escapeHtml(ord.comment)}</span>
            </div>`
          : ""
      }
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  }

  function printPrecheck(ord) {
    if (!ord) return;
    const area = document.getElementById("thermal-receipt-print-area");
    if (!area) return;

    const ordTotal = getOrderTotal(ord);
    const subtotal = Number(ord.subtotal || ordTotal);
    const serviceFee = Number(ord.service_fee || (ord.delivery_type === "dine_in" ? Math.round(subtotal * 0.10) : 0));
    const discount = Number(ord.discount || 0);
    const grandTotal = Number(ord.total || (subtotal - discount + serviceFee));

    const items = Array.isArray(ord.items)
      ? ord.items
      : [{ name: ord.items_summary || "Buyurtma", price: subtotal, qty: 1 }];

    let itemsHtml = "";
    items.forEach((it, idx) => {
      const itemName = typeof it.name === "object" ? getDishName(it) : (it.name || "Taom");
      const qty = Number(it.qty || 1);
      const price = Number(it.price || 0);
      const lineTot = price > 0 ? (price * qty) : 0;
      itemsHtml += `
        <tr>
          <td style="padding: 2px 0;">${idx + 1}. ${escapeHtml(itemName)}</td>
          <td style="text-align:center;">x${qty}</td>
          <td style="text-align:right;">${lineTot > 0 ? lineTot.toLocaleString("ru-RU") : "-"}</td>
        </tr>
      `;
    });

    const dateStr = ord.created_at_utc
      ? new Date(ord.created_at_utc).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })
      : new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" });

    const tableName = escapeHtml(ord.customer_name || ord.address || "Stol");

    area.innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px;">PREDCHEK / PREDCHECK</h2>
        <div style="font-size: 13px; font-weight: 800;">American Caffetteria Termiz</div>
        <div style="font-size: 11px; font-weight: 700; color: #555;">(Bu to'lov cheki emas / Chiqishda to'lanadi)</div>
      </div>

      <div style="font-size: 12px; margin-bottom: 6px; line-height: 1.4;">
        <div style="font-size: 16px; font-weight: 900;"><b>Stol:</b> ${tableName}</div>
        <div><b>Buyurtma kodi:</b> ${escapeHtml(getOrderCode(ord))}</div>
        <div><b>Vaqt:</b> ${escapeHtml(dateStr)}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 6px; border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
        <thead>
          <tr style="border-bottom: 1px dotted #000;">
            <th style="text-align:left; padding: 3px 0;">Taom</th>
            <th style="text-align:center;">Soni</th>
            <th style="text-align:right;">Summa</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="font-size: 13px; margin-bottom: 6px; border-top: 1px dashed #000; padding-top: 4px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>Taomlar summasi:</span>
          <span>${subtotal.toLocaleString("ru-RU")} UZS</span>
        </div>
        ${discount > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px; color:#166534;">
          <span>Chegirma (${escapeHtml(ord.promo_code || "")}):</span>
          <span>-${discount.toLocaleString("ru-RU")} UZS</span>
        </div>` : ""}
        ${serviceFee > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-weight:700;">
          <span>Xizmat haqi (10%):</span>
          <span>+${serviceFee.toLocaleString("ru-RU")} UZS</span>
        </div>` : ""}
        <div style="display:flex; justify-content:space-between; font-size: 16px; font-weight: 900; border-top: 2px solid #000; padding-top: 4px; margin-top: 4px;">
          <span>JAMI TO'LOV:</span>
          <span>${grandTotal.toLocaleString("ru-RU")} UZS</span>
        </div>
      </div>

      <div style="text-align:center; border: 2px dashed #000; padding: 6px; border-radius: 4px; margin-top: 8px; font-size: 11.5px; font-weight: 800; background:#f9fafb;">
        ☕ To'lov kafedan chiqishda kassaga to'lanadi (Naqd, Karta yoki Click).<br/>
        Xizmatingizdan mamnunmiz!
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  }

  async function updateOrderStatus(id, newStatus) {
    try {
      const res = await fetch(getAdminApiUrl(`/api/admin/orders/${id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.order) {
          updateOrderInList(data.order);
          if (state.bc) {
            state.bc.postMessage({ type: "order_updated", order: data.order });
          }
          fetchStats();
        }
      }
    } catch (e) {
      console.warn("Status update error:", e);
    }
  }

  async function updateOrderKitchenStatus(id, kitchenStatus) {
    try {
      const payload = { kitchen_status: kitchenStatus };
      if (kitchenStatus === "ready") {
        payload.status = "ready";
      } else if (kitchenStatus === "cooking") {
        payload.status = "cooking";
      }
      const res = await fetch(getAdminApiUrl(`/api/admin/orders/${id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.order) {
          updateOrderInList(data.order);
          if (state.bc) {
            state.bc.postMessage({ type: "order_updated", order: data.order });
          }
          fetchStats();
        }
      }
    } catch (e) {
      console.warn("Kitchen status update error:", e);
    }
  }

  let activeCourierDispatchOrderId = null;

  function openCourierDispatchModal(ord) {
    activeCourierDispatchOrderId = ord.id;
    const modal = document.getElementById("courier-dispatch-modal");
    if (!modal) return;

    document.getElementById("cdm-order-code").textContent = getOrderCode(ord);
    document.getElementById("cdm-order-sum").textContent = getOrderTotal(ord).toLocaleString("ru-RU") + " so'm";

    const isCardTerminal = ord.payment_method === "card_terminal" || (ord.comment || "").toLowerCase().includes("terminal");
    const terminalAlert = document.getElementById("cdm-terminal-alert");
    if (terminalAlert) terminalAlert.style.display = isCardTerminal ? "block" : "none";

    const extWrap = document.getElementById("cdm-mode-external-wrap");
    const extRadio = document.getElementById("cdm-mode-external");
    const ownRadio = document.getElementById("cdm-mode-own");

    if (isCardTerminal) {
      if (extRadio) {
        extRadio.disabled = true;
        extRadio.checked = false;
      }
      if (extWrap) {
        extWrap.style.opacity = "0.5";
        extWrap.title = "Tashqi kuryerda kafening terminali yo'q — terminal bilan o'zimizning kuryer borishi shart!";
      }
      if (ownRadio) ownRadio.checked = true;
    } else {
      if (extRadio) extRadio.disabled = false;
      if (extWrap) {
        extWrap.style.opacity = "1";
        extWrap.title = "";
      }
      if (ownRadio) ownRadio.checked = true;
    }

    const buyoutSec = document.getElementById("cdm-buyout-section");
    if (buyoutSec) buyoutSec.style.display = "none";
    const paidUpfrontCheckbox = document.getElementById("cdm-courier-paid-upfront");
    if (paidUpfrontCheckbox) paidUpfrontCheckbox.checked = false;

    modal.style.display = "flex";
  }

  async function confirmCourierDispatch() {
    if (!activeCourierDispatchOrderId) return;
    const ord = state.orders.find((o) => o.id === activeCourierDispatchOrderId);
    if (!ord) return;

    const isExternal = document.getElementById("cdm-mode-external")?.checked;
    const deliveryMode = isExternal ? "external_buyout" : "own_courier";
    const courierName = document.getElementById("cdm-courier-name")?.value.trim() || "";
    const courierPhone = document.getElementById("cdm-courier-phone")?.value.trim() || "";
    const isPaidUpfront = isExternal && Boolean(document.getElementById("cdm-courier-paid-upfront")?.checked);

    const isCardTerminal = ord.payment_method === "card_terminal" || (ord.comment || "").toLowerCase().includes("terminal");
    if (isExternal && isCardTerminal) {
      alert("Tashqi kuryerda terminal yo'q! Mijoz terminal so'ragan, faqat o'zimizning kuryerni tanlang.");
      return;
    }

    const payload = {
      status: "delivering",
      delivery_mode: deliveryMode,
      courier_name: courierName,
      courier_phone: courierPhone,
      courier_paid_upfront: isPaidUpfront ? 1 : 0,
    };
    if (isPaidUpfront) {
      payload.payment_status = "paid";
      payload.payment_method = "cash";
    }

    try {
      const res = await fetch(getAdminApiUrl(`/api/admin/orders/${ord.id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.order) {
          updateOrderInList(data.order);
          if (state.bc) {
            state.bc.postMessage({ type: "order_updated", order: data.order });
          }
          fetchStats();
        }
      }
    } catch (e) {
      console.warn("Courier dispatch error:", e);
    }

    const modal = document.getElementById("courier-dispatch-modal");
    if (modal) modal.style.display = "none";
    activeCourierDispatchOrderId = null;
  }

  function renderKitchenView() {
    const grid = document.getElementById("kitchen-live-grid");
    const countBadge = document.getElementById("kitchen-queue-count");
    const navBadge = document.getElementById("badge-kitchen-orders");
    if (!grid) return;

    grid.innerHTML = "";
    const activeOrders = state.orders.filter((o) => {
      const st = normalizeStatus(o.status);
      return (st === "new" || st === "accepted" || st === "cooking" || st === "preparing") && o.status !== "completed" && o.status !== "cancelled";
    });

    if (countBadge) countBadge.textContent = activeOrders.length;
    if (navBadge) {
      navBadge.textContent = activeOrders.length;
      navBadge.hidden = activeOrders.length === 0;
    }

    if (activeOrders.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 20px; background:#fff; border:2px dashed #232424; border-radius:12px;">
          <h3 style="font-size:20px; font-weight:900; color:var(--ink);">🎉 Oshxona bo'sh — Barcha taomlar tayyorlandi!</h3>
          <p style="color:var(--text-muted); font-size:14px; margin-top:6px;">Yangi buyurtma kelganda bu yerda avtomatik paydo bo'ladi.</p>
        </div>
      `;
      return;
    }

    activeOrders.forEach((ord) => {
      const card = document.createElement("div");
      card.className = "order-live-card";
      card.style.border = "3px solid #ea580c";
      card.style.boxShadow = "4px 4px 0 #ea580c";

      const ordCode = getOrderCode(ord);
      const isDineIn = ord.delivery_type === "dine_in";
      const placeLabel = isDineIn ? `🪑 ${escapeHtml(ord.customer_name || ord.address || "Stol")}` : `🛵 Dostavka (${escapeHtml(ord.customer_name || "Mijoz")})`;

      let itemsHtml = "";
      if (Array.isArray(ord.items)) {
        ord.items.forEach((it, idx) => {
          const rawNm = typeof it.name === "object" ? getDishName(it) : (it.name || "Taom");
          itemsHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:2px dashed rgba(35,36,36,0.15);">
              <span style="font-size:18px; font-weight:800; color:#232424;">${idx + 1}. ${escapeHtml(rawNm)}</span>
              <span style="font-size:24px; font-weight:900; color:#ea580c; background:#ffedd5; padding:2px 10px; border-radius:6px; border:1px solid #fdba74;">
                × ${it.qty || 1}
              </span>
            </div>
          `;
        });
      } else if (ord.items_summary) {
        itemsHtml = `<div style="font-size:18px; font-weight:800; padding:8px 0;">${ord.items_summary}</div>`;
      }

      const st = normalizeStatus(ord.status);
      const isCooking = st === "cooking" || ord.kitchen_status === "cooking";

      card.innerHTML = `
        <div class="order-card-header" style="background:#fff7ed; padding:10px 12px; border-bottom:2px solid #ea580c;">
          <div>
            <span style="font-size:18px; font-weight:900; color:#ea580c;">${ordCode}</span>
            <div style="font-size:16px; font-weight:900; color:#232424; margin-top:2px;">${placeLabel}</div>
          </div>
          <div class="order-timing-box">
            <span class="sla-timer-badge" data-created="${ord.created_at_utc || ord.created_at_local || ""}" data-status="${st}">
              <i class="ti ti-clock"></i> <span class="sla-text">00:00</span>
            </span>
          </div>
        </div>

        ${ord.comment ? `
          <div style="background:#fef3c7; border:1px solid #f59e0b; color:#92400e; padding:6px 10px; font-weight:700; font-size:13px; margin:8px 12px 0; border-radius:6px;">
            💬 Izoh: ${escapeHtml(ord.comment)}
          </div>
        ` : ""}

        <div style="padding:12px; flex:1;">
          ${itemsHtml}
        </div>

        <div style="display:flex; gap:8px; padding:10px 12px; background:#f9fafb; border-top:2px solid rgba(35,36,36,0.15);">
          <button type="button" class="btn-kitchen-cooking" data-id="${ord.id}" style="flex:1; background:${isCooking ? '#fdba74' : '#fff'}; border:2px solid #ea580c; color:#ea580c; font-weight:900; padding:10px; border-radius:8px; font-size:14px; cursor:pointer;">
            ${isCooking ? "🔥 Tayyorlanmoqda" : "🔥 Tayyorlash"}
          </button>
          <button type="button" class="btn-kitchen-ready" data-id="${ord.id}" style="flex:1.5; background:#10b981; border:2px solid #059669; color:#fff; font-weight:900; padding:10px; border-radius:8px; font-size:15px; cursor:pointer;">
            ✅ TAYYOR (Olib ketish)
          </button>
        </div>
      `;

      card.querySelector(".btn-kitchen-cooking")?.addEventListener("click", () => {
        updateOrderKitchenStatus(ord.id, "cooking");
      });

      card.querySelector(".btn-kitchen-ready")?.addEventListener("click", () => {
        updateOrderKitchenStatus(ord.id, "ready");
      });

      grid.appendChild(card);
    });
    updateAllSlaTimers();
  }

  function renderCourierView() {
    const grid = document.getElementById("courier-live-grid");
    const countBadge = document.getElementById("courier-queue-count");
    const navBadge = document.getElementById("badge-courier-orders");
    if (!grid) return;

    grid.innerHTML = "";
    const deliveryOrders = state.orders.filter((o) => {
      const st = normalizeStatus(o.status);
      return o.delivery_type === "delivery" && (st === "ready" || st === "delivering" || st === "preparing") && o.status !== "completed" && o.status !== "cancelled";
    });

    if (countBadge) countBadge.textContent = deliveryOrders.length;
    if (navBadge) {
      navBadge.textContent = deliveryOrders.length;
      navBadge.hidden = deliveryOrders.length === 0;
    }

    if (deliveryOrders.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 20px; background:#fff; border:2px dashed #232424; border-radius:12px;">
          <h3 style="font-size:20px; font-weight:900; color:var(--ink);">🛵 Kuryer navbati bo'sh!</h3>
          <p style="color:var(--text-muted); font-size:14px; margin-top:6px;">Yetkazib berish buyurtmalari tayyor bo'lganda bu yerda ko'rinadi.</p>
        </div>
      `;
      return;
    }

    deliveryOrders.forEach((ord) => {
      const card = document.createElement("div");
      card.className = "order-live-card";
      card.style.border = "3px solid #0284c7";
      card.style.boxShadow = "4px 4px 0 #0284c7";

      const ordCode = getOrderCode(ord);
      const total = getOrderTotal(ord);
      const st = normalizeStatus(ord.status);

      const rawPm = String(ord.payment_method || "cash").toLowerCase();
      const isPaid = ord.payment_status === "paid" || ord.courier_paid_upfront === 1;

      let payBadge = "";
      if (isPaid) {
        payBadge = `<div style="background:#d1fae5; border:2px solid #10b981; color:#065f46; font-size:14px; font-weight:900; padding:6px 12px; border-radius:6px; text-align:center;">🟢 TO'LANGAN (Kassada to'langan / Click)</div>`;
      } else if (rawPm === "card_terminal" || (ord.comment || "").toLowerCase().includes("terminal")) {
        payBadge = `<div style="background:#fee2e2; border:2px solid #ef4444; color:#991b1b; font-size:14px; font-weight:900; padding:6px 12px; border-radius:6px; text-align:center;">💳 KURYERDA TERMINAL: ${total.toLocaleString("ru-RU")} so'm</div>`;
      } else {
        payBadge = `<div style="background:#fef3c7; border:2px solid #f59e0b; color:#92400e; font-size:14px; font-weight:900; padding:6px 12px; border-radius:6px; text-align:center;">💵 NAQD PUL: ${total.toLocaleString("ru-RU")} so'm oling</div>`;
      }

      let itemsSummary = "";
      if (Array.isArray(ord.items)) {
        itemsSummary = ord.items.map((i) => `${typeof i.name === "object" ? getDishName(i) : i.name} × ${i.qty || 1}`).join(", ");
      } else {
        itemsSummary = ord.items_summary || "Taomlar";
      }

      card.innerHTML = `
        <div class="order-card-header" style="background:#f0f9ff; padding:10px 12px; border-bottom:2px solid #0284c7;">
          <div>
            <span style="font-size:18px; font-weight:900; color:#0284c7;">${ordCode}</span>
            <div style="font-size:13px; font-weight:800; color:#555;">${escapeHtml(ord.customer_name || "Mijoz")}</div>
          </div>
          <div class="order-timing-box">
            <span class="sla-timer-badge" data-created="${ord.created_at_utc || ord.created_at_local || ""}" data-status="${st}">
              <i class="ti ti-clock"></i> <span class="sla-text">00:00</span>
            </span>
          </div>
        </div>

        <div style="padding:12px; display:flex; flex-direction:column; gap:8px;">
          <div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted);">MANZIL:</div>
            <a href="https://maps.google.com/?q=${encodeURIComponent(ord.address || 'Termiz')}" target="_blank" style="font-size:15px; font-weight:900; color:#0284c7; text-decoration:underline;">
              📍 ${escapeHtml(ord.address || "Manzil ko'rsatilmagan")}
            </a>
          </div>

          <div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted);">TELEFON:</div>
            <a href="tel:${escapeHtml(ord.phone || '')}" style="font-size:16px; font-weight:900; color:#16a34a;">
              📞 ${escapeHtml(ord.phone || '—')}
            </a>
          </div>

          <div style="font-size:13px; font-weight:700; color:#374151; background:#f9fafb; padding:6px 10px; border-radius:6px; border:1px solid #e5e7eb;">
            🍲 <b>Taomlar:</b> ${escapeHtml(itemsSummary)}
          </div>

          ${ord.comment ? `
            <div style="font-size:12px; font-weight:700; color:#b45309; background:#fffbeb; padding:4px 8px; border-radius:4px;">
              💬 Izoh: ${escapeHtml(ord.comment)}
            </div>
          ` : ""}

          ${payBadge}
        </div>

        <div style="display:flex; gap:8px; padding:10px 12px; background:#f9fafb; border-top:2px solid rgba(35,36,36,0.15);">
          ${st !== "delivering" ? `
            <button type="button" class="btn-courier-take" data-id="${ord.id}" style="flex:1; background:#0284c7; border:2px solid #0369a1; color:#fff; font-weight:900; padding:10px; border-radius:8px; font-size:14px; cursor:pointer;">
              🛵 Yetkazishga oldim
            </button>
          ` : `
            <button type="button" class="btn-courier-delivered" data-id="${ord.id}" style="flex:1; background:#10b981; border:2px solid #059669; color:#fff; font-weight:900; padding:10px; border-radius:8px; font-size:15px; cursor:pointer;">
              ✅ Yetkazildi / To'lov olindi
            </button>
          `}
        </div>
      `;

      card.querySelector(".btn-courier-take")?.addEventListener("click", () => {
        updateOrderStatus(ord.id, "delivering");
      });

      card.querySelector(".btn-courier-delivered")?.addEventListener("click", async () => {
        try {
          const res = await fetch(getAdminApiUrl(`/api/admin/orders/${ord.id}/status`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ status: "completed", payment_status: "paid" }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.order) {
              updateOrderInList(data.order);
              if (state.bc) {
                state.bc.postMessage({ type: "order_updated", order: data.order });
              }
              fetchStats();
            }
          }
        } catch (e) {
          console.warn("Delivery completed error:", e);
        }
      });

      grid.appendChild(card);
    });
    updateAllSlaTimers();
  }

  // ==================== 17-TABLE MAP & ONLINE RESERVATIONS ====================
  async function fetchReservations() {
    try {
      const res = await fetch(getAdminApiUrl("/api/reservations"), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.reservations)) {
          state.reservations = data.reservations;
          updateReservationsBadge();
          renderTablesAndReservations();
        }
      }
    } catch (e) {}
  }

  function handleIncomingReservation(resObj) {
    if (!state.reservations.some((r) => r.id === resObj.id)) {
      state.reservations.unshift(resObj);
      playOrderChime();
      updateReservationsBadge();
      renderTablesAndReservations();
    }
  }

  function updateReservationsBadge() {
    const badge = document.getElementById("badge-new-reservations");
    if (!badge) return;
    const newCount = state.reservations.filter((r) => (r.status || "new") === "new").length;
    if (newCount > 0) {
      badge.textContent = newCount;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function renderTablesAndReservations() {
    const mapGrid = document.getElementById("tables-map-grid");
    if (!mapGrid) return;

    mapGrid.innerHTML = "";
    TABLES_LIST.forEach((tbl) => {
      const activeOrder = state.orders.find(
        (o) =>
          o.delivery_type === "dine_in" &&
          normalizeStatus(o.status) !== "completed" &&
          normalizeStatus(o.status) !== "cancelled" &&
          (String(o.customer_name || "").toLowerCase().includes(tbl.name.toLowerCase()) ||
            String(o.address || "").toLowerCase().includes(tbl.name.toLowerCase()))
      );

      const card = document.createElement("div");

      if (activeOrder) {
        const ordCode = getOrderCode(activeOrder);
        const ordTot = getOrderTotal(activeOrder);
        const itemCount = Array.isArray(activeOrder.items)
          ? activeOrder.items.reduce((s, it) => s + (it.qty || 1), 0)
          : 1;

        card.className = "table-map-card table-busy";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:16px;">🪑 ${escapeHtml(tbl.name)}</strong>
            <span style="color:#ef4444; font-size:12px; font-weight:800;">🔴 Band (${ordCode})</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">${tbl.hall} · ${tbl.seats} o'rinli</div>
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:700;">Jami (${itemCount} taom):</span>
            <strong style="font-size:14px; color:#10b981;">${ordTot.toLocaleString("ru-RU")} so'm</strong>
          </div>
          <div style="display:inline-block; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:700; background:#fef3c7; color:#d97706; border:1px solid #f59e0b; margin-bottom:8px;">
            🟡 Chiqishda to'lanadi
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
            <button type="button" class="header-btn btn-add-food-to-table" style="justify-content:center; background:rgba(33,79,252,0.2); border-color:rgba(33,79,252,0.5); color:#fff; font-weight:700; font-size:12px; padding:6px 4px;">
              ➕ Taom qo'shish
            </button>
            <button type="button" class="header-btn btn-precheck-table" style="justify-content:center; background:rgba(245,158,11,0.2); border-color:rgba(245,158,11,0.5); color:#f59e0b; font-weight:700; font-size:12px; padding:6px 4px;">
              🧾 Predchek
            </button>
          </div>
          <button type="button" class="header-btn btn-settle-table" style="width:100%; justify-content:center; background:#10b981; border-color:#059669; color:#fff; font-weight:800; font-size:13px; padding:8px 4px;">
            💳 Chiqishda to'lash
          </button>
        `;

        card.querySelector(".btn-add-food-to-table").addEventListener("click", () => {
          switchTab("pos");
          state.posOrderType = "dine_in";
          document.querySelectorAll(".order-type-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.type === "dine_in");
          });
          const tableSelect = document.getElementById("pos-table-select");
          if (tableSelect) tableSelect.value = tbl.name;
          const nameInput = document.getElementById("pos-cust-name");
          if (nameInput) nameInput.value = tbl.name;
          state.activeTableAppendOrderId = activeOrder.id;
          handleOrderTypeChange();
          updatePOSTableBanner();
        });

        card.querySelector(".btn-precheck-table").addEventListener("click", () => {
          printPrecheck(activeOrder);
        });

        card.querySelector(".btn-settle-table").addEventListener("click", () => {
          openPaymentModal(activeOrder);
        });
      } else {
        card.className = "table-map-card table-free";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:16px;">🪑 ${escapeHtml(tbl.name)}</strong>
            <span style="color:#10b981; font-size:12px; font-weight:800;">🟢 Bo'sh</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">${tbl.hall} · ${tbl.seats} o'rinli</div>
          <button type="button" class="header-btn btn-order-for-table" style="width:100%; justify-content:center; background:rgba(33,79,252,0.2); border-color:rgba(33,79,252,0.5); color:#fff; font-weight:700; font-size:13px; padding:8px 4px;">
            + Zakaz urish
          </button>
        `;

        card.querySelector(".btn-order-for-table").addEventListener("click", () => {
          switchTab("pos");
          state.posOrderType = "dine_in";
          document.querySelectorAll(".order-type-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.type === "dine_in");
          });
          const tableSelect = document.getElementById("pos-table-select");
          if (tableSelect) tableSelect.value = tbl.name;
          const nameInput = document.getElementById("pos-cust-name");
          if (nameInput) nameInput.value = tbl.name;
          state.activeTableAppendOrderId = null;
          handleOrderTypeChange();
          updatePOSTableBanner();
        });
      }

      mapGrid.appendChild(card);
    });
  }

  // ==================== STOP-LIST MANAGER ====================
  async function fetchStoplist() {
    try {
      const res = await fetch(getAdminApiUrl("/api/stoplist"), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.stoplist)) {
          state.stoplist = new Set(data.stoplist);
          localStorage.setItem("ac_stoplist", JSON.stringify(data.stoplist));
          updateStoplistBadge();
          renderPOSMenu();
          renderStoplistView();
        }
      }
    } catch (e) {}
  }

  function updateStoplistBadge() {
    const badge = document.getElementById("badge-stoplist-count");
    if (!badge) return;
    if (state.stoplist.size > 0) {
      badge.textContent = state.stoplist.size;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function renderStoplistView() {
    const grid = document.getElementById("stoplist-items-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const items = window.menuItems || [];
    const q = state.stoplistSearch;

    const filtered = items.filter((it) => {
      if (!q) return true;
      return (
        getDishName(it, "uz").toLowerCase().includes(q) ||
        getDishName(it, "ru").toLowerCase().includes(q) ||
        String(it.id).toLowerCase().includes(q)
      );
    });

    filtered.forEach((it) => {
      const isStopped = state.stoplist.has(it.id);
      const card = document.createElement("div");
      card.className = "stoplist-item-card" + (isStopped ? " stopped" : "");
      const title = getDishName(it);
      const price = Number(it.price || 0).toLocaleString("ru-RU") + " so'm";

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <img src="${it.image}" alt="${title}" style="width:42px; height:42px; border-radius:8px; object-fit:cover;" onerror="this.src='images/logo.png'" />
          <div style="min-width:0;">
            <div style="font-size:13.5px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${price}</div>
          </div>
        </div>
        <button type="button" class="btn-stoplist-toggle ${isStopped ? "stopped" : "available"}">
          ${isStopped ? "🚫 Stopda (Yoqish)" : "✅ Mavjud (Stopga olish)"}
        </button>
      `;

      card.querySelector(".btn-stoplist-toggle").addEventListener("click", async () => {
        const nextStopped = !isStopped;
        try {
          const res = await fetch(getAdminApiUrl("/api/stoplist"), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ item_id: it.id, stopped: nextStopped }),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.stoplist)) {
              state.stoplist = new Set(data.stoplist);
              localStorage.setItem("ac_stoplist", JSON.stringify(data.stoplist));
              if (state.bc) {
                state.bc.postMessage({ type: "stoplist_updated", stoplist: data.stoplist });
              }
              updateStoplistBadge();
              renderPOSMenu();
              renderStoplistView();
            }
          }
        } catch (e) {}
      });

      grid.appendChild(card);
    });
  }

  // ==================== SHIFT REPORT (X-REPORT / Z-REPORT & TOP-5 DISHES) ====================
  async function fetchStats() {
    try {
      const res = await fetch(getAdminApiUrl("/api/admin/stats"), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          state.stats = data;
          renderStats();
        }
      }
    } catch (e) {}
  }

  function renderStats() {
    const s = state.stats;
    if (!s) return;

    document.getElementById("rep-val-orders").textContent = (s.orders_count ?? 0) + " ta";
    document.getElementById("rep-val-total").textContent = (s.total_revenue || 0).toLocaleString("ru-RU") + " so'm";
    document.getElementById("rep-val-avg").textContent = (s.avg_check || 0).toLocaleString("ru-RU") + " so'm";
    document.getElementById("rep-val-cash").textContent = (s.cash_revenue || 0).toLocaleString("ru-RU") + " so'm";
    document.getElementById("rep-val-card").textContent = (s.card_revenue || 0).toLocaleString("ru-RU") + " so'm";
    document.getElementById("rep-val-click").textContent = (s.online_revenue || 0).toLocaleString("ru-RU") + " so'm";
    const drawerEl = document.getElementById("rep-val-drawer");
    if (drawerEl) {
      const drawerAmount = s.cash_in_drawer ?? s.cash_revenue ?? 0;
      drawerEl.textContent = drawerAmount.toLocaleString("ru-RU") + " so'm";
    }

    const top5Box = document.getElementById("report-top5-list");
    if (top5Box) {
      const topList = Array.isArray(s.top_dishes) ? s.top_dishes : [];
      if (topList.length === 0) {
        top5Box.innerHTML = `<div style="color:var(--text-dim); font-size:13px;">Bugun sotilgan taomlar hali qayd etilmadi.</div>`;
      } else {
        top5Box.innerHTML = topList
          .map(
            (d, idx) => `
          <div class="top5-dish-row">
            <span><b>#${idx + 1}.</b> ${escapeHtml(d.name || "Taom")}</span>
            <span><b>${d.qty} dona</b> · <strong style="color:#10b981;">${Number(d.revenue || 0).toLocaleString("ru-RU")} so'm</strong></span>
          </div>
        `
          )
          .join("");
      }
    }
  }

  function showSuccessToast(message) {
    const banner = document.getElementById("new-order-flash-banner");
    const txt = document.getElementById("new-order-flash-text");
    if (banner && txt) {
      txt.innerHTML = `✅ <strong>${escapeHtml(message)}</strong>`;
      banner.hidden = false;
      setTimeout(() => {
        banner.hidden = true;
      }, 3500);
    }
  }

  function promptCashOperation(type) {
    const isCashIn = type === "cash_in";
    const modal = document.getElementById("cash-op-modal");
    const titleEl = document.getElementById("cash-op-title");
    const amountInput = document.getElementById("cash-op-amount");
    const reasonInput = document.getElementById("cash-op-reason");
    const confirmBtn = document.getElementById("btn-confirm-cash-op");
    const cancelBtn = document.getElementById("btn-cancel-cash-op");
    const closeBtn = document.getElementById("btn-close-cash-op-modal");

    if (!modal) return;

    if (titleEl) {
      titleEl.textContent = isCashIn
        ? "📥 Razmen (Kassaga naqd pul kiritish)"
        : "📤 Inkassatsiya (Kassadan naqd pul olish)";
    }
    if (amountInput) amountInput.value = isCashIn ? "100000" : "500000";
    if (reasonInput) {
      reasonInput.value = isCashIn ? "Smena boshidagi razmen" : "Inkassatsiya seyfga";
    }

    modal.style.display = "flex";

    const closeModal = () => {
      modal.style.display = "none";
      if (confirmBtn) confirmBtn.onclick = null;
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        const rawAmount = amountInput ? amountInput.value : "";
        const amount = parseInt(String(rawAmount).replace(/\D/g, ""), 10);
        if (!amount || amount <= 0) {
          alert("Summa noto'g'ri kiritildi!");
          if (amountInput) amountInput.focus();
          return;
        }

        const reason = reasonInput ? reasonInput.value.trim() : "";
        confirmBtn.disabled = true;

        try {
          const res = await fetch(getAdminApiUrl("/api/admin/cash-operations"), {
            method: "POST",
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ type, amount, reason, operator: state.username || "admin" }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) {
            closeModal();
            await fetchStats();
            showSuccessToast(isCashIn ? "Razmen muvaffaqiyatli kiritildi!" : "Inkassatsiya muvaffaqiyatli qayd etildi!");
          } else {
            alert(data.error || "Xatolik yuz berdi");
          }
        } catch (e) {
          alert("Server bilan aloqa xatosi");
        } finally {
          confirmBtn.disabled = false;
        }
      };
    }
  }

  function openZReportModal() {
    const s = state.stats || {
      orders_count: state.orders.length,
      total_revenue: 0,
      cash_revenue: 0,
      card_revenue: 0,
      online_revenue: 0,
      avg_check: 0,
    };
    const summaryBox = document.getElementById("z-report-summary-box");
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="display:flex; justify-content:space-between;"><span>Jami buyurtmalar:</span><b>${s.orders_count || 0} ta</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Naqd savdo:</span><b>${(s.cash_revenue || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Karta / Terminal:</span><b>${(s.card_revenue || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Click / Payme:</span><b>${(s.online_revenue || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between; color:#10b981;"><span>Kassaga kiritildi (razmen):</span><b>+${(s.cash_in_total || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between; color:#f59e0b;"><span>Kassadan olindi (inkassatsiya):</span><b>-${(s.cash_out_total || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between; font-weight:800; color:var(--primary);"><span>Kassadagi naqd qoldiq:</span><b>${(s.cash_in_drawer || s.cash_revenue || 0).toLocaleString("ru-RU")} so'm</b></div>
        <div style="display:flex; justify-content:space-between; border-top:2px dashed var(--border-mid); padding-top:6px; font-size:15px; color:var(--green); font-weight:900;">
          <span>SMENA YAKUNIY TUSHUMI:</span><b>${(s.total_revenue || 0).toLocaleString("ru-RU")} so'm</b>
        </div>
      `;
    }
    document.getElementById("z-report-modal").style.display = "flex";
  }

  function printShiftReport(mode) {
    const s = state.stats || {
      orders_count: state.orders.length,
      total_revenue: 0,
      cash_revenue: 0,
      card_revenue: 0,
      online_revenue: 0,
      avg_check: 0,
    };

    const area = document.getElementById("thermal-receipt-print-area");
    const now = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" });
    const title = mode === "Z" ? "FISKAL Z-HISOBOT (SMENA YOPILISHI)" : "KASSA X-HISOBOTI (ORALIQ SMENA)";

    area.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <img src="images/logo_3x4.png" alt="Logo" style="width: 48px; height: 64px; object-fit: cover; border-radius: 6px; margin: 0 auto 4px; display: block;" />
        <h2 style="margin: 0; font-size: 16px; font-weight: 900;">AMERICAN CAFFETTERIA</h2>
        <div style="font-size: 11px; font-weight: 800;">${title}</div>
        <div style="font-size: 11px;">Termiz sh. · 100% Halol</div>
      </div>

      <div style="font-size: 11px; margin-bottom: 6px;">
        <div><b>Vaqt:</b> ${now}</div>
        <div><b>Kassir:</b> ${state.username}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin-bottom: 6px;">
        <tr><td style="padding: 3px 0;">Jami buyurtmalar:</td><td style="text-align:right; font-weight:bold;">${s.orders_count || 0} ta</td></tr>
        <tr><td style="padding: 3px 0;">Naqd pul tushumi:</td><td style="text-align:right;">${(s.cash_revenue || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr><td style="padding: 3px 0;">Karta / Terminal:</td><td style="text-align:right;">${(s.card_revenue || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr><td style="padding: 3px 0;">Click / Payme:</td><td style="text-align:right;">${(s.online_revenue || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr><td style="padding: 3px 0;">Kassaga kiritildi (+):</td><td style="text-align:right; color:#10b981;">+${(s.cash_in_total || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr><td style="padding: 3px 0;">Kassadan olindi (-):</td><td style="text-align:right; color:#f59e0b;">-${(s.cash_out_total || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr style="font-weight:bold;"><td style="padding: 3px 0;">Kassadagi naqd qoldiq:</td><td style="text-align:right;">${(s.cash_in_drawer || s.cash_revenue || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr><td style="padding: 3px 0;">O'rtacha chek:</td><td style="text-align:right;">${(s.avg_check || 0).toLocaleString("ru-RU")} so'm</td></tr>
        <tr style="border-top: 1px solid #000; font-size: 13px; font-weight: 900;">
          <td style="padding: 4px 0;">UMUMIY TUSHUM:</td>
          <td style="text-align:right;">${(s.total_revenue || 0).toLocaleString("ru-RU")} UZS</td>
        </tr>
      </table>

      <div style="text-align: center; font-size: 10.5px; padding-top: 4px;">
        <div>${mode === "Z" ? "SMENA YOPILDI (Z-REPORT)" : "Smena davom etmoqda (X-REPORT)"}</div>
        <div>American Caffetteria POS v3.0</div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  }

  function formatTime(isoStr) {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${hours}:${mins}`;
    } catch (e) {
      return "";
    }
  }
})();

