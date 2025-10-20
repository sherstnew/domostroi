"use client"

import React from 'react'
import ProductCard from './ProductCard'
import { Button } from './ui/button'

interface Props {
  products: any[]
  favorites?: string[]
  onToggleFavorite?: (id: string) => void
}

export default function ProductCarousel({ products, favorites = [], onToggleFavorite }: Props) {
  return (
    <div className="relative">
      <Button variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 z-10">‹</Button>
      <div className="flex gap-6 overflow-x-auto py-4 px-6 scroll-pl-6 snap-x snap-mandatory">
        {products.map(p => (
          <ProductCard key={p._id || p.id} product={p} onToggleFavorite={onToggleFavorite} isFavorite={favorites.includes(p._id || p.id)} />
        ))}
      </div>
      <Button variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 z-10">›</Button>
    </div>
  )
}
