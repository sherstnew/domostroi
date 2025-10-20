"use client"

import { useEffect, useState } from 'react'
import { mockProducts } from '../api/products/route'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/favorites')
        if (!res.ok) throw new Error('Не авторизован')
        const data = await res.json()
        const favs: string[] = data.favorites || []
        setFavorites(favs)
        // map ids to mockProducts
  const found = favs.map(id => mockProducts.find((p:any) => p._id === id)).filter(Boolean)
        setProducts(found as any[])
      } catch (e) {
        console.warn('Failed to load favorites', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const remove = async (productId: string) => {
    try {
      const res = await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' })
      if (res.ok) {
        setFavorites(prev => prev.filter(id => id !== productId))
        setProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
      }
    } catch (e) {
      console.warn('Failed to remove favorite', e)
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Ваши избранные продукты</h1>
        {products.length === 0 ? (
          <div className="text-gray-600">У вас пока нет избранных продуктов.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p._id || p.id} className="border rounded p-4 bg-white">
                <div className="flex items-center gap-4">
                  <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.description}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => remove(p._id || p.id)}>Удалить</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
