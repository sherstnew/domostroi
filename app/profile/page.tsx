"use client"

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DynamicGoals from '@/components/onboarding/DynamicGoals'
import CategorySelector from '@/components/onboarding/CategorySelector'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<any>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newAllergy, setNewAllergy] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const [prefsRes, meRes] = await Promise.all([
          fetch('/api/user-preferences'),
          fetch('/api/auth/me', { credentials: 'include' })
        ])
        if (prefsRes.ok) {
          const data = await prefsRes.json()
          setPrefs(data.preferences || {})
        }
        if (meRes.ok) {
          const me = await meRes.json()
          setUser(me.user)
          // merge some profile fields
          setPrefs((p: any) => ({ ...p, ...(me.user?.profile || {}), email: me.user?.email, name: me.user?.profile?.fullName }))
        }
      } catch (e) {
        console.warn(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    try {
      // save preferences
      await fetch('/api/user-preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
      // try to save basic user fields (name, email, weeklyBudget)
      try {
        const payload: any = {}
        if (prefs.name) payload.fullName = prefs.name
        if (prefs.email) payload.email = prefs.email
        if (typeof prefs.weeklyBudget !== 'undefined') payload.weeklyBudget = prefs.weeklyBudget
        if (Object.keys(payload).length > 0) {
          const res2 = await fetch('/api/auth/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
          if (!res2.ok) console.warn('Failed to save /api/auth/me')
        }
      } catch (e) {
        console.warn('Failed to save user profile', e)
      }
      router.push('/dashboard')
    } catch (e) {
      alert('Ошибка при сохранении')
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Профиль и предпочтения</h1>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-color)]/80">Имя</label>
            <Input value={prefs.name || prefs.fullName || ''} onChange={e => setPrefs((p:any) => ({ ...p, name: e.target.value }))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-color)]/80">Email</label>
            <Input value={prefs.email || ''} onChange={e => setPrefs((p:any) => ({ ...p, email: e.target.value }))} className="w-full" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Личные предпочтения</h3>
          <p className="text-sm text-gray-600 mb-2">Выберите те же опции, что и при онбординге</p>
          <CategorySelector options={["Мясо","Овощи","Фрукты","Молоко","Хлеб","Заморозка"]} selectedOptions={prefs.lifestyle || []} onOptionToggle={(opt:string) => setPrefs((p:any) => ({ ...p, lifestyle: (p.lifestyle||[]).includes(opt) ? p.lifestyle.filter((x:string)=>x!==opt) : [...(p.lifestyle||[]), opt] }))} />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Аллергии</h3>
          <div className="flex gap-2 mb-2">
            <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Добавить аллерген" id="new-allergy" />
            <Button onClick={() => {
              const v = (newAllergy || '').trim()
              if (!v) return
              setPrefs((p:any) => ({ ...p, allergies: Array.from(new Set([...(p.allergies||[]), v])) }))
              setNewAllergy('')
            }}>Добавить</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(prefs.allergies || []).map((a:string) => (
              <span key={a} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2">
                {a}
                <button onClick={() => setPrefs((p:any) => ({ ...p, allergies: (p.allergies||[]).filter((x:string)=>x!==a) }))} className="text-red-500">✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Цели и бюджет</h3>
          <DynamicGoals initial={prefs.goals || {}} onNext={(g:any) => setPrefs((p:any) => ({ ...p, goals: g }))} onBack={() => {}} />
        </div>
        <div className="flex gap-2">
          <Button onClick={save} className="px-4 py-2">Сохранить</Button>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="px-4 py-2">Отмена</Button>
        </div>
      </div>
    </div>
  )
}
