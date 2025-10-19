'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface Store {
  _id: string
  name: string
  address: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

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
              <Link key={s._id} href={`/stores/${s._id}`} className="block p-4 border rounded hover:shadow">
                <div className="font-medium text-[var(--dark-green)]">{s.name}</div>
                <div className="text-sm text-gray-600">{s.address}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
