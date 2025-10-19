'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  calories: number
  protein: number
  carbs: number
  fat: number
  image: string
  category: string
  tags: string[]
  stores: Array<{
    storeId: string
    available: boolean
    aisle?: string
    shelf?: string
    price?: number
  }>
  nutritionalInfo: {
    glutenFree: boolean
    lactoseFree: boolean
    vegan: boolean
    diabeticFriendly: boolean
    lowGi: boolean
  }
}

interface Store {
  _id: string
  name: string
  address: string
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)

   const productId = Array.isArray(params.id) ? params.id[0] : params.id

  // load user favorites to determine initial state
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) return
        const data = await me.json()
        const favs: string[] = data.user?.favorites || []
          if (productId && favs.includes(productId)) setFavorite(true)
      } catch (err) {
        console.error('Не удалось получить user/me', err)
      }
    }
    fetchUser()
  }, [params.id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, storesRes] = await Promise.all([
            fetch(`/api/products/${productId}`),
          fetch('/api/stores')
        ])

        const productData = await productRes.json()
        const storesData = await storesRes.json()

        setProduct(productData.product)
        setStores(storesData.stores)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--light-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка продукта...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--dark-green)] mb-4">
            Продукт не найден
          </h1>
          <Link href="/dashboard" className="btn-primary">
            Вернуться в дашборд
          </Link>
        </div>
      </div>
    )
  }

  const availableStores = product.stores
    .filter(store => store.available)
    .map(store => {
      const storeInfo = stores.find(s => s._id === store.storeId)
      return { ...store, storeInfo }
    })
    .filter(store => store.storeInfo)

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/dashboard" className="hover:text-[var(--light-green)]">
            Дашборд
          </Link>
          <span>›</span>
          <Link href="/dashboard" className="hover:text-[var(--light-green)]">
            Продукты
          </Link>
          <span>›</span>
          <span className="text-[var(--dark-green)]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Изображение продукта */}
          <div className="card p-6">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-xl overflow-hidden mb-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-[var(--light-green)]/20 text-[var(--dark-green)] text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Информация о продукте */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--dark-green)] mb-4 font-serif">
                {product.name}
              </h1>
              <p className="text-xl text-gray-700 mb-6">{product.description}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-[var(--accent-orange)]">
                  {product.price} ₽
                </span>
                <button
                  onClick={async () => {
                    try {
                      const method = favorite ? 'DELETE' : 'POST'
                      const res = await fetch('/api/favorites', {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
              body: JSON.stringify({ productId: productId })
                      })
                      if (!res.ok) throw new Error('Ошибка избранного')
                      setFavorite(!favorite)
                    } catch (err) {
                      console.error(err)
                      alert('Не удалось обновить избранное')
                    }
                  }}
                  className={`p-3 rounded-full border-2 ${
                    favorite 
                      ? 'border-[var(--accent-orange)] text-[var(--accent-orange)]' 
                      : 'border-gray-300 text-gray-400 hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]'
                  }`}
                >
                  ♥
                </button>
              </div>
            </div>

            {/* Пищевая ценность */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
                Пищевая ценность
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-[var(--cream-white)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--dark-green)]">{product.calories}</div>
                  <div className="text-sm text-gray-600">ккал</div>
                </div>
                <div className="text-center p-4 bg-[var(--cream-white)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--dark-green)]">{product.protein}г</div>
                  <div className="text-sm text-gray-600">Белки</div>
                </div>
                <div className="text-center p-4 bg-[var(--cream-white)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--dark-green)]">{product.carbs}г</div>
                  <div className="text-sm text-gray-600">Углеводы</div>
                </div>
                <div className="text-center p-4 bg-[var(--cream-white)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--dark-green)]">{product.fat}г</div>
                  <div className="text-sm text-gray-600">Жиры</div>
                </div>
              </div>

              {/* Диетическая информация */}
              <div className="flex flex-wrap gap-2">
                {product.nutritionalInfo.glutenFree && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Без глютена
                  </span>
                )}
                {product.nutritionalInfo.lactoseFree && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Без лактозы
                  </span>
                )}
                {product.nutritionalInfo.vegan && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                    Веган
                  </span>
                )}
                {product.nutritionalInfo.diabeticFriendly && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    Для диабетиков
                  </span>
                )}
                {product.nutritionalInfo.lowGi && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                    Низкий ГИ
                  </span>
                )}
              </div>
            </div>

            {/* Доступность в магазинах */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
                Где купить
              </h2>
              
              {availableStores.length > 0 ? (
                <div className="space-y-4">
                  {availableStores.map(({ storeInfo, aisle, shelf, price }) => (
                    storeInfo ? (
                      <div key={storeInfo._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Link 
                            href={`/stores/${storeInfo._id}`}
                            className="font-bold text-[var(--dark-green)] hover:text-[var(--light-green)]"
                          >
                            {storeInfo.name}
                          </Link>
                          <p className="text-sm text-gray-600">{storeInfo.address}</p>
                          <p className="text-sm text-gray-600">
                            Отдел: {aisle}, Полка: {shelf}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[var(--accent-orange)]">
                            {price} ₽
                          </div>
                          <div className="text-sm text-green-600">В наличии</div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Продукт временно отсутствует в магазинах
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}