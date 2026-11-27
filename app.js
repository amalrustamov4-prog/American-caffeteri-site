
// Очистка любых клиентских секретов
try {
  localStorage.removeItem("cfg_bot_token");
  localStorage.removeItem("cfg_group_id");
  localStorage.removeItem("BOT_TOKEN");
  localStorage.removeItem("GROUP_CHAT_ID");
  localStorage.removeItem("american_cfg_bot_token");
  localStorage.removeItem("american_cfg_group_id");
} catch (_) {}

// American Caffetteria App Logic (Original Website Design + All 77 Menu Dishes & Enhanced Photos)
(function() {
  const menuCategories = window.menuCategories || [];
  const menuItems = window.menuItems || [];

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCapacitorPlatform() {
    try {
      if (window.Capacitor && typeof window.Capacitor.getPlatform === "function") {
        return window.Capacitor.getPlatform();
      }
    } catch (_) {}
    return "web";
  }

  const i18n = {
    ru: {
      doc_title: "American Caffetteria · Термез | Бургеры, Пицца, Лаваш, Салаты, Пиде и Суши (100% Halal)",
      top_location: "Термез · Сурхандарья",
      top_hours: "Ежедневно: 08:00–03:00",
      halal_badge: "100% ХАЛЯЛЬ",
      sound_on: "Звук: ВКЛ",
      sound_off: "Звук: ВЫКЛ",
      now_label: "Сейчас",
      status_open: "Открыто",
      status_closed: "Закрыто",
      status_open_note: "закроемся в 03:00",
      status_closed_note: "откроемся в 08:00",
      auto_mode_hint: "Оригинальный дизайн сайта + все 77 авторских блюд и улучшенные фото из Instagram меню",
      install_app_btn: "Приложение на телефон",

      nav_menu: "Меню",
      nav_featured: "Хит стритфуда",
      nav_about: "О нас",
      nav_gallery: "Фоторепортаж",
      nav_reviews: "Отзывы",
      nav_contacts: "Контакты",
      nav_ai: "ИИ-Агент",
      nav_my_orders: "Мои заказы",
      nav_reg: "Вход",
      nav_cart: "Корзина",

      hero_eyebrow: "Американский стритфуд и кофейня · Термез · 100% Halal",
      hero_title: "Сочные бургеры, хрустящий лаваш и кофе до трёх ночи",
      hero_p1: "American Caffetteria — легендарный стритфуд в самом центре Термеза. Мы выпекаем фирменные булочки, жарим котлеты из 100% отборной халяльной говядины на открытом гриле и крутим горячий лаваш каждый день с 08:00 утра до 03:00 ночи.",
      hero_p2: "В нашем меню 77 авторских блюд: сочные бургеры на гриле, горячая пицца, хрустящий лаваш, свежие фирменные салаты (Istanbul, Pineapple, Mujskoy Kapriz, Sezar), турецкие пиде и роллы с быстрой доставкой по всему Термезу!",
      hero_btn_menu: "Посмотреть меню",
      hero_btn_tg_reg: "Регистрация в Telegram",
      hero_caption: "Фирменный американский бургер на гриле со свежей выпечкой (100% Halal)",
      hero_rating_sub: "Google & Instagram",

      featured_price_label: "Цена порции (410г):",
      featured_order_btn: "В корзину",

      ticket_depart_label: "Отправление",
      ticket_depart_val: "ЦЕНТР ТЕРМЕЗА",
      ticket_arrive_label: "Прибытие",
      ticket_arrive_val: "AMERICAN CAFFETTERIA",
      ticket_addr_label: "Адрес и ориентир",
      ticket_addr_val: "г. Термез, Центр (пр. Ат-Термизий)",
      ticket_phone_label: "Телефоны доставки",
      ticket_hours_label: "Часы работы",
      ticket_hours_val: "Ежедневно 08:00–03:00",
      ticket_delivery_label: "Доставка и стандарт",
      ticket_delivery_val: "По Термезу · 100% Halal",

      banner_desc: "Мы не экономим на качестве: булочки для бургеров выпекаются на нашей кухне каждое утро, мясо проходит строгий халяль-контроль, а кофе готовится на профессиональной рожковой кофемашине из зерен 100% Арабики.",

      menu_title: "Наше Меню",
      menu_subtitle: "Все 77 авторских блюд: фирменные салаты, бургеры, пицца, лаваш, турецкие пиде, хот-доги, хрустящие стрипсы, картофель фри и японские роллы с доставкой до 03:00 ночи.",
      search_placeholder: "Поиск блюда (например: Istanbul, Big Burger, Chicago, Lavash, Sezar, Filadelfiya)...",
      search_empty: "По вашему запросу ничего не найдено. Попробуйте выбрать другую категорию.",
      search_reset: "Показать все блюда",
      btn_add_to_cart: "В корзину",
      prep_prefix: "Приготовление:",

      gallery_title: "Фоторепортаж",
      gallery_subtitle: "Кухня, открытый гриль, зал и атмосфера American Caffetteria в Термезе",
      gallery_c1: "Уютный зал для встреч с друзьями и семьей",
      gallery_c2: "Котлеты из 100% говядины на открытом огне",
      gallery_c3: "Свежий помол 100% Арабики и мастерство бариста",
      gallery_c4: "Быстрая доставка горячих блюд по Термезу",

      reviews_tag: "Отзывы гостей · Google & Instagram",
      reviews_quote_main: "«Лучшие бургеры и лаваш в Термезе! Порции огромные, мясо невероятно сочное, а булочки мягкие как облако. И самое крутое — работают до 3 ночи!»",
      reviews_author_main: "Алишер Рахимов · Термез",

      rev1_name: "Жасур Мирзаев",
      rev1_text: "Заказываем доставку почти каждые выходные. Доставляют горячим минут за 25–30. Салат Istanbul, комбо «Стритфуд Дуэт» и пиде с мясом — просто топ!",
      rev2_name: "Мадина Каримова",
      rev2_text: "Очень приятное место! Чисто, красиво, вежливый персонал. Вкуснейшие бургеры, пицца Чикаго, салат Сезар и свежие роллы Филадельфия!",
      rev3_name: "Фарход Умаров",
      rev3_text: "Часто заказываем с коллегами. Радует, что открыты до глубокой ночи. Королевский хот-дог, лаваш сырный и пицца Пепперони — лучшие в городе.",

      contacts_title: "Как добраться",
      contacts_desc: "Ждём вас в центре города Термез. Также оперативно доставляем горячие заказы прямо к вашей двери до 03:00 ночи.",
      contacts_label_addr: "Адрес",
      contacts_addr: "г. Термез, Центр, ориентир пр. Ат-Термизий",
      contacts_label_phone1: "Телефон 1",
      contacts_label_phone2: "Телефон 2",
      contacts_label_ig: "Instagram",
      contacts_label_hours: "Режим работы",
      contacts_hours_val: "Ежедневно 08:00 – 03:00",
      contacts_call_caff: "Позвонить оператору",
      contacts_route: "Открыть на карте",

      footer_text: "© 2026 American Caffetteria. Все права защищены. Термез, Узбекистан · 100% Halal.",

      cart_title: "Ваша Корзина",
      cart_clear_btn: "Очистить",
      cart_empty_title: "Корзина пуста",
      cart_empty_sub: "Выберите аппетитные бургеры, пиццу, лаваш, салаты, пиде или роллы из нашего меню!",
      cart_empty_btn: "Перейти к меню",
      cart_delivery_type: "Способ получения",
      cart_delivery_option: "Доставка курьером",
      cart_pickup_option: "Самовывоз из кафе",
      cart_dine_in_option: "В кафе (В зале)",
      cart_pay_method: "Способ оплаты",
      pay_cash: "Наличные",
      pay_card: "Терминал",
      pay_online: "Click/Payme",
      pay_exit: "При выходе (В кассе)",
      cart_free_progress_more: "Добавьте ещё на {amount} сум для бесплатной доставки!",
      cart_free_progress_done: "🎉 У вас бесплатная доставка по Термезу!",
      cart_pickup_note: "Самовывоз из кафе — без платы за доставку (готовность 10–15 мин)",
      cart_dine_in_note: "☕ Оплата в кассе при выходе из кафе. Дозаказ в любой момент!",
      cart_name_placeholder: "Ваше Имя и Фамилия",
      cart_phone_placeholder: "Телефон (+998 90 123 45 67)",
      cart_addr_placeholder: "Адрес доставки или GPS-локация в Термезе",
      cart_comment_placeholder: "Комментарий к заказу (соусы, без лука, приборы)",
      cart_subtotal: "Сумма заказа:",
      cart_delivery_fee: "Доставка (бесплатно от 100 000):",
      cart_delivery_free: "Бесплатно",
      cart_total: "ИТОГО К ОПЛАТЕ:",
      cart_btn_order: "Оформить заказ",
      cart_btn_tg: "Заказать через Telegram",
      cart_btn_call: "Позвонить и заказать",

      err_phone: "Пожалуйста, введите полный номер телефона в формате +998 XX XXX XX XX (минимум 9 цифр).",
      err_address: "Пожалуйста, укажите адрес или ориентир доставки в Термезе (или выберите Самовывоз).",

      receipt_modal_title: "Чек заказа готов!",
      receipt_modal_sub: "Ваш заказ успешно передан на кухню! Вы можете отслеживать его статус в разделе «Мои заказы».",
      receipt_btn_copy: "Скопировать текст чека",
      receipt_btn_copied: "Чек скопирован!",

      tg_header: "🍔 ЗАКАЗ В AMERICAN CAFFETTERIA (ТЕРМЕЗ)",
      tg_subtotal: "💰 Сумма блюд",
      tg_method: "🚗 Способ",
      tg_method_delivery: "Доставка курьером",
      tg_method_pickup: "Самовывоз из кафе",
      tg_delivery_cost: "📦 Доставка",
      tg_address: "📍 Адрес",
      tg_total: "💵 ИТОГО К ОПЛАТЕ",
      tg_name: "👤 Имя",
      tg_guest: "Гость",
      tg_phone: "📞 Телефон",
      tg_comment: "📝 Комментарий",
      tg_footer: "Спасибо за заказ! Ждём подтверждения оператора.",

      toast_added: "добавлено в корзину!",
      currency: "сум"
    },

    uz: {
      doc_title: "American Caffetteria · Termiz | Burgerlar, Pitsa, Lavash, Salatlar, Pide va Sushi (100% Halol)",
      top_location: "Termiz · Surxondaryo",
      top_hours: "Har kuni: 08:00–03:00",
      halal_badge: "100% HALOL",
      sound_on: "Ovoz: YONIQ",
      sound_off: "Ovoz: O'CHIQ",
      now_label: "Hozir",
      status_open: "Ochiq",
      status_closed: "Yopiq",
      status_open_note: "03:00 da yopilamiz",
      status_closed_note: "08:00 da ochilamiz",
      auto_mode_hint: "Saytning original dizayni + barcha 77 xil mualliflik taomlari va studiya sifatidagi suratlar",
      install_app_btn: "Telefonga o'rnatish",

      nav_menu: "Menyu",
      nav_featured: "Fastfud Xiti",
      nav_about: "Biz haqimizda",
      nav_gallery: "Fotoreportaj",
      nav_reviews: "Fikrlar",
      nav_contacts: "Aloqa",
      nav_ai: "AI-Ofitsiant",
      nav_my_orders: "Buyurtmalarim",
      nav_reg: "Kirish",
      nav_cart: "Savat",

      hero_eyebrow: "Amerika stritfudi va qahvaxonasi · Termiz · 100% Halol",
      hero_title: "Sershira burgerlar, qarsildoq lavash va tungi 03:00 gacha qahva",
      hero_p1: "American Caffetteria — Termiz markazidagi sevimli ta'm maskani. Biz har kuni ertalab 08:00 dan tungi 03:00 gacha yumshoq bulochkalarni pishiramiz, 100% halol mol go'shtidan kotletlarni grilda qovuramiz va qaynoq lavash tayyorlaymiz.",
      hero_p2: "Menyumizda 77 xil mualliflik taomlari: sershira burgerlar, qaynoq pitsa, qarsildoq lavash, maxsus salatlar (Istanbul, Pineapple, Mujskoy Kapriz, Sezar), turk pidelari va sushi rollar!",
      hero_btn_menu: "Menyuni ko'rish",
      hero_btn_tg_reg: "Telegramda ro'yxatdan o'tish",
      hero_caption: "Grilda pishirilgan maxsus Amerika burgeri yangi bulochka bilan (100% Halol)",
      hero_rating_sub: "Google & Instagram",

      featured_price_label: "Porsiya narxi (410g):",
      featured_order_btn: "Savatga",

      ticket_depart_label: "Jo'nash",
      ticket_depart_val: "TERMIZ MARKAZI",
      ticket_arrive_label: "Yetib kelish",
      ticket_arrive_val: "AMERICAN CAFFETTERIA",
      ticket_addr_label: "Manzil va mo'ljal",
      ticket_addr_val: "Termiz sh., Markaz (At-Termiziy ko'chasi)",
      ticket_phone_label: "Yetkazib berish telefonlari",
      ticket_hours_label: "Ish vaqti",
      ticket_hours_val: "Har kuni 08:00–03:00",
      ticket_delivery_label: "Yetkazish va sifat",
      ticket_delivery_val: "Termiz bo'ylab · 100% Halol",

      banner_desc: "Biz sifatda chekinmaymiz: burger bulochkalari har tong oshxonamizda pishiriladi, go'sht qat'iy halol nazoratidan o'tadi, qahva esa 100% Arabika donalaridan damlanadi.",

      menu_title: "Bizning Menyu",
      menu_subtitle: "Barcha 77 xil taomlar: maxsus salatlar, burgerlar, pitsa, lavash, turkcha pide, hot-doglar, strips, fri va yaponcha rollar tungi 03:00 gacha yetkazish bilan.",
      search_placeholder: "Taom qidirish (masalan: Istanbul, Big Burger, Chicago, Lavash, Sezar, Filadelfiya)...",
      search_empty: "So'rovingiz bo'yicha hech narsa topilmadi.",
      search_reset: "Barcha taomlarni ko'rsatish",
      btn_add_to_cart: "Savatga",
      prep_prefix: "Tayyorlash vaqti:",

      gallery_title: "Fotoreportaj",
      gallery_subtitle: "Termizdagi American Caffetteria oshxonasi, ochiq grili, zali va muhiti",
      gallery_c1: "Do'stlar va oila davrasida o'tirish uchun shinam zal",
      gallery_c2: "Ochiq olovda pishirilgan 100% halol mol go'shti",
      gallery_c3: "Yangi maydalangan 100% Arabika va barista mahorati",
      gallery_c4: "Termiz bo'ylab qaynoq taomlarni tezkor yetkazish",

      reviews_tag: "Mehmonlarimiz fikrlari · Google & Instagram",
      reviews_quote_main: "«Termizdagi eng mazali burger va lavash! Porsiyalari juda katta, go'shti sershira, bulochkalari esa bulutdek yumshoq. Eng zo'r tomoni — kechasi soat 3 gacha ochiq!»",
      reviews_author_main: "Alisher Rahimov · Termiz",

      rev1_name: "Jasur Mirzayev",
      rev1_text: "Deyarli har dam olish kunlari yetkazib berish xizmatidan foydalanamiz. Istanbul salati, «Stritfud Duet» kombo va go'shtli pide — shunchaki a'lo!",
      rev2_name: "Madina Karimova",
      rev2_text: "Juda shinam va toza maskan! Mazali burgerlar, Chicago pitsasi, Sezar salati va Filadelfiya rollari juda yoqdi.",
      rev3_name: "Farxod Umarov",
      rev3_text: "Ishdan keyin hamkasblar bilan tez-tez buyurtma beramiz. Qirollik hot-dogi, pishloqli lavash va Peperoni pitsasi shahar bo'yicha eng yaxshisi.",

      contacts_title: "Qanday boriladi",
      contacts_desc: "Sizni Termiz shahri markazida kutib qolamiz. Tungi 03:00 gacha yetkazib beramiz.",
      contacts_label_addr: "Manzil",
      contacts_addr: "Termiz sh., Markaz (mo'ljal: At-Termiziy ko'chasi)",
      contacts_label_phone1: "Telefon 1",
      contacts_label_phone2: "Telefon 2",
      contacts_label_ig: "Instagram",
      contacts_label_hours: "Ish vaqti",
      contacts_hours_val: "Har kuni 08:00 – 03:00",
      contacts_call_caff: "Operatorga qo'ng'iroq",
      contacts_route: "Xaritada ko'rish",

      footer_text: "© 2026 American Caffetteria. Barcha huquqlar himoyalangan. Termiz, O'zbekiston · 100% Halol.",

      cart_title: "Sizning Savatingiz",
      cart_clear_btn: "Tozalash",
      cart_empty_title: "Savat bo'sh",
      cart_empty_sub: "Menyudan mazali burger, pitsa, lavash, salat, pide yoki rollarni tanlang!",
      cart_empty_btn: "Menyuga o'tish",
      cart_delivery_type: "Qabul qilish usuli",
      cart_delivery_option: "Kuryer orqali yetkazish",
      cart_pickup_option: "Kafedan olib ketish",
      cart_dine_in_option: "Kafeda (Zalda)",
      cart_pay_method: "To'lov usuli",
      pay_cash: "Naqd pul",
      pay_card: "Karta / Terminal",
      pay_online: "Click / Payme",
      pay_exit: "Chiqishda (Kassada)",
      cart_free_progress_more: "Bepul yetkazib berish uchun yana {amount} so'mlik taom qo'shing!",
      cart_free_progress_done: "🎉 Termiz bo'ylab yetkazib berish siz uchun BEPUL!",
      cart_pickup_note: "Kafedan olib ketish — yetkazib berish to'lovisiz (10–15 daqiqada tayyor)",
      cart_dine_in_note: "☕ To'lov kafedan chiqib ketayotganda kassada to'lanadi. Xohlagan payt qo'shimcha taom buyurtma qilishingiz mumkin!",
      cart_name_placeholder: "Ism va Familiyangiz",
      cart_phone_placeholder: "Telefon (+998 90 123 45 67)",
      cart_addr_placeholder: "Termizdagi yetkazish manzili yoki GPS",
      cart_comment_placeholder: "Buyurtma bo'yicha izoh (souslar, piyozsiz)",
      cart_subtotal: "Taomlar narxi:",
      cart_delivery_fee: "Yetkazib berish (100 000 dan bepul):",
      cart_delivery_free: "Bepul",
      cart_total: "JAMI TO'LOV:",
      cart_btn_order: "Buyurtma berish",
      cart_btn_tg: "Telegram orqali buyurtma berish",
      cart_btn_call: "Qo'ng'iroq qilib buyurtma berish",

      err_phone: "Iltimos, telefon raqamingizni to'liq kiriting (+998 XX XXX XX XX, kamida 9 ta raqam).",
      err_address: "Iltimos, yetkazib berish manzilini kiriting.",

      receipt_modal_title: "Buyurtma cheki tayyor!",
      receipt_modal_sub: "Buyurtmangiz oshxonaga qabul qilindi! Buyurtma holatini «Buyurtmalarim» bo'limida kuzatishingiz mumkin.",
      receipt_btn_copy: "Chek matnini nusxalash",
      receipt_btn_copied: "Nusxalandi!",

      tg_header: "🍔 AMERICAN CAFFETTERIA (TERMIZ) — YANGI BUYURTMA",
      tg_subtotal: "💰 Taomlar narxi",
      tg_method: "🚗 Qabul qilish usuli",
      tg_method_delivery: "Kuryer orqali yetkazib berish",
      tg_method_pickup: "Kafedan olib ketish",
      tg_delivery_cost: "📦 Yetkazib berish",
      tg_address: "📍 Manzil",
      tg_total: "💵 JAMI TO'LOV",
      tg_name: "👤 Ism",
      tg_guest: "Mehmon",
      tg_phone: "📞 Telefon",
      tg_comment: "📝 Izoh",
      tg_footer: "Buyurtma uchun rahmat! Operator tasdiqlashini kutamiz.",

      toast_added: "savatga qo'shildi!",
      currency: "so'm"
    },

    en: {
      doc_title: "American Caffetteria · Termez | Burgers, Pizza, Lavash, Salads, Pide & Sushi (100% Halal)",
      top_location: "Termez · Surkhandarya",
      top_hours: "Daily: 08:00 AM – 03:00 AM",
      halal_badge: "100% HALAL",
      sound_on: "Sound: ON",
      sound_off: "Sound: OFF",
      now_label: "Now",
      status_open: "Open",
      status_closed: "Closed",
      status_open_note: "open until 03:00 AM",
      status_closed_note: "opens at 08:00 AM",
      auto_mode_hint: "Original site design + all 77 signature dishes and studio quality photos",
      install_app_btn: "Install Phone App",

      nav_menu: "Menu",
      nav_featured: "Featured Hit",
      nav_about: "About Us",
      nav_gallery: "Gallery",
      nav_reviews: "Reviews",
      nav_contacts: "Contacts",
      nav_ai: "AI Waiter",
      nav_my_orders: "My Orders",
      nav_reg: "Register",
      nav_cart: "Cart",

      hero_eyebrow: "American Street Food & Coffeehouse · Termez · 100% Halal",
      hero_title: "Juicy Burgers, Crispy Lavash & Specialty Coffee Until 3 AM",
      hero_p1: "American Caffetteria is a signature street-food and coffee destination in the heart of Termez. Every day from 08:00 AM to 03:00 AM we bake fresh brioche buns, flame-grill 100% halal prime beef patties, and roll hot crispy lavash wraps.",
      hero_p2: "Explore 77 signature items: flame-grilled burgers, fresh pizza, crispy lavash wraps, gourmet salads (Istanbul, Pineapple, Mujskoy Kapriz, Caesar), Turkish pide, and sushi rolls!",
      hero_btn_menu: "Explore Menu",
      hero_btn_tg_reg: "Register via Telegram",
      hero_caption: "Flame-grilled signature American Burger on a house-baked sesame bun (100% Halal)",
      hero_rating_sub: "Google & Instagram",

      featured_price_label: "Portion price (410g):",
      featured_order_btn: "Add to Cart",

      ticket_depart_label: "Departure",
      ticket_depart_val: "DOWNTOWN TERMEZ",
      ticket_arrive_label: "Arrival",
      ticket_arrive_val: "AMERICAN CAFFETTERIA",
      ticket_addr_label: "Address & Landmark",
      ticket_addr_val: "Termez Center (At-Termiziy Ave)",
      ticket_phone_label: "Delivery Hotlines",
      ticket_hours_label: "Opening Hours",
      ticket_hours_val: "Daily 08:00 – 03:00",
      ticket_delivery_label: "Delivery & Quality",
      ticket_delivery_val: "City-wide · 100% Halal",

      banner_desc: "We never compromise on quality: our burger buns are baked fresh every morning, our meat is strictly 100% Halal certified, and our coffee is brewed from freshly ground 100% Arabica beans.",

      menu_title: "Our Menu",
      menu_subtitle: "All 77 signature items: gourmet salads, flame-grilled burgers, pizza, lavash wraps, Turkish pide, hot dogs, chicken strips, french fries, and sushi rolls until 03:00 AM.",
      search_placeholder: "Search dishes (e.g., Istanbul, Big Burger, Chicago, Lavash, Caesar, Filadelfiya)...",
      search_empty: "No dishes matched your search. Try picking another category.",
      search_reset: "Show All Dishes",
      btn_add_to_cart: "Add to Cart",
      prep_prefix: "Prep time:",

      gallery_title: "Photo Report",
      gallery_subtitle: "Open grill, espresso bar, dining hall, and atmosphere at American Caffetteria Termez",
      gallery_c1: "Cozy dining room for friends and family gatherings",
      gallery_c2: "100% halal prime beef patties sizzling over open flames",
      gallery_c3: "Freshly ground 100% Arabica beans and skilled baristas",
      gallery_c4: "Fast, hot delivery across Termez until 03:00 AM",

      reviews_tag: "Guest Reviews · Google & Instagram",
      reviews_quote_main: "“Hands down the best burgers and lavash in Termez! Huge portions, super juicy meat, and buns as soft as a cloud. Best of all — they stay open until 3 AM!”",
      reviews_author_main: "Alisher Rakhimov · Termez",

      rev1_name: "Jasur Mirzayev",
      rev1_text: "We order delivery almost every weekend. The Istanbul Salad, Streetfood Duet Combo, and beef pide are unbeatable!",
      rev2_name: "Madina Karimova",
      rev2_text: "Such a welcoming place! Amazing flame-grilled burgers, Chicago pizza, Caesar salad, and fresh Philadelphia sushi rolls.",
      rev3_name: "Farkhod Umarov",
      rev3_text: "My colleagues and I order here all the time. The Royal Hot Dog, Cheesy Lavash, and Pepperoni Pizza are the best in town.",

      contacts_title: "How to Find Us",
      contacts_desc: "Visit us in the center of Termez or order fast courier delivery straight to your door until 03:00 AM.",
      contacts_label_addr: "Address",
      contacts_addr: "Termez City Center (near At-Termiziy Ave)",
      contacts_label_phone1: "Phone 1",
      contacts_label_phone2: "Phone 2",
      contacts_label_ig: "Instagram",
      contacts_label_hours: "Opening Hours",
      contacts_hours_val: "Daily 08:00 AM – 03:00 AM",
      contacts_call_caff: "Call Operator",
      contacts_route: "Open in Google Maps",

      footer_text: "© 2026 American Caffetteria. All rights reserved. Termez, Uzbekistan · 100% Halal.",

      cart_title: "Your Order Cart",
      cart_clear_btn: "Clear",
      cart_empty_title: "Your Cart is Empty",
      cart_empty_sub: "Pick mouth-watering burgers, lavash wraps, salads, sushi rolls, or drinks from our menu!",
      cart_empty_btn: "Browse Menu",
      cart_delivery_type: "Fulfillment Method",
      cart_delivery_option: "Courier Delivery",
      cart_pickup_option: "Cafe Pickup",
      cart_dine_in_option: "Dine-in (In cafe)",
      cart_pay_method: "Payment Method",
      pay_cash: "Cash",
      pay_card: "Terminal",
      pay_online: "Click / Payme",
      pay_exit: "At exit (At cashier)",
      cart_free_progress_more: "Add {amount} UZS more to unlock FREE delivery!",
      cart_free_progress_done: "🎉 You unlocked FREE delivery across Termez!",
      cart_pickup_note: "Pickup from our cafe — zero delivery fee (ready in 10–15 min)",
      cart_dine_in_note: "☕ Payment at cashier upon exit. You can order more dishes anytime!",
      cart_name_placeholder: "First & Last Name",
      cart_phone_placeholder: "Phone Number (+998 90 123 45 67)",
      cart_addr_placeholder: "Delivery address or GPS location in Termez",
      cart_comment_placeholder: "Order notes (extra sauces, no onions)",
      cart_subtotal: "Subtotal:",
      cart_delivery_fee: "Delivery (free over 100,000):",
      cart_delivery_free: "Free",
      cart_total: "TOTAL DUE:",
      cart_btn_order: "Place Order",
      cart_btn_tg: "Order via Telegram",
      cart_btn_call: "Call to Order",

      err_phone: "Please enter a valid phone number (+998 XX XXX XX XX, at least 9 digits).",
      err_address: "Please enter your delivery address in Termez.",

      receipt_modal_title: "Order Receipt Ready!",
      receipt_modal_sub: "Your order has been sent to the kitchen! You can track its status in the 'My Orders' section.",
      receipt_btn_copy: "Copy Receipt Text",
      receipt_btn_copied: "Copied to Clipboard!",

      tg_header: "🍔 NEW ORDER — AMERICAN CAFFETTERIA (TERMEZ)",
      tg_subtotal: "💰 Items Subtotal",
      tg_method: "🚗 Method",
      tg_method_delivery: "Courier Delivery",
      tg_method_pickup: "Cafe Pickup",
      tg_delivery_cost: "📦 Delivery Fee",
      tg_address: "📍 Address",
      tg_total: "💵 TOTAL DUE",
      tg_name: "👤 Customer",
      tg_guest: "Guest",
      tg_phone: "📞 Phone",
      tg_comment: "📝 Notes",
      tg_footer: "Thank you for your order! Awaiting operator confirmation.",

      toast_added: "added to cart!",
      currency: "UZS"
    }
  };

  function safeGetStorage(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetStorage(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  function getApiBaseUrl() {
    if (typeof window !== "undefined" && window.API_BASE_URL) {
      return String(window.API_BASE_URL).replace(/\/+$/, "");
    }
    if (typeof window !== "undefined") {
      const isCapacitor = window.location.protocol === "capacitor:" ||
        window.location.protocol === "file:" ||
        Boolean(window.Capacitor) ||
        (window.location.hostname === "localhost" && !window.location.port);
      if (isCapacitor) {
        return "https://american11.vercel.app";
      }
    }
    return "";
  }

  let currentLang = safeGetStorage('american_lang', 'ru');
  if (!i18n[currentLang]) currentLang = 'ru';
  let activeCategory = 'all';
  let searchQuery = '';
  let cart = [];
  try {
    const parsed = JSON.parse(safeGetStorage('american_cart', '[]'));
    if (Array.isArray(parsed)) {
      cart = parsed.filter(c => c && c.id && typeof c.qty === 'number' && c.qty > 0);
    }
  } catch (e) {
    cart = [];
  }
  let deliveryType = 'delivery';
  let lastGeneratedReceipt = '';
  let generatedOtpCode = '';
  let deferredPwaPrompt = null;

  let userProfile = null;
  try {
    const rawUser = safeGetStorage('american_user_profile', '');
    if (rawUser) userProfile = JSON.parse(rawUser);
  } catch (e) {
    userProfile = null;
  }

  // --- Sound Effects Engine ---
  let audioCtx = null;
  let soundEnabled = safeGetStorage('american_sound', '1') === '1';

  function getAudioContext() {
    try {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playChime() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {}
  }

  function playClick() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  function playWhoosh() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  function playSuccess() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + (i * 0.08);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, noteTime);
        gain.gain.setValueAtTime(0.14, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.38);
      });
    } catch (e) {}
  }

  function initSoundEngine() {
    const btn = document.getElementById('sound-toggle-btn');
    const icon = document.getElementById('sound-icon');
    const text = document.getElementById('sound-text');
    function updateBtn() {
      if (!btn) return;
      const dict = i18n[currentLang] || i18n.ru;
      if (soundEnabled) {
        btn.classList.remove('muted');
        if (icon) icon.className = 'ti ti-volume';
        if (text) text.textContent = dict.sound_on;
      } else {
        btn.classList.add('muted');
        if (icon) icon.className = 'ti ti-volume-off';
        if (text) text.textContent = dict.sound_off;
      }
    }
    if (btn) {
      updateBtn();
      btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        safeSetStorage('american_sound', soundEnabled ? '1' : '0');
        updateBtn();
        if (soundEnabled) {
          getAudioContext();
          playChime();
        }
      });
    }
  }

  // --- Automatic Environment Detection ---
  let forcedPreviewMode = false;

  function autoDetectEnvironment() {
    const badge = document.getElementById('env-detected-badge');
    const tgApp = window.Telegram && window.Telegram.WebApp;
    const isTelegramWebApp = Boolean(tgApp && tgApp.initData && tgApp.initData.length > 0);
    const isMobileScreen = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

    document.body.classList.remove('env-desktop', 'env-mobile', 'env-tma', 'env-capacitor');

    // Detect iOS devices for specific notch and status bar handling
    const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent || '') || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOSDevice) {
      document.documentElement.classList.add('is-ios');
      document.body.classList.add('is-ios');
      const isStandalonePWA = window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      if (isStandalonePWA || window.Capacitor) {
        document.documentElement.classList.add('is-ios-standalone');
        document.body.classList.add('is-ios-standalone');
      }
    }

    // Detect Capacitor native Android/iOS
    const isCapacitorNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isCapacitorNative) {
      document.body.classList.add('env-capacitor', 'env-mobile');
      const capPlat = getCapacitorPlatform();
      if (badge) badge.innerHTML = `<i class="ti ti-device-mobile"></i> Native App (${capPlat === 'ios' ? 'iOS' : 'Android'})`;
      return; // Skip other detection for native app
    }

    if (isTelegramWebApp) {
      document.body.classList.add('env-tma');
      try {
        tgApp.ready();
        tgApp.expand();
        if (typeof tgApp.enableClosingConfirmation === 'function') {
          tgApp.enableClosingConfirmation();
        }
        if (typeof tgApp.setHeaderColor === 'function') {
          tgApp.setHeaderColor('#232424');
        }
        if (typeof tgApp.setBackgroundColor === 'function') {
          tgApp.setBackgroundColor('#DEDBD4');
        }
      } catch (e) {}
      if (badge) badge.innerHTML = '<i class="ti ti-brand-telegram"></i> Авто-режим: Telegram Mini Web App';
      if (tgApp.initDataUnsafe && tgApp.initDataUnsafe.user && !userProfile) {
        const u = tgApp.initDataUnsafe.user;
        userProfile = {
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          username: u.username ? `@${u.username}` : '',
          phone: '+998 ',
          location: 'г. Термез',
          lat: '',
          lng: ''
        };
        safeSetStorage('american_user_profile', JSON.stringify(userProfile));
      }
    } else if (isMobileScreen || forcedPreviewMode) {
      document.body.classList.add('env-mobile');
      if (badge) badge.innerHTML = '<i class="ti ti-device-mobile"></i> Авто-режим: Мобильное приложение';
    } else {
      document.body.classList.add('env-desktop');
      if (badge) badge.innerHTML = '<i class="ti ti-device-desktop"></i> Авто-режим: Десктоп (ПК)';
    }

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('fname') || params.get('phone')) {
        userProfile = {
          firstName: params.get('fname') || (userProfile && userProfile.firstName) || '',
          lastName: params.get('lname') || (userProfile && userProfile.lastName) || '',
          phone: params.get('phone') || (userProfile && userProfile.phone) || '+998 ',
          username: params.get('user') ? `@${params.get('user').replace(/^@/, '')}` : ((userProfile && userProfile.username) || ''),
          location: (params.get('lat') && params.get('lng'))
            ? `GPS: ${params.get('lat')}, ${params.get('lng')}`
            : ((userProfile && userProfile.location) || 'г. Термез'),
          lat: params.get('lat') || '',
          lng: params.get('lng') || ''
        };
        safeSetStorage('american_user_profile', JSON.stringify(userProfile));
      }
    } catch (e) {}

    syncUserProfileToUI();
  }

  function setupEnvironmentControls() {
    autoDetectEnvironment();
    window.addEventListener('resize', () => {
      if (!forcedPreviewMode) autoDetectEnvironment();
    });

    const previewBtn = document.getElementById('toggle-mobile-preview-btn');
    const previewLabel = document.getElementById('toggle-mobile-preview-label');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        forcedPreviewMode = !forcedPreviewMode;
        document.body.classList.toggle('force-mobile-shell', forcedPreviewMode);
        if (previewLabel) {
          previewLabel.textContent = forcedPreviewMode ? 'Вид: Смартфон / Mini App' : 'Тест экрана: Авто';
        }
        autoDetectEnvironment();
        showToast(forcedPreviewMode
          ? 'Включен предпросмотр мобильного приложения и Telegram Mini App!'
          : 'Включено 100% автоматическое определение экрана!');
      });
    }

    // Register Service Worker ONLY for browser/PWA (NEVER in Capacitor native app)
    const isCapacitorNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || Boolean(window.Capacitor);
    if (!isCapacitorNative && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // In Capacitor native Android, unregister any leftover service workers and clear caches
    if (isCapacitorNative) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (let r of regs) r.unregister();
        }).catch(() => {});
      }
      if ('caches' in window) {
        caches.keys().then(keys => {
          for (let k of keys) caches.delete(k);
        }).catch(() => {});
      }
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;
    });

    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPwaPrompt) {
          deferredPwaPrompt.prompt();
          await deferredPwaPrompt.userChoice;
          deferredPwaPrompt = null;
        } else {
          if (!forcedPreviewMode && window.innerWidth >= 768) {
            forcedPreviewMode = true;
            document.body.classList.add('force-mobile-shell');
            autoDetectEnvironment();
          }
          showToast('📲 Мобильный режим активен! На телефоне нажмите «Поделиться → На экран Домой».');
        }
      });
    }
  }

  window.mobNavGo = function(target, btnEl) {
    playClick();
    document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const btn = document.querySelector(`.mob-nav-btn[data-target="${target}"]`);
      if (btn) btn.classList.add('active');
    }

    if (target === 'menu') {
      window.selectCatalog('all');
    } else if (target === 'cold_drinks') {
      window.selectCatalog('drinks');
    } else {
      window.selectCatalog(target);
    }
    const menuSec = document.getElementById('v2-menu');
    if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function syncUserProfileToUI() {
    const headerLabel = document.getElementById('header-reg-label');
    const mobProfileLabel = document.getElementById('mob-nav-profile-label');
    const orderNameInput = document.getElementById('order-name');
    const orderPhoneInput = document.getElementById('order-phone');
    const orderAddrInput = document.getElementById('order-address');

    if (userProfile && userProfile.firstName) {
      const fullName = `${userProfile.firstName} ${userProfile.lastName || ''}`.trim();
      if (headerLabel) headerLabel.textContent = userProfile.firstName;
      if (mobProfileLabel) mobProfileLabel.textContent = userProfile.firstName;
      if (orderNameInput && !orderNameInput.value) orderNameInput.value = fullName;
      if (orderPhoneInput && (!orderPhoneInput.value || orderPhoneInput.value.trim() === '+998')) {
        orderPhoneInput.value = userProfile.phone || '+998 ';
      }
      if (orderAddrInput && !orderAddrInput.value && userProfile.location) {
        orderAddrInput.value = userProfile.location;
      }
    }
  }

  function detectGpsLocation(inputEl, coordsLabelEl) {
    if (!navigator.geolocation) {
      if (inputEl) inputEl.value = 'г. Термез, Центр (пр. Ат-Термизий)';
      showToast('📍 Установлен ориентир: г. Термез, Центр');
      return;
    }
    showToast('🛰 Определяем вашу GPS-геолокацию...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const formatted = `г. Термез (GPS: ${lat}, ${lng})`;
        if (inputEl) inputEl.value = formatted;
        if (coordsLabelEl) {
          coordsLabelEl.textContent = `✅ Точные координаты: ${lat}, ${lng}`;
          coordsLabelEl.classList.add('text-[#166534]', 'font-bold');
        }
        if (!userProfile) userProfile = {};
        userProfile.lat = lat;
        userProfile.lng = lng;
        playChime();
        showToast('📍 Геолокация успешно определена!');
      },
      () => {
        const fallbackLat = '37.22420';
        const fallbackLng = '67.27830';
        if (inputEl && !inputEl.value.trim()) {
          inputEl.value = `г. Термез, Центр (GPS: ${fallbackLat}, ${fallbackLng})`;
        }
        if (coordsLabelEl) {
          coordsLabelEl.textContent = `📍 Координаты Термеза: ${fallbackLat}, ${fallbackLng}`;
        }
        if (!userProfile) userProfile = {};
        userProfile.lat = fallbackLat;
        userProfile.lng = fallbackLng;
        showToast('📍 Координаты Термеза подставлены автоматически!');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  async function sendToTelegramGroupIfConfigured(textMessage, lat, lng) {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        window.Telegram.WebApp.sendData(JSON.stringify({
          type: 'order_or_reg',
          receipt: textMessage,
          lat: lat || '',
          lng: lng || ''
        }));
      }
    } catch (e) {}
    return true;
  }

  function setupRegistrationModal() {
    const overlay = document.getElementById('reg-modal-overlay');
    const closeBtn = document.getElementById('reg-modal-close');
    const gpsBtn = document.getElementById('reg-detect-gps-btn');
    const cartGpsBtn = document.getElementById('cart-gps-btn');
    const sendCodeBtn = document.getElementById('reg-send-code-btn');
    const submitBtn = document.getElementById('reg-submit-btn');

    const fnInput = document.getElementById('reg-first-name');
    const lnInput = document.getElementById('reg-last-name');
    const phoneInput = document.getElementById('reg-phone');
    const userInput = document.getElementById('reg-username');
    const locInput = document.getElementById('reg-location');
    const coordsEl = document.getElementById('reg-gps-coords');
    document.querySelectorAll('.open-reg-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        playWhoosh();
        if (userProfile) {
          if (fnInput) fnInput.value = userProfile.firstName || '';
          if (lnInput) lnInput.value = userProfile.lastName || '';
          if (phoneInput) phoneInput.value = userProfile.phone || '+998 ';
          if (userInput) userInput.value = userProfile.username || '';
          if (locInput) locInput.value = userProfile.location || '';
        }
        if (overlay) {
          overlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeRegModal() {
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeRegModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeRegModal();
      });
    }

    if (gpsBtn) gpsBtn.addEventListener('click', () => detectGpsLocation(locInput, coordsEl));
    if (cartGpsBtn) {
      cartGpsBtn.addEventListener('click', () => {
        const addrInput = document.getElementById('order-address');
        detectGpsLocation(addrInput, null);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const errBox = document.getElementById('reg-error-box');
        const okBox = document.getElementById('reg-success-box');
        if (errBox) errBox.classList.add('hidden');
        if (okBox) okBox.classList.add('hidden');

        const firstName = fnInput ? fnInput.value.trim() : '';
        const lastName = lnInput ? lnInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const usernameRaw = userInput ? userInput.value.trim() : '';
        const location = locInput ? locInput.value.trim() : '';

        if (firstName.length < 2) {
          if (errBox) {
            errBox.textContent = 'Пожалуйста, укажите ваше Имя.';
            errBox.classList.remove('hidden');
          }
          return;
        }

        const digits = phone.replace(/\D/g, '');
        if (digits.length < 9) {
          if (errBox) {
            errBox.textContent = 'Пожалуйста, укажите корректный номер телефона (+998 XX XXX XX XX).';
            errBox.classList.remove('hidden');
          }
          return;
        }

        const username = usernameRaw
          ? (usernameRaw.startsWith('@') ? usernameRaw : `@${usernameRaw}`)
          : '@не_указан';

        userProfile = {
          firstName,
          lastName,
          phone,
          username,
          location: location || 'г. Термез, Центр',
          lat: (userProfile && userProfile.lat) || '37.22420',
          lng: (userProfile && userProfile.lng) || '67.27830',
          registeredAt: new Date().toLocaleString('ru-RU')
        };

        safeSetStorage('american_user_profile', JSON.stringify(userProfile));
        syncUserProfileToUI();

        const groupCardText =
          `🆕 НОВАЯ РЕГИСТРАЦИЯ КЛИЕНТА (AMERICAN CAFFETTERIA)\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 Имя и Фамилия: ${userProfile.firstName} ${userProfile.lastName}\n` +
          `📞 Телефон: ${userProfile.phone}\n` +
          `🔗 Юзернейм Telegram: ${userProfile.username}\n` +
          `📍 Геолокация / Адрес: ${userProfile.location}\n` +
          `🗺 Карта GPS: https://maps.google.com/?q=${userProfile.lat},${userProfile.lng}\n` +
          `🕒 Время: ${userProfile.registeredAt}`;

                // Отправка регистрации на сервер /api/register (в базу данных и Telegram-группу напрямую)
        const capPlat = getCapacitorPlatform();
        const isNativeApp = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || capPlat === "ios" || capPlat === "android";
        const regPayload = {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          phone: userProfile.phone,
          username: userProfile.username,
          location: userProfile.location,
          lat: userProfile.lat,
          lng: userProfile.lng,
          source: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) ? "tg_miniapp" : (isNativeApp ? (capPlat === "ios" ? "ios_app" : "android_app") : "web"),
          user_id: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) ? window.Telegram.WebApp.initDataUnsafe.user.id : null
        };

        const origBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Saqlanmoqda...</span>`;

        try {
          const apiBase = getApiBaseUrl();
          const res = await fetch(`${apiBase}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regPayload)
          });
          const data = await res.json().catch(() => ({}));
          if (data && data.ok) {
            console.log("Mijoz muvaffaqiyatli ro'yxatga olindi:", data);
          }
        } catch (regApiErr) {
          console.warn("Register API dispatch error:", regApiErr);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnText;
        }

        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.sendData) {
          try {
            window.Telegram.WebApp.sendData(JSON.stringify({
              type: 'reg',
              profile: userProfile
            }));
          } catch (_) {}
        }

        if (okBox) {
          okBox.innerHTML = `✅ <strong>Muvaffaqiyatli saqlandi!</strong> Profilingiz ma'lumotlari yangilandi.`;
          okBox.classList.remove('hidden');
        }

        playSuccess();
        triggerConfetti();
        showToast(`🎉 Xush kelibsiz, ${userProfile.firstName}!`);

        setTimeout(() => {
          closeRegModal();
        }, 600);
      });
    }
  }

  window.addMultipleToCart = function(csvIds) {
    if (!csvIds) return;
    const ids = csvIds.split(',').filter(Boolean);
    ids.forEach(id => {
      const existing = cart.find(c => c.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ id, qty: 1 });
    });
    playSuccess();
    saveCart();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();
    showToast(`🎉 Все ${ids.length} блюда добавлены в корзину!`);
  };

  // --- Fly Item To Cart Animation ---
  function flyItemToCart(sourceEl, imageSrc) {
    const cartBtn = document.querySelector('.cart-trigger-btn') || document.querySelector('.open-cart-trigger');
    if (!cartBtn || !sourceEl) return;

    const startRect = sourceEl.getBoundingClientRect();
    const targetRect = cartBtn.getBoundingClientRect();

    const flyer = document.createElement('img');
    flyer.src = imageSrc || sourceEl.src;
    flyer.className = 'fly-food-clone';
    flyer.style.left = `${startRect.left + (startRect.width / 2) - 36}px`;
    flyer.style.top = `${startRect.top + (startRect.height / 2) - 36}px`;
    document.body.appendChild(flyer);

    flyer.getBoundingClientRect();

    const deltaX = (targetRect.left + (targetRect.width / 2)) - (startRect.left + (startRect.width / 2));
    const deltaY = (targetRect.top + (targetRect.height / 2)) - (startRect.top + (startRect.height / 2));

    flyer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.25) rotate(360deg)`;
    flyer.style.opacity = '0.3';

    setTimeout(() => {
      flyer.remove();
      cartBtn.classList.remove('cart-jelly-active');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('cart-jelly-active');
      createSparkles(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2);
    }, 700);
  }

  function createSparkles(cx, cy) {
    const colors = ['#EB2A2A', '#F59E0B', '#22C55E', '#DEDBD4'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-burst';
      const angle = (Math.PI * 2 * i) / 10 + (Math.random() * 0.4);
      const dist = 24 + Math.random() * 32;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.background = colors[i % colors.length];
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function setup3DCardTilt() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach(card => {
      if (card._hasTilt) return;
      card._hasTilt = true;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (((y - rect.height / 2) / (rect.height / 2)) * -8).toFixed(2);
        const rotateY = (((x - rect.width / 2) / (rect.width / 2)) * 8).toFixed(2);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--glare-x', `${(x / rect.width * 100).toFixed(1)}%`);
        card.style.setProperty('--glare-y', `${(y / rect.height * 100).toFixed(1)}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  function triggerConfetti() {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EB2A2A', '#A50F14', '#166534', '#F59E0B', '#232424']
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupEnvironmentControls();
    initLanguage();
    initSoundEngine();
    initTimeAndStatus();
    renderCategories();
    renderMenuItems();
    setup3DCardTilt();
    updateCartUI();
    setupSearch();
    setupCartDrawer();
    setupRegistrationModal();
    setupModal();
    setupReceiptModal();
    setupOrdersHistoryModal();
    setupScrollReveal();
    setupProgressBar();
    setupEventListeners();
    initQRTable();
  });

  function initLanguage() {
    setLanguage(currentLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.currentTarget.getAttribute('data-lang');
        if (selected && i18n[selected] && selected !== currentLang) {
          setLanguage(selected);
        }
      });
    });
  }

  window.setLanguage = setLanguage;
  function setLanguage(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    safeSetStorage('american_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('bg-[#232424]', 'text-[#DEDBD4]');
        btn.classList.remove('text-[#232424]', 'opacity-60');
      } else {
        btn.classList.remove('bg-[#232424]', 'text-[#DEDBD4]');
        btn.classList.add('text-[#232424]', 'opacity-60');
      }
    });

    const dict = i18n[lang];
    document.title = dict.doc_title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.placeholder = dict[key];
    });

    const soundText = document.getElementById('sound-text');
    if (soundText) soundText.textContent = soundEnabled ? dict.sound_on : dict.sound_off;

    syncUserProfileToUI();
    renderCategories();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();
    updateTimeDisplay();
  };

  function initTimeAndStatus() {
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 30000);
  }

  function updateTimeDisplay() {
    const dict = i18n[currentLang];
    const now = new Date();
    const localeMap = { ru: 'ru-RU', uz: 'uz-UZ', en: 'en-US' };
    let dateFormatted = '';
    try {
      dateFormatted = new Intl.DateTimeFormat(localeMap[currentLang] || 'ru-RU', {
        timeZone: 'Asia/Tashkent',
        day: 'numeric',
        month: 'long'
      }).format(now);
    } catch (e) {}

    const dateEl = document.getElementById('live-date');
    if (dateEl) {
      dateEl.textContent = dateFormatted ? `${dict.top_location} · ${dateFormatted}` : dict.top_location;
    }

    let currentHour = now.getHours();
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: 'numeric',
        hour12: false
      }).formatToParts(now);
      const hourPart = parts.find(p => p.type === 'hour');
      if (hourPart) currentHour = parseInt(hourPart.value, 10) % 24;
    } catch (e) {}

    const isOpen = (currentHour >= 8 || currentHour < 3);
    const beaconHeader = document.getElementById('header-beacon');
    const beaconHero = document.getElementById('hero-beacon');
    const statusWord = document.getElementById('hero-status-word');
    const statusNote = document.getElementById('hero-status-note');

    if (isOpen) {
      if (beaconHeader) beaconHeader.classList.remove('closed');
      if (beaconHero) beaconHero.classList.remove('closed');
      if (statusWord) statusWord.textContent = dict.status_open;
      if (statusNote) statusNote.textContent = dict.status_open_note;
    } else {
      if (beaconHeader) beaconHeader.classList.add('closed');
      if (beaconHero) beaconHero.classList.add('closed');
      if (statusWord) statusWord.textContent = dict.status_closed;
      if (statusNote) statusNote.textContent = dict.status_closed_note;
    }
  }

  function setupSearch() {
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('menu-search-clear');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.classList.toggle('hidden', searchQuery.length === 0);
      renderMenuItems();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchQuery = '';
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        renderMenuItems();
      });
    }
  }

  window.resetMenuFilters = function() {
    activeCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('menu-search-clear');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    renderCategories();
    renderMenuItems();
  };

  window.selectedPizzaSizes = window.selectedPizzaSizes || {};
  window.activePromoCode = "";
  window.activePromoRate = 0;
  window.stoppedDishIds = new Set(JSON.parse(localStorage.getItem("ac_stoplist") || "[]"));
  const PROMO_RATES = { AMERICAN10: 0.10, HALAL5: 0.05, SUPER2026: 0.15, BLEST10: 0.10 };
  let realtimeBC = null;
  if ("BroadcastChannel" in window) {
    try {
      realtimeBC = new BroadcastChannel("american_caffetteria_realtime");
      realtimeBC.onmessage = (ev) => {
        const msg = ev.data || {};
        if (msg.type === "stoplist_updated" && Array.isArray(msg.stoplist)) {
          window.stoppedDishIds = new Set(msg.stoplist);
          localStorage.setItem("ac_stoplist", JSON.stringify(msg.stoplist));
          renderMenuItems();
        }
      };
    } catch (_) {}
  }
  fetch(`${getApiBaseUrl()}/api/stoplist`).then(r => r.json()).then(d => {
    if (d && Array.isArray(d.stoplist)) {
      window.stoppedDishIds = new Set(d.stoplist);
      localStorage.setItem("ac_stoplist", JSON.stringify(d.stoplist));
      renderMenuItems();
    }
  }).catch(() => {});

  function initPublicStoplistStream() {
    if (!("EventSource" in window)) return;
    const base = getApiBaseUrl();
    const streamUrl = base ? `${base}/api/stream` : (window.location.protocol.startsWith("http") ? "/api/stream" : "");
    if (!streamUrl) return;
    try {
      const es = new EventSource(streamUrl);
      es.addEventListener("stoplist_updated", (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data && Array.isArray(data.stoplist)) {
            window.stoppedDishIds = new Set(data.stoplist);
            safeSetStorage("ac_stoplist", JSON.stringify(data.stoplist));
            renderMenuItems();
          }
        } catch (_) {}
      });
      es.onerror = () => {
        es.close();
        setTimeout(initPublicStoplistStream, 5000);
      };
    } catch (_) {}
  }
  initPublicStoplistStream();

  function formatSizeLabel(sz) {
    if (!sz) return '';
    if (typeof sz.label === 'object' && sz.label !== null) {
      return sz.label[currentLang] || sz.label.ru || sz.label.uz || sz.label.en || String(sz.key || '');
    }
    return String(sz.label || sz.key || '');
  }

  function resolveDishById(itemId) {
    if (!itemId) return null;
    const rawId = String(itemId);
    const direct = menuItems.find(i => i.id === rawId);
    if (direct) {
      if (Array.isArray(direct.sizes) && direct.sizes.length > 0) {
        const chosen = window.selectedPizzaSizes[direct.id] || direct.sizes[0];
        window.selectedPizzaSizes[direct.id] = chosen;
        const szLabel = formatSizeLabel(chosen);
        const szLabelRu = (typeof chosen.label === 'object' && chosen.label !== null) ? (chosen.label.ru || szLabel) : szLabel;
        return {
          ...direct,
          cartId: `${direct.id}_${chosen.key}`,
          baseId: direct.id,
          sizeKey: chosen.key,
          price: Number(chosen.price || direct.price),
          weight: chosen.weight || direct.weight,
          displayName: `${direct.name[currentLang] || direct.name.ru} (${szLabel})`,
          displayNameRu: `${direct.name.ru} (${szLabelRu})`
        };
      }
      return {
        ...direct,
        cartId: direct.id,
        baseId: direct.id,
        sizeKey: null,
        price: Number(direct.price),
        weight: direct.weight,
        displayName: direct.name[currentLang] || direct.name.ru,
        displayNameRu: direct.name.ru
      };
    }

    for (const item of menuItems) {
      if (Array.isArray(item.sizes) && rawId.startsWith(item.id + '_')) {
        const suffix = rawId.slice(item.id.length + 1);
        const sz = item.sizes.find((s, idx) => String(s.key) === suffix || String(idx) === suffix);
        if (sz) {
          const szLabel = formatSizeLabel(sz);
          const szLabelRu = (typeof sz.label === 'object' && sz.label !== null) ? (sz.label.ru || szLabel) : szLabel;
          return {
            ...item,
            cartId: `${item.id}_${sz.key}`,
            baseId: item.id,
            sizeKey: sz.key,
            price: Number(sz.price || item.price),
            weight: sz.weight || item.weight,
            displayName: `${item.name[currentLang] || item.name.ru} (${szLabel})`,
            displayNameRu: `${item.name.ru} (${szLabelRu})`
          };
        }
      }
    }
    return null;
  }

  window.selectDishSize = function(dishId, sizeKey, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const item = menuItems.find(x => String(x.id) === String(dishId));
    if (!item || !Array.isArray(item.sizes)) return;

    const sizeObj = item.sizes.find(s => String(s.key) === String(sizeKey)) || item.sizes[0];
    window.selectedPizzaSizes[item.id] = sizeObj;
    playClick();
    renderMenuItems();

    const modalOverlay = document.getElementById('dish-modal-overlay');
    if (modalOverlay && modalOverlay.classList.contains('open') && modalOverlay.getAttribute('data-open-item') === item.id) {
      window.openDishModal(item.id, true);
    }
  };

  window.selectCatalog = function(catId) {
    playClick();
    const aliasMap = {
      choy: 'tea',
      choylar: 'tea',
      cold_drinks: 'drinks',
      coffee: 'drinks',
      fastfood: 'burgers'
    };
    const resolvedCat = aliasMap[catId] || catId;
    const exists = menuCategories.some(c => c.id === resolvedCat);
    activeCategory = exists ? resolvedCat : 'all';
    renderCategories();
    renderMenuItems();
    const menuSec = document.getElementById('v2-menu');
    if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
  };

  function renderCategories() {
    const container = document.getElementById('category-tabs');
    if (!container) return;

    container.innerHTML = menuCategories.map(cat => {
      const isActive = cat.id === activeCategory;
      const label = cat[currentLang] || cat.ru;
      const count = cat.id === 'all'
        ? menuItems.length
        : menuItems.filter(item => item.category === cat.id).length;

      return `
        <button
          type="button"
          class="cat-pill px-3 py-1 rounded-full font-bold f-d uppercase text-[13px] sm:text-[14px] tracking-wider flex items-center gap-1.5 cursor-pointer ${isActive ? 'active' : 'bg-[#E8E5DE] text-[#232424]'}"
          data-cat-id="${cat.id}">
          <i class="ti ${cat.icon} text-[14px]"></i>
          <span>${label}</span>
          <span class="text-[11px] opacity-75 font-normal">(${count})</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        playClick();
        activeCategory = btn.getAttribute('data-cat-id');
        renderCategories();
        renderMenuItems();
      });
    });

    // Update Active Catalog Banner dynamically
    const activeCatObj = menuCategories.find(c => c.id === activeCategory) || menuCategories[0];
    if (activeCatObj) {
      const activeCount = activeCatObj.id === 'all'
        ? menuItems.length
        : menuItems.filter(item => item.category === activeCatObj.id).length;
      const iconEl = document.getElementById('active-catalog-icon');
      const titleEl = document.getElementById('active-catalog-title');
      if (iconEl) {
        iconEl.className = `ti ${activeCatObj.icon || 'ti-apps'} text-[#EB2A2A] text-[22px]`;
      }
      if (titleEl) {
        const catTitle = activeCatObj[currentLang] || activeCatObj.ru;
        titleEl.textContent = `${catTitle} (${activeCount})`;
      }
    }
  }

  // --- Render Menu Items (Original Paper & Ink Card Style) ---
  function renderMenuItems() {
    const container = document.getElementById('menu-grid');
    if (!container) return;

    let items = activeCategory === 'all'
      ? menuItems
      : menuItems.filter(i => i.category === activeCategory);

    if (searchQuery) {
      items = items.filter(item => {
        const nameMatch = (item.name.ru + ' ' + item.name.uz + ' ' + (item.name.en || '')).toLowerCase().includes(searchQuery);
        const descMatch = (item.desc.ru + ' ' + item.desc.uz + ' ' + (item.desc.en || '')).toLowerCase().includes(searchQuery);
        return nameMatch || descMatch;
      });
    }

    const dict = i18n[currentLang];

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 px-4 text-center sheet rounded-lg border-2 border-dashed border-[#232424]/40">
          <i class="ti ti-search-off text-[42px] text-[#EB2A2A] block mb-3"></i>
          <p class="f-d uppercase text-[24px] font-bold">${dict.search_empty}</p>
          <button
            type="button"
            onclick="window.resetMenuFilters()"
            class="mt-4 btn-animated bg-[#232424] text-[#DEDBD4] hover:bg-[#EB2A2A] px-6 py-2.5 rounded font-bold f-d uppercase text-[17px] tracking-wider cursor-pointer">
            ${dict.search_reset}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
      const chosenSize = hasSizes ? (window.selectedPizzaSizes[item.id] || item.sizes[0]) : null;
      if (hasSizes && chosenSize) {
        window.selectedPizzaSizes[item.id] = chosenSize;
      }

      const activeCartId = hasSizes ? `${item.id}_${chosenSize.key}` : item.id;
      const displayPrice = hasSizes ? Number(chosenSize.price) : Number(item.price);
      const displayWeight = (hasSizes && chosenSize.weight) ? chosenSize.weight : item.weight;

      const cartItem = cart.find(c => c.id === activeCartId);
      const inCartQty = cartItem ? cartItem.qty : 0;
      const name = item.name[currentLang] || item.name.ru;
      const desc = item.desc[currentLang] || item.desc.ru;
      const badgeText = item.badge ? (item.badge[currentLang] || item.badge.ru) : null;
      const formattedPrice = displayPrice.toLocaleString('ru-RU');
      const imgSrc = item.image;
      const isStoppedDish = window.stoppedDishIds && window.stoppedDishIds.has(item.id);

      const sizeSelectorHtml = hasSizes ? `
        <div class="pizza-size-selector">
          ${item.sizes.map(sz => {
            const isSelected = String(sz.key) === String(chosenSize.key);
            const lbl = formatSizeLabel(sz);
            return `
              <button
                type="button"
                class="size-pill-btn ${isSelected ? 'active' : ''}"
                data-size-key="${sz.key}"
                onclick="window.selectDishSize('${item.id}', '${sz.key}', event)">
                ${lbl} — ${(Number(sz.price) / 1000)}k
              </button>
            `;
          }).join('')}
        </div>
      ` : '';

      return `
        <div class="menu-card rounded-lg overflow-hidden group" data-item-id="${item.id}" data-dish-card="${item.id}">
          <div class="card-glare"></div>
          <div class="food-img-wrap cursor-pointer" onclick="window.openDishModal('${item.id}')">
            <img
              src="${imgSrc}"
              alt="${name}"
              class="food-img"
              loading="lazy"
              decoding="async"
              onerror="this.onerror=null; if(this.src && this.src.includes('?')){ this.src=this.src.split('?')[0]; }"
            />
            ${badgeText ? `
              <span class="absolute top-2 left-2 bg-[#EB2A2A] text-white text-[10px] sm:text-[11px] font-bold f-d uppercase tracking-wider px-2 py-0.5 rounded shadow">
                ${badgeText}
              </span>
            ` : ''}
            <span class="absolute bottom-2 right-2 bg-[#232424]/85 text-[#DEDBD4] text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm" data-dish-weight="1">
              ${displayWeight}
            </span>
          </div>

          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-2">
                <h3
                  class="f-d font-bold uppercase text-[18px] sm:text-[21px] leading-tight cursor-pointer hover:text-[#EB2A2A] transition-colors"
                  onclick="window.openDishModal('${item.id}')">
                  ${name}
                </h3>
              </div>
              <p class="f-b text-[13px] sm:text-[14px] leading-relaxed text-[#232424]/80 mt-2">
                ${desc}
              </p>
            </div>

            <div>
              ${sizeSelectorHtml}
              <div class="card-footer-row mt-2.5 pt-2.5 border-t border-[#232424]/20 flex items-center justify-between gap-1.5">
                <div class="price-pill bg-[#EB2A2A] text-white px-2 py-1 rounded font-bold f-d text-[15px] sm:text-[17px] tracking-wide shadow-sm whitespace-nowrap" data-dish-price="1">
                  ${formattedPrice} <span class="text-[11px] font-normal uppercase">${dict.currency}</span>
                </div>

                <div class="action-btn-area flex-shrink-0">
                  ${inCartQty > 0 ? `
                    <div class="qty-control-box flex items-center gap-1 bg-[#232424] text-[#DEDBD4] rounded-md px-1.5 py-0.5 shadow">
                      <button
                        type="button"
                        class="w-6 h-6 flex items-center justify-center font-bold text-[15px] hover:text-[#EB2A2A] transition-colors cursor-pointer"
                        onclick="window.changeItemQty('${activeCartId}', -1)"
                        title="-">
                        -
                      </button>
                      <span class="f-d font-bold text-[15px] w-4 text-center text-[#EB2A2A]">${inCartQty}</span>
                      <button
                        type="button"
                        class="w-6 h-6 flex items-center justify-center font-bold text-[15px] hover:text-[#EB2A2A] transition-colors cursor-pointer"
                        onclick="window.changeItemQty('${activeCartId}', 1)"
                        title="+">
                        +
                      </button>
                    </div>
                  ` : `
                    ${isStoppedDish ? `
                      <button
                        type="button"
                        disabled
                        class="bg-gray-500 text-white px-2.5 py-1 rounded-md font-bold f-d uppercase text-[12px] tracking-wider opacity-80 cursor-not-allowed whitespace-nowrap">
                        🚫 Vaqtincha tugadi
                      </button>
                    ` : `
                      <button
                        type="button"
                        class="add-cart-card-btn btn-animated btn-shimmer bg-[#232424] text-[#DEDBD4] hover:bg-[#EB2A2A] hover:text-white px-2.5 py-1 rounded-md font-bold f-d uppercase text-[12.5px] sm:text-[14px] tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                        onclick="window.addToCart('${activeCartId}', event)">
                        <i class="ti ti-shopping-bag-plus text-[13px]"></i>
                        <span>${dict.btn_add_to_cart}</span>
                      </button>
                    `}
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    setup3DCardTilt();
  }

  window.addToCart = function(itemId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') {
      evt.stopPropagation();
    }
    const resolved = resolveDishById(itemId);
    if (!resolved) return;

    if (
      window.stoppedDishIds &&
      (window.stoppedDishIds.has(resolved.baseId) || window.stoppedDishIds.has(resolved.cartId))
    ) {
      showToast(
        currentLang === 'uz'
          ? '🚫 Ushbu taom vaqtincha tugagan (Stop-List)'
          : currentLang === 'en'
          ? '🚫 This dish is temporarily sold out'
          : '🚫 Это блюдо временно в стоп-листе'
      );
      return;
    }

    const targetId = resolved.cartId;
    const existing = cart.find(c => c.id === targetId);
    if (existing) existing.qty += 1;
    else cart.push({ id: targetId, qty: 1 });

    playChime();

    const cardEl = (evt && evt.target && evt.target.closest)
      ? evt.target.closest('.menu-card')
      : document.querySelector(`[data-item-id="${resolved.baseId}"]`);
    const imgEl = cardEl ? cardEl.querySelector('.food-img') : null;
    if (imgEl) {
      flyItemToCart(imgEl, resolved.image);
    }

    saveCart();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();

    showToast(`«${resolved.displayName}» ${i18n[currentLang].toast_added}`);
  };

  window.addDishWithSizeToCart = function(dishId, event) {
    window.addToCart(dishId, event);
  };

  window.changeItemQty = function(itemId, delta) {
    playClick();
    const idx = cart.findIndex(c => c.id === itemId);
    if (idx !== -1) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    saveCart();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();
  };

  window.removeFromCart = function(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveCart();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();
  };

  window.clearCart = function() {
    cart = [];
    saveCart();
    renderMenuItems();
    updateCartUI();
    renderCartDrawerItems();
  };

  function saveCart() {
    safeSetStorage('american_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = totalCount;
      badge.classList.toggle('hidden', totalCount === 0);
    });

    const cartTotalSum = calculateSubtotal();
    const formattedTotal = cartTotalSum.toLocaleString('ru-RU');
    document.querySelectorAll('.cart-sum-display').forEach(el => {
      el.textContent = `${formattedTotal} ${i18n[currentLang].currency}`;
    });
  }

  function calculateSubtotal() {
    return cart.reduce((sum, cartItem) => {
      const resolved = resolveDishById(cartItem.id);
      return sum + (resolved ? resolved.price * cartItem.qty : 0);
    }, 0);
  }


  function setupWelcomeSplashAndReservations() {
    const splashModal = document.getElementById('welcome-splash-modal');
    const splashMenuBtn = document.getElementById('splash-btn-menu');

    if (splashModal && !sessionStorage.getItem('ac_splash_seen')) {
      splashModal.classList.remove('hidden');
      sessionStorage.setItem('ac_splash_seen', '1');
    }

    if (splashMenuBtn && splashModal) {
      splashMenuBtn.addEventListener('click', () => {
        splashModal.classList.add('hidden');
      });
    }

    if (splashModal) {
      splashModal.addEventListener('click', (e) => {
        if (e.target === splashModal) splashModal.classList.add('hidden');
      });
    }
  }

  function setupCartDrawer() {
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('close-cart-btn');
    const emptyBrowseBtn = document.getElementById('cart-empty-browse-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    document.querySelectorAll('.open-cart-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    if (overlay) overlay.addEventListener('click', closeCartDrawer);
    if (clearCartBtn) clearCartBtn.addEventListener('click', window.clearCart);

    if (emptyBrowseBtn) {
      emptyBrowseBtn.addEventListener('click', () => {
        closeCartDrawer();
        const menuSec = document.getElementById('v2-menu');
        if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const deliveryRadio = document.getElementById('opt-delivery');
    const pickupRadio = document.getElementById('opt-pickup');
    const dineinRadio = document.getElementById('opt-dinein');
    const addrWrap = document.getElementById('cart-address-wrap');
    const tableWrap = document.getElementById('cart-table-wrap');
    const payExitRadio = document.getElementById('pay-exit');
    const payCashRadio = document.getElementById('pay-cash');

    if (deliveryRadio && pickupRadio) {
      deliveryRadio.addEventListener('change', () => {
        deliveryType = 'delivery';
        if (addrWrap) addrWrap.classList.remove('hidden');
        if (tableWrap) tableWrap.classList.add('hidden');
        const payExitWrap = document.getElementById('pay-exit-wrap');
        if (payExitWrap) payExitWrap.classList.add('hidden');
        if (payExitRadio && payExitRadio.checked && payCashRadio) payCashRadio.checked = true;
        const payCardLbl = document.getElementById('pay-card-label');
        if (payCardLbl) payCardLbl.textContent = currentLang === 'uz' ? "Kuryerda terminal" : "Терминал у курьера";
        hideCartError();
        renderCartDrawerItems();
      });
      pickupRadio.addEventListener('change', () => {
        deliveryType = 'pickup';
        if (addrWrap) addrWrap.classList.add('hidden');
        if (tableWrap) tableWrap.classList.add('hidden');
        const payExitWrap = document.getElementById('pay-exit-wrap');
        if (payExitWrap) payExitWrap.classList.add('hidden');
        if (payExitRadio && payExitRadio.checked && payCashRadio) payCashRadio.checked = true;
        const payCardLbl = document.getElementById('pay-card-label');
        if (payCardLbl) payCardLbl.textContent = currentLang === 'uz' ? "Kassada terminal" : "Терминал на кассе";
        hideCartError();
        renderCartDrawerItems();
      });
      if (dineinRadio) {
        dineinRadio.addEventListener('change', () => {
          deliveryType = 'dine_in';
          if (addrWrap) addrWrap.classList.add('hidden');
          if (tableWrap) tableWrap.classList.remove('hidden');
          const payExitWrap = document.getElementById('pay-exit-wrap');
          if (payExitWrap) payExitWrap.classList.remove('hidden');
          if (payExitRadio) payExitRadio.checked = true;
          hideCartError();
          renderCartDrawerItems();
        });
      }
    }

    const posDirectBtn = document.getElementById('cart-pos-direct-btn');
    if (posDirectBtn) posDirectBtn.addEventListener('click', (e) => handleTelegramCheckout(e, 'pos'));

    const promoApplyBtn = document.getElementById('cart-promo-apply-btn');
    const promoInput = document.getElementById('cart-promo-input');
    const promoMsg = document.getElementById('cart-promo-msg');
    if (promoApplyBtn && promoInput) {
      promoApplyBtn.addEventListener('click', () => {
        const code = (promoInput.value || '').trim().toUpperCase();
        if (PROMO_RATES[code]) {
          window.activePromoCode = code;
          window.activePromoRate = PROMO_RATES[code];
          if (promoMsg) {
            promoMsg.textContent = `✅ Promo-kod ${code} qo'llandi (-${Math.round(window.activePromoRate * 100)}%)!`;
            promoMsg.className = 'text-[11.5px] font-bold mt-1 text-[#166534]';
          }
          playChime();
          renderCartDrawerItems();
        } else {
          window.activePromoCode = '';
          window.activePromoRate = 0;
          if (promoMsg) {
            promoMsg.textContent = '❌ Bunday promo-kod mavjud emas (AMERICAN10, HALAL5, SUPER2026)';
            promoMsg.className = 'text-[11.5px] font-bold mt-1 text-[#EB2A2A]';
          }
          renderCartDrawerItems();
        }
      });
    }

    setupWelcomeSplashAndReservations();

    const callBtn = document.getElementById('cart-call-order-btn');
    if (callBtn) {
      callBtn.addEventListener('click', () => {
        window.location.href = 'tel:+998908220101';
      });
    }
  }

  window.openCartDrawer = openCartDrawer;
  window.closeCartDrawer = closeCartDrawer;

  function openCartDrawer() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;

    playWhoosh();
    hideCartError();
    syncUserProfileToUI();
    renderCartDrawerItems();
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showCartError(msg, inputEl) {
    const errBox = document.getElementById('cart-form-error');
    if (errBox) {
      errBox.textContent = msg;
      errBox.classList.remove('hidden');
    }
    if (inputEl) inputEl.focus();
  }

  function hideCartError() {
    const errBox = document.getElementById('cart-form-error');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.add('hidden');
    }
  }

  function renderCartDrawerItems() {
    const container = document.getElementById('cart-items-list');
    const emptyView = document.getElementById('cart-empty-view');
    const checkoutView = document.getElementById('cart-checkout-view');
    const clearBtn = document.getElementById('clear-cart-btn');
    if (!container) return;

    const dict = i18n[currentLang];

    if (cart.length === 0) {
      if (emptyView) emptyView.classList.remove('hidden');
      if (checkoutView) checkoutView.classList.add('hidden');
      if (clearBtn) clearBtn.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    if (emptyView) emptyView.classList.add('hidden');
    if (checkoutView) checkoutView.classList.remove('hidden');
    if (clearBtn) clearBtn.classList.remove('hidden');

    container.innerHTML = cart.map(cartItem => {
      const resolved = resolveDishById(cartItem.id);
      if (!resolved) return '';

      const name = resolved.displayName;
      const itemTotal = (resolved.price * cartItem.qty).toLocaleString('ru-RU');
      const imgSrc = resolved.image;

      return `
        <div class="flex items-center gap-3 p-3 bg-white/50 border border-[#232424]/15 rounded-lg">
          <img
            src="${imgSrc}"
            alt="${name}"
            class="w-16 h-16 rounded object-cover border border-[#232424]/30 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h4 class="f-d font-bold text-[18px] uppercase leading-tight truncate">${name}</h4>
            <p class="text-[13px] text-[#EB2A2A] font-bold mt-0.5">
              ${resolved.price.toLocaleString('ru-RU')} ${dict.currency}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <button
                type="button"
                class="w-6 h-6 rounded bg-[#232424] text-[#DEDBD4] font-bold text-[14px] flex items-center justify-center hover:bg-[#EB2A2A] transition-colors cursor-pointer"
                onclick="window.changeItemQty('${cartItem.id}', -1)">-</button>
              <span class="f-d font-bold text-[16px] w-5 text-center">${cartItem.qty}</span>
              <button
                type="button"
                class="w-6 h-6 rounded bg-[#232424] text-[#DEDBD4] font-bold text-[14px] flex items-center justify-center hover:bg-[#EB2A2A] transition-colors cursor-pointer"
                onclick="window.changeItemQty('${cartItem.id}', 1)">+</button>
            </div>
          </div>
          <div class="text-right flex flex-col justify-between items-end h-16">
            <button
              type="button"
              class="text-[#232424]/50 hover:text-[#EB2A2A] text-[18px] transition-colors cursor-pointer"
              onclick="window.removeFromCart('${cartItem.id}')"
              title="Удалить">
              <i class="ti ti-trash"></i>
            </button>
            <span class="f-d font-bold text-[18px]">
              ${itemTotal} <span class="text-[12px] font-normal">${dict.currency}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = calculateSubtotal();
    const discountAmount = window.activePromoRate > 0 ? Math.round(subtotal * window.activePromoRate) : 0;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const isDelivery = deliveryType === 'delivery';
    const isDineIn = deliveryType === 'dine_in';
    const serviceFee = isDineIn ? Math.round(afterDiscount * 0.10) : 0;
    const freeThreshold = 100000;
    const deliveryFee = (isDelivery && afterDiscount < freeThreshold) ? 10000 : 0;
    const grandTotal = afterDiscount + deliveryFee + serviceFee;

    const discRow = document.getElementById('cart-discount-row');
    const discCodeLbl = document.getElementById('cart-promo-code-lbl');
    const discValEl = document.getElementById('cart-discount-val');
    if (discRow) {
      if (discountAmount > 0) {
        discRow.classList.remove('hidden');
        if (discCodeLbl) discCodeLbl.textContent = window.activePromoCode;
        if (discValEl) discValEl.textContent = `-${discountAmount.toLocaleString('ru-RU')} ${dict.currency}`;
      } else {
        discRow.classList.add('hidden');
      }
    }

    const servFeeRow = document.getElementById('cart-service-fee-row');
    const servFeeVal = document.getElementById('cart-service-fee-val');
    if (servFeeRow) {
      if (isDineIn && serviceFee > 0) {
        servFeeRow.classList.remove('hidden');
        if (servFeeVal) servFeeVal.textContent = `+${serviceFee.toLocaleString('ru-RU')} ${dict.currency}`;
      } else {
        servFeeRow.classList.add('hidden');
      }
    }

    const progressTextEl = document.getElementById('cart-free-delivery-text');
    const progressFillEl = document.getElementById('cart-free-delivery-bar');
    if (progressTextEl && progressFillEl) {
      if (!isDelivery) {
        progressTextEl.textContent = deliveryType === 'dine_in' ? (dict.cart_dine_in_note || dict.cart_pickup_note) : dict.cart_pickup_note;
        progressFillEl.style.width = '100%';
      } else if (subtotal >= freeThreshold) {
        progressTextEl.textContent = dict.cart_free_progress_done;
        progressFillEl.style.width = '100%';
      } else {
        const diff = (freeThreshold - subtotal).toLocaleString('ru-RU');
        progressTextEl.textContent = dict.cart_free_progress_more.replace('{amount}', diff);
        progressFillEl.style.width = Math.min(100, Math.round((subtotal / freeThreshold) * 100)) + '%';
      }
    }

    const subtotalEl = document.getElementById('cart-subtotal-val');
    const deliveryFeeEl = document.getElementById('cart-delivery-fee-val');
    const grandTotalEl = document.getElementById('cart-grand-total-val');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString('ru-RU')} ${dict.currency}`;
    if (deliveryFeeEl) {
      deliveryFeeEl.textContent = deliveryFee === 0
        ? dict.cart_delivery_free
        : `${deliveryFee.toLocaleString('ru-RU')} ${dict.currency}`;
    }
    if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toLocaleString('ru-RU')} ${dict.currency}`;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (e) {}
  }

  // --- Checkout & Receipt Modal ---
  let isSubmittingOrder = false;
  let currentCheckoutIdempotencyKey = null;

  const CHECKOUT_TEXTS = {
    ru: {
      emptyCart: "Ваша корзина пуста!",
      missingName: "Пожалуйста, укажите ваше имя (минимум 2 символа).",
      invalidPhone: "Пожалуйста, введите корректный номер телефона (минимум 7 цифр).",
      missingAddress: "Пожалуйста, укажите адрес доставки или ориентир.",
      sending: "Оформляем заказ...",
      networkError: "Нет соединения с сервером. Проверьте интернет и попробуйте снова.",
      serverError: "Ошибка при оформлении заказа: {err}",
      orderConfirmed: "Заказ #{id} успешно принят!",
    },
    uz: {
      emptyCart: "Savatingiz bo'sh!",
      missingName: "Iltimos, ismingizni kiriting (kamida 2 ta harf).",
      invalidPhone: "Iltimos, to'g'ri telefon raqamini kiriting.",
      missingAddress: "Iltimos, yetkazib berish manzilini kiriting.",
      sending: "Buyurtma yuborilmoqda...",
      networkError: "Server bilan aloqa yo'q. Internetni tekshirib qayta urinib ko'ring.",
      serverError: "Buyurtma xatosi: {err}",
      orderConfirmed: "Buyurtma #{id} qabul qilindi!",
    },
    en: {
      emptyCart: "Your cart is empty!",
      missingName: "Please enter your name (at least 2 characters).",
      invalidPhone: "Please enter a valid phone number.",
      missingAddress: "Please enter your delivery address.",
      sending: "Submitting order...",
      networkError: "Network error. Please check your connection and try again.",
      serverError: "Order error: {err}",
      orderConfirmed: "Order #{id} confirmed!",
    },
  };

  function getCheckoutText(key, replacements = {}) {
    const lang = (currentLang || localStorage.getItem("american_lang") || "ru").toLowerCase();
    const dict = CHECKOUT_TEXTS[lang] || CHECKOUT_TEXTS.ru;
    let str = dict[key] || CHECKOUT_TEXTS.ru[key] || key;
    for (const [k, v] of Object.entries(replacements)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  function generateIdempotencyKey() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
  }

  function validatePhoneFormatOnly(phoneStr) {
    if (!phoneStr) return false;
    const cleaned = phoneStr.trim();
    if (!/^[+\d][\d\s()\-]{6,22}$/.test(cleaned)) return false;
    const digitsOnly = cleaned.replace(/\D/g, "");
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }

  async function handleTelegramCheckout(event, checkoutChannel = 'pos') {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    if (isSubmittingOrder) return;

    if (!Array.isArray(cart) || cart.length === 0) {
      showToast(getCheckoutText("emptyCart"));
      return;
    }

    const nameInput = document.getElementById("order-name");
    const phoneInput = document.getElementById("order-phone");
    const addrInput = document.getElementById("order-address");
    const commentInput = document.getElementById("order-comment");

    const customerName = (nameInput ? nameInput.value : (userProfile?.firstName || "")).trim();
    const phone = (phoneInput ? phoneInput.value : (userProfile?.phone || "")).trim();
    const currentDeliveryType = typeof deliveryType !== "undefined" ? deliveryType : "delivery";
    let address = (addrInput ? addrInput.value : (userProfile?.location || "")).trim();
    if (currentDeliveryType === "pickup") {
      address = address || "Kafedan olib ketish";
    } else if (currentDeliveryType === "dine_in") {
      const tableSelect = document.getElementById("order-table-select");
      address = tableSelect ? tableSelect.value : (address || "1-Stol (Zalda)");
    }
    const comment = (commentInput ? commentInput.value : "").trim();

    if (customerName.length < 2) {
      showCartError(getCheckoutText("missingName"), nameInput);
      return;
    }

    if (!validatePhoneFormatOnly(phone)) {
      showCartError(getCheckoutText("invalidPhone"), phoneInput);
      return;
    }

    if (currentDeliveryType === "delivery" && address.length < 4) {
      showCartError(getCheckoutText("missingAddress"), addrInput);
      return;
    }

    if (!currentCheckoutIdempotencyKey) {
      currentCheckoutIdempotencyKey = generateIdempotencyKey();
    }

    const submitBtn = document.getElementById("cart-pos-direct-btn");
    const originalBtnText = submitBtn ? submitBtn.textContent : "";

    isSubmittingOrder = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = getCheckoutText("sending");
    }

    const isTgMiniApp = Boolean(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
    const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;

    const selectedPayRadio = document.querySelector('input[name="payment_choice"]:checked');
    let paymentMethod = selectedPayRadio ? selectedPayRadio.value : (currentDeliveryType === "dine_in" ? "unpaid" : "cash");
    if (currentDeliveryType === "dine_in" && (!selectedPayRadio || selectedPayRadio.value === "unpaid")) {
      paymentMethod = "unpaid";
    }

    const subtotalVal = calculateSubtotal();
    const discountVal = window.activePromoRate > 0 ? Math.round(subtotalVal * window.activePromoRate) : 0;
    const capPlat = getCapacitorPlatform();
    const isNativeApp = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || capPlat === "ios" || capPlat === "android";
    const orderPayload = {
      idempotency_key: currentCheckoutIdempotencyKey,
      customer_name: customerName,
      phone: phone,
      delivery_type: currentDeliveryType,
      address: address,
      comment: comment,
      payment_method: paymentMethod,
      payment_status: (currentDeliveryType === "dine_in" && paymentMethod === "unpaid") ? "pending" : (paymentMethod === "online" ? "awaiting_confirmation" : "pending"),
      promo_code: window.activePromoCode || "",
      discount: discountVal,
      source: isTgMiniApp ? "tg_miniapp" : (isNativeApp ? (capPlat === "ios" ? "ios_app" : "android_app") : "web"),
      user_id: tgUserId,
      append_if_active: currentDeliveryType === "dine_in",
      items: cart.map((cartItem) => {
        const resolved = resolveDishById(cartItem.id);
        return {
          id: String(resolved ? resolved.cartId : cartItem.id),
          name: String(resolved ? resolved.displayNameRu : (cartItem.name || cartItem.id)),
          qty: Number(cartItem.qty || 1),
          price: Number(resolved ? resolved.price : 0),
        };
      }),
    };

    try {
      const apiBase = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch(`${apiBase}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !data.order || !data.order.id) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const savedOrder = data.order;
      currentCheckoutIdempotencyKey = null;
      if (realtimeBC) {
        try {
          realtimeBC.postMessage({ type: "new_order", order: savedOrder });
        } catch (_) {}
      }

      window.clearCart();
      window.activePromoCode = "";
      window.activePromoRate = 0;
      const promoInp = document.getElementById("promo-code-input");
      if (promoInp) promoInp.value = "";
      const promoMsg = document.getElementById("promo-status-msg");
      if (promoMsg) { promoMsg.textContent = ""; promoMsg.classList.add("hidden"); }

      if (isTgMiniApp && typeof window.Telegram.WebApp.sendData === "function") {
        try {
          window.Telegram.WebApp.sendData(
            JSON.stringify({
              already_saved_via_http: true,
              order_id: savedOrder.order_code || (savedOrder.id ? `#AC-${1000 + Number(savedOrder.id)}` : ''),
              order_code: savedOrder.order_code || (savedOrder.id ? `#AC-${1000 + Number(savedOrder.id)}` : ''),
              total: savedOrder.total,
            })
          );
        } catch (_) {}
      }

      try {
        const hist = JSON.parse(localStorage.getItem('ac_orders_history') || '[]');
        hist.unshift({
          id: savedOrder.id,
          order_code: savedOrder.order_code,
          created_at: savedOrder.created_at_utc,
          total: savedOrder.total,
          items: savedOrder.items,
          delivery_type: savedOrder.delivery_type,
          address: savedOrder.address,
        });
        localStorage.setItem('ac_orders_history', JSON.stringify(hist.slice(0, 20)));
        if (typeof updateOrdersBadge === 'function') updateOrdersBadge();
      } catch (_) {}

      const dict = (typeof i18n !== "undefined" && i18n[currentLang]) || {};
      const cur = dict.currency || "сум";
      const itemsListText = (savedOrder.items || []).map(it => `▪ ${it.qty}x ${it.name} — ${(it.price * it.qty).toLocaleString("ru-RU")} ${cur}`).join("\n");
      const deliveryText = savedOrder.delivery_type === "delivery"
        ? `🚗 Доставка: ${savedOrder.delivery_fee === 0 ? "Бесплатно" : `${savedOrder.delivery_fee.toLocaleString("ru-RU")} ${cur}`}\n📍 Адрес: ${savedOrder.address}\n`
        : (savedOrder.delivery_type === "dine_in"
            ? `🏛️ В зале: ${savedOrder.address}\n`
            : "🏃 Самовывоз из кафе\n");

      const deliveryLabel = savedOrder.delivery_type === "delivery"
        ? "🚗 Доставка"
        : (savedOrder.delivery_type === "dine_in" ? "🏛️ В зале" : "🏃 Самовывоз");

      let payLabel = "💵 Наличные";
      if (savedOrder.payment_method === "card_terminal") payLabel = "💳 Терминал у курьера";
      else if (savedOrder.payment_method === "card") payLabel = "💳 Карта / Терминал";
      else if (savedOrder.payment_method === "online") payLabel = "📱 Click / Payme (Онлайн)";
      else if (savedOrder.payment_method === "unpaid" || savedOrder.delivery_type === "dine_in") {
        payLabel = "☕ При выходе из кафе (В кассе)";
      }

      const ordCode = savedOrder.order_code || `#AC-${1000 + Number(savedOrder.id)}`;
      const discLine = Number(savedOrder.discount || 0) > 0 ? `\n🎁 Скидка${savedOrder.promo_code ? ` (${savedOrder.promo_code})` : ""}: -${Number(savedOrder.discount).toLocaleString("ru-RU")} ${cur}` : "";
      const svcLine = Number(savedOrder.service_fee || 0) > 0 ? `\n🍽 Обслуживание (10%): +${Number(savedOrder.service_fee).toLocaleString("ru-RU")} ${cur}` : "";
      const receiptText = `🧾 ЧЕК ЗАКАЗА ${ordCode}
---------------------------------
${itemsListText}
---------------------------------
Сумма блюд: ${savedOrder.subtotal.toLocaleString("ru-RU")} ${cur}${discLine}${svcLine}
Способ: ${deliveryLabel}
${deliveryText}Оплата: ${payLabel}
ИТОГО К ОПЛАТЕ: ${savedOrder.total.toLocaleString("ru-RU")} ${cur}

👤 Клиент: ${savedOrder.customer_name}
📞 Телефон: ${savedOrder.phone}
${savedOrder.comment ? `💬 Комментарий: ${savedOrder.comment}\n` : ""}
✅ Заказ передан на кухню American Caffetteria!`;

      lastGeneratedReceipt = receiptText;
      closeCartDrawer();
      openReceiptModal(receiptText);
    } catch (err) {
      let msg;
      if (err.name === "AbortError") {
        msg = currentLang === "uz"
          ? "Aloqa vaqti tugadi (internet sekin). Qaytadan bosing."
          : "Таймаут соединения (медленный интернет). Повторите попытку.";
      } else if (err.name === "TypeError") {
        msg = getCheckoutText("networkError");
      } else {
        msg = getCheckoutText("serverError", { err: err.message });
      }
      showToast(msg);
    } finally {
      isSubmittingOrder = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  }

  function setupReceiptModal() {
    const overlay = document.getElementById('receipt-modal-overlay');
    const closeBtn = document.getElementById('receipt-modal-close');
    const copyBtn = document.getElementById('receipt-copy-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeReceiptModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeReceiptModal();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (lastGeneratedReceipt) {
          copyTextToClipboard(lastGeneratedReceipt);
          showToast(i18n[currentLang].receipt_btn_copied || "Чек скопирован!");
        }
      });
    }
  }

  function openReceiptModal(receiptText) {
    const overlay = document.getElementById('receipt-modal-overlay');
    const previewEl = document.getElementById('receipt-preview-text');
    if (!overlay) return;

    if (previewEl) previewEl.textContent = receiptText;

    playSuccess();
    triggerConfetti();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeReceiptModal() {
    const overlay = document.getElementById('receipt-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.closeReceiptModal = closeReceiptModal;

  function updateOrdersBadge() {
    const badge = document.getElementById('my-orders-badge');
    if (!badge) return;
    try {
      const hist = JSON.parse(localStorage.getItem('ac_orders_history') || '[]');
      if (hist.length > 0) {
        badge.textContent = hist.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    } catch (_) {}
  }

  function setupOrdersHistoryModal() {
    const overlay = document.getElementById('orders-history-modal-overlay');
    const closeBtn = document.getElementById('orders-history-modal-close');
    const listEl = document.getElementById('orders-history-list');

    if (!overlay || !listEl) return;
    updateOrdersBadge();

    async function openHistoryModal() {
      playWhoosh();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      renderOrdersHistory();
      await refreshOrdersStatus();
    }

    function closeHistoryModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.open-orders-history-trigger').forEach(btn => {
      btn.addEventListener('click', openHistoryModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeHistoryModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeHistoryModal();
    });

    function renderOrdersHistory() {
      let hist = [];
      try {
        hist = JSON.parse(localStorage.getItem('ac_orders_history') || '[]');
      } catch (_) {}

      if (hist.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-10 text-[#232424]/60">
            <i class="ti ti-package-off text-[42px] text-[#232424]/40"></i>
            <p class="mt-2 font-bold f-d uppercase text-[18px]">Hozircha buyurtmalar yo'q</p>
            <p class="text-[13px] text-[#232424]/70">Menyudan birinchi mazali taomingizni tanlang!</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = hist.map(o => {
        const orderId = o.id;
        const code = o.order_code || `#AC-${1000 + Number(orderId)}`;
        const status = o.status || 'new';
        const totalFmt = (Number(o.total) || 0).toLocaleString('ru-RU') + ' so\'m';
        const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('ru-RU') : '';

        const steps = [
          { key: 'new', label: 'Qabul qilindi' },
          { key: 'cooking', label: 'Oshxonada' },
          { key: 'delivering', label: o.delivery_type === 'delivery' ? 'Kuryerda' : 'Tayyor' },
          { key: 'completed', label: o.delivery_type === 'dine_in' ? 'Topshirildi' : (o.delivery_type === 'pickup' ? 'Olib ketildi' : 'Yetkazildi') }
        ];

        let activeIdx = 0;
        if (status === 'cooking' || status === 'accepted') activeIdx = 1;
        else if (status === 'delivering' || status === 'ready') activeIdx = 2;
        else if (status === 'completed') activeIdx = 3;
        else if (status === 'cancelled') activeIdx = -1;

        let itemsSummary = '';
        if (Array.isArray(o.items)) {
          itemsSummary = o.items.map(it => `${it.name || it.id} × ${it.qty || 1}`).join(', ');
        }

        const isCancelled = status === 'cancelled';

        return `
          <div class="p-4 rounded-xl border border-[#232424]/20 bg-white shadow-sm space-y-3">
            <div class="flex justify-between items-start gap-2">
              <div>
                <span class="f-d font-bold text-[18px] text-[#232424]">${escapeHtml(code)}</span>
                <span class="block text-[11px] text-[#232424]/60">${escapeHtml(dateStr)}</span>
              </div>
              <div class="text-right">
                <span class="f-d font-bold text-[18px] text-[#EB2A2A]">${escapeHtml(totalFmt)}</span>
                <span class="block text-[11px] uppercase font-bold text-[#232424]/70">${o.delivery_type === 'dine_in' ? 'Zalda' : (o.delivery_type === 'pickup' ? 'Olib ketish' : 'Dostavka')}</span>
              </div>
            </div>

            ${itemsSummary ? `<p class="text-[12.5px] text-[#232424]/80 italic line-clamp-2">📦 ${escapeHtml(itemsSummary)}</p>` : ''}

            ${isCancelled ? `
              <div class="p-2 rounded bg-red-100 text-red-800 text-[12px] font-bold text-center">
                ❌ Buyurtma bekor qilingan / Отменён
              </div>
            ` : `
              <div class="space-y-1.5 pt-1">
                <div class="grid grid-cols-4 gap-1 text-center">
                  ${steps.map((st, i) => `
                    <div class="text-[10px] font-bold uppercase ${i <= activeIdx ? 'text-[#EB2A2A]' : 'text-[#232424]/40'}">
                      ${st.label}
                    </div>
                  `).join('')}
                </div>
                <div class="w-full bg-[#E8E5DE] h-2 rounded-full overflow-hidden flex">
                  ${steps.map((_, i) => `
                    <div class="flex-1 border-r last:border-r-0 border-white ${i <= activeIdx ? 'bg-[#EB2A2A]' : 'bg-transparent'}"></div>
                  `).join('')}
                </div>
              </div>
            `}

            <div class="pt-2 border-t border-[#232424]/10 flex justify-end">
              <button
                type="button"
                class="btn-repeat-order px-3 py-1.5 rounded bg-[#232424] hover:bg-[#EB2A2A] text-white text-[12.5px] font-bold f-d uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                data-order-id="${orderId}">
                <i class="ti ti-refresh"></i>
                <span>Qayta buyurtma berish / Повторить</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.btn-repeat-order').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.getAttribute('data-order-id'));
          repeatOrder(id);
        });
      });
    }

    async function refreshOrdersStatus() {
      let hist = [];
      try {
        hist = JSON.parse(localStorage.getItem('ac_orders_history') || '[]');
      } catch (_) {}
      if (hist.length === 0) return;

      const ids = hist.map(o => o.id).filter(Boolean).slice(0, 20);
      if (ids.length === 0) return;

      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/orders/status?ids=${ids.join(',')}`);
        const data = await res.json().catch(() => ({}));
        if (data.ok && Array.isArray(data.orders)) {
          let updated = false;
          data.orders.forEach(liveO => {
            const match = hist.find(h => Number(h.id) === Number(liveO.id));
            if (match && match.status !== liveO.status) {
              match.status = liveO.status;
              match.status_label = liveO.status_label;
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem('ac_orders_history', JSON.stringify(hist));
            renderOrdersHistory();
          }
        }
      } catch (_) {}
    }

    function repeatOrder(orderId) {
      let hist = [];
      try {
        hist = JSON.parse(localStorage.getItem('ac_orders_history') || '[]');
      } catch (_) {}
      const target = hist.find(h => Number(h.id) === Number(orderId));
      if (!target || !Array.isArray(target.items)) {
        showToast('⚠️ Buyurtma ma\'lumotlari topilmadi');
        return;
      }

      target.items.forEach(it => {
        const itemId = it.id || it.item_id;
        const qty = Number(it.qty || 1);
        if (itemId) {
          const existing = cart.find(c => c.id === itemId);
          if (existing) existing.qty += qty;
          else cart.push({ id: itemId, qty });
        }
      });

      saveCart();
      updateCartUI();
      renderCartDrawerItems();
      closeHistoryModal();
      window.openCartDrawer();
      playSuccess();
      showToast('🛒 Taomlar savatga qo\'shildi!');
    }
  }

  // --- Dish Detail Modal ---
  function setupModal() {
    const overlay = document.getElementById('dish-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeDishModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDishModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDishModal();
        closeReceiptModal();
        closeCartDrawer();
        const splash = document.getElementById('welcome-splash-modal');
        if (splash) splash.classList.add('hidden');
        document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
        document.body.style.overflow = '';
      }
    });
  }

  window.openDishModal = function(itemId, skipSound) {
    if (!skipSound) playWhoosh();
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const overlay = document.getElementById('dish-modal-overlay');
    const content = document.getElementById('modal-dish-body');
    if (!overlay || !content) return;

    overlay.setAttribute('data-open-item', item.id);

    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const chosenSize = hasSizes ? (window.selectedPizzaSizes[item.id] || item.sizes[0]) : null;
    if (hasSizes && chosenSize) {
      window.selectedPizzaSizes[item.id] = chosenSize;
    }

    const activeCartId = hasSizes ? `${item.id}_${chosenSize.key}` : item.id;
    const displayPrice = hasSizes ? Number(chosenSize.price) : Number(item.price);
    const displayWeight = (hasSizes && chosenSize.weight) ? chosenSize.weight : item.weight;

    const dict = i18n[currentLang];
    const name = item.name[currentLang] || item.name.ru;
    const desc = item.desc[currentLang] || item.desc.ru;
    const badgeText = item.badge ? (item.badge[currentLang] || item.badge.ru) : null;
    const catObj = menuCategories.find(c => c.id === item.category);
    const prepTime = (catObj && catObj.prep && catObj.prep[currentLang]) ? catObj.prep[currentLang] : '10–15 мин';
    const imgSrc = item.image;

    const modalSizeSelectorHtml = hasSizes ? `
      <div class="pizza-size-selector mt-5">
        ${item.sizes.map(sz => {
          const isSelected = String(sz.key) === String(chosenSize.key);
          const lbl = formatSizeLabel(sz);
          return `
            <button
              type="button"
              class="size-pill-btn ${isSelected ? 'active' : ''}"
              data-size-key="${sz.key}"
              onclick="window.selectDishSize('${item.id}', '${sz.key}', event)">
              ${lbl} — ${Number(sz.price).toLocaleString('ru-RU')} ${dict.currency}
            </button>
          `;
        }).join('')}
      </div>
    ` : '';

    const isStoppedDish = window.stoppedDishIds && (window.stoppedDishIds.has(item.id) || window.stoppedDishIds.has(activeCartId));

    const modalBtnHtml = isStoppedDish ? `
      <button
        type="button"
        disabled
        class="w-full sm:w-auto bg-[#888888] text-white px-8 py-3.5 rounded-lg font-bold f-d uppercase text-[18px] tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75">
        <i class="ti ti-ban text-[22px]"></i>
        <span>${currentLang === 'uz' ? "Vaqtincha tugagan" : (currentLang === 'en' ? "Temporarily out of stock" : "Временно в стоп-листе")}</span>
      </button>
    ` : `
      <button
        type="button"
        class="w-full sm:w-auto btn-animated btn-shimmer bg-[#232424] text-[#DEDBD4] hover:bg-[#EB2A2A] hover:text-white px-8 py-3.5 rounded-lg font-bold f-d uppercase text-[18px] tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        onclick="window.addToCart('${activeCartId}', event); window.closeDishModal();">
        <i class="ti ti-shopping-bag-plus text-[22px]"></i>
        <span>${dict.btn_add_to_cart}</span>
      </button>
    `;

    content.innerHTML = `
      <div class="relative bg-[#073B3A]">
        <img
          src="${imgSrc}"
          alt="${name}"
          class="w-full h-72 sm:h-96 object-cover"
        />
        ${badgeText ? `
          <span class="absolute top-4 left-4 bg-[#EB2A2A] text-white text-[13px] font-bold f-d uppercase tracking-wider px-3 py-1 rounded shadow-lg">
            ${badgeText}
          </span>
        ` : ''}
        <span class="absolute bottom-4 right-4 bg-[#232424]/90 text-[#DEDBD4] text-[13px] font-semibold px-3 py-1 rounded">
          ${displayWeight}
        </span>
      </div>

      <div class="p-6 sm:p-8">
        <div class="flex justify-between items-start gap-4">
          <h2 class="f-d font-bold uppercase text-[32px] sm:text-[40px] leading-tight text-[#232424]">
            ${name}
          </h2>
          <div class="price-pill bg-[#EB2A2A] text-white px-4 py-2 rounded font-bold f-d text-[24px] tracking-wide shadow-md whitespace-nowrap">
            ${displayPrice.toLocaleString('ru-RU')} ${dict.currency}
          </div>
        </div>

        <p class="f-b text-[16px] sm:text-[18px] leading-relaxed text-[#232424]/90 mt-4">
          ${desc}
        </p>

        ${modalSizeSelectorHtml}

        <div class="mt-8 pt-6 border-t border-[#232424]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3 text-[14px] text-[#232424]/70">
            <i class="ti ti-clock text-[20px] text-[#EB2A2A]"></i>
            <span>${dict.prep_prefix} <strong>${prepTime}</strong></span>
          </div>

          ${modalBtnHtml}
        </div>
      </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeDishModal() {
    const overlay = document.getElementById('dish-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    const icon = document.createElement('i');
    icon.className = 'ti ti-circle-check text-[#EB2A2A] text-[20px]';
    const textSpan = document.createElement('span');
    textSpan.textContent = String(message || '');

    toast.appendChild(icon);
    toast.appendChild(textSpan);

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  function setupProgressBar() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      bar.style.width = scrolled + '%';
    });
  }

  function setupScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    document.body.classList.add('js-reveal-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function setupEventListeners() {
    const fab = document.getElementById('floating-call-btn');
    const footer = document.querySelector('footer');
    if (fab && footer && ('IntersectionObserver' in window)) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
          } else {
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
          }
        });
      }, { threshold: 0.2 });
      footerObserver.observe(footer);
    }
  }

  // === QR Code Table Preselection ===
  function initQRTable() {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawParam = params.get('table') || params.get('stol') || params.get('st') || '';
      if (!rawParam) return;

      const tableSelect = document.getElementById('order-table-select');
      const dineinRadio = document.getElementById('opt-dinein');
      if (!tableSelect || !dineinRadio) return;

      let matchedValue = '';
      const cleanParam = rawParam.trim().toLowerCase();

      for (const opt of tableSelect.options) {
        const optVal = opt.value.toLowerCase();
        if (cleanParam === optVal || optVal.includes(cleanParam) || cleanParam.includes(optVal)) {
          matchedValue = opt.value;
          break;
        }
        const numMatch = cleanParam.match(/\d+/);
        if (numMatch && optVal.startsWith(numMatch[0] + '-')) {
          matchedValue = opt.value;
          break;
        }
      }

      if (!matchedValue) {
        if (cleanParam.includes('vip')) {
          matchedValue = 'VIP Xona';
        } else {
          const numMatch = cleanParam.match(/\d+/);
          matchedValue = numMatch ? `${numMatch[0]}-Stol` : (tableSelect.options[0]?.value || '1-Stol');
        }
      }

      tableSelect.value = matchedValue;

      // Select dine-in delivery mode
      dineinRadio.checked = true;
      dineinRadio.dispatchEvent(new Event('change'));

      showQRTableBanner(matchedValue);
    } catch (e) {
      console.warn('QR table init error:', e);
    }
  }

  function showQRTableBanner(tableName) {
    if (document.getElementById('qr-table-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'qr-table-banner';
    banner.className = 'w-full bg-[#166534] text-white px-4 py-2.5 text-center text-[13px] font-bold shadow-md sticky top-0 z-[60] flex items-center justify-between transition-all';
    const isUz = (typeof currentLang !== 'undefined' && currentLang === 'uz');
    const safeTableName = escapeHtml(tableName);
    banner.innerHTML = `
      <div class="flex items-center gap-2 mx-auto">
        <span class="text-base">🪑</span>
        <span>${isUz ? `Siz <strong>${safeTableName}</strong>dasiz (Zalda xizmat). Buyurtma oshxona va kassaga tushadi.` : `Вы за столом: <strong>${safeTableName}</strong> (В зале). Заказ поступит прямо на кухню.`}</span>
      </div>
      <button type="button" class="text-white/80 hover:text-white text-xl font-bold ml-2 leading-none cursor-pointer" onclick="document.getElementById('qr-table-banner')?.remove()">&times;</button>
    `;
    document.body.prepend(banner);
  }

  // === Android Hardware Back Button (Capacitor) ===
  function initAndroidBackButton() {
    if (!window.Capacitor) return;
    try {
      const { App } = window.Capacitor.Plugins || {};
      if (App && App.addListener) {
        App.addListener('backButton', function(e) {
          // 1. Close Quick Dish Modal
          const dishOverlay = document.getElementById('dish-modal-overlay');
          if (dishOverlay && dishOverlay.classList.contains('open')) {
            dishOverlay.classList.remove('open');
            document.body.style.overflow = '';
            return;
          }
          // 2. Close Receipt Modal
          const receiptOverlay = document.getElementById('receipt-modal-overlay');
          if (receiptOverlay && receiptOverlay.classList.contains('open')) {
            receiptOverlay.classList.remove('open');
            document.body.style.overflow = '';
            return;
          }
          // 3. Close Registration Modal
          const regOverlay = document.getElementById('reg-modal-overlay');
          if (regOverlay && regOverlay.classList.contains('open')) {
            regOverlay.classList.remove('open');
            document.body.style.overflow = '';
            return;
          }
          // 4. Close Cart Drawer
          const cartDrawer = document.getElementById('cart-drawer');
          const cartOverlay = document.getElementById('cart-overlay');
          if (cartDrawer && cartDrawer.classList.contains('open')) {
            cartDrawer.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
            return;
          }
                    // 6. Generic catch-all for any open modal overlay
          const modals = document.querySelectorAll('.modal-overlay.open');
          if (modals.length > 0) {
            modals.forEach(m => m.classList.remove('open'));
            document.body.style.overflow = '';
            return;
          }
          // 7. If everything is closed, exit Android app
          if (App.exitApp) App.exitApp();
        });
      }
    } catch(e) {}
  }

  initAndroidBackButton();

})();
