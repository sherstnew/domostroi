import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/types'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Органические яблоки Гренни Смит',
    description: 'Свежие органические яблоки с низким гликемическим индексом, идеально подходят для диабетического питания',
    price: 320,
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    image: '/products/apples.webp',
    category: 'Фрукты',
    tags: ['без глютена', 'веган', 'низкий ГИ', 'органический'],
    stores: [
      { storeId: '7', available: true, point: 'Овощи фрукты 3', price: 320, lastUpdated: new Date() },
      { storeId: '3', available: true, point: 'Овощи фрукты 2', price: 350, lastUpdated: new Date() },
      { storeId: '9', available: false, point: 'Овощи фрукты 1', price: 400, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '2',
    name: 'Миндальное молоко без сахара',
    description: 'Натуральное миндальное молоко без добавления сахара и консервантов',
    price: 280,
    calories: 35,
    protein: 1,
    carbs: 2,
    fat: 3,
    image: '/products/mindal.webp',
    category: 'Напитки',
    tags: ['без лактозы', 'веган', 'без сахара', 'низкокалорийный'],
    stores: [
      { storeId: '2', available: true, point: 'Молочные продукты 1', price: 280, lastUpdated: new Date() },
      { storeId: '5', available: true, point: 'Молочные продукты 2', price: 300, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '3',
    name: 'Киноа органическая',
    description: 'Питательная киноа с высоким содержанием белка и клетчатки',
    price: 450,
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    image: '/products/kinoa.webp',
    category: 'Крупы',
    tags: ['без глютена', 'веган', 'высокий белок', 'органический'],
    stores: [
      { storeId: '1', available: true, point: 'Бакалея', price: 450, lastUpdated: new Date() },
      { storeId: '8', available: true, point: 'Бакалея', price: 480, lastUpdated: new Date() },
      { storeId: '4', available: true, point: 'Специи соусы 2', price: 430, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: false
    }
  },
  {
    _id: '4',
    name: 'Лосось дикий свежий',
    description: 'Свежий дикий лосось, богатый омега-3 жирными кислотами',
    price: 1200,
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    image: '/products/losos.webp',
    category: 'Рыба',
    tags: ['высокий белок', 'омега-3', 'низкие углеводы'],
    stores: [
      { storeId: '6', available: true, point: 'Заморозка 1', price: 1200, lastUpdated: new Date() },
      { storeId: '10', available: true, point: 'Заморозка 2', price: 1250, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: false,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '5',
    name: 'Авокадо Хасс',
    description: 'Спелые авокадо с кремовой текстурой, источник полезных жиров',
    price: 180,
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    image: '/products/avocado.webp',
    category: 'Овощи',
    tags: ['полезные жиры', 'веган', 'без глютена', 'высокая калорийность'],
    stores: [
      { storeId: '3', available: true, point: 'Овощи фрукты 2', price: 180, lastUpdated: new Date() },
      { storeId: '7', available: true, point: 'Овощи фрукты 3', price: 200, lastUpdated: new Date() },
      { storeId: '2', available: false, point: 'Молочные продукты 1', price: 190, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '6',
    name: 'Гречневая крупа ядрица',
    description: 'Натуральная гречневая крупа, не содержит глютен',
    price: 120,
    calories: 343,
    protein: 13,
    carbs: 72,
    fat: 3,
    image: '/products/grechka.webp',
    category: 'Крупы',
    tags: ['без глютена', 'веган', 'высокий белок', 'бюджетный'],
    stores: [
      { storeId: '5', available: true, point: 'Бакалея', price: 120, lastUpdated: new Date() },
      { storeId: '9', available: true, point: 'Бакалея', price: 110, lastUpdated: new Date() },
      { storeId: '1', available: true, point: 'Бакалея', price: 130, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '7',
    name: 'Цельнозерновой хлеб',
    description: 'Свежий хлеб из цельного зерна, без искусственных добавок',
    price: 80,
    calories: 250,
    protein: 8,
    carbs: 40,
    fat: 3,
    image: '/products/hleb.webp',
    category: 'Хлеб',
    tags: ['хлеб', 'цельнозерновой', 'без сахара'],
    stores: [ 
      { storeId: '4', available: true, point: 'Хлеб', price: 80, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: false
    }
  },
  {
    _id: '8',
    name: 'Шоколад Alpen Gold Молочный с фундуком',
    description: 'Молочный шоколад с дробленым фундуком от популярного бренда Alpen Gold.',
    price: 89,
    calories: 525,
    protein: 5.4,
    carbs: 60,
    fat: 26,
    image: '/products/choco.webp',
    category: 'Сладости',
    tags: ['шоколад', 'молочный', 'фундук', 'перекус'],
    stores: [
      {
        storeId: '10',
        available: true,
        point: 'Кондитерка',
        price: 89,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '2',
        available: true,
        point: 'Кондитерка',
        price: 92,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: false,
      lowGi: false
    }
  },
  {
    _id: '9',
    name: 'Батончик Snickers',
    description: 'Классический шоколадный батончик с арахисом, карамелью и нугой.',
    price: 65,
    calories: 500,
    protein: 7.9,
    carbs: 58.2,
    fat: 25.8,
    image: '/products/snickers.webp',
    category: 'Сладости',
    tags: ['батончик', 'шоколад', 'арахис', 'перекус'],
    stores: [
      {
        storeId: '7',
        available: true,
        point: 'Кондитерка',
        price: 65,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '3',
        available: true,
        point: 'Кондитерка',
        price: 68,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: false,
      lowGi: false
    }
  },
  {
    _id: '10',
    name: 'Овсяные хлопья Quaker',
    description: 'Цельнозерновые овсяные хлопья для здорового завтрака.',
    price: 199,
    calories: 345,
    protein: 11,
    carbs: 60,
    fat: 8,
    image: '/products/quaker.webp',
    category: 'Крупы и хлопья',
    tags: ['овсянка', 'завтрак', 'клетчатка', 'цельнозерновой'],
    stores: [
      {
        storeId: '1',
        available: true,
        point: 'Бакалея',
        price: 199,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '8',
        available: true,
        point: 'Бакалея',
        price: 210,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '11',
    name: 'Гречка Мистраль ядрица',
    description: 'Натуральная гречневая крупа высшего качества.',
    price: 120,
    calories: 353,
    protein: 13.6,
    carbs: 65,
    fat: 3.3,
    image: '/products/mistral.webp',
    category: 'Крупы и хлопья',
    tags: ['гречка', 'крупа', 'без глютена', 'ЗОЖ'],
    stores: [
      {
        storeId: '5',
        available: true,
        point: 'Бакалея',
        price: 120,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '9',
        available: true,
        point: 'Бакалея',
        price: 125,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '12',
    name: 'Йогурт Activia Натуральный',
    description: 'Натуральный йогурт с живыми пробиотиками для здоровья кишечника.',
    price: 75,
    calories: 75,
    protein: 4.5,
    carbs: 6.3,
    fat: 3.5,
    image: '/products/activia.webp',
    category: 'Молочные продукты',
    tags: ['йогурт', 'пробиотики', 'натуральный', 'кишечник'],
    stores: [
      {
        storeId: '4',
        available: true,
        point: 'Молочные продукты 1',
        price: 75,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '6',
        available: true,
        point: 'Молочные продукты 1',
        price: 78,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: false,
      lowGi: true
    }
  },
  {
    _id: '13',
    name: 'Кефир Простоквашино 3.2%',
    description: 'Классический кефир из свежего молока.',
    price: 95,
    calories: 57,
    protein: 3,
    carbs: 4,
    fat: 3.2,
    image: '/products/kefir.webp',
    category: 'Молочные продукты',
    tags: ['кефир', 'молоко', 'кишечник', 'кальций'],
    stores: [
      {
        storeId: '2',
        available: true,
        point: 'Молочные продукты 1',
        price: 95,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '7',
        available: true,
        point: 'Молочные продукты 1',
        price: 98,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '14',
    name: 'Творог Простоквашино 5% классический',
    description: 'Нежный и полезный творог с классическим вкусом.',
    price: 140,
    calories: 121,
    protein: 16,
    carbs: 3,
    fat: 5,
    image: '/products/prostokv.webp',
    category: 'Молочные продукты',
    tags: ['творог', 'белок', 'кальций', 'ЗОЖ'],
    stores: [
      {
        storeId: '10',
        available: true,
        point: 'Молочные продукты 2',
        price: 140,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '1',
        available: true,
        point: 'Молочные продукты 1',
        price: 145,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '15',
    name: 'Чай Greenfield Зеленый с жасмином',
    description: 'Ароматный зеленый чай с цветами жасмина в двойных пакетиках.',
    price: 189,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    image: '/products/greenfield.webp',
    category: 'Напитки',
    tags: ['чай', 'зеленый', 'жасмин', 'антиоксиданты'],
    stores: [
      {
        storeId: '3',
        available: true,
        point: 'Чай кофе хлебцы 1',
        price: 189,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '8',
        available: true,
        point: 'Чай кофе хлебцы 2',
        price: 195,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '16',
    name: 'Пюре ФрутоНяня Яблоко-Слива',
    description: 'Натуральное фруктовое пюре для детей и взрослых.',
    price: 79,
    calories: 52,
    protein: 0.5,
    carbs: 12.5,
    fat: 0.1,
    image: '/products/fruto.webp',
    category: 'Детское питание',
    tags: ['пюре', 'фрукты', 'натуральное', 'детское'],
    stores: [
      {
        storeId: '5',
        available: true,
        point: 'Детские товары',
        price: 79,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '9',
        available: true,
        point: 'Детские товары',
        price: 82,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: false,
      lowGi: true
    }
  },
  {
    _id: '17',
    name: 'Йогурт БиоБаланс Клубника',
    description: 'Йогурт с живыми бифидобактериями и натуральным клубничным вкусом.',
    price: 85,
    calories: 88,
    protein: 3.8,
    carbs: 13.2,
    fat: 2.5,
    image: '/products/balance.webp',
    category: 'Молочные продукты',
    tags: ['йогурт', 'бифидобактерии', 'клубника', 'кишечник'],
    stores: [
      {
        storeId: '6',
        available: true,
        point: 'Молочные продукты 1',
        price: 85,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '4',
        available: true,
        point: 'Молочные продукты 1',
        price: 89,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: false,
      lowGi: true
    }
  },
  {
    _id: '18',
    name: 'Хлеб Бородинский Бородино',
    description: 'Традиционный ржаной хлеб по ГОСТу с кориандром и тмином.',
    price: 65,
    calories: 208,
    protein: 6.8,
    carbs: 39.8,
    fat: 1.3,
    image: '/products/borodino.webp',
    category: 'Хлеб и выпечка',
    tags: ['хлеб', 'ржаной', 'бородинский', 'ГОСТ'],
    stores: [
      {
        storeId: '2',
        available: true,
        point: 'Хлеб',
        price: 65,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '7',
        available: true,
        point: 'Хлеб',
        price: 68,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  },
  {
    _id: '19',
    name: 'Сыр Хохланд Филадельфия',
    description: 'Сливочный сыр для бутербродов и закусок.',
    price: 299,
    calories: 255,
    protein: 6.5,
    carbs: 3.5,
    fat: 24,
    image: '/products/cheese.webp',
    category: 'Молочные продукты',
    tags: ['сыр', 'сливочный', 'филадельфия', 'закуска'],
    stores: [
      {
        storeId: '8',
        available: true,
        point: 'Сыры пресервы 1',
        price: 299,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '10',
        available: true,
        point: 'Сыры пресервы 2',
        price: 310,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: false,
      vegan: false,
      diabeticFriendly: false,
      lowGi: true
    }
  },
  {
    _id: '20',
    name: 'Мюсли Green Valley с ягодами',
    description: 'Хрустящие мюсли из цельных злаков с сушеной клубникой и черникой.',
    price: 249,
    calories: 380,
    protein: 8,
    carbs: 65,
    fat: 10,
    image: '/products/musli.webp',
    category: 'Завтраки',
    tags: ['мюсли', 'ягоды', 'цельнозерновой', 'завтрак'],
    stores: [
      {
        storeId: '1',
        available: true,
        point: 'Бакалея',
        price: 249,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '5',
        available: true,
        point: 'Бакалея',
        price: 259,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      }
    ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: false,
      lowGi: true
    }
  }
];
// Заменили поля aisle/shelf на point прямо в данных выше.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const top = searchParams.get('top')
    const ids = searchParams.get('ids')

    let result = [...mockProducts]
    // If ids param provided, return only those products (comma separated)
    if (ids) {
      const idsArr = ids.split(',').map(s => s.trim())
      result = result.filter(p => idsArr.includes(String(p._id)))
      return NextResponse.json({ products: result })
    }
    if (storeId) {
      result = result.filter(p => p.stores?.some(s => String(s.storeId) === String(storeId)))
    }

    // If user token present, try to filter by user's preferences
    try {
      // Try header first, then cookie fallback (some clients use credentials: 'include')
      let token = getTokenFromHeaders(request.headers)
      if (!token) {
        try {
          const cookie = request.cookies.get('token')
          if (cookie) token = cookie.value
        } catch (e) {
          console.warn('Cookie read failed in /api/products', e)
        }
      }
      if (token) {
        const payload = await verifyToken(token)
        if (payload?.userId) {
          const client = await clientPromise
          const db = client.db()
          const user = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) })
          const prefs = user?.preferences
          if (prefs) {
            // remove products that match forbidden words/tags (support name/category and tags, case-insensitive)
            const forbidden: string[] = prefs.forbidden || []
            if (forbidden.length > 0) {
              const forbiddenLower = forbidden.map(f => String(f).toLowerCase())
              result = result.filter(p => {
                const name = String(p.name || '').toLowerCase()
                const category = String(p.category || '').toLowerCase()
                const description = String(p.description || '').toLowerCase()
                const tags = (p.tags || []).map((t: any) => String(t).toLowerCase())

                // if any forbidden token appears in name, category, description or tags (substring match), exclude
                for (const f of forbiddenLower) {
                  if (!f) continue
                  if (name.includes(f) || category.includes(f) || description.includes(f)) return false
                  // tag matches if either the tag contains the forbidden token or vice-versa (to catch 'молоко' vs 'молочка')
                  if (tags.some(t => t.includes(f) || f.includes(t))) return false
                }
                return true
              })
            }
            // simple dietaryRestrictions filter: if product has nutritionalInfo flags that conflict, exclude
            const dietary: string[] = prefs.dietaryRestrictions || []
            if (dietary.length > 0) {
              result = result.filter(p => {
                for (const dr of dietary) {
                  if (dr === 'gluten-free' && p.nutritionalInfo?.glutenFree === false) return false
                  if (dr === 'lactose-free' && p.nutritionalInfo?.lactoseFree === false) return false
                  if (dr === 'vegan' && p.nutritionalInfo?.vegan === false) return false
                }
                return true
              })
            }
          }
        }
      }
    } catch (e) {
      // ignore token/verification errors and return unfiltered list
      console.warn('Product prefs filter skipped:', e)
    }

    if (top === 'true' && storeId) {
      // simple top: sort by price asc and take first 6 (example)
      result = result
        .filter(p => p.stores?.some(s => String(s.storeId) === String(storeId) && s.available))
        .sort((a, b) => (a.price || 0) - (b.price || 0))
        .slice(0, 6)
    }

    return NextResponse.json({ products: result })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}