'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import PreferencesForm from '@/components/onboarding/PreferencesForm'
import DynamicGoals from '@/components/onboarding/DynamicGoals'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('onboarding:preferences') || '{}')
    } catch {
      return {}
    }
  })

  const saveAndContinue = (patch: any) => {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    try { localStorage.setItem('onboarding:preferences', JSON.stringify(next)) } catch (e) {}
    setStep((s) => s + 1)
  }

  const finish = async (patch: any) => {
    const final = { ...preferences, ...patch }
    try { localStorage.setItem('user:preferences', JSON.stringify(final)) } catch (e) {}
    // try to persist to backend if token exists
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/user-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(final)
        })
      }
    } catch (e) {
      console.warn('Failed saving preferences to server', e)
    }
    setStep(4)
  }

  return (
    <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-8">
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--dark-green)] mb-2 font-serif">Покупайте осознанно. Экономьте время</h1>
            <p className="text-[var(--text-color)]/80 mb-8">Мы поможем вам найти продукты в магазине, которые подходят именно вам</p>
            <Button onClick={() => setStep(2)} className="px-8 py-3">Начать настройку</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-2">Что для вас важно?</h2>
            <p className="text-gray-600 mb-4">Выберите один или несколько вариантов. Это поможет нам делать точные рекомендации.</p>
            <PreferencesForm
              initial={preferences}
              onNext={(p: any) => saveAndContinue(p)}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-2">Настройте цели на сегодня</h2>
            <p className="text-[var(--text-color)]/80 mb-4">Укажите ограничения и цели, которые будут применены к рекомендациям.</p>
            <DynamicGoals
              initial={preferences.goals}
              onBack={() => setStep(2)}
              onNext={(g: any) => saveAndContinue({ goals: g })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4">Отлично! Ваш профиль готов.</h2>
            <p className="text-[var(--text-color)]/80 mb-6">Вы можете начать покупки и получать персональные рекомендации.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => finish({})} className="px-6 py-2">Начать покупки!</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="px-6 py-2">Перейти в приложение</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}