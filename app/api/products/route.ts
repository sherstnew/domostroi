import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Product } from '@/types'

// Моковые данные продуктов
export const mockProducts: Product[] = [
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
      { storeId: '7', available: true, aisle: 'Фрукты', shelf: 'A3', price: 320, lastUpdated: new Date() },
      { storeId: '3', available: true, aisle: 'Органик', shelf: 'B1', price: 350, lastUpdated: new Date() },
      { storeId: '9', available: false, lastUpdated: new Date() }
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
      { storeId: '2', available: true, aisle: 'Растительное молоко', shelf: 'C2', price: 280, lastUpdated: new Date() },
      { storeId: '5', available: false, lastUpdated: new Date() }
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
      { storeId: '1', available: true, aisle: 'Крупы', shelf: 'D4', price: 450, lastUpdated: new Date() },
      { storeId: '8', available: true, aisle: 'Органик', shelf: 'B3', price: 480, lastUpdated: new Date() },
      { storeId: '4', available: true, aisle: 'Здоровое питание', shelf: 'E1', price: 430, lastUpdated: new Date() }
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
      { storeId: '6', available: true, aisle: 'Рыба', shelf: 'F2', price: 1200, lastUpdated: new Date() },
      { storeId: '10', available: true, aisle: 'Морепродукты', shelf: 'G1', price: 1250, lastUpdated: new Date() }
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
      { storeId: '3', available: true, aisle: 'Овощи', shelf: 'A1', price: 180, lastUpdated: new Date() },
      { storeId: '7', available: true, aisle: 'Органик', shelf: 'B2', price: 200, lastUpdated: new Date() },
      { storeId: '2', available: false, lastUpdated: new Date() }
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
      { storeId: '5', available: true, aisle: 'Крупы', shelf: 'D2', price: 120, lastUpdated: new Date() },
      { storeId: '9', available: true, aisle: 'Бакалея', shelf: 'C1', price: 110, lastUpdated: new Date() },
      { storeId: '1', available: true, aisle: 'Крупы', shelf: 'E2', price: 130, lastUpdated: new Date() }
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
    stores: [ { storeId: '4', available: true, aisle: 'Хлеб', shelf: 'H1', price: 80, lastUpdated: new Date() } ],
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
    image: 'https://upload.wikimedia.org/wikipedia/ru/0/0d/Alpen_Gold_milk_chocolate.jpg  ',
    category: 'Сладости',
    tags: ['шоколад', 'молочный', 'фундук', 'перекус'],
    stores: [
      {
        storeId: '10',
        available: true,
        price: 89,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '2',
        available: true,
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
    image: 'https://upload.wikimedia.org/wikipedia/ru/1/1c/Snickers_wrapped.png  ',
    category: 'Сладости',
    tags: ['батончик', 'шоколад', 'арахис', 'перекус'],
    stores: [
      {
        storeId: '7',
        available: true,
        price: 65,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '3',
        available: true,
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Quaker_Oats_Logo.svg/1200px-Quaker_Oats_Logo.svg.png  ',
    category: 'Крупы и хлопья',
    tags: ['овсянка', 'завтрак', 'клетчатка', 'цельнозерновой'],
    stores: [
      {
        storeId: '1',
        available: true,
        price: 199,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '8',
        available: true,
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
    image: 'https://mistrall.ru/upload/iblock/8d5/8d5a0b8f1e3d5c0e3f3b3e3b3e3b3e3b.jpg  ',
    category: 'Крупы и хлопья',
    tags: ['гречка', 'крупа', 'без глютена', 'ЗОЖ'],
    stores: [
      {
        storeId: '5',
        available: true,
        price: 120,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '9',
        available: true,
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
    image: 'https://www.danone.ru/upload/iblock/7a0/7a0e3b3e3b3e3b3e3b3e3b3e3b3e3b3b.jpg  ',
    category: 'Молочные продукты',
    tags: ['йогурт', 'пробиотики', 'натуральный', 'кишечник'],
    stores: [
      {
        storeId: '4',
        available: true,
        price: 75,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '6',
        available: true,
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
    image: 'https://prostokvashino.ru/upload/iblock/3e3/3e3b3e3b3e3b3e3b3e3b3e3b3e3b3e3b.jpg  ',
    category: 'Молочные продукты',
    tags: ['кефир', 'молоко', 'кишечник', 'кальций'],
    stores: [
      {
        storeId: '2',
        available: true,
        price: 95,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '7',
        available: true,
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
    image: 'https://prostokvashino.ru/upload/iblock/3e3/3e3b3e3b3e3b3e3b3e3b3e3b3e3b3e3b.jpg  ',
    category: 'Молочные продукты',
    tags: ['творог', 'белок', 'кальций', 'ЗОЖ'],
    stores: [
      {
        storeId: '10',
        available: true,
        price: 140,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '1',
        available: true,
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
    image: 'https://greenfield.ru/upload/iblock/1a2/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p.jpg  ',
    category: 'Напитки',
    tags: ['чай', 'зеленый', 'жасмин', 'антиоксиданты'],
    stores: [
      {
        storeId: '3',
        available: true,
        price: 189,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '8',
        available: true,
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
    image: 'https://frutonyanya.ru/upload/iblock/9a8/9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4.jpg  ',
    category: 'Детское питание',
    tags: ['пюре', 'фрукты', 'натуральное', 'детское'],
    stores: [
      {
        storeId: '5',
        available: true,
        price: 79,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '9',
        available: true,
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
    image: 'https://danone.ru/upload/iblock/b1c/b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5.jpg  ',
    category: 'Молочные продукты',
    tags: ['йогурт', 'бифидобактерии', 'клубника', 'кишечник'],
    stores: [
      {
        storeId: '6',
        available: true,
        price: 85,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '4',
        available: true,
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
    image: 'https://borodino-hleb.ru/upload/iblock/c1d/c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5.jpg  ',
    category: 'Хлеб и выпечка',
    tags: ['хлеб', 'ржаной', 'бородинский', 'ГОСТ'],
    stores: [
      {
        storeId: '2',
        available: true,
        price: 65,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '7',
        available: true,
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
    image: 'https://hochland.ru/upload/iblock/d1e/d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5.jpg  ',
    category: 'Молочные продукты',
    tags: ['сыр', 'сливочный', 'филадельфия', 'закуска'],
    stores: [
      {
        storeId: '8',
        available: true,
        price: 299,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '10',
        available: true,
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
    image: 'https://greenvalley.ru/upload/iblock/e1f/e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5.jpg  ',
    category: 'Завтраки',
    tags: ['мюсли', 'ягоды', 'цельнозерновой', 'завтрак'],
    stores: [
      {
        storeId: '1',
        available: true,
        price: 249,
        lastUpdated: new Date('2025-10-20T10:00:00Z')
      },
      {
        storeId: '5',
        available: true,
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const maxCalories = searchParams.get('maxCalories')
    const minProtein = searchParams.get('minProtein')
    const maxCarbs = searchParams.get('maxCarbs')
    const maxFat = searchParams.get('maxFat')
    const maxPrice = searchParams.get('maxPrice')

    let filteredProducts = [...mockProducts]

    // Фильтрация по поисковому запросу
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Фильтрация по категории
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === category
      )
    }

    // Фильтрация по БЖУ и калориям
    if (maxCalories) {
      filteredProducts = filteredProducts.filter(product =>
        product.calories <= parseInt(maxCalories)
      )
    }

    if (minProtein) {
      filteredProducts = filteredProducts.filter(product =>
        product.protein >= parseInt(minProtein)
      )
    }

    if (maxCarbs) {
      filteredProducts = filteredProducts.filter(product =>
        product.carbs <= parseInt(maxCarbs)
      )
    }

    if (maxFat) {
      filteredProducts = filteredProducts.filter(product =>
        product.fat <= parseInt(maxFat)
      )
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseInt(maxPrice)
      )
    }

    return NextResponse.json({ products: filteredProducts })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}