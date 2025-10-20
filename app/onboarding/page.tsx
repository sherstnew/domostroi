'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import PreferencesForm from '@/components/onboarding/PreferencesForm'

export default function Onboarding() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user:preferences') || '{}')
    } catch {
      return {}
    }
  })

  const save = async (patch: any) => {
    if (!patch) return
    const final = { ...preferences, ...patch }
    setPreferences(final)
    try { localStorage.setItem('user:preferences', JSON.stringify(final)) } catch (e) {}
    try {
      const token = localStorage.getItem('token')
      // prefer using token header; server also checks cookie
      await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(final)
      })
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