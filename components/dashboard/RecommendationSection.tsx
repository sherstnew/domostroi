"use client"

import React, { useEffect, useState } from "react"
import CircularGallery from '@/components/CircularGallery'

interface ProductShort {
  id: string
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
      alert("Ошибка при добавлении в группу")
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
      alert("Ошибка при удалении из группы")
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
      await handleAddToGroup(created._id, productId)
      // notify others
      try { window.dispatchEvent(new Event('groups:updated')) } catch (e) {}
    } catch (err) {
      console.error(err)
      alert("Ошибка при создании группы")
    } finally {
      setCreating(false)
      setNewGroupName("")
    }
  }

  async function toggleFavoriteRemote(productId: string) {
    // guess: if in favorites -> DELETE, else POST
    const isFav = favorites.includes(productId)
    setActionInProgress(true)
    try {
      const res = await fetch(`/api/favorites`, {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId })
      })
      if (!res.ok) throw new Error("Ошибка избранного")
      // notify parent to update UI
      onToggleFavorite(productId)
    } catch (err) {
      console.error(err)
      alert("Не удалось обновить избранное")
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <section className="card p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-6 font-serif">Рекомендуем для вас</h2>
      <div className="w-full h-[50vh] mb-6">
        {/* Circular gallery visual */}
        {/* render images + text in WebGL gallery */}
        {typeof window !== 'undefined' && (
          <CircularGallery items={products.map(p => ({ image: p.image, text: p.name }))} />
        )}
      </div>

      {/* Below the gallery: actionable horizontal product list */}
      <div className="flex gap-4 overflow-x-auto py-2">
        {products.map(p => (
          <div key={p.id} className="min-w-[220px] border border-gray-200 rounded-xl p-3 flex-shrink-0">
            <div className="mb-2 bg-gray-100 rounded overflow-hidden h-28">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-medium text-[var(--dark-green)] mb-1">{p.name}</div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-[var(--accent-orange)]">{p.price} ₽</div>
              <div className="text-sm text-gray-600">{p.calories} ккал</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleFavoriteRemote(p.id)} disabled={actionInProgress} className={`px-2 py-1 rounded ${favorites.includes(p.id) ? 'text-[var(--accent-orange)]' : 'text-gray-400'}`}>♥</button>
              <button onClick={() => setModalOpenFor(p.id)} className="px-2 py-1 border rounded text-sm">В группу</button>
              <a href={`/stores/${p.id}`} className="px-2 py-1 border rounded text-sm">Магазин</a>
            </div>
          </div>
        ))}
      </div>

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
                {groups.length === 0 && <div className="text-sm text-gray-500">У вас пока нет групп</div>}
                {groups.map(g => {
                  const inGroup = !!g.products?.includes(modalOpenFor as string)
                  return (
                    <div key={g._id} className="flex justify-between items-center border p-2 rounded">
                      <div>
                        <div className="font-medium">{g.name}</div>
                        <div className="text-xs text-gray-500">{(g.products || []).length} продуктов</div>
                      </div>
                      {inGroup ? (
                        <div className="flex gap-2">
                          <button disabled={actionInProgress} onClick={() => handleRemoveFromGroup(g._id, modalOpenFor as string)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Удалить</button>
                        </div>
                      ) : (
                        <button disabled={actionInProgress} onClick={() => handleAddToGroup(g._id, modalOpenFor as string)} className="px-2 py-1 bg-[var(--accent-orange)] text-white rounded text-sm">Добавить</button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t pt-3">
              <label className="block text-sm mb-1">Создать новую группу</label>
              <div className="flex gap-2">
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="flex-1 border rounded p-2" placeholder="Название группы" />
                <button disabled={creating} onClick={() => handleCreateGroupAndAdd(modalOpenFor)} className="px-3 py-2 bg-green-600 text-white rounded">Создать и добавить</button>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => setModalOpenFor(null)} className="px-3 py-2 border rounded">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}