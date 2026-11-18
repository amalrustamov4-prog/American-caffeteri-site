// American Caffetteria Official Menu Data (Full 73 Items across 10 Categories)
// Synchronized across Web App, Mobile PWA, Admin Panel, and Telegram Bot Server

window.menuCategories = [
  {
    "id": "all",
    "ru": "Все меню",
    "uz": "Barcha menyu",
    "en": "Full Menu",
    "icon": "ti-apps"
  },
  {
    "id": "burgers",
    "ru": "Бургеры",
    "uz": "Burgerlar",
    "en": "Burgers",
    "icon": "ti-burger"
  },
  {
    "id": "pizza",
    "ru": "American Pizza",
    "uz": "American Pitsa",
    "en": "American Pizza",
    "icon": "ti-pizza"
  },
  {
    "id": "lavash",
    "ru": "Лаваш и донер",
    "uz": "Lavash va donar",
    "en": "Lavash & Doner",
    "icon": "ti-meat"
  },
  {
    "id": "pide",
    "ru": "Турецкое пиде",
    "uz": "Turkcha pide",
    "en": "Turkish Pide",
    "icon": "ti-flame"
  },
  {
    "id": "hotdogs",
    "ru": "Хот-доги и сэндвичи",
    "uz": "Hot-dog va sendvichlar",
    "en": "Hot Dogs & Sandwiches",
    "icon": "ti-bread"
  },
  {
    "id": "snacks",
    "ru": "Снэки и фри",
    "uz": "Qarsildoq gazaklar",
    "en": "Snacks & Fries",
    "icon": "ti-fries"
  },
  {
    "id": "salads",
    "ru": "Свежие салаты",
    "uz": "Yangi salatlar",
    "en": "Fresh Salads",
    "icon": "ti-salad"
  },
  {
    "id": "sushi",
    "ru": "Суши и роллы",
    "uz": "Sushi va rollar",
    "en": "Sushi & Rolls",
    "icon": "ti-fish"
  },
  {
    "id": "desserts",
    "ru": "Десерты и вафли",
    "uz": "Shirinliklar va vaflilar",
    "en": "Desserts & Waffles",
    "icon": "ti-cake"
  },
  {
    "id": "tea",
    "ru": "Чайная коллекция",
    "uz": "Choylar to'plami",
    "en": "Tea Collection",
    "icon": "ti-mug"
  },
  {
    "id": "drinks",
    "ru": "Прохладительные напитки",
    "uz": "Salqin ichimliklar",
    "en": "Cold Drinks",
    "icon": "ti-cup"
  }
];

window.menuItems = [
  {
    "id": "burger_gamburger",
    "category": "burgers",
    "image": "images/food/burger_gamburger.jpg",
    "badge": {
      "ru": "КЛАССИКА",
      "uz": "KLASSIK",
      "en": "CLASSIC"
    },
    "price": 35000,
    "weight": "280 г",
    "weight_i18n": {
      "ru": "280 г",
      "uz": "280 g",
      "en": "280 g"
    },
    "name": {
      "ru": "Гамбургер",
      "uz": "Gamburger",
      "en": "Classic Hamburger"
    },
    "desc": {
      "ru": "Сочная котлета из 100% халяльной говядины на открытом гриле, свежие томаты, маринованные огурчики, хрустящий айсберг и фирменный бургер-соус на мягкой кунжутной булочке.",
      "uz": "100% halol mol go'shtidan grilda pishirilgan sersuv kotlet, yangi pomidor, tuzlangan bodring, aysberg salati va maxsus sous.",
      "en": "Flame-grilled 100% halal beef patty, fresh tomatoes, tangy pickles, crisp iceberg lettuce, and signature burger sauce in a soft sesame bun."
    }
  },
  {
    "id": "burger_chizburger",
    "category": "burgers",
    "image": "images/food/burger_chizburger.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 38000,
    "weight": "300 г",
    "weight_i18n": {
      "ru": "300 г",
      "uz": "300 g",
      "en": "300 g"
    },
    "name": {
      "ru": "Чизбургер",
      "uz": "Chizburger",
      "en": "Cheeseburger"
    },
    "desc": {
      "ru": "Говяжья котлета на углях под расплавленным сыром Чеддер со свежими томатами, хрустящим салатом, маринованным огурчиком и сливочным соусом.",
      "uz": "Eritilgan Chedder pishlog'i bilan qoplangan mol go'shti kotleti, barra pomidor, tuzlangan bodring va maxsus sous.",
      "en": "Char-grilled halal beef patty topped with melted American Cheddar cheese, fresh tomatoes, crisp lettuce, pickles, and creamy house sauce."
    }
  },
  {
    "id": "burger_big",
    "category": "burgers",
    "image": "images/food/burger_big.jpg",
    "badge": {
      "ru": "ДВОЙНОЙ",
      "uz": "IKKI HISSA",
      "en": "DOUBLE"
    },
    "price": 45000,
    "weight": "380 г",
    "weight_i18n": {
      "ru": "380 г",
      "uz": "380 g",
      "en": "380 g"
    },
    "name": {
      "ru": "Биг Бургер",
      "uz": "Big Burger",
      "en": "Big Double Burger"
    },
    "desc": {
      "ru": "Двойная порция сочной говядины с дымком, свежие овощи, красный лук, маринованные огурчики и фирменный соус в пышной булочке бриошь.",
      "uz": "Ikki qavatli sersuv mol go'shti kotleti, yangi sabzavotlar, qizil piyoz, tuzlangan bodring va maxsus sous.",
      "en": "Double flame-grilled beef patties layered with fresh tomatoes, red onion rings, pickles, crisp lettuce, and smoky burger glaze."
    }
  },
  {
    "id": "burger_big_chiz",
    "category": "burgers",
    "image": "images/food/burger_big_chiz.jpg",
    "badge": {
      "ru": "ХИТ ПРОДАЖ",
      "uz": "ENG XARIDORGIR",
      "en": "BESTSELLER"
    },
    "price": 49000,
    "weight": "420 г",
    "weight_i18n": {
      "ru": "420 г",
      "uz": "420 g",
      "en": "420 g"
    },
    "name": {
      "ru": "Биг Чизбургер",
      "uz": "Big Chizburger",
      "en": "Big Double Cheeseburger"
    },
    "desc": {
      "ru": "Две мощные говяжьи котлеты на гриле, двойной слой тягучего сыра Чеддер, томаты, маринованные огурцы и фирменный соус шефа.",
      "uz": "Ikkita sersuv mol go'shti kotleti, ikki hissa eritilgan Chedder pishlog'i, pomidor, bodring va maxsus sous.",
      "en": "Two hearty grilled halal beef patties, double melted Cheddar cheese, fresh tomatoes, pickles, and signature chef's sauce."
    }
  },
  {
    "id": "american_burger",
    "category": "burgers",
    "image": "images/food/american_burger.jpg",
    "badge": {
      "ru": "ФИРМЕННЫЙ",
      "uz": "MAXSUS",
      "en": "SIGNATURE"
    },
    "price": 52000,
    "weight": "400 г",
    "weight_i18n": {
      "ru": "400 г",
      "uz": "400 g",
      "en": "400 g"
    },
    "name": {
      "ru": "American Бургер",
      "uz": "American Burger",
      "en": "Signature American Burger"
    },
    "desc": {
      "ru": "Фирменный бургер кафе: сочная котлета из мраморной говядины, обжаренные слайсы халяльного говяжьего бекона, сыр Чеддер, томаты, красный лук и соус барбекю.",
      "uz": "Kafemizning maxsus burgeri: sersuv mol go'shti kotleti, qovurilgan halol mol bekoni, Chedder pishlog'i, pomidor va BBQ sousi.",
      "en": "House signature burger with a thick flame-grilled beef patty, crispy halal beef bacon strips, melted Cheddar, red onion, tomato, and smoky BBQ sauce."
    }
  },
  {
    "id": "burger_mini_gam",
    "category": "burgers",
    "image": "images/food/burger_mini_gam.jpg",
    "badge": {
      "ru": "СЕТ 5 ШТ",
      "uz": "SET 5 DONA",
      "en": "5 PCS SET"
    },
    "price": 90000,
    "weight": "750 г · 5 шт",
    "weight_i18n": {
      "ru": "750 г · 5 шт",
      "uz": "750 g · 5 dona",
      "en": "750 g · 5 pcs"
    },
    "name": {
      "ru": "Мини-гамбургеры (5 шт)",
      "uz": "Mini Gamburger (5 dona)",
      "en": "Mini Beef Sliders (5 pcs)"
    },
    "desc": {
      "ru": "Набор из 5 сочных мини-гамбургеров с говяжьей котлетой на гриле, свежими овощами и фирменным соусом. Отличный выбор для компании!",
      "uz": "Do'stlar давраси uchun 5 ta sersuv mini-gamburger to'plami: mol go'shti kotleti, barra sabzavotlar va maxsus sous.",
      "en": "Box of 5 gourmet mini beef sliders with flame-grilled patties, fresh veggies, and house sauce — ideal for sharing."
    }
  },
  {
    "id": "burger_mini_chicken",
    "category": "burgers",
    "image": "images/food/burger_mini_chicken.jpg",
    "badge": {
      "ru": "СЕТ 5 ШТ",
      "uz": "SET 5 DONA",
      "en": "5 PCS SET"
    },
    "price": 80000,
    "weight": "750 г · 5 шт",
    "weight_i18n": {
      "ru": "750 г · 5 шт",
      "uz": "750 g · 5 dona",
      "en": "750 g · 5 pcs"
    },
    "name": {
      "ru": "Мини-чикенбургеры (5 шт)",
      "uz": "Mini Chikenburger (5 dona)",
      "en": "Mini Chicken Sliders (5 pcs)"
    },
    "desc": {
      "ru": "Набор из 5 хрустящих мини-бургеров с нежным куриным филе в золотистой панировке, свежим салатом и сливочно-чесночным соусом.",
      "uz": "Oltinrang qarsildoq tovuq filesi, yangi salat bargi va qaymoqli sousga ega 5 ta mini-burger to'plami.",
      "en": "Box of 5 crispy breaded chicken breast sliders with fresh lettuce and creamy garlic ranch dressing."
    }
  },
  {
    "id": "pizza_qazili",
    "category": "pizza",
    "image": "images/food/pizza_qazili.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 100000,
    "prices": [
      100000,
      120000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 100000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 120000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца с Казы (Qazili)",
      "uz": "Qazili Pitsa",
      "en": "Qazi Horsemeat Pizza"
    },
    "desc": {
      "ru": "Аппетитная пицца с деликатесными кружочками узбекского казы, тягучей моцареллой, томатным соусом со специями и зеленью.",
      "uz": "Xushbo'y o'zbek qazisi bo'laklari, cho'ziluvchan motsarella pishlog'i va maxsus pomidor sousi bilan tayyorlangan pitsa.",
      "en": "Signature pizza topped with savory traditional Uzbek horsemeat sausage (Qazi), melted mozzarella, and spiced tomato sauce."
    }
  },
  {
    "id": "pizza_miks",
    "category": "pizza",
    "image": "images/food/pizza_miks.jpg",
    "badge": {
      "ru": "АССОРТИ",
      "uz": "ASSORTI",
      "en": "SUPREME"
    },
    "price": 90000,
    "prices": [
      90000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 90000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Микс",
      "uz": "Pitsa Miks",
      "en": "Mix Supreme Pizza"
    },
    "desc": {
      "ru": "Богатое мясное ассорти: говядина, куриное филе, пепперони, шампиньоны, сладкий перец, маслины и двойной слой моцареллы.",
      "uz": "Go'shtli assorti: mol go'shti, tovuq filesi, pepperoni, qo'ziqorin, bulg'or qalampiri, zaytun va motsarella pishlog'i.",
      "en": "Loaded supreme pizza with beef, chicken breast, halal pepperoni, mushrooms, bell peppers, black olives, and mozzarella."
    }
  },
  {
    "id": "pizza_peperoni",
    "category": "pizza",
    "image": "images/food/pizza_peperoni.jpg",
    "badge": {
      "ru": "ХИТ ПРОДАЖ",
      "uz": "XIT",
      "en": "BESTSELLER"
    },
    "price": 85000,
    "prices": [
      85000,
      95000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 85000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 95000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Пепперони",
      "uz": "Pitsa Pepperoni",
      "en": "Pepperoni Pizza"
    },
    "desc": {
      "ru": "Классическая американская пицца с хрустящими пикантными колбасками халяль-пепперони, сливочной моцареллой и соусом из спелых томатов.",
      "uz": "Qarsildoq halol pepperoni kolbasalari, motsarella pishlog'i va pomidor sousidan tayyorlangan klassik pitsa.",
      "en": "Classic American pizza loaded with crispy halal beef pepperoni slices, bubbling mozzarella cheese, and rich marinara sauce."
    }
  },
  {
    "id": "pizza_sosiska",
    "category": "pizza",
    "image": "images/food/pizza_sosiska.jpg",
    "badge": null,
    "price": 75000,
    "prices": [
      75000,
      85000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 75000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 85000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца с сосисками",
      "uz": "Sosiskali Pitsa",
      "en": "Sausage Pizza"
    },
    "desc": {
      "ru": "Любимая семейная пицца с нежными подкопченными сосисками, тягучим сыром моцарелла, сладкой кукурузой и фирменным томатным соусом.",
      "uz": "Dudlangan mazali sosiskalar, motsarella pishlog'i, shirin makkajo'xori va pomidor sousi bilan oilaviy pitsa.",
      "en": "Family favorite pizza topped with smoky beef sausages, sweet corn, melted mozzarella, and classic tomato sauce."
    }
  },
  {
    "id": "pizza_tovuqli",
    "category": "pizza",
    "image": "images/food/pizza_tovuqli.jpg",
    "badge": null,
    "price": 85000,
    "prices": [
      85000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 85000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца с курицей",
      "uz": "Tovuq go'shtli Pitsa",
      "en": "Chicken Supreme Pizza"
    },
    "desc": {
      "ru": "Нежное маринованное куриное филе на гриле, шампиньоны, сочный болгарский перец, спелые томаты и сливочная моцарелла.",
      "uz": "Grilda pishirilgan yumshoq tovuq filesi, qo'ziqorin, bulg'or qalampiri, pomidor va motsarella pishlog'i.",
      "en": "Tender marinated grilled chicken breast, fresh mushrooms, sweet bell peppers, ripe tomatoes, and melted mozzarella."
    }
  },
  {
    "id": "pizza_mujskoy",
    "category": "pizza",
    "image": "images/food/pizza_mujskoy.jpg",
    "badge": {
      "ru": "МЯСНАЯ",
      "uz": "GO'SHTLI",
      "en": "MEAT FEAST"
    },
    "price": 95000,
    "prices": [
      95000,
      120000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 95000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 120000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Мужской каприз",
      "uz": "Mujskoy Pitsa",
      "en": "Meat Lover's Pizza"
    },
    "desc": {
      "ru": "Мощная мясная пицца: рубленая говядина, казы, копченая индейка, пепперони, охотничьи колбаски и много расплавленного сыра.",
      "uz": "To'yimli go'shtli pitsa: mol go'shti, qazi, dudlangan kurka, pepperoni, ovchi kolbasalari va ko'p pishloq.",
      "en": "Hearty four-meat pizza loaded with roast beef, qazi sausage, smoked turkey, pepperoni, hunter sausages, and extra cheese."
    }
  },
  {
    "id": "pizza_monaco",
    "category": "pizza",
    "image": "images/food/pizza_monaco.jpg",
    "badge": null,
    "price": 75000,
    "prices": [
      75000,
      90000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 75000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 90000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Монако",
      "uz": "Pitsa Monako",
      "en": "Monaco Pizza"
    },
    "desc": {
      "ru": "Изысканное сочетание нежной ветчины из индейки, свежих шампиньонов, маслин, сладкого перца и тягучей моцареллы под сливочно-томатным соусом.",
      "uz": "Kurka vetchinasi, yangi qo'ziqorinlar, zaytun, bulg'or qalampiri va motsarella pishlog'ining nafis uyg'unligi.",
      "en": "Delicate turkey ham, sliced mushrooms, black olives, sweet bell peppers, and mozzarella over a creamy tomato base."
    }
  },
  {
    "id": "pizza_margarita",
    "category": "pizza",
    "image": "images/food/pizza_margarita.jpg",
    "badge": {
      "ru": "КЛАССИКА",
      "uz": "KLASSIK",
      "en": "CLASSIC"
    },
    "price": 70000,
    "prices": [
      70000,
      85000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 70000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 85000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Маргарита",
      "uz": "Pitsa Margarita",
      "en": "Margherita Pizza"
    },
    "desc": {
      "ru": "Итальянская классика на тонком тесте: ароматный томатный соус с орегано, двойная моцарелла, спелые томаты и свежий базилик.",
      "uz": "Italyancha klassika: xushbo'y pomidor sousi, ikki hissa motsarella pishlog'i, barra pomidor va rayhon barglari.",
      "en": "Traditional Italian Margherita with herb tomato sauce, double fresh mozzarella, vine-ripened tomatoes, and basil leaves."
    }
  },
  {
    "id": "pizza_chicago",
    "category": "pizza",
    "image": "images/food/pizza_chicago.jpg",
    "badge": {
      "ru": "ФИРМЕННАЯ",
      "uz": "MAXSUS",
      "en": "SIGNATURE"
    },
    "price": 85000,
    "prices": [
      85000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 85000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Чикаго",
      "uz": "Pitsa Chikago",
      "en": "Chicago Pizza"
    },
    "desc": {
      "ru": "Сытная американская пицца с пряной говядиной, куриным филе, зеленым перцем, шампиньонами, красным луком и соусом барбекю.",
      "uz": "Ziravorli mol go'shti, tovuq filesi, yashil qalampir, qo'ziqorin va BBQ sousi bilan boyitilgan Chikago pitsasi.",
      "en": "Rich Chicago-style pizza topped with spiced beef, grilled chicken, green bell peppers, mushrooms, red onion, and BBQ drizzle."
    }
  },
  {
    "id": "pizza_las_vegas",
    "category": "pizza",
    "image": "images/food/pizza_las_vegas.jpg",
    "badge": null,
    "price": 90000,
    "prices": [
      90000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 90000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Лас-Вегас",
      "uz": "Pitsa Las-Vegas",
      "en": "Las Vegas Pizza"
    },
    "desc": {
      "ru": "Яркий вкус: копченая говядина, салями пепперони, маринованные огурчики, халапеньо, сладкий перец и тягучий сыр моцарелла.",
      "uz": "Dudlangan mol go'shti, pepperoni, tuzlangan bodring, xalapenyo va cho'ziluvchan motsarella pishlog'i.",
      "en": "Bold flavor combo of smoked beef, pepperoni, tangy pickles, jalapeno slices, bell peppers, and melted mozzarella."
    }
  },
  {
    "id": "pizza_miami",
    "category": "pizza",
    "image": "images/food/pizza_miami.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 95000,
    "prices": [
      95000,
      120000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 95000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 120000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Майами",
      "uz": "Pitsa Mayami",
      "en": "Miami Pizza"
    },
    "desc": {
      "ru": "Нежное куриное филе, копченая индейка, сочные кусочки ананаса, сладкая кукуруза, болгарский перец и сливочный сыр моцарелла.",
      "uz": "Yumshoq tovuq filesi, dudlangan kurka, sersuv ananas bo'laklari, makkajo'xori va qaymoqli motsarella pishlog'i.",
      "en": "Tropical Miami pizza with grilled chicken breast, smoked turkey, sweet pineapple chunks, corn, and creamy mozzarella."
    }
  },
  {
    "id": "pizza_new_york",
    "category": "pizza",
    "image": "images/food/pizza_new_york.jpg",
    "badge": null,
    "price": 90000,
    "prices": [
      90000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 90000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Нью-Йорк",
      "uz": "Pitsa Nyu-York",
      "en": "New York Pizza"
    },
    "desc": {
      "ru": "Классика Нью-Йорка на тонком хрустящем тесте с говяжьим фаршем, пепперони, томатами, базиликом и двойной порцией моцареллы.",
      "uz": "Yupqa xamirda pishirilgan Nyu-York pitsasi: qiymalangan mol go'shti, pepperoni, pomidor va ikki hissa motsarella.",
      "en": "New York style thin-crust pizza topped with seasoned ground beef, pepperoni, fresh tomatoes, basil, and double mozzarella."
    }
  },
  {
    "id": "pizza_xanter",
    "category": "pizza",
    "image": "images/food/pizza_xanter.jpg",
    "badge": null,
    "price": 85000,
    "prices": [
      85000,
      100000
    ],
    "sizes": [
      {
        "key": "28",
        "price": 85000,
        "label": {
          "ru": "28 см",
          "uz": "28 sm",
          "en": "28 cm"
        }
      },
      {
        "key": "34",
        "price": 100000,
        "label": {
          "ru": "34 см",
          "uz": "34 sm",
          "en": "34 cm"
        }
      }
    ],
    "weight": "28 / 34 см",
    "weight_i18n": {
      "ru": "28 / 34 см",
      "uz": "28 / 34 sm",
      "en": "28 / 34 cm"
    },
    "name": {
      "ru": "Пицца Хантер (Охотничья)",
      "uz": "Pitsa Xanter",
      "en": "Hunter's Sausage Pizza"
    },
    "desc": {
      "ru": "Пикантные охотничьи колбаски с дымком, шампиньоны, маринованные огурчики, маслины, красный лук и расплавленный сыр.",
      "uz": "Dudlangan ovchi kolbasalari, qo'ziqorin, tuzlangan bodring, zaytun, qizil piyoz va eritilgan pishloq.",
      "en": "Smoky hunter sausages, sliced mushrooms, tangy pickles, black olives, red onion, and melted mozzarella cheese."
    }
  },
  {
    "id": "pide_goshtli",
    "category": "pide",
    "image": "images/food/pide_goshtli.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 78000,
    "weight": "350 г",
    "weight_i18n": {
      "ru": "350 г",
      "uz": "350 g",
      "en": "350 g"
    },
    "name": {
      "ru": "Пиде с мясом (Go'shtli)",
      "uz": "Go'shtli Pide",
      "en": "Minced Beef Turkish Pide"
    },
    "desc": {
      "ru": "Традиционная турецкая лодочка из печи с сочным рубленым мясом говядины, томатами, сладким перцем, зеленью и сыром моцарелла.",
      "uz": "Pechda pishirilgan an'anaviy turkcha pide: sersuv mol go'shti qiymasi, pomidor, bulg'or qalampiri va motsarella pishlog'i.",
      "en": "Traditional oven-baked Turkish boat flatbread filled with spiced minced beef, diced tomatoes, bell peppers, herbs, and mozzarella."
    }
  },
  {
    "id": "pide_qazili",
    "category": "pide",
    "image": "images/food/pide_qazili.jpg",
    "badge": {
      "ru": "ДЕЛИКАТЕС",
      "uz": "MAXSUS",
      "en": "SPECIAL"
    },
    "price": 90000,
    "weight": "360 г",
    "weight_i18n": {
      "ru": "360 г",
      "uz": "360 g",
      "en": "360 g"
    },
    "name": {
      "ru": "Пиде с Казы (Qazili)",
      "uz": "Qazili Pide",
      "en": "Qazi & Cheese Turkish Pide"
    },
    "desc": {
      "ru": "Румяная кунжутная лодочка пиде со сливочным сыром моцарелла и ароматными ломтиками настоящего узбекского казы.",
      "uz": "Kunjutli oltinrang pide xamiri ichida eritilgan motsarella pishlog'i va xushbo'y o'zbek qazisi bo'laklari.",
      "en": "Golden sesame-crusted Turkish pide filled with bubbling mozzarella cheese and rich slices of Uzbek Qazi sausage."
    }
  },
  {
    "id": "pide_asalli",
    "category": "pide",
    "image": "images/food/pide_asalli.jpg",
    "badge": {
      "ru": "НЕЖНОЕ",
      "uz": "YUMSHOQ",
      "en": "SWEET & SAVORY"
    },
    "price": 70000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Пиде сырно-медовое (Asalli)",
      "uz": "Asalli Pide",
      "en": "Cheese & Honey Pide"
    },
    "desc": {
      "ru": "Нежнейшее турецкое пиде с тягучим сливочным сыром кашар и моцареллой, политое натуральным горным мёдом и сливочным маслом.",
      "uz": "Eritilgan qaymoqli pishloq, sariyog' va tabiiy tog' asali bilan tayyorlangan betakror turkcha pide.",
      "en": "heavenly Turkish cheese pide with melted kashar and mozzarella cheese, brushed with butter and drizzled with pure floral honey."
    }
  },
  {
    "id": "pide_pepperoni",
    "category": "pide",
    "image": "images/food/pide_pepperoni.jpg",
    "badge": null,
    "price": 70000,
    "weight": "340 г",
    "weight_i18n": {
      "ru": "340 г",
      "uz": "340 g",
      "en": "340 g"
    },
    "name": {
      "ru": "Пиде Пепперони",
      "uz": "Pepperoni Pide",
      "en": "Pepperoni Turkish Pide"
    },
    "desc": {
      "ru": "Хрустящая турецкая лодочка с пикантными колбасками халяль-пепперони, томатным соусом и расплавленным сыром моцарелла.",
      "uz": "Halol pepperoni kolbasalari, pomidor sousi va cho'ziluvchan motsarella pishlog'i bilan pishirilgan pide.",
      "en": "Crispy boat-shaped Turkish pide filled with halal beef pepperoni slices, zesty tomato sauce, and melted mozzarella."
    }
  },
  {
    "id": "lavash_classic",
    "category": "lavash",
    "image": "images/food/lavash_classic.jpg",
    "badge": {
      "ru": "ХИТ ПРОДАЖ",
      "uz": "XIT",
      "en": "BESTSELLER"
    },
    "price": 42000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Лаваш Классический",
      "uz": "Lavash Classic",
      "en": "Classic Beef Lavash"
    },
    "desc": {
      "ru": "Тонкий пшеничный лаваш на гриле с сочным говяжьим донером, спелыми томатами, хрустящим картофелем фри и фирменным соусом.",
      "uz": "Grilda qizartirilgan yupqa lavash ichida sersuv mol go'shti donari, pomidor, qarsildoq fri va maxsus sous.",
      "en": "Grilled flatbread wrap filled with juicy carved beef doner, fresh tomatoes, crispy french fries, and signature sauce."
    }
  },
  {
    "id": "lavash_sirli",
    "category": "lavash",
    "image": "images/food/lavash_sirli.jpg",
    "badge": {
      "ru": "СЫРНЫЙ",
      "uz": "PISHLOQLI",
      "en": "CHEESY"
    },
    "price": 45000,
    "weight": "350 г",
    "weight_i18n": {
      "ru": "350 г",
      "uz": "350 g",
      "en": "350 g"
    },
    "name": {
      "ru": "Лаваш Сырный (Sirli)",
      "uz": "Lavash Sirli",
      "en": "Cheese Beef Lavash"
    },
    "desc": {
      "ru": "Горячий хрустящий лаваш с сочной говядиной, двойной порцией расплавленного сыра Чеддер, свежими томатами и соусом.",
      "uz": "Sersuv mol go'shti, eritilgan Chedder pishlog'i, pomidor va maxsus sousli issiq qarsildoq lavash.",
      "en": "Toasted lavash wrap loaded with juicy beef doner, rich melted Cheddar cheese, fresh tomatoes, crispy fries, and house sauce."
    }
  },
  {
    "id": "tandir_lavash_classic",
    "category": "lavash",
    "image": "images/food/tandir_lavash_classic.jpg",
    "badge": {
      "ru": "ИЗ ПЕЧИ",
      "uz": "TANDIR",
      "en": "TANDOOR"
    },
    "price": 45000,
    "weight": "360 г",
    "weight_i18n": {
      "ru": "360 г",
      "uz": "360 g",
      "en": "360 g"
    },
    "name": {
      "ru": "Тандыр Лаваш Классический",
      "uz": "Tandir Lavash Classic",
      "en": "Classic Tandoor Lavash"
    },
    "desc": {
      "ru": "Запеченный в печи румяный лаваш с черным и белым кунжутом, сочной говядиной, свежими огурчиками, томатами и зеленью.",
      "uz": "Kunjut sepib tandirda qizartirilgan lavash: sersuv mol go'shti, barra bodring, pomidor va ko'katlar.",
      "en": "Oven-baked sesame crusted tandoor lavash stuffed with roasted beef doner, fresh tomatoes, cucumbers, and herbs."
    }
  },
  {
    "id": "tandir_lavash_sirli",
    "category": "lavash",
    "image": "images/food/tandir_lavash_sirli.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 48000,
    "weight": "390 г",
    "weight_i18n": {
      "ru": "390 г",
      "uz": "390 g",
      "en": "390 g"
    },
    "name": {
      "ru": "Тандыр Лаваш Сырный",
      "uz": "Tandir Lavash Sirli",
      "en": "Cheese Tandoor Lavash"
    },
    "desc": {
      "ru": "Хрустящий кунжутный тандыр-лаваш с сочным говяжьим мясом, тягучим расплавленным сыром, томатами и фирменным соусом.",
      "uz": "Tandirda pishirilgan kunjutli lavash ichida sersuv mol go'shti va cho'ziluvchan eritilgan pishloq.",
      "en": "Crispy sesame tandoor-baked lavash bursting with melted cheese, juicy beef doner, ripe tomatoes, and creamy sauce."
    }
  },
  {
    "id": "donar_box",
    "category": "lavash",
    "image": "images/food/donar_box.jpg",
    "badge": null,
    "price": 44000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Донар в лепёшке (Donar Nonda)",
      "uz": "Donar Nonda",
      "en": "Turkish Bread Beef Doner"
    },
    "desc": {
      "ru": "Пышная румяная турецкая лепёшка с кунжутом, щедро начиненная тонко нарезанной говядиной на вертеле, свежими томатами, красным луком, салатом и соусом.",
      "uz": "Kunjutli yumshoq non ichida yupqa kesilgan sersuv mol go'shti donari, pomidor, qizil piyoz, salat bargi va sous.",
      "en": "Fluffy toasted sesame Turkish bread stuffed with thinly sliced rotisserie beef doner, tomatoes, red onion, lettuce, and garlic sauce."
    }
  },
  {
    "id": "pitta_sandwich",
    "category": "lavash",
    "image": "images/food/pitta_sandwich.jpg",
    "badge": {
      "ru": "3 РАЗМЕРА",
      "uz": "3 XIL VAZN",
      "en": "3 SIZES"
    },
    "price": 44000,
    "prices": [
      44000,
      48000,
      52000
    ],
    "sizes": [
      {
        "key": "0",
        "price": 44000,
        "label": {
          "ru": "100 г мяса",
          "uz": "100 g go'sht",
          "en": "100g meat"
        }
      },
      {
        "key": "1",
        "price": 48000,
        "label": {
          "ru": "120 г мяса",
          "uz": "120 g go'sht",
          "en": "120g meat"
        }
      },
      {
        "key": "2",
        "price": 52000,
        "label": {
          "ru": "140 г мяса",
          "uz": "140 g go'sht",
          "en": "140g meat"
        }
      }
    ],
    "weight": "100 / 120 / 140 г",
    "weight_i18n": {
      "ru": "100 / 120 / 140 г",
      "uz": "100 / 120 / 140 g",
      "en": "100 / 120 / 140 g"
    },
    "name": {
      "ru": "Питта Сэндвич",
      "uz": "Pitta Sandwich",
      "en": "Beef Pitta Pocket"
    },
    "desc": {
      "ru": "Мягкий кармашек из греческой питты на гриле с нежными ломтиками говядины (100/120/140 г на выбор), свежими овощами и белым соусом дзадзики.",
      "uz": "Grilda qizartirilgan yumshoq pitta noni ichida sersuv mol go'shti (100/120/140 g), barra sabzavotlar va oq sous.",
      "en": "Warm toasted Greek pita pocket filled with tender grilled beef slices (100g/120g/140g), crisp vegetables, and white herb sauce."
    }
  },
  {
    "id": "american_doner_beef",
    "category": "lavash",
    "image": "images/food/american_doner_beef.jpg",
    "badge": {
      "ru": "ФИРМЕННЫЙ",
      "uz": "MAXSUS",
      "en": "SIGNATURE"
    },
    "price": 25000,
    "prices": [
      25000,
      45000
    ],
    "sizes": [
      {
        "key": "0",
        "price": 25000,
        "label": {
          "ru": "Малый",
          "uz": "Kichik",
          "en": "Small"
        }
      },
      {
        "key": "1",
        "price": 45000,
        "label": {
          "ru": "Большой",
          "uz": "Katta",
          "en": "Large"
        }
      }
    ],
    "weight": "Малый / Большой",
    "weight_i18n": {
      "ru": "Малый / Большой",
      "uz": "Kichik / Katta",
      "en": "Small / Large"
    },
    "name": {
      "ru": "American Донер (Говядина)",
      "uz": "American Doner (Mol go'shti)",
      "en": "American Beef Doner"
    },
    "desc": {
      "ru": "Фирменный американский донер в поджаренной лепёшке на гриле с сочной говядиной, кольцами красного лука, спелыми томатами, сыром и авторским соусом.",
      "uz": "Grilda qizartirilgan maxsus non ichida sersuv mol go'shti donari, qizil piyoz halqalari, pomidor, pishloq va sous.",
      "en": "Signature folded artisan flatbread grilled with juicy beef doner slices, red onion rings, ripe tomatoes, melted cheese, and special sauce."
    }
  },
  {
    "id": "hotdog_classic",
    "category": "hotdogs",
    "image": "images/food/hotdog_classic.jpg",
    "badge": null,
    "price": 25000,
    "weight": "220 г",
    "weight_i18n": {
      "ru": "220 г",
      "uz": "220 g",
      "en": "220 g"
    },
    "name": {
      "ru": "Хот-дог Классический",
      "uz": "Hot-Dog Classic",
      "en": "Classic Hot Dog"
    },
    "desc": {
      "ru": "Мягкая кунжутная булочка, сочная халяльная сосиска на гриле, свежие томаты, огурчики, лист салата, горчица и кетчуп.",
      "uz": "Kunjutli yumshoq bulochka, grilda pishirilgan halol sosiska, yangi pomidor, bodring, salat bargi, xantal va ketchup.",
      "en": "Soft sesame bun with a grilled halal beef sausage, fresh tomato slices, crisp cucumber, lettuce, mustard, and ketchup."
    }
  },
  {
    "id": "hotdog_korolevskiy",
    "category": "hotdogs",
    "image": "images/food/hotdog_korolevskiy.jpg",
    "badge": {
      "ru": "ДВОЙНОЙ",
      "uz": "QIROLLIK",
      "en": "ROYAL"
    },
    "price": 35000,
    "weight": "300 г",
    "weight_i18n": {
      "ru": "300 г",
      "uz": "300 g",
      "en": "300 g"
    },
    "name": {
      "ru": "Хот-дог Королевский",
      "uz": "Hot-Dog Korolevskiy",
      "en": "Royal Double Hot Dog"
    },
    "desc": {
      "ru": "Две сочные подкопченные сосиски на гриле в пышной булочке под шапкой расплавленного сырного соуса, со свежими томатами и маринованными огурчиками.",
      "uz": "Ikkita dudlangan sosiska, eritilgan pishloqli sous, pomidor va tuzlangan bodring bilan to'yimli qirollik xot-dogi.",
      "en": "Two grilled smoked sausages in a toasted sesame bun topped with rich cheddar cheese sauce, ketchup, mayo, tomatoes, and pickles."
    }
  },
  {
    "id": "hotdog_american",
    "category": "hotdogs",
    "image": "images/food/hotdog_american.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 38000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Хот-дог Американский",
      "uz": "Hot-Dog American",
      "en": "American Loaded Hot Dog"
    },
    "desc": {
      "ru": "Большая фермерская сосиска на гриле, ломтики халяльного говяжьего бекона, тягучий сыр Чеддер, хрустящий жареный лук, пикули и соус барбекю.",
      "uz": "Katta gril sosiskasi, halol mol bekoni, Chedder pishlog'i, qarsildoq qovurilgan piyoz, tuzlangan bodring va BBQ sousi.",
      "en": "Loaded American hot dog with a jumbo grilled sausage, crispy halal beef bacon, melted Cheddar, fried onions, pickles, and BBQ glaze."
    }
  },
  {
    "id": "hotdog_goshtli",
    "category": "hotdogs",
    "image": "images/food/hotdog_goshtli.jpg",
    "badge": {
      "ru": "С МЯСОМ",
      "uz": "GO'SHTLI",
      "en": "BEEF & SAUSAGE"
    },
    "price": 42000,
    "weight": "340 г",
    "weight_i18n": {
      "ru": "340 г",
      "uz": "340 g",
      "en": "340 g"
    },
    "name": {
      "ru": "Хот-дог Мясной (Go'shtli)",
      "uz": "Hot-Dog Go'shtli",
      "en": "Meat Lover's Beef Hot Dog"
    },
    "desc": {
      "ru": "Супер-сытный хот-дог: сосиска на гриле плюс щедрая порция обжаренного говяжьего донера, расплавленный сыр, томаты, зелень и фирменный соус.",
      "uz": "Gril sosiskasi hamda sersuv mol go'shti donari, eritilgan pishloq, pomidor va maxsus sousli super to'yimli xot-dog.",
      "en": "Ultimate meat hot dog combining a grilled sausage with tender carved beef doner strips, melted cheese, diced tomatoes, and herb sauce."
    }
  },
  {
    "id": "club_sandwich",
    "category": "hotdogs",
    "image": "images/food/club_sandwich.jpg",
    "badge": {
      "ru": "С ФРИ",
      "uz": "FRI BILAN",
      "en": "WITH FRIES"
    },
    "price": 48000,
    "weight": "380 г",
    "weight_i18n": {
      "ru": "380 г",
      "uz": "380 g",
      "en": "380 g"
    },
    "name": {
      "ru": "Клаб Сэндвич",
      "uz": "Klab Sandwich",
      "en": "Club Sandwich with Fries"
    },
    "desc": {
      "ru": "Трёхслойный тост-сэндвич с куриным филе на гриле, копченой говядиной, сыром Чеддер, яйцом, томатами и свежим салатом. Подается с порцией золотистого фри и кетчупом!",
      "uz": "Tovuq filesi, dudlangan mol go'shti, Chedder pishlog'i, tuxum va sabzavotli 3 qavatli sendvich. Qarsildoq kartoshka fri bilan tortiladi!",
      "en": "Triple-decker toasted club sandwich with grilled chicken breast, smoked beef, Cheddar, egg, tomato, and lettuce, served with golden fries."
    }
  },
  {
    "id": "strips_3dona",
    "category": "snacks",
    "image": "images/food/strips_3dona.jpg",
    "badge": null,
    "price": 25000,
    "weight": "160 г · 3 шт",
    "weight_i18n": {
      "ru": "160 г · 3 шт",
      "uz": "160 g · 3 dona",
      "en": "160 g · 3 pcs"
    },
    "name": {
      "ru": "Куриные стрипсы (3 шт)",
      "uz": "Tovuq stripslari (3 dona)",
      "en": "Crispy Chicken Strips (3 pcs)"
    },
    "desc": {
      "ru": "Три сочных филе куриной грудки в хрустящей золотистой панировке по фирменному рецепту. Подаются с томатным кетчупом.",
      "uz": "Maxsus retsept bo'yicha qarsildoq oltinrang panirovkada pishirilgan 3 dona sersuv tovuq filesi.",
      "en": "Three tender chicken breast strips in a crunchy golden breading, served hot with tomato ketchup."
    }
  },
  {
    "id": "strips_5dona",
    "category": "snacks",
    "image": "images/food/strips_5dona.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "POPULAR"
    },
    "price": 35000,
    "weight": "260 г · 5 шт",
    "weight_i18n": {
      "ru": "260 г · 5 шт",
      "uz": "260 g · 5 dona",
      "en": "260 g · 5 pcs"
    },
    "name": {
      "ru": "Куриные стрипсы (5 шт)",
      "uz": "Tovuq stripslari (5 dona)",
      "en": "Crispy Chicken Strips (5 pcs)"
    },
    "desc": {
      "ru": "Пять больших хрустящих куриных стрипсов из 100% цельного филе со специями и двумя соусами.",
      "uz": "100% tovuq ko'krak filesidan tayyorlangan 5 dona katta qarsildoq strips va sous.",
      "en": "Five large crispy-fried chicken tenderloin strips seasoned with signature spices and served with dipping sauces."
    }
  },
  {
    "id": "fri_classic",
    "category": "snacks",
    "image": "images/food/fri_classic.jpg",
    "badge": null,
    "price": 25000,
    "weight": "180 г",
    "weight_i18n": {
      "ru": "180 г",
      "uz": "180 g",
      "en": "180 g"
    },
    "name": {
      "ru": "Картофель фри Классик",
      "uz": "Kartoshka Fri Classic",
      "en": "Classic French Fries"
    },
    "desc": {
      "ru": "Золотистый хрустящий снаружи и мягкий внутри картофель фри с морской солью и томатным кетчупом.",
      "uz": "Tashqarisi qarsildoq, ichi yumshoq oltinrang kartoshka fri va pomidor ketchupi.",
      "en": "Crispy golden French fries lightly salted and served hot with rich tomato ketchup."
    }
  },
  {
    "id": "fri_derevenskiy",
    "category": "snacks",
    "image": "images/food/fri_derevenskiy.jpg",
    "badge": null,
    "price": 25000,
    "weight": "200 г",
    "weight_i18n": {
      "ru": "200 г",
      "uz": "200 g",
      "en": "200 g"
    },
    "name": {
      "ru": "Картофель по-деревенски",
      "uz": "Jaydari kartoshka (Derevenskiy)",
      "en": "Rustic Potato Wedges"
    },
    "desc": {
      "ru": "Ароматные картофельные дольки с кожурой, запеченные с паприкой, чесноком и пряными травами.",
      "uz": "Paprika, sarimsoq va xushbo'y ko'katlar bilan qovurilgan oltinrang kartoshka bo'laklari.",
      "en": "Seasoned skin-on potato wedges roasted with sweet paprika, garlic, and aromatic herbs."
    }
  },
  {
    "id": "kfc_bayts",
    "category": "snacks",
    "image": "images/food/kfc_bayts.jpg",
    "badge": {
      "ru": "ХРУСТЯЩИЕ",
      "uz": "QARSILDOQ",
      "en": "CRISPY"
    },
    "price": 30000,
    "weight": "200 г",
    "weight_i18n": {
      "ru": "200 г",
      "uz": "200 g",
      "en": "200 g"
    },
    "name": {
      "ru": "Куриные байтсы (KFC Bayts)",
      "uz": "KFC Bayts",
      "en": "Crispy Popcorn Chicken Bites"
    },
    "desc": {
      "ru": "Сочные кусочки куриного филе в пикантной хрустящей панировке с сырным соусом.",
      "uz": "Maxsus qarsildoq panirovkada qovurilgan sersuv tovuq filesi bo'lakchalari (baytslar).",
      "en": "Bite-sized pieces of juicy chicken breast in a spicy crunchy breading, served with cheese dip."
    }
  },
  {
    "id": "salad_istanbul",
    "category": "salads",
    "image": "images/food/salad_istanbul.jpg",
    "badge": {
      "ru": "ФИРМЕННЫЙ",
      "uz": "MAXSUS",
      "en": "SIGNATURE"
    },
    "price": 50000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Салат Истанбул (Istanbul)",
      "uz": "Istanbul salati",
      "en": "Istanbul Signature Salad"
    },
    "desc": {
      "ru": "Отварной говяжий язык соломкой, свежий хрустящий огурец, салатные листья, дробленый жареный миндаль, фисташки и авторская сливочная заправка.",
      "uz": "Qaynatilgan mol tili, barra bodring, salat bargi, qovurilgan bodom, xandon pista va maxsus qaymoqli sous.",
      "en": "Tender julienned boiled beef tongue, crisp cucumbers, fresh lettuce, roasted almonds, pistachios, and signature creamy dressing."
    }
  },
  {
    "id": "salad_pineapple",
    "category": "salads",
    "image": "images/food/salad_pineapple.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 48000,
    "weight": "330 г",
    "weight_i18n": {
      "ru": "330 г",
      "uz": "330 g",
      "en": "330 g"
    },
    "name": {
      "ru": "Салат Ананасовый (Pineapple)",
      "uz": "Pineapple salati",
      "en": "Pineapple Chicken Salad"
    },
    "desc": {
      "ru": "Нежное куриное филе, сочные кусочки тропического ананаса, твердый сыр, свежий айсберг, сладкая кукуруза и легкий сливочный соус.",
      "uz": "Yumshoq tovuq filesi, sersuv ananas bo'laklari, pishloq, aysberg salati, makkajo'xori va yengil sous.",
      "en": "Tender chicken breast, sweet tropical pineapple chunks, aged cheese, crisp iceberg lettuce, sweet corn, and light dressing."
    }
  },
  {
    "id": "salad_grecheskiy",
    "category": "salads",
    "image": "images/food/salad_grecheskiy.jpg",
    "badge": {
      "ru": "СВЕЖИЙ",
      "uz": "YENGIL",
      "en": "FRESH"
    },
    "price": 45000,
    "weight": "300 г",
    "weight_i18n": {
      "ru": "300 г",
      "uz": "300 g",
      "en": "300 g"
    },
    "name": {
      "ru": "Салат Греческий",
      "uz": "Grecheskiy salati",
      "en": "Greek Feta Salad"
    },
    "desc": {
      "ru": "Спелые томаты, хрустящие огурцы, сладкий болгарский перец, маслины Каламата, красный лук, кубики нежного сыра Фета и оливковое масло с орегано.",
      "uz": "Barra pomidor, bodring, bulg'or qalampiri, qora zaytun, Feta pishlog'i va zaytun yog'i.",
      "en": "Ripe tomatoes, crisp cucumbers, bell peppers, black olives, red onion, creamy Feta cheese cubes, and extra virgin olive oil."
    }
  },
  {
    "id": "salad_sezar",
    "category": "salads",
    "image": "images/food/salad_sezar.jpg",
    "badge": {
      "ru": "КЛАССИКА",
      "uz": "KLASSIK",
      "en": "CLASSIC"
    },
    "price": 45000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Салат Цезарь с курицей",
      "uz": "Sezar salati",
      "en": "Chicken Caesar Salad"
    },
    "desc": {
      "ru": "Обжаренное куриное филе на гриле, хрустящие листья романо и айсберга, томаты черри, пшеничные гренки, пармезан и классический соус Цезарь.",
      "uz": "Grilda pishirilgan tovuq filesi, aysberg barglari, cherri pomidorlari, qarsildoq suxariklar, parmezan va Sezar sousi.",
      "en": "Grilled chicken breast, crisp romaine and iceberg lettuce, cherry tomatoes, garlic croutons, shaved Parmesan, and Caesar dressing."
    }
  },
  {
    "id": "salad_apple",
    "category": "salads",
    "image": "images/food/salad_apple.jpg",
    "badge": null,
    "price": 45000,
    "weight": "300 г",
    "weight_i18n": {
      "ru": "300 г",
      "uz": "300 g",
      "en": "300 g"
    },
    "name": {
      "ru": "Салат Эппл (Apple)",
      "uz": "Apple salati",
      "en": "Green Apple & Chicken Salad"
    },
    "desc": {
      "ru": "Освежающее сочетание куриной грудки, хрустящего зеленого яблока Гренни Смит, сельдерея, грецкого ореха, сыра и йогуртово-сливочной заправки.",
      "uz": "Tovuq filesi, qarsildoq yashil olma, yong'oq, pishloq va mayin qaymoqli sous.",
      "en": "Refreshing salad with tender chicken breast, crisp Granny Smith green apple julienne, walnuts, cheese, and creamy dressing."
    }
  },
  {
    "id": "salad_barf",
    "category": "salads",
    "image": "images/food/salad_barf.jpg",
    "badge": null,
    "price": 48000,
    "weight": "320 г",
    "weight_i18n": {
      "ru": "320 г",
      "uz": "320 g",
      "en": "320 g"
    },
    "name": {
      "ru": "Салат Барф (Barf)",
      "uz": "Barf salati",
      "en": "Barf Crispy Beef Salad"
    },
    "desc": {
      "ru": "Сочная говядина соломкой, красная фасоль, сладкий болгарский перец, воздушный тертый сыр, зелень и хрустящий картофель пай.",
      "uz": "Sersuv mol go'shti, qizil loviya, bulg'or qalampiri, mayin qirg'ichlangan pishloq va qarsildoq kartoshka pay.",
      "en": "Tender beef strips, red kidney beans, colorful bell peppers, fluffy grated white cheese, fresh herbs, and crispy potato sticks."
    }
  },
  {
    "id": "salad_mujskoy_kapriz",
    "category": "salads",
    "image": "images/food/salad_mujskoy_kapriz.jpg",
    "badge": {
      "ru": "МЯСНОЙ ХИТ",
      "uz": "GO'SHTLI XIT",
      "en": "MEAT SALAD"
    },
    "price": 48000,
    "weight": "340 г",
    "weight_i18n": {
      "ru": "340 г",
      "uz": "340 g",
      "en": "340 g"
    },
    "name": {
      "ru": "Салат Мужской каприз",
      "uz": "Mujskoy Kapriz salati",
      "en": "Men's Caprice Meat Salad"
    },
    "desc": {
      "ru": "Сытный мясной салат из отварной говядины, копченой индейки, деликатесного казы, сыра, маринованных шампиньонов и фирменного соуса.",
      "uz": "Qaynatilgan mol go'shti, dudlangan kurka, qazi, pishloq, qo'ziqorin va maxsus sousdan tayyorlangan to'yimli salat.",
      "en": "Rich meat salad combining boiled beef, smoked turkey, Uzbek qazi sausage, cheese julienne, marinated mushrooms, and house dressing."
    }
  },
  {
    "id": "salad_american",
    "category": "salads",
    "image": "images/food/salad_american.jpg",
    "badge": {
      "ru": "ФИРМЕННЫЙ",
      "uz": "MAXSUS",
      "en": "SIGNATURE"
    },
    "price": 48000,
    "weight": "350 г",
    "weight_i18n": {
      "ru": "350 г",
      "uz": "350 g",
      "en": "350 g"
    },
    "name": {
      "ru": "Салат Американский",
      "uz": "American salati",
      "en": "American Chef's Salad"
    },
    "desc": {
      "ru": "Фирменный салат шефа: ростбиф на гриле, копченая индейка, сыр Чеддер, томаты черри, сладкая кукуруза, хрустящий айсберг и пикантная заправка.",
      "uz": "Grilda pishirilgan mol go'shti, dudlangan kurka, Chedder pishlog'i, cherri pomidorlari, makkajo'xori va aysberg salati.",
      "en": "Chef's signature salad with grilled roast beef strips, smoked turkey, Cheddar cheese, cherry tomatoes, sweet corn, and iceberg lettuce."
    }
  },
  {
    "id": "sushi_filadelfiya",
    "category": "sushi",
    "image": "images/food/sushi_filadelfiya.jpg",
    "badge": {
      "ru": "ТОП",
      "uz": "TOP",
      "en": "TOP"
    },
    "price": 85000,
    "weight": "8 шт · 260 г",
    "weight_i18n": {
      "ru": "8 шт · 260 г",
      "uz": "8 dona · 260 g",
      "en": "8 pcs · 260 g"
    },
    "name": {
      "ru": "Ролл Филадельфия",
      "uz": "Filadelfiya roll",
      "en": "Philadelphia Salmon Roll"
    },
    "desc": {
      "ru": "Щедрый слой охлажденного норвежского лосося, нежный сливочный сыр Cremette, свежий огурец и отборный рис для суши (8 шт).",
      "uz": "Yangi Norvegiya losos balig'i, mayin qaymoqli Cremette pishlog'i va barra bodring (8 dona).",
      "en": "Generous slices of fresh Norwegian salmon wrapping creamy Philadelphia cheese and crisp cucumber (8 pcs)."
    }
  },
  {
    "id": "sushi_californiya",
    "category": "sushi",
    "image": "images/food/sushi_californiya.jpg",
    "badge": {
      "ru": "КЛАССИКА",
      "uz": "KLASSIK",
      "en": "CLASSIC"
    },
    "price": 80000,
    "weight": "8 шт · 240 г",
    "weight_i18n": {
      "ru": "8 шт · 240 г",
      "uz": "8 dona · 240 g",
      "en": "8 pcs · 240 g"
    },
    "name": {
      "ru": "Ролл Калифорния",
      "uz": "Kaliforniya roll",
      "en": "California Tobiko Roll"
    },
    "desc": {
      "ru": "Снежный краб, спелое авокадо, свежий огурец, японский майонез и яркая хрустящая икра тобико (8 шт).",
      "uz": "Qisqichbaqa go'shti, pishgan avokado, barra bodring va yorqin tobiko uvildrig'i (8 dona).",
      "en": "Snow crab meat, ripe avocado, fresh cucumber, and Japanese mayo coated in vibrant orange tobiko roe (8 pcs)."
    }
  },
  {
    "id": "sushi_filadelfiya_zapechenniy",
    "category": "sushi",
    "image": "images/food/sushi_filadelfiya_zapechenniy.jpg",
    "badge": {
      "ru": "ЗАПЕЧЕННЫЙ",
      "uz": "PISHIRILGAN",
      "en": "BAKED"
    },
    "price": 110000,
    "weight": "8 шт · 290 г",
    "weight_i18n": {
      "ru": "8 шт · 290 г",
      "uz": "8 dona · 290 g",
      "en": "8 pcs · 290 g"
    },
    "name": {
      "ru": "Филадельфия Запеченный",
      "uz": "Filadelfiya Zapechenniy",
      "en": "Baked Philadelphia Roll"
    },
    "desc": {
      "ru": "Тёплый ролл с норвежским лососем и сливочным сыром под румяной запеченной сырно-икорной шапочкой с соусом унаги и кунжутом (8 шт).",
      "uz": "Losos va qaymoqli pishloqli iliq roll, ustida qizartirib pishirilgan pishloqli qatlam va unagi sousi (8 dona).",
      "en": "Warm salmon and cream cheese roll topped with a golden torched cheese cap, unagi glaze, and toasted sesame seeds (8 pcs)."
    }
  },
  {
    "id": "sushi_chicken_tempura",
    "category": "sushi",
    "image": "images/food/sushi_chicken_tempura.jpg",
    "badge": {
      "ru": "ТЕМПУРА",
      "uz": "TEMPURA",
      "en": "HOT TEMPURA"
    },
    "price": 80000,
    "weight": "8 шт · 270 г",
    "weight_i18n": {
      "ru": "8 шт · 270 г",
      "uz": "8 dona · 270 g",
      "en": "8 pcs · 270 g"
    },
    "name": {
      "ru": "Чикен Темпура (Горячий ролл)",
      "uz": "Chicken Tempura roll",
      "en": "Hot Chicken Tempura Roll"
    },
    "desc": {
      "ru": "Хрустящий горячий ролл в золотистой панировке панко с нежным куриным филе, сливочным сыром, огурцом и соусом унаги (8 шт).",
      "uz": "Issiq qarsildoq panko-tempura roll: tovuq filesi, qaymoqli pishloq, bodring va unagi sousi (8 dona).",
      "en": "Crispy hot panko-fried tempura roll filled with chicken breast, cream cheese, and cucumber, drizzled with unagi sauce (8 pcs)."
    }
  },
  {
    "id": "set_american",
    "category": "sushi",
    "image": "images/food/set_american.jpg",
    "badge": {
      "ru": "СЕТ 32 ШТ",
      "uz": "SET 32 DONA",
      "en": "32 PCS SET"
    },
    "price": 340000,
    "weight": "32 шт · 1100 г",
    "weight_i18n": {
      "ru": "32 шт · 1100 г",
      "uz": "32 dona · 1100 g",
      "en": "32 pcs · 1100 g"
    },
    "name": {
      "ru": "Сет American (32 шт)",
      "uz": "Set American (32 dona)",
      "en": "Grand American Sushi Set (32 pcs)"
    },
    "desc": {
      "ru": "Большой фирменный сет для компании (32 шт): Филадельфия с лососем, Калифорния в тобико, Запеченный ролл под сырной шапочкой и горячий Чикен Темпура.",
      "uz": "Katta kompaniya uchun 32 dona roll to'plami: Filadelfiya, Kaliforniya, Pishirilgan Filadelfiya va issiq Chicken Tempura.",
      "en": "Grand 32-piece platter featuring 4 full rolls: Salmon Philadelphia, California Tobiko, Baked Philadelphia, and Hot Chicken Tempura."
    }
  },
  {
    "id": "waffle_nutella_banan",
    "category": "desserts",
    "image": "images/food/waffle_nutella_banan.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "BESTSELLER"
    },
    "price": 65000,
    "weight": "350 г",
    "weight_i18n": {
      "ru": "350 г",
      "uz": "350 g",
      "en": "350 g"
    },
    "name": {
      "ru": "Бельгийская вафля Нутелла-Банан",
      "uz": "Belgiya vaflisi Nutella-Banan",
      "en": "Belgian Waffle Nutella & Banana"
    },
    "desc": {
      "ru": "Тёплая хрустящая бельгийская вафля, щедро покрытая пастой Nutella, ломтиками спелого банана и свежей клубники.",
      "uz": "Asl Nutella shokolad pastasi, pishgan banan va yangi qulupnay bilan bezatilgan issiq Belgiya vaflisi.",
      "en": "Warm golden Belgian waffle generously topped with original Nutella hazelnut spread, ripe banana slices, and fresh strawberries."
    }
  },
  {
    "id": "waffle_fistashka",
    "category": "desserts",
    "image": "images/food/waffle_fistashka.jpg",
    "badge": {
      "ru": "ФИСТАШКА",
      "uz": "PISTALI",
      "en": "PISTACHIO"
    },
    "price": 65000,
    "weight": "350 г",
    "weight_i18n": {
      "ru": "350 г",
      "uz": "350 g",
      "en": "350 g"
    },
    "name": {
      "ru": "Бельгийская вафля Фисташковая",
      "uz": "Belgiya vaflisi Fistashka",
      "en": "Pistachio Belgian Waffle"
    },
    "desc": {
      "ru": "Ароматная бельгийская вафля с нежным фисташковым кремом, белым и молочным бельгийским шоколадом и дробленой фисташкой.",
      "uz": "Mayin pista kremi, Belgiya shokoladi va maydalangan xandon pista sepilgan xushbo'y vafli.",
      "en": "Crispy Belgian waffle drizzled with rich pistachio cream, Belgian chocolate, and crushed roasted pistachios."
    }
  },
  {
    "id": "waffle_classic",
    "category": "desserts",
    "image": "images/food/waffle_classic.jpg",
    "badge": null,
    "price": 45000,
    "weight": "280 г",
    "weight_i18n": {
      "ru": "280 г",
      "uz": "280 g",
      "en": "280 g"
    },
    "name": {
      "ru": "Бельгийская вафля Классическая",
      "uz": "Belgiya vaflisi Classic",
      "en": "Classic Chocolate Belgian Waffle"
    },
    "desc": {
      "ru": "Свежевыпеченная золотистая бельгийская вафля с топпингом из тёплого молочного шоколада и сахарной пудрой.",
      "uz": "Issiq sutli shokolad va shakar upasi bilan tortiladigan yangi pishirilgan oltinrang Belgiya vaflisi.",
      "en": "Freshly baked golden Belgian waffle drizzled with warm milk chocolate ganache and powdered sugar."
    }
  },
  {
    "id": "san_sebastian_lotus",
    "category": "desserts",
    "image": "images/food/san_sebastian_lotus.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 65000,
    "weight": "260 г",
    "weight_i18n": {
      "ru": "260 г",
      "uz": "260 g",
      "en": "260 g"
    },
    "name": {
      "ru": "Сан-Себастьян Lotus Biscoff",
      "uz": "San-Sebastyan Lotus",
      "en": "San Sebastian Lotus Cheesecake"
    },
    "desc": {
      "ru": "Нежнейший кремовый чизкейк Сан-Себастьян с карамельной пастой, крошкой и цельным бельгийским печеньем Lotus Biscoff.",
      "uz": "Karamelli Lotus Biscoff pastasi va qarsildoq pechenyesi bilan bezatilgan mayin San-Sebastyan chizkeyki.",
      "en": "Creamy burnt Basque San Sebastian cheesecake topped with warm melted Lotus Biscoff spread, cookie crumbles, and a Lotus biscuit."
    }
  },
  {
    "id": "san_sebastian_bounty",
    "category": "desserts",
    "image": "images/food/san_sebastian_bounty.jpg",
    "badge": null,
    "price": 65000,
    "weight": "260 г",
    "weight_i18n": {
      "ru": "260 г",
      "uz": "260 g",
      "en": "260 g"
    },
    "name": {
      "ru": "Сан-Себастьян Баунти",
      "uz": "San-Sebastyan Bounty",
      "en": "San Sebastian Bounty Cheesecake"
    },
    "desc": {
      "ru": "Тающий во рту чизкейк Сан-Себастьян под волной тёплого молочного шоколада с кокосовой стружкой и конфетой Bounty.",
      "uz": "Issiq sutli shokolad, kokos qirindisi va Bounty shokoladi bilan tortiladigan San-Sebastyan chizkeyki.",
      "en": "Velvety San Sebastian cheesecake poured with warm milk chocolate ganache, shredded coconut flakes, and a Bounty bar piece."
    }
  },
  {
    "id": "san_sebastian_oreo",
    "category": "desserts",
    "image": "images/food/san_sebastian_oreo.jpg",
    "badge": null,
    "price": 65000,
    "weight": "260 г",
    "weight_i18n": {
      "ru": "260 г",
      "uz": "260 g",
      "en": "260 g"
    },
    "name": {
      "ru": "Сан-Себастьян Орео",
      "uz": "San-Sebastyan Oreo",
      "en": "San Sebastian Oreo Cheesecake"
    },
    "desc": {
      "ru": "Испанский запеченный чизкейк Сан-Себастьян с топпингом из бельгийского шоколада и хрустящим печеньем Oreo.",
      "uz": "Belgiya shokoladi va qarsildoq Oreo pechenyesi bilan boyitilgan mayin San-Sebastyan chizkeyki.",
      "en": "Creamy Basque cheesecake drenched in rich chocolate ganache and topped with crunchy Oreo cookies."
    }
  },
  {
    "id": "san_sebastian_qulupnay",
    "category": "desserts",
    "image": "images/food/san_sebastian_qulupnay.jpg",
    "badge": {
      "ru": "С КЛУБНИКОЙ",
      "uz": "QULUPNAYLI",
      "en": "STRAWBERRY"
    },
    "price": 65000,
    "weight": "270 г",
    "weight_i18n": {
      "ru": "270 г",
      "uz": "270 g",
      "en": "270 g"
    },
    "name": {
      "ru": "Сан-Себастьян Нутелла-Клубника",
      "uz": "San-Sebastyan Nutella Qulupnay",
      "en": "San Sebastian Nutella & Strawberry"
    },
    "desc": {
      "ru": "Воздушный сливочный чизкейк Сан-Себастьян, политый тёплой пастой Nutella и украшенный сочной свежей клубникой.",
      "uz": "Issiq Nutella shokolad pastasi va barra qulupnay mevalari bilan bezatilgan San-Sebastyan chizkeyki.",
      "en": "Rich San Sebastian cheesecake drizzled with warm Nutella chocolate-hazelnut spread and garnished with fresh ripe strawberries."
    }
  },
  {
    "id": "san_sebastian_fistashka",
    "category": "desserts",
    "image": "images/food/san_sebastian_fistashka.jpg",
    "badge": {
      "ru": "ПРЕМИУМ",
      "uz": "PREMIUM",
      "en": "PREMIUM"
    },
    "price": 65000,
    "weight": "270 г",
    "weight_i18n": {
      "ru": "270 г",
      "uz": "270 g",
      "en": "270 g"
    },
    "name": {
      "ru": "Сан-Себастьян Фисташковый",
      "uz": "San-Sebastyan Fistashka",
      "en": "Pistachio San Sebastian Cheesecake"
    },
    "desc": {
      "ru": "Изысканный чизкейк Сан-Себастьян под густым соусом из иранской фисташки с россыпью дробленых фисташковых орешков.",
      "uz": "Qalin Eron pistasi sousi va maydalangan xandon pista bilan qoplangan San-Sebastyan chizkeyki.",
      "en": "Decadent San Sebastian cheesecake draped in velvety green Iranian pistachio cream and crushed roasted pistachios."
    }
  },
  {
    "id": "san_sebastian_raffaello",
    "category": "desserts",
    "image": "images/food/san_sebastian_raffaello.jpg",
    "badge": null,
    "price": 65000,
    "weight": "260 г",
    "weight_i18n": {
      "ru": "260 г",
      "uz": "260 g",
      "en": "260 g"
    },
    "name": {
      "ru": "Сан-Себастьян Raffaello",
      "uz": "San-Sebastyan Raffaello",
      "en": "San Sebastian Raffaello Cheesecake"
    },
    "desc": {
      "ru": "Нежный сливочный чизкейк Сан-Себастьян под соусом из белого бельгийского шоколада с миндалем, кокосом и конфетой Raffaello.",
      "uz": "Oq Belgiya shokoladi, bodom, kokos va Raffaello shirinligi bilan bezatilgan San-Sebastyan chizkeyki.",
      "en": "Creamy San Sebastian cheesecake topped with melted white chocolate, coconut flakes, almonds, and a Raffaello praline."
    }
  },
  {
    "id": "tea_marakanskiy",
    "category": "tea",
    "image": "images/food/tea_marakanskiy.jpg",
    "badge": {
      "ru": "ЧАЙНИК 1 Л",
      "uz": "CHOYNAK 1 L",
      "en": "1L TEAPOT"
    },
    "price": 45000,
    "weight": "Чайник 1 л",
    "weight_i18n": {
      "ru": "Чайник 1 л",
      "uz": "Choynak 1 l",
      "en": "1L Teapot"
    },
    "name": {
      "ru": "Марокканский / Турецкий чай",
      "uz": "Turk / Marokash choyi",
      "en": "Moroccan & Turkish Spiced Tea"
    },
    "desc": {
      "ru": "Согревающий авторский чай со свежей мятой, палочками корицы, бадьяном, гвоздикой, цедрой цитрусовых и натуральным мёдом.",
      "uz": "Yangi yalpiz, dolchin, badyan, sitrus mevalari va asal qo'shib damlangan xushbo'y choy (1 litr).",
      "en": "Aromatic warming teapot brewed with fresh mint leaves, cinnamon sticks, star anise, citrus peel, and honey (1L)."
    }
  },
  {
    "id": "tea_sitrus",
    "category": "tea",
    "image": "images/food/tea_sitrus.jpg",
    "badge": {
      "ru": "ВИТАМИННЫЙ",
      "uz": "MEVALI",
      "en": "FRUIT TEA"
    },
    "price": 30000,
    "weight": "Чайник 800 мл",
    "weight_i18n": {
      "ru": "Чайник 800 мл",
      "uz": "Choynak 800 ml",
      "en": "800ml Teapot"
    },
    "name": {
      "ru": "Фруктово-ягодный цитрусовый чай",
      "uz": "Meva va rezavorli sitrus choy",
      "en": "Citrus & Berry Fruit Tea"
    },
    "desc": {
      "ru": "Насыщенный витаминный чай с дольками свежего апельсина, лимона, лайма, лесными ягодами и веточкой мяты.",
      "uz": "Yangi apelsin, limon, laym bo'laklari, rezavor mevalar va yalpizli vitaminlarga boy choy.",
      "en": "Refreshing vitamin teapot infused with fresh orange, lemon, and lime slices, mixed berries, and mint leaves."
    }
  },
  {
    "id": "tea_tinchlantiruvchi",
    "category": "tea",
    "image": "images/food/tea_tinchlantiruvchi.jpg",
    "badge": null,
    "price": 30000,
    "weight": "Чайник 800 мл",
    "weight_i18n": {
      "ru": "Чайник 800 мл",
      "uz": "Choynak 800 ml",
      "en": "800ml Teapot"
    },
    "name": {
      "ru": "Успокаивающий травяной чай",
      "uz": "Tinchlantiruvchi giyohli choy",
      "en": "Calming Herbal Tea"
    },
    "desc": {
      "ru": "Ароматный травяной сбор из горной ромашки, мелиссы, чабреца, мяты и липового цвета для уюта и гармонии.",
      "uz": "Tog' moychechagi, melissa, kiyiko't va yalpizdan tayyorlangan xushbo'y tinchlantiruvchi choy.",
      "en": "Soothing herbal infusion of mountain chamomile, lemon balm, wild thyme, and fresh mint leaves."
    }
  },
  {
    "id": "tea_qora_kok",
    "category": "tea",
    "image": "images/food/tea_qora_kok.jpg",
    "badge": null,
    "price": 12000,
    "weight": "Чайник 800 мл",
    "weight_i18n": {
      "ru": "Чайник 800 мл",
      "uz": "Choynak 800 ml",
      "en": "800ml Teapot"
    },
    "name": {
      "ru": "Чёрный / Зелёный чай с лимоном",
      "uz": "Qora / Ko'k choy",
      "en": "Classic Black or Green Tea"
    },
    "desc": {
      "ru": "Классический крупнолистовой цейлонский чёрный или отборный зелёный чай в чайнике со свежим лимоном.",
      "uz": "Yirik bargli klassik qora yoki ko'k choy (800 ml choynakda).",
      "en": "Classic loose-leaf Ceylon black tea or premium green tea served in an 800ml teapot."
    }
  },
  {
    "id": "shake_karamel",
    "category": "drinks",
    "image": "images/food/shake_karamel.jpg",
    "badge": {
      "ru": "ХИТ",
      "uz": "XIT",
      "en": "HIT"
    },
    "price": 30000,
    "weight": "400 мл",
    "weight_i18n": {
      "ru": "400 мл",
      "uz": "400 ml",
      "en": "400 ml"
    },
    "name": {
      "ru": "Милкшейк Карамельный",
      "uz": "Milksheyk Karamel",
      "en": "Salted Caramel Milkshake"
    },
    "desc": {
      "ru": "Густой холодный молочный коктейль из сливочного пломбира с карамельным сиропом и шапкой взбитых сливок.",
      "uz": "Qaymoqli muzqaymoq, karamel siropi va ko'pirtirilgan qaymoqli muzdek sutli kokteyl.",
      "en": "Thick creamy vanilla ice cream milkshake swirled with rich caramel sauce and topped with whipped cream."
    }
  },
  {
    "id": "drink_coca_cola_05",
    "category": "drinks",
    "image": "images/food/drink_coca_cola_05.jpg",
    "badge": null,
    "price": 10000,
    "weight": "0.5 л",
    "weight_i18n": {
      "ru": "0.5 л",
      "uz": "0.5 l",
      "en": "0.5 L"
    },
    "name": {
      "ru": "Coca-Cola 0.5 л",
      "uz": "Coca-Cola 0.5 l",
      "en": "Coca-Cola 0.5L"
    },
    "desc": {
      "ru": "Освежающий классический напиток Coca-Cola охлажденный (0.5 л).",
      "uz": "Muzdek klassik Coca-Cola ichimligi (0.5 l).",
      "en": "Chilled classic Coca-Cola bottle (0.5L)."
    }
  },
  {
    "id": "drink_coca_cola_15",
    "category": "drinks",
    "image": "images/food/drink_coca_cola_15.jpg",
    "badge": {
      "ru": "ДЛЯ КОМПАНИИ",
      "uz": "1.5 LITR",
      "en": "1.5L BOTTLE"
    },
    "price": 18000,
    "weight": "1.5 л",
    "weight_i18n": {
      "ru": "1.5 л",
      "uz": "1.5 l",
      "en": "1.5 L"
    },
    "name": {
      "ru": "Coca-Cola 1.5 л",
      "uz": "Coca-Cola 1.5 l",
      "en": "Coca-Cola 1.5L"
    },
    "desc": {
      "ru": "Большая семейная бутылка охлажденной Coca-Cola (1.5 л) — идеально к пицце и бургерам.",
      "uz": "Pitsa va burgerlar uchun katta oilaviy muzdek Coca-Cola (1.5 l).",
      "en": "Family-size chilled Coca-Cola bottle (1.5L) — great with pizza and burgers."
    }
  },
  {
    "id": "drink_fanta_05",
    "category": "drinks",
    "image": "images/food/drink_fanta_05.jpg",
    "badge": null,
    "price": 10000,
    "weight": "0.5 л",
    "weight_i18n": {
      "ru": "0.5 л",
      "uz": "0.5 l",
      "en": "0.5 L"
    },
    "name": {
      "ru": "Fanta Апельсин 0.5 л",
      "uz": "Fanta 0.5 l",
      "en": "Fanta Orange 0.5L"
    },
    "desc": {
      "ru": "Яркий искрящийся напиток Fanta со вкусом сочного апельсина (0.5 л).",
      "uz": "Apelsin ta'mli muzdek Fanta ichimligi (0.5 l).",
      "en": "Chilled sparkling Fanta Orange bottle (0.5L)."
    }
  },
  {
    "id": "drink_sprite_05",
    "category": "drinks",
    "image": "images/food/drink_sprite_05.jpg",
    "badge": null,
    "price": 10000,
    "weight": "0.5 л",
    "weight_i18n": {
      "ru": "0.5 л",
      "uz": "0.5 l",
      "en": "0.5 L"
    },
    "name": {
      "ru": "Sprite Лимон-Лайм 0.5 л",
      "uz": "Sprite 0.5 l",
      "en": "Sprite Lemon-Lime 0.5L"
    },
    "desc": {
      "ru": "Освежающий напиток Sprite со вкусом лимона и лайма (0.5 л).",
      "uz": "Limon va laym ta'mli tetiklashtiruvchi Sprite ichimligi (0.5 l).",
      "en": "Crisp lemon-lime Sprite bottle (0.5L)."
    }
  },
  {
    "id": "drink_water_05",
    "category": "drinks",
    "image": "images/food/drink_water_05.jpg",
    "badge": null,
    "price": 5000,
    "weight": "0.5 л",
    "weight_i18n": {
      "ru": "0.5 л",
      "uz": "0.5 l",
      "en": "0.5 L"
    },
    "name": {
      "ru": "Вода чистая без газа 0.5 л",
      "uz": "Toza ichimlik suvi (gazsiz) 0.5 l",
      "en": "Still Mineral Water 0.5L"
    },
    "desc": {
      "ru": "Чистая родниковая питьевая вода без газа (0.5 л).",
      "uz": "Gazsiz toza tog' ichimlik suvi (0.5 l).",
      "en": "Pure still spring drinking water (0.5L)."
    }
  },
  {
    "id": "drink_fanta_15",
    "category": "drinks",
    "image": "images/food/drink_fanta_15.jpg",
    "badge": {
      "ru": "ДЛЯ КОМПАНИИ",
      "uz": "1.5 LITR",
      "en": "1.5L BOTTLE"
    },
    "price": 18000,
    "weight": "1.5 л",
    "weight_i18n": {
      "ru": "1.5 л",
      "uz": "1.5 l",
      "en": "1.5 L"
    },
    "name": {
      "ru": "Fanta Апельсин 1.5 л",
      "uz": "Fanta 1.5 l",
      "en": "Fanta Orange 1.5L"
    },
    "desc": {
      "ru": "Большая семейная бутылка сильногазированного апельсинового напитка Fanta (1.5 л). Идеально к пицце и бургерам.",
      "uz": "Katta 1.5 litrli Fanta apelsinli salqin ichimligi. Pitsa va burgerlar bilan butun oila va do'stlar uchun ajoyib tanlov.",
      "en": "Family-size chilled sparkling Fanta Orange bottle (1.5L) — perfect pairing for pizza and burgers."
    }
  },
  {
    "id": "drink_sprite_15",
    "category": "drinks",
    "image": "images/food/drink_sprite_15.jpg",
    "badge": {
      "ru": "ДЛЯ КОМПАНИИ",
      "uz": "1.5 LITR",
      "en": "1.5L BOTTLE"
    },
    "price": 18000,
    "weight": "1.5 л",
    "weight_i18n": {
      "ru": "1.5 л",
      "uz": "1.5 l",
      "en": "1.5 L"
    },
    "name": {
      "ru": "Sprite Лимон-Лайм 1.5 л",
      "uz": "Sprite 1.5 l",
      "en": "Sprite Lemon-Lime 1.5L"
    },
    "desc": {
      "ru": "Освежающий сильногазированный напиток Sprite с ярким вкусом лимона и лайма в большой бутылке 1.5 л.",
      "uz": "Muzdek tetiklashtiruvchi limon va laym ta'mli gazlangan Sprite ichimligi (1.5 l).",
      "en": "Chilled sparkling lemon-lime Sprite bottle (1.5L) for family dinners and party feasts."
    }
  },
  {
    "id": "drink_water_15",
    "category": "drinks",
    "image": "images/food/drink_water_15.jpg",
    "badge": {
      "ru": "1.5 ЛИТРА",
      "uz": "1.5 LITR",
      "en": "1.5L"
    },
    "price": 9000,
    "weight": "1.5 л",
    "weight_i18n": {
      "ru": "1.5 л",
      "uz": "1.5 l",
      "en": "1.5 L"
    },
    "name": {
      "ru": "Вода чистая без газа 1.5 л",
      "uz": "Toza ichimlik suvi (gazsiz) 1.5 l",
      "en": "Still Mineral Water 1.5L"
    },
    "desc": {
      "ru": "Природная артезианская питьевая вода высшей степени очистки без газа в бутылке 1.5 л.",
      "uz": "Tabiiy toza artezian ichimlik suvi, gazlanmagan katta 1.5 litrli qadoqda.",
      "en": "Natural pure still mineral drinking water in 1.5L bottle."
    }
  },
  {
    "id": "drink_ayran_05",
    "category": "drinks",
    "image": "images/food/drink_ayran_05.jpg",
    "badge": {
      "ru": "СВЕЖИЙ",
      "uz": "MUZDEK",
      "en": "FRESH"
    },
    "price": 10000,
    "weight": "0.5 л",
    "weight_i18n": {
      "ru": "0.5 л",
      "uz": "0.5 l",
      "en": "0.5 L"
    },
    "name": {
      "ru": "Освежающий айран с мятой 0.5 л",
      "uz": "Muzdek ayron (yalpizli) 0.5 l",
      "en": "Chilled Mint Ayran 0.5L"
    },
    "desc": {
      "ru": "Традиционный густой кисломолочный айран с добавлением свежей мяты и легкой морской соли. Идеально к донеру и пиде.",
      "uz": "Yalpizli muzdek qatiqli milliy ayron. Donar, lavash va pide taomlariga ajoyib mos keladi.",
      "en": "Traditional cold frothy Turkish-style Ayran with fresh mint and a pinch of salt."
    }
  }
];
