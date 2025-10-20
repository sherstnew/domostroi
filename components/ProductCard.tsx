"use client"

import React from 'react'

interface Props {
  product: any
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
}

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, ShoppingCart, Eye } from 'lucide-react'

export default function ProductCard({ product, onToggleFavorite, isFavorite }: Props) {
  return (
      <div className="card w-80 sm:w-96 p-4 rounded-lg shadow-sm bg-white flex-shrink-0 snap-start">
      <div className="h-44 mb-3 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="font-medium text-[var(--dark-green)] mb-1">{product.name}</div>
        <div className="mt-1 text-sm text-[var(--text-color)]/80">{product.price} ₽</div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-[var(--accent-orange)]">{product.price ?? product.priceAvg} ₽</div>
        <div className="text-sm text-[var(--text-color)]/80">{product.nutrition?.calories ?? product.calories} ккал</div>
      </div>
      <div className="flex items-center gap-2">
              <Button onClick={() => onToggleFavorite?.(product._id || product.id)} variant="secondary" size="sm" className={`w-12 h-12 flex items-center justify-center rounded-full p-0`} aria-pressed={isFavorite}>
                <Heart size={20} className={isFavorite ? 'text-[var(--accent-orange)] fill-[var(--accent-orange)]' : 'text-gray-400'} />
              </Button>
          <div className="flex gap-2">
            <Button variant="default" size="sm"><ShoppingCart size={14} className="mr-2" />В корзину</Button>
            <Button variant="outline" size="sm"><Eye size={14} className="mr-2" />Подробнее</Button>
          </div>
      </div>
    </div>
  )
}

