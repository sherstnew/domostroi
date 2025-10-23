"use client"

import { useEffect, useState } from 'react'
// server-side mockProducts import removed to avoid bundling server code into client
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch('/api/favorites', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (!res.ok) throw new Error('Не авторизован')
        const data = await res.json()
        const favs: string[] = data.favorites || []
        setFavorites(favs)
        // fetch product details for favorite ids from server
        if (favs.length > 0) {
          try {
            const idsQuery = favs.map(encodeURIComponent).join(',')
            const token = localStorage.getItem('token')
            const prodRes = await fetch(`/api/products?ids=${idsQuery}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (prodRes.ok) {
              const prodData = await prodRes.json()
              setProducts(prodData.products || [])
            } else {
              setProducts([])
            }
          } catch (e) {
            console.warn('Failed to load favorite products', e)
            setProducts([])
          }
        } else {
          setProducts([])
        }
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
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
              <div key={p._id || p.id} className="bg-white p-4 rounded">
                <div className="flex items-center gap-4">
                  <ProductCard product={p} />
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
