 'use client'

import { useState, useEffect, useRef } from 'react'
import { useToasts } from '@/components/ui/toast'
import { Loader2, PlusCircle, Trash2, Box, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductGroup {
  id: string
  name: string
  products: { id: string; name: string; price?: number; calories?: number }[]
  totalCalories: number
  totalPrice: number
}

export default function ProductGroups() {
  const toasts = useToasts()
  const [groups, setGroups] = useState<ProductGroup[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [manageGroupId, setManageGroupId] = useState<string | null>(null)
  const [productToAdd, setProductToAdd] = useState('')
  const [groupsLoading, setGroupsLoading] = useState(true)
  // load real products to populate select
  const [availableProducts, setAvailableProducts] = useState<{ id: string; name: string; price?: number; calories?: number }[]>([])
  const isMountedRef = useRef(true)

  const fetchGroups = async () => {
    setGroupsLoading(true)
    try {
      const res = await fetch('/api/groups')
      if (!res.ok) return
      const data = await res.json()
      const groupsRaw = (data.groups || [])
      const list = await Promise.all(groupsRaw.map(async (g: any) => {
        const ids = (g.products || []).map((p: any) => (typeof p === 'string' ? p : (p.id || p._id || p)))
        // fetch product details for each id
        const prods = await Promise.all(ids.map(async (pid: string) => {
          try {
            const r = await fetch(`/api/products/${pid}`)
            if (!r.ok) return { id: pid, name: pid, price: 0, calories: 0 }
            const dd = await r.json()
            const pr = dd.product
            return { id: pr._id || pr.id || pid, name: pr.name || pid, price: pr.price || 0, calories: pr.calories || 0 }
          } catch (err) {
            return { id: pid, name: pid, price: 0, calories: 0 }
          }
        }))

        const totalCalories = prods.reduce((s, p) => s + (p.calories || 0), 0)
        const totalPrice = prods.reduce((s, p) => s + (p.price || 0), 0)

        return {
          id: g._id || g.id,
          name: g.name,
          products: prods,
          totalCalories,
          totalPrice
        }
      }))
      if (isMountedRef.current) setGroups(list)
    } catch (e) {
      console.error('Failed to load groups', e)
    }
    finally {
      if (isMountedRef.current) setGroupsLoading(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    // initial load
    fetchGroups()
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) return
        const data = await res.json()
        const list = (data.products || []).map((p: any) => ({ id: p._id || p.id, name: p.name, price: p.price || 0, calories: p.calories || 0 }))
        if (isMountedRef.current) setAvailableProducts(list)
      } catch (e) {
        console.error('Failed to load products for select', e)
      }
    }
    fetchProducts()

    const onGroupsUpdated = () => {
      fetchGroups()
    }
    window.addEventListener('groups:updated', onGroupsUpdated)

    return () => {
      isMountedRef.current = false
      window.removeEventListener('groups:updated', onGroupsUpdated)
    }
  }, [])

    // createGroupLocal removed — we always create remote groups now

  const createGroupRemote = async () => {
    if (!newGroupName.trim()) return
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName })
      })
      const data = await res.json()
      if (res.ok) {
        const g = data.group
        setGroups(prev => [...prev, { id: g._id, name: g.name, products: [], totalCalories: 0, totalPrice: 0 }])
        setNewGroupName('')
        setShowCreateForm(false)
      }
    } catch (e) {
      console.error('Create group error', e)
      toasts?.add?.('Ошибка при создании группы', 'error')
    }
  }

  const addProductToGroup = async (groupId: string) => {
    if (!productToAdd.trim()) return
    try {
      // fetch product details to get the name/price/calories
      let prod = availableProducts.find(p => p.id === productToAdd)
      if (!prod) {
        try {
          const r = await fetch(`/api/products/${productToAdd}`)
          if (r.ok) {
            const dd = await r.json()
            const p = dd.product
            prod = { id: p._id || p.id || productToAdd, name: p.name, price: p.price || 0, calories: p.calories || 0 }
          }
        } catch (err) {
          // ignore, will fallback
        }
      }

      const payload = { action: 'add', productId: productToAdd }
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to add')

      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g
        const newProd = { id: productToAdd, name: prod?.name || productToAdd, price: prod?.price || 0, calories: prod?.calories || 0 }
        const products = [...g.products, newProd]
        const totalCalories = products.reduce((s, p) => s + (p.calories || 0), 0)
        const totalPrice = products.reduce((s, p) => s + (p.price || 0), 0)
        return { ...g, products, totalCalories, totalPrice }
      }))
      setProductToAdd('')
    } catch (e) {
      console.error('Add product to group error', e)
      toasts?.add?.('Не удалось добавить продукт в группу', 'error')
    }
  }

  const removeProductFromGroup = async (groupId: string, productId: string) => {
    try {
      await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', productId })
      })
      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g
        const products = g.products.filter((p: any) => p.id !== productId)
        const totalCalories = products.reduce((s, p) => s + (p.calories || 0), 0)
        const totalPrice = products.reduce((s, p) => s + (p.price || 0), 0)
        return { ...g, products, totalCalories, totalPrice }
      }))
    } catch (e) {
      console.error('Remove product from group error', e)
      toasts?.add?.('Не удалось удалить продукт из группы', 'error')
    }
  }

  return (
    <section className="card p-6">
        <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--dark-green)] font-serif">
          Группы продуктов
        </h2>
        <Button onClick={() => setShowCreateForm(true)}>+ Создать группа</Button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <input
            type="text"
            placeholder="Название группы..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] text-[var(--text-color)]/90"
          />
          <div className="flex gap-2">
            <Button onClick={createGroupRemote} className="text-sm">Создать</Button>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)} className="text-sm">Отмена</Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {groupsLoading ? (
          // simple skeletons
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse bg-gray-50 h-40" />
          ))
        ) : (
          groups.map(group => (
            <div key={group.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[var(--dark-green)]">{group.name}</h3>
                <Button onClick={() => setManageGroupId(group.id)} variant="outline" size="sm">Управлять</Button>
              </div>

              {group.products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🥑</div>
                  <p>Добавьте продукты в группу</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600 mb-3">
                    <div className="flex items-center gap-2"><Box size={14} className="text-[var(--light-green)]" />{group.products.length} товаров</div>
                    <div className="flex items-center gap-2"><Layers size={14} className="text-[var(--accent-orange)]" />{group.totalCalories} ккал</div>
                    <div className="flex items-center gap-2"><svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{group.totalPrice} ₽</div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.products.map(p => (
                      <div key={p.id} className="flex justify-between items-center border p-2 rounded">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.calories} ккал · {p.price} ₽</div>
                        </div>
                        <Button onClick={() => removeProductFromGroup(group.id, p.id)} variant="destructive" size="sm">Удалить</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {manageGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Управление группой</h3>
            <div className="mb-4">
              <select value={productToAdd} onChange={e => setProductToAdd(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-2 text-[var(--text-color)]/90">
                <option value="">Выберите продукт...</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => { if (manageGroupId) addProductToGroup(manageGroupId) }} className="">Добавить</Button>
                <Button variant="ghost" onClick={() => { setManageGroupId(null); setProductToAdd('') }}>Закрыть</Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Товары в группе</h4>
                <div className="space-y-2 max-h-48 overflow-auto">
                {manageGroupId && groups.find(g => g.id === manageGroupId)?.products?.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center border p-2 rounded">
                    <div>{p.name}</div>
                    <button onClick={() => removeProductFromGroup(manageGroupId, p.id)} className="text-red-500">Удалить</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}