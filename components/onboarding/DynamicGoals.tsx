"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DynamicGoals({ initial = {}, onNext, onBack }: any) {
  const [calories, setCalories] = useState<number | ''>(initial?.calories ?? '')
  const [budget, setBudget] = useState<number | ''>(initial?.budget ?? '')
  const [mode, setMode] = useState<'simple' | 'detailed'>(initial?.mode || 'simple')
  const [protein, setProtein] = useState<number | ''>(initial?.protein ?? '')
  const [fat, setFat] = useState<number | ''>(initial?.fat ?? '')
  const [carbs, setCarbs] = useState<number | ''>(initial?.carbs ?? '')

  const submit = () => {
    onNext?.({ calories, budget, mode, protein, fat, carbs })
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-color)]/80">Калораж (ккал)</label>
          <Input value={calories} onChange={e => setCalories(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full" placeholder="Например 1800" />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-color)]/80">Бюджет (руб.)</label>
          <Input value={budget} onChange={e => setBudget(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full" placeholder="Например 500" />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-color)]/80">БЖУ</label>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => setMode('simple')} variant={mode === 'simple' ? 'default' : 'outline'} size="sm">Простой режим</Button>
            <Button onClick={() => setMode('detailed')} variant={mode === 'detailed' ? 'default' : 'outline'} size="sm">Точный режим</Button>
          </div>

          {mode === 'simple' ? (
            <div className="mt-3 flex gap-2">
              <Button onClick={() => { setProtein(150); setFat('' as any); setCarbs('' as any); }} size="sm">Больше белка</Button>
              <Button onClick={() => { setFat(40); setProtein('' as any); setCarbs('' as any); }} size="sm">Меньше жиров</Button>
              <Button onClick={() => { setCarbs(120); setProtein('' as any); setFat('' as any); }} size="sm">Меньше углеводов</Button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Input value={protein} onChange={e => setProtein(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Белки г" className="px-2 py-1" />
              <Input value={fat} onChange={e => setFat(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Жиры г" className="px-2 py-1" />
              <Input value={carbs} onChange={e => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Углеводы г" className="px-2 py-1" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={onBack} variant="outline" className="border">Назад</Button>
        <Button onClick={submit} variant="default">Сохранить и далее</Button>
      </div>
    </div>
  )
}
