'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useToasts } from '@/components/ui/toast'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Store {
  _id: string
  name: string
  address: string
}

export default function StoresPage() {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const toasts = useToasts()
  const router = useRouter()

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/stores')
        if (!res.ok) throw new Error('Не удалось получить магазины')
        const data = await res.json()
        setStores(data.stores || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStores()
  }, [])

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[var(--dark-green)] mb-6">Магазины</h1>

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {stores.map(s => (
              <div key={s._id} className="p-4 border rounded hover:shadow flex items-center justify-between">
                <Link href={`/stores/${s._id}`} className="flex-1">
                  <div className="font-medium text-[var(--dark-green)]">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.address}</div>
                </Link>
                <div className="ml-4">
                  {(user as any)?.selectedStore === s._id ? (
                    <button disabled className="px-3 py-1 opacity-50 cursor-not-allowed border rounded">Выбран</button>
                  ) : (
                    <button onClick={async () => {
                      try {
                        const token = localStorage.getItem('token')
                        if (!token) { window.location.href = '/login'; return }
                        const res = await fetch('/api/user/store', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ storeId: s._id, storeName: s.name }) })
                        if (!res.ok) throw new Error('fail')
                        const jd = await res.json()
                        try { window.dispatchEvent(new CustomEvent('user:updated', { detail: { user: jd.user } })) } catch (e) {}
                        window.location.reload();
                        toasts.add('Магазин выбран', 'success')
                      } catch (e) { console.error(e); toasts.add('Ошибка при выборе магазина', 'error') }
                    }} className="btn-primary px-3 py-1">Выбрать</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
