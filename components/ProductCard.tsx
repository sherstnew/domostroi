"use client";

import React from "react";
import { useToasts } from '@/components/ui/toast'

interface Props {
  product: any;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext'

export default function ProductCard({
  product,
  onToggleFavorite,
  isFavorite,
}: Props) {
  const toasts = useToasts()
  const { user } = (() => {
    try { return useAuth() } catch (e) { return { user: null } as any }
  })()
  const inCart = (() => {
    try {
      const cart = (user as any)?.cart || []
      return cart.some((it: any) => String(it.productId) === String(product._id || product.id))
    } catch (e) { return false }
  })()

  // local optimistic state so UI updates immediately on add/remove
  const [localInCart, setLocalInCart] = React.useState<boolean>(inCart)

  // keep localInCart in sync if user.cart changes externally
  React.useEffect(() => {
    setLocalInCart(inCart)
  }, [inCart, product._id])
  const addToCart = async () => {
    // optimistic update
    setLocalInCart(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLocalInCart(false)
        window.location.href = '/login'
        return
      }
      // prefer user's selectedStore if available for this product
      let selectedStore: string | null = null
      try {
        const { user } = useAuth()
        const sel = (user as any)?.selectedStore
        if (sel) {
          // check if product is available in user's store
          const found = (product.stores || []).find((s: any) => String(s.storeId) === String(sel) && s.available)
          if (found) selectedStore = String(found.storeId)
        }
      } catch (e) {
        // useAuth may throw if provider missing; ignore
      }
      if (!selectedStore) {
        selectedStore = product.stores?.[0]?.storeId || null
      }
      if (!selectedStore) {
        toasts.add('Нет информации о наличии товара в магазине', 'error')
        return
      }

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id || product.id, storeId: selectedStore, quantity: 1, price: product.price || product.priceAvg })
      })
      if (!res.ok) throw new Error('fail')
      const jd = await res.json()
      try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: jd.cart?.length ?? null } })) } catch (e) {}
      toasts.add('Добавлено в корзину', 'success')
    } catch (e) {
      console.error(e)
      // rollback optimistic update
      setLocalInCart(false)
      toasts.add('Ошибка при добавлении в корзину', 'error')
    }
  }
  return (
    <div className="w-full sm:w-80 md:w-96 p-4 rounded-lg shadow-sm bg-white">
      <div className="h-44 mb-3 bg-white rounded overflow-hidden flex items-center justify-center">
        <img
          src={product.image || product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="font-medium text-[var(--dark-green)] mb-1">
        {product.name}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-[var(--accent-orange)]">
          {product.price ?? product.priceAvg} ₽
        </div>
        <div className="text-sm text-[var(--text-color)]/80">
          {product.nutrition?.calories ?? product.calories} ккал
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onToggleFavorite?.(product._id || product.id)}
          variant="secondary"
          size="sm"
          className={`w-12 h-12 flex items-center justify-center rounded-full p-0`}
          aria-pressed={isFavorite}
        >
          <Heart
            size={20}
            className={
              isFavorite
                ? "text-[var(--accent-orange)] fill-[var(--accent-orange)]"
                : "text-gray-400"
            }
          />
        </Button>
        <div className="flex gap-2">
            {!localInCart ? (
              <Button onClick={addToCart} variant="default" size="sm">
                <ShoppingCart size={14} className="mr-2" />
                В корзину
              </Button>
            ) : (
              <Button onClick={async () => {
                // optimistic remove
                setLocalInCart(false)
                try {
                  const token = localStorage.getItem('token')
                  if (!token) { setLocalInCart(true); window.location.href = '/login'; return }
                  const storeId = product.stores?.[0]?.storeId || null
                  const res = await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ productId: product._id || product.id, storeId }) })
                  if (!res.ok) throw new Error('fail')
                  const jd = await res.json()
                  try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: jd.cart?.length ?? null } })) } catch (e) {}
                  toasts.add('Удалено из корзины', 'success')
                } catch (e) { console.error(e); setLocalInCart(true); toasts.add('Ошибка при удалении из корзины', 'error') }
              }} variant="destructive" size="sm">Удалить</Button>
            )}
          <Link href={`/products/${product._id}`}>
            <Button variant="outline" size="sm">
              <Eye size={14} className="mr-2" />
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
