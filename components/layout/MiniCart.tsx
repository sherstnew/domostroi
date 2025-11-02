"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToasts } from '@/components/ui/toast'
import { useAuth } from '@/context/AuthContext'

export default function MiniCart({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const toasts = useToasts()

  const load = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return setItems([])
      const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) return setItems([])
      const jd = await res.json()
      const cart = jd.cart || []

      // enrich items with product names and store names
      try {
  const prodIds = Array.from(new Set(cart.map((it: any) => it.productId).filter(Boolean))).map(String)
  const storeIds = Array.from(new Set(cart.map((it: any) => it.storeId).filter(Boolean))).map(String)

        let productsMap: Record<string, any> = {}
        if (prodIds.length > 0) {
          const idsQuery = prodIds.map(encodeURIComponent).join(',')
          const pRes = await fetch(`/api/products?ids=${idsQuery}`, { headers: { 'Authorization': `Bearer ${token}` } })
          if (pRes.ok) {
            const pd = await pRes.json()
            const prods = pd.products || []
            productsMap = prods.reduce((acc: any, p: any) => { acc[p._id || p.id] = p; return acc }, {})
          }
        }

        let storesMap: Record<string, any> = {}
        if (storeIds.length > 0) {
          const sRes = await fetch('/api/stores')
          if (sRes.ok) {
            const sd = await sRes.json()
            const stores = sd.stores || []
            storesMap = stores.reduce((acc: any, s: any) => { acc[s._id] = s; return acc }, {})
          }
        }

        const enriched = cart.map((it: any) => ({
          ...it,
          productName: it.productName || (productsMap[it.productId]?.name) || `Товар ${it.productId}`,
          storeName: it.storeName || (storesMap[it.storeId]?.name) || `Магазин ${it.storeId}`
        }))
        setItems(enriched)
      } catch (e) {
        console.warn('Failed to enrich cart items', e)
        setItems(cart)
      }
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateQty = async (productId: string, storeId: string, qty: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) { window.location.href = '/login'; return }
      // replace whole cart with updated qty for simplicity
      const newItems = items.map(it => it.productId === productId && it.storeId === storeId ? { ...it, quantity: qty } : it)
      const res = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ cart: newItems }) })
      if (!res.ok) throw new Error('fail')
      const jd = await res.json()
      setItems(jd.cart || [])
      try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: jd.cart?.length ?? null } })) } catch (e) {}
    } catch (e) { console.error(e); toasts.add('Ошибка при обновлении количества', 'error') }
  }

  const removeItem = async (productId: string, storeId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) { window.location.href = '/login'; return }
      const res = await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ productId, storeId }) })
      if (!res.ok) throw new Error('fail')
      const jd = await res.json()
      setItems(jd.cart || [])
      try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: jd.cart?.length ?? null } })) } catch (e) {}
    } catch (e) { console.error(e); toasts.add('Ошибка при удалении позиции', 'error') }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) { window.location.href = '/login'; return }
      // set cart to empty array
      const res = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ cart: [] }) })
      if (!res.ok) throw new Error('fail')
      const jd = await res.json()
      setItems(jd.cart || [])
      try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: jd.cart?.length ?? 0 } })) } catch (e) {}
      toasts.add('Корзина очищена', 'success')
      window.location.reload();
    } catch (e) { console.error(e); toasts.add('Ошибка при очистке корзины', 'error') }
  }

  const total = items.reduce((s, it) => s + ((it.priceSnapshot || 0) * (it.quantity || 1)), 0)

  return (
    <div className="min-h-[60vh] h-full overflow-auto p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Ваша корзина</h3>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => { if (onClose) onClose() }}>Закрыть</Button>
        </div>
      </div>

      {loading && <div>Загрузка...</div>}
      {!loading && items.length === 0 && <div className="text-gray-600">Корзина пуста</div>}

      <div className="space-y-3">
        {items.map(it => (
          <div key={`${it.productId}-${it.storeId}`} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-medium">{it.productName || `Товар ${it.productId}`}</div>
              <div className="text-sm text-gray-500">{it.priceSnapshot ?? '-'} ₽ · Магазин {it.storeId}</div>
            </div>
            <div className="flex items-center gap-2">
              <input className="w-14 text-center" type="number" value={it.quantity} min={1} onChange={(e) => updateQty(it.productId, it.storeId, parseInt(e.target.value || '1'))} />
              <Button variant="destructive" size="sm" onClick={() => removeItem(it.productId, it.storeId)}>Удалить</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">Итого</div>
          <div className="font-bold">{total} ₽</div>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={typeof (user as any)?.selectedStore === 'string' ? `/map/?storeId=${(user as any).selectedStore}` : '/map/?storeId=1'}><Button className="w-full bg-[var(--light-green)] text-white" onClick={onClose}>Открыть карту</Button></Link>
          <Button className="w-full" onClick={clearCart} disabled={items.length === 0}>Очистить</Button>
        </div>
      </div>
    </div>
  )
}
