"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToasts } from '@/components/ui/toast'

const LIFESTYLES = [
  'диабет 1 типа',
  'диабет 2 типа',
  'веганство',
  'вегетарианство',
  'безглютеновое питание',
  'безлактозное питание',
  'натуральный состав',
  'без сахара'
]

const FORBIDDEN = [
  'цитрусовые',
  'молочка',
  'хлеб',
  'малина',
  'яблоки'
]

type MacroPref = 'more' | 'less' | 'normal'

export default function PreferencesForm({ initial = {}, onSave, showActions = true }: any) {
  const [lifestyle, setLifestyle] = useState<string[]>(initial.lifestyle || [])
  const [forbidden, setForbidden] = useState<string[]>(initial.forbidden || [])
  const [macros, setMacros] = useState<{ protein: MacroPref; fat: MacroPref; carbs: MacroPref }>(() => ({
    protein: initial.macros?.protein || 'normal',
    fat: initial.macros?.fat || 'normal',
    carbs: initial.macros?.carbs || 'normal'
  }))
  const [saving, setSaving] = useState(false)
  const toasts = useToasts()

  const toggleLifestyle = (v: string) => setLifestyle(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  const toggleForbidden = (v: string) => setForbidden(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  const setMacro = (key: 'protein'|'fat'|'carbs', val: MacroPref) => setMacros(m => ({ ...m, [key]: val }))

  const submit = () => {
    // client-side submit will instead persist to server and notify parent with updated preferences
    savePreferences()
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const payload = { lifestyle, macros, forbidden }
      // try to get existing preferences to merge
      let existing: any = {}
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const r = await fetch('/api/user-preferences', { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (r.ok) {
          const d = await r.json()
          existing = d.preferences || {}
        }
      } catch (e) {
        // ignore, we'll save payload as-is
      }

      const merged = { ...existing, ...payload }
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch('/api/user-preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include', body: JSON.stringify(merged) })
      if (!res.ok) throw new Error('Failed saving preferences')
      // server returns { message, preferences }
      const data = await res.json()
      const updated = data.preferences || merged
  onSave?.(updated)
  try { toasts?.add?.('Предпочтения сохранены', 'success') } catch (e) {}
    } catch (e) {
  console.error('Preferences save failed', e)
  try { toasts?.add?.('Ошибка при сохранении предпочтений', 'error') } catch (e) {}
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Образ жизни</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LIFESTYLES.map(l => (
            <button key={l} onClick={() => toggleLifestyle(l)} className={`p-3 rounded-lg border transition ${lifestyle.includes(l) ? 'bg-[var(--light-green)] text-white border-[var(--light-green)]' : 'bg-white text-[var(--text-color)]/90'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Акцент на БЖУ</h3>
        <p className="text-sm text-gray-600 mb-3">Выберите для каждого — больше, меньше или нормально</p>
        <div className="flex flex-wrap gap-3">
          <div>
            <div className="text-sm mb-2">Белки</div>
            <div className="flex gap-2">
              <Button size="sm" variant={macros.protein === 'more' ? 'outline' : 'default'} onClick={() => setMacro('protein','more')}>Больше</Button>
              <Button size="sm" variant={macros.protein === 'normal' ? 'outline' : 'default'} onClick={() => setMacro('protein','normal')}>Нормально</Button>
              <Button size="sm" variant={macros.protein === 'less' ? 'outline' : 'default'} onClick={() => setMacro('protein','less')}>Меньше</Button>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2">Жиры</div>
            <div className="flex gap-2">
              <Button size="sm" variant={macros.fat === 'more' ? 'outline' : 'default'} onClick={() => setMacro('fat','more')}>Больше</Button>
              <Button size="sm" variant={macros.fat === 'normal' ? 'outline' : 'default'} onClick={() => setMacro('fat','normal')}>Нормально</Button>
              <Button size="sm" variant={macros.fat === 'less' ? 'outline' : 'default'} onClick={() => setMacro('fat','less')}>Меньше</Button>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2">Углеводы</div>
            <div className="flex gap-2">
              <Button size="sm" variant={macros.carbs === 'more' ? 'outline' : 'default'} onClick={() => setMacro('carbs','more')}>Больше</Button>
              <Button size="sm" variant={macros.carbs === 'normal' ? 'outline' : 'default'} onClick={() => setMacro('carbs','normal')}>Нормально</Button>
              <Button size="sm" variant={macros.carbs === 'less' ? 'outline' : 'default'} onClick={() => setMacro('carbs','less')}>Меньше</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Запрет на продукты</h3>
        <div className="flex gap-2 flex-wrap">
          {FORBIDDEN.map(f => (
            <button key={f} onClick={() => toggleForbidden(f)} className={`px-4 py-2 rounded-full border transition ${forbidden.includes(f) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-[var(--text-color)]/90'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onSave?.(null)}>Отмена</Button>
          <Button onClick={submit}>Сохранить</Button>
        </div>
    </div>
  )
}
