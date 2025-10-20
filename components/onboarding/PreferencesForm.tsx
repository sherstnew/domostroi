"use client"

import { useState } from 'react'
import CategorySelector from './CategorySelector'
import { Button } from '@/components/ui/button'

const LIFESTYLE = [
  'Веган',
  'Вегетарианец',
  'Кето / Низкоуглеводное',
  'Без глютена',
  'Ем без сахара',
  'Аллергия'
]

export default function PreferencesForm({ initial = {}, onNext }: any) {
  const [selected, setSelected] = useState<string[]>(initial.lifestyle || [])
  const [allergies, setAllergies] = useState<string[]>(initial.allergies || [])

  const toggle = (opt: string) => {
    if (opt === 'Аллергия') {
      const a = prompt('Укажите аллерген, например: арахис')
      if (a) setAllergies((s) => Array.from(new Set([...s, a])))
      return
    }
    setSelected((s) => (s.includes(opt) ? s.filter(x => x !== opt) : [...s, opt]))
  }

  return (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {["Мясо","Овощи","Фрукты","Молоко","Хлеб","Заморозка"].map(x => (
              <div key={x} className={`p-3 border rounded cursor-pointer text-[var(--text-color)]/90 ${selected.includes(x) ? 'bg-[var(--light-green)] text-white' : ''}`} onClick={() => toggle(x)}>
                {x}
              </div>
            ))}
          </div>
  
          <div className="flex justify-end mt-4">
            <Button onClick={() => onNext?.({ selected })} variant="default">Далее</Button>
          </div>
        </div>
  )
}
