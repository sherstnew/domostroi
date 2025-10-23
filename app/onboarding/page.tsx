'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import PreferencesForm from '@/components/onboarding/PreferencesForm'
import { useAuth } from '@/context/AuthContext'

export default function Onboarding() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [preferences, setPreferences] = useState<any>({})

  useEffect(() => {
    // initialize from server-provided user preferences when available
    if ((user as any)?.preferences) setPreferences((user as any).preferences)
  }, [user])

  const save = async (patch: any) => {
    if (!patch) return
    const final = { ...preferences, ...patch }
    setPreferences(final)
    try {
      // persist to server; use credentials so cookie or token-based auth works
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(final)
      })
      if (res.ok) {
        const jd = await res.json()
        const updated = jd.preferences || final
        // update auth context so rest of app sees new preferences
        try { updateUser && updateUser({ ...(user as any), preferences: updated }) } catch (e) {}
      } else {
        console.warn('Failed saving preferences to server', res.status)
      }
    } catch (e) {
      console.warn('Failed saving preferences to server', e)
    }
    // redirect to dashboard after save
    try { window.location.href = '/dashboard' } catch (e) {}
  }

  return (
    <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--dark-green)] mb-2">Настройка предпочтений</h1>
          <p className="text-[var(--text-color)]/80 mb-4">Укажите образ жизни, акцент на БЖУ и продукты, которые нужно исключить.</p>
          <PreferencesForm initial={preferences} onSave={(p:any) => save(p)} />
        </div>
      </div>
    </div>
  )
}