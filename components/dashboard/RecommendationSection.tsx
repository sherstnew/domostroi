"use client"

import React, { useEffect, useState } from "react"
import { useToasts } from '@/components/ui/toast'
import CircularGallery from '@/components/CircularGallery'
import ProductCarousel from '@/components/ProductCarousel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProductShort {
  _id: string
  name: string
  price: number
  calories: number
  image: string
  tags: string[]
}

interface Group {
  _id: string
  name: string
  products?: string[]
}

interface Props {
  products: ProductShort[]
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

export default function RecommendationSection({ products, favorites, onToggleFavorite }: Props) {
  const [modalOpenFor, setModalOpenFor] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [actionInProgress, setActionInProgress] = useState(false)
  const toasts = useToasts()

  async function fetchGroups() {
    setLoadingGroups(true)
    try {
      const res = await fetch("/api/groups", { credentials: "include" })
      if (!res.ok) throw new Error("Не удалось получить группы")
      const data = await res.json()
      // Server may return { groups: [...] } or an array
      if (Array.isArray(data)) setGroups(data)
      else if (Array.isArray(data.groups)) setGroups(data.groups)
      else setGroups([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingGroups(false)
    }
  }

  useEffect(() => {
    if (modalOpenFor) fetchGroups()
  }, [modalOpenFor])

  async function handleAddToGroup(groupId: string, productId: string) {
    setActionInProgress(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "add", productId })
      })
      if (!res.ok) throw new Error("Не удалось добавить в группу")
      // optimistic local update
      setGroups(prev => prev.map(g => g._id === groupId ? { ...g, products: Array.from(new Set([...(g.products||[]), productId])) } : g))
      setModalOpenFor(null)
      // broadcast update so other components can refetch
      try { window.dispatchEvent(new Event('groups:updated')) } catch (e) {}
    } catch (err) {
      console.error(err)
      toasts.add("Ошибка при добавлении в группу", 'error')
    } finally {
      setActionInProgress(false)
    }
  }

  async function handleRemoveFromGroup(groupId: string, productId: string) {
    setActionInProgress(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "remove", productId })
      })
      if (!res.ok) throw new Error("Не удалось удалить из группы")
      setGroups(prev => prev.map(g => g._id === groupId ? { ...g, products: (g.products || []).filter(id => id !== productId) } : g))
    } catch (err) {
      console.error(err)
      toasts.add("Ошибка при удалении из группы", 'error')
    } finally {
      setActionInProgress(false)
    }
  }

  async function handleCreateGroupAndAdd(productId: string) {
    if (!newGroupName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newGroupName.trim() })
      })
      if (!res.ok) throw new Error("Не удалось создать группу")
      const created = await res.json()
      // immediately add product to created group
      try {
        await handleAddToGroup(created._id, productId)
      } catch (e) {
        console.warn('Failed to add to newly created group', e)
      }
    } catch (err) {
      console.error(err)
      toasts.add("Не удалось создать группу", 'error')
    } finally {
      setCreating(false)
      setNewGroupName("")
    }
  }

  async function toggleFavoriteRemote(productId: string) {
    const isFav = favorites.includes(productId)
    setActionInProgress(true)
    try {
      let res
      if (isFav) {
        // server expects productId in query for DELETE
        res = await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      } else {
        res = await fetch(`/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId })
        })
      }
      if (!res.ok) throw new Error('Ошибка избранного')
      onToggleFavorite(productId)
    } catch (err) {
      console.error(err)
      toasts.add('Не удалось обновить избранное', 'error')
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <section className="card p-6 my-8">
      <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-6 font-serif">Рекомендуем для вас</h2>
      {/* <div className="w-full h-[50vh] mb-6"> */}
        {/* Circular gallery visual */}
        {/* render images + text in WebGL gallery */}
        {/* {typeof window !== 'undefined' && (
          <CircularGallery textColor='#000000' items={products.map(p => ({ image: p.image, text: p.name }))} />
        )} */}
      {/* </div> */}

      {/* Below the gallery: actionable horizontal product carousel */}
      <ProductCarousel products={products} favorites={favorites} onToggleFavorite={toggleFavoriteRemote} />

      {/* Modal for groups */}
      {modalOpenFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpenFor(null)} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Добавить в группу</h3>
            {loadingGroups ? (
              <div>Загрузка групп...</div>
            ) : (
              <div className="space-y-3 mb-4">
                {groups.length === 0 && <div className="text-sm text-[var(--text-color)]/70">У вас пока нет групп</div>}
                {groups.map(g => {
                  const inGroup = !!g.products?.includes(modalOpenFor as string)
                  return (
                    <div key={g._id} className="flex justify-between items-center border p-2 rounded">
                      <div>
                        <div className="font-medium">{g.name}</div>
                        <div className="text-xs text-[var(--text-color)]/70">{(g.products || []).length} продуктов</div>
                      </div>
                      {inGroup ? (
                        <div className="flex gap-2">
                          <Button disabled={actionInProgress} onClick={() => handleRemoveFromGroup(g._id, modalOpenFor as string)} variant="destructive" size="sm">Удалить</Button>
                        </div>
                      ) : (
                        <Button disabled={actionInProgress} onClick={() => handleAddToGroup(g._id, modalOpenFor as string)} variant="default" size="sm">Добавить</Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t pt-3">
              <label className="block text-sm mb-1">Создать новую группу</label>
              <div className="flex gap-2">
                <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-1" placeholder="Название группы" />
                <Button disabled={creating} onClick={() => handleCreateGroupAndAdd(modalOpenFor)} variant="default" className="bg-green-600 hover:bg-green-500">Создать и добавить</Button>
              </div>
            </div>

            <div className="mt-4 text-right">
              <Button onClick={() => setModalOpenFor(null)} variant="ghost">Закрыть</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}