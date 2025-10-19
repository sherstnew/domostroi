'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategorySelector from '@/components/onboarding/CategorySelector'

export default function Onboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const lifestyleOptions = [
    'диабет 1 типа', 'диабет 2 типа', 'веганство', 'вегетарианство', 
    'безглютеновое питание', 'безлактозное питание', 'натуральный состав', 'без сахара'
  ]

  const bjuOptions = [
    'Больше углеводов', 'Больше белков', 'Больше жиров',
    'Меньше углеводов', 'Меньше белков', 'Меньше жиров'
  ]

  const forbiddenProducts = [
    'цитрусовые', 'молочка', 'хлеб', 'малина', 'яблоки', 'орехи', 'морепродукты',
    'яйца', 'соя', 'кукуруза', 'пшеница', 'шоколад', 'кофе', 'алкоголь'
  ]

  const steps = [
    {
      title: 'Ваш образ жизни',
      description: 'Выберите особенности питания, которые соответствуют вашему образу жизни',
      options: lifestyleOptions,
      type: 'lifestyle'
    },
    {
      title: 'Акцент на БЖУ',
      description: 'Какой баланс белков, жиров и углеводов вы предпочитаете?',
      options: bjuOptions,
      type: 'bju'
    },
    {
      title: 'Запрещенные продукты',
      description: 'Отметьте продукты, которые вам нельзя употреблять',
      options: forbiddenProducts,
      type: 'forbidden'
    }
  ]

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      // Группируем выбранные категории по типам
      const preferences = {
        lifestyle: selectedCategories.filter(cat => lifestyleOptions.includes(cat)),
        bju: selectedCategories.filter(cat => bjuOptions.includes(cat)),
        forbidden: selectedCategories.filter(cat => forbiddenProducts.includes(cat)),
        dietaryRestrictions: selectedCategories
      }

      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Ошибка сохранения предпочтений')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
      // В случае ошибки все равно переходим на дашборд
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      savePreferences()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--dark-green)] mb-2 font-serif">
            {steps[currentStep].title}
          </h1>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>

        <CategorySelector
          options={steps[currentStep].options}
          selectedOptions={selectedCategories}
          onOptionToggle={handleCategoryToggle}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Назад
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Шаг {currentStep + 1} из {steps.length}
            </span>
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary px-6 py-2 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}