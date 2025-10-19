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
    image: '/products/apples.png',
    category: 'Фрукты',
    tags: ['без глютена', 'веган', 'низкий ГИ', 'органический'],
    stores: [
      { storeId: '1', available: true, aisle: 'Фрукты', shelf: 'A3', price: 320, lastUpdated: new Date() },
      { storeId: '2', available: true, aisle: 'Органик', shelf: 'B1', price: 350, lastUpdated: new Date() },
      { storeId: '3', available: false, lastUpdated: new Date() }
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
    image: '/products/mindal.png',
    category: 'Напитки',
    tags: ['без лактозы', 'веган', 'без сахара', 'низкокалорийный'],
    stores: [
      { storeId: '1', available: true, aisle: 'Растительное молоко', shelf: 'C2', price: 280, lastUpdated: new Date() },
      { storeId: '3', available: false, lastUpdated: new Date() }
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
    image: '/products/kinoa.png',
    category: 'Крупы',
    tags: ['без глютена', 'веган', 'высокий белок', 'органический'],
    stores: [
      { storeId: '1', available: true, aisle: 'Крупы', shelf: 'D4', price: 450, lastUpdated: new Date() },
      { storeId: '2', available: true, aisle: 'Органик', shelf: 'B3', price: 480, lastUpdated: new Date() },
      { storeId: '3', available: true, aisle: 'Здоровое питание', shelf: 'E1', price: 430, lastUpdated: new Date() }
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
    image: '/products/losos.png',
    category: 'Рыба',
    tags: ['высокий белок', 'омега-3', 'низкие углеводы'],
    stores: [
      { storeId: '1', available: true, aisle: 'Рыба', shelf: 'F2', price: 1200, lastUpdated: new Date() },
      { storeId: '3', available: true, aisle: 'Морепродукты', shelf: 'G1', price: 1250, lastUpdated: new Date() }
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
    image: '/products/avocado.png',
    category: 'Овощи',
    tags: ['полезные жиры', 'веган', 'без глютена', 'высокая калорийность'],
    stores: [
      { storeId: '1', available: true, aisle: 'Овощи', shelf: 'A1', price: 180, lastUpdated: new Date() },
      { storeId: '2', available: true, aisle: 'Органик', shelf: 'B2', price: 200, lastUpdated: new Date() },
      { storeId: '3', available: false, lastUpdated: new Date() }
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
    image: '/products/grechka.png',
    category: 'Крупы',
    tags: ['без глютена', 'веган', 'высокий белок', 'бюджетный'],
    stores: [
      { storeId: '1', available: true, aisle: 'Крупы', shelf: 'D2', price: 120, lastUpdated: new Date() },
      { storeId: '2', available: true, aisle: 'Бакалея', shelf: 'C1', price: 110, lastUpdated: new Date() },
      { storeId: '3', available: true, aisle: 'Крупы', shelf: 'E2', price: 130, lastUpdated: new Date() }
    ],
    nutritionalInfo: {
      glutenFree: true,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: true,
      lowGi: true
    }
  }
  ,
  {
    _id: '7',
    name: 'Цельнозерновой хлеб',
    description: 'Свежий хлеб из цельного зерна, без искусственных добавок',
    price: 80,
    calories: 250,
    protein: 8,
    carbs: 40,
    fat: 3,
    image: '/products/hleb.png',
    category: 'Хлеб',
    tags: ['хлеб', 'цельнозерновой', 'без сахара'],
    stores: [ { storeId: '1', available: true, aisle: 'Хлеб', shelf: 'H1', price: 80, lastUpdated: new Date() } ],
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
    name: 'Батон пшеничный',
    description: 'Классический пшеничный батон, мягкий и воздушный',
    price: 60,
    calories: 270,
    protein: 7,
    carbs: 45,
    fat: 2,
    image: '/products/baton.jpg',
    category: 'Хлеб',
    tags: ['хлеб', 'пшеничный'],
    stores: [ { storeId: '2', available: true, aisle: 'Хлеб', shelf: 'H2', price: 60, lastUpdated: new Date() } ],
    nutritionalInfo: {
      glutenFree: false,
      lactoseFree: true,
      vegan: true,
      diabeticFriendly: false,
      lowGi: false
    }
  }
]

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