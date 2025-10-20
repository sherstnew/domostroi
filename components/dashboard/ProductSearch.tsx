'use client'

import { useState } from 'react'
import { useToasts } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ProductSearchProps {
  onSearchResults: (results: any[]) => void
  products?: any[]
  hasDiabetes?: boolean
}

interface Filters {
  noSugar: boolean
  natural: boolean
  maxPrice: string
  carbsMin: string
  carbsMax: string
  proteinMin: string
  proteinMax: string
  fatMin: string
  fatMax: string
  calMin: string
  calMax: string
  breadUnitsMin: string
  breadUnitsMax: string
}

export default function ProductSearch({ onSearchResults, products = [], hasDiabetes = false }: ProductSearchProps) {
  const toasts = useToasts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [bjuMode, setBjuMode] = useState<'simple' | 'detailed'>('simple')
  
  const [filters, setFilters] = useState<Filters>({
    noSugar: false,
    natural: false,
    maxPrice: '',
    carbsMin: '',
    carbsMax: '',
    proteinMin: '',
    proteinMax: '',
    fatMin: '',
    fatMax: '',
    calMin: '',
    calMax: '',
    breadUnitsMin: '',
    breadUnitsMax: '',
  })

  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredientChips, setIngredientChips] = useState<string[]>([])

  // Предустановленные ингредиенты
  const commonIngredients = ['шоколад', 'абрикосы', 'сахар', 'соль', 'орехи', 'мёд', 'ягоды', 'сыр', 'молоко', 'яйца']

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    let results: any[] = []
    try {
      results = products.filter((p: any) => {
        // Поиск по тексту
        if (searchTerm && !(p.name + ' ' + p.description).toLowerCase().includes(searchTerm.toLowerCase())) return false
        
        // Фильтры по макронутриентам
        if (filters.carbsMin && p.carbs < Number(filters.carbsMin)) return false
        if (filters.carbsMax && p.carbs > Number(filters.carbsMax)) return false
        if (filters.proteinMin && p.protein < Number(filters.proteinMin)) return false
        if (filters.proteinMax && p.protein > Number(filters.proteinMax)) return false
        if (filters.fatMin && p.fat < Number(filters.fatMin)) return false
        if (filters.fatMax && p.fat > Number(filters.fatMax)) return false
        
        // Калории
        if (filters.calMin && p.calories < Number(filters.calMin)) return false
        if (filters.calMax && p.calories > Number(filters.calMax)) return false
        
        // Бюджет
        if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false
        
        // Хлебные единицы (для диабета)
        if (hasDiabetes) {
          const breadUnits = p.breadUnits || 0
          if (filters.breadUnitsMin && breadUnits < Number(filters.breadUnitsMin)) return false
          if (filters.breadUnitsMax && breadUnits > Number(filters.breadUnitsMax)) return false
        }
        
        // Ингредиенты
        const parts = ingredientChips.map(s => s.toLowerCase()).filter(Boolean)
        for (const part of parts) {
          if (!((p.description || '').toLowerCase().includes(part) || (p.tags || []).join(' ').toLowerCase().includes(part))) return false
        }
        
        // Флаги
        if (filters.noSugar && !(p.tags || []).some((t: string) => t.toLowerCase().includes('без сахара') || t.toLowerCase().includes('без сахара'))) return false
        if (filters.natural && !(p.tags || []).some((t: string) => t.toLowerCase().includes('натураль') || t.toLowerCase().includes('натурал'))) return false
        
        return true
      })
    } catch (err) {
      console.error('Search error', err)
      toasts?.add?.('Ошибка при выполнении поиска', 'error')
      results = []
    }

    onSearchResults(results)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCheckboxChange = (key: keyof Filters, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
    }))
  }

  const applyPresetFilter = (type: 'moreProtein' | 'lessFat' | 'lowCarb' | 'balanced') => {
    if (activePreset === type) {
      setActivePreset(null)
      setFilters(prev => ({
        ...prev,
        proteinMin: '',
        proteinMax: '',
        fatMin: '',
        fatMax: '',
        carbsMin: '',
        carbsMax: ''
      }))
      return
    }

    setActivePreset(type)
    const newFilters = { ...filters }

    switch (type) {
      case 'moreProtein':
        newFilters.proteinMin = '20'
        newFilters.fatMax = '15'
        newFilters.carbsMax = '30'
        break
      case 'lessFat':
        newFilters.fatMax = '10'
        newFilters.proteinMin = '15'
        break
      case 'lowCarb':
        newFilters.carbsMax = '20'
        newFilters.proteinMin = '15'
        break
      case 'balanced':
        newFilters.proteinMin = '15'
        newFilters.carbsMax = '40'
        newFilters.fatMax = '20'
        break
    }

    setFilters(newFilters)
  }

  const resetAllFilters = () => {
    setSearchTerm('')
    setFilters({
      noSugar: false,
      natural: false,
      maxPrice: '',
      carbsMin: '',
      carbsMax: '',
      proteinMin: '',
      proteinMax: '',
      fatMin: '',
      fatMax: '',
      calMin: '',
      calMax: '',
      breadUnitsMin: '',
      breadUnitsMax: '',
    })
    setIngredientChips([])
    setActivePreset(null)
    setBjuMode('simple')
    
    try {
      onSearchResults(products)
    } catch (e) {
      console.warn('Failed to update search results on reset', e)
    }
  }

  const addIngredient = (ingredient: string) => {
    setIngredientChips(chips => Array.from(new Set([...chips, ingredient.toLowerCase()])))
  }

  return (
    <section className="card p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-6 font-serif">
        Поиск продуктов
      </h2>
      
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Поисковая строка */}
        <div className="flex gap-4 flex-wrap lg:flex-nowrap">
          <Input
            type="text"
            placeholder="Найти продукты по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white/80 border-[var(--light-green)]/30 focus:border-[var(--light-green)]"
          />
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <Button type="submit" variant="default" className="bg-[var(--light-green)] hover:bg-[var(--light-green)]/90 text-white px-6">
              Найти
            </Button>
            <Button 
              type="button" 
              variant={filtersOpen ? "default" : "outline"}
              onClick={() => setFiltersOpen(o => !o)}
              className="border-[var(--light-green)] text-[var(--light-green)] hover:bg-[var(--light-green)]/10"
            >
              {filtersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
            </Button>
          </div>
        </div>

        {/* Панель фильтров */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} space-y-6 animate-in fade-in duration-300`}>
          
          {/* Первая строка фильтров */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-[var(--light-green)]/5 to-[var(--accent-orange)]/5 rounded-lg">
            
            {/* Общие фильтры */}
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-[var(--dark-green)]">Общие фильтры</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/50 cursor-pointer">
                  <Checkbox
                    id="noSugar"
                    checked={filters.noSugar}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange('noSugar', checked)}
                    className="text-[var(--light-green)] focus:ring-[var(--light-green)]"
                  />
                  <Label
                    htmlFor="noSugar"
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    🍬 Без сахара
                  </Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/50 cursor-pointer">
                  <Checkbox
                    id="natural"
                    checked={filters.natural}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange('natural', checked)}
                    className="text-[var(--light-green)] focus:ring-[var(--light-green)]"
                  />
                  <Label
                    htmlFor="natural"
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    🌿 Натуральный состав
                  </Label>
                </div>
              </div>
            </div>

            {/* Бюджет */}
            <div>
              <Label className="block text-sm font-medium text-[var(--dark-green)] mb-2">
                💰 Макс. цена (₽)
              </Label>
              <Input 
                type="number" 
                value={filters.maxPrice} 
                onChange={e => handleFilterChange('maxPrice', e.target.value)} 
                className="w-full bg-white/80 border-[var(--light-green)]/30"
                placeholder="Ваш бюджет" 
              />
            </div>

            {/* Режим БЖУ */}
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-[var(--dark-green)]">📊 Режим БЖУ</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={bjuMode === 'simple' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBjuMode('simple')}
                  className={bjuMode === 'simple' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                >
                  Простой
                </Button>
                <Button
                  type="button"
                  variant={bjuMode === 'detailed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBjuMode('detailed')}
                  className={bjuMode === 'detailed' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                >
                  Детальный
                </Button>
              </div>
            </div>

            {/* Для диабета */}
            {hasDiabetes && (
              <div>
                <Label className="block text-sm font-medium text-[var(--dark-green)] mb-2">
                  🍞 Хлебные единицы
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={filters.breadUnitsMin} 
                    onChange={e => handleFilterChange('breadUnitsMin', e.target.value)} 
                    className="w-1/2 bg-white/80 border-[var(--light-green)]/30"
                    placeholder="От" 
                  />
                  <Input 
                    type="number" 
                    value={filters.breadUnitsMax} 
                    onChange={e => handleFilterChange('breadUnitsMax', e.target.value)} 
                    className="w-1/2 bg-white/80 border-[var(--light-green)]/30"
                    placeholder="До" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Калории */}
          <div className="p-4 bg-white/50 rounded-lg border border-[var(--light-green)]/20">
            <h3 className="font-medium text-[var(--dark-green)] mb-3 flex items-center gap-2">
              🔥 Калории
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div>
                <Label className="block text-sm text-gray-600 mb-1">От (ккал)</Label>
                <Input 
                  type="number" 
                  value={filters.calMin} 
                  onChange={e => handleFilterChange('calMin', e.target.value)} 
                  className="bg-white border-[var(--light-green)]/30"
                  placeholder="Минимум" 
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-1">До (ккал)</Label>
                <Input 
                  type="number" 
                  value={filters.calMax} 
                  onChange={e => handleFilterChange('calMax', e.target.value)} 
                  className="bg-white border-[var(--light-green)]/30"
                  placeholder="Максимум" 
                />
              </div>
            </div>
          </div>

          {/* БЖУ */}
          <div className="p-4 bg-white/50 rounded-lg border border-[var(--light-green)]/20">
            <h3 className="font-medium text-[var(--dark-green)] mb-4 flex items-center gap-2">
              🥗 Белки, Жиры, Углеводы
            </h3>

            {bjuMode === 'simple' ? (
              // Простой режим - кнопки
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    variant={activePreset === 'moreProtein' ? 'default' : 'outline'} 
                    onClick={() => applyPresetFilter('moreProtein')}
                    className={activePreset === 'moreProtein' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                  >
                    🥩 Больше белка
                  </Button>
                  <Button 
                    type="button" 
                    variant={activePreset === 'lessFat' ? 'default' : 'outline'} 
                    onClick={() => applyPresetFilter('lessFat')}
                    className={activePreset === 'lessFat' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                  >
                    🥑 Меньше жиров
                  </Button>
                  <Button 
                    type="button" 
                    variant={activePreset === 'lowCarb' ? 'default' : 'outline'} 
                    onClick={() => applyPresetFilter('lowCarb')}
                    className={activePreset === 'lowCarb' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                  >
                    🍞 Низкоуглеводные
                  </Button>
                  <Button 
                    type="button" 
                    variant={activePreset === 'balanced' ? 'default' : 'outline'} 
                    onClick={() => applyPresetFilter('balanced')}
                    className={activePreset === 'balanced' ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                  >
                    ⚖️ Сбалансированные
                  </Button>
                </div>
              </div>
            ) : (
              // Детальный режим - поля ввода
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">🥩 Белки (г)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={filters.proteinMin} 
                      onChange={e => handleFilterChange('proteinMin', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="От" 
                    />
                    <Input 
                      type="number" 
                      value={filters.proteinMax} 
                      onChange={e => handleFilterChange('proteinMax', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="До" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">🥑 Жиры (г)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={filters.fatMin} 
                      onChange={e => handleFilterChange('fatMin', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="От" 
                    />
                    <Input 
                      type="number" 
                      value={filters.fatMax} 
                      onChange={e => handleFilterChange('fatMax', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="До" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">🍞 Углеводы (г)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={filters.carbsMin} 
                      onChange={e => handleFilterChange('carbsMin', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="От" 
                    />
                    <Input 
                      type="number" 
                      value={filters.carbsMax} 
                      onChange={e => handleFilterChange('carbsMax', e.target.value)} 
                      className="bg-white border-[var(--light-green)]/30"
                      placeholder="До" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Желаемые продукты в составе */}
          <div className="p-4 bg-white/50 rounded-lg border border-[var(--light-green)]/20">
            <h3 className="font-medium text-[var(--dark-green)] mb-4 flex items-center gap-2">
              🎯 Желаемые продукты в составе
            </h3>
            
            {/* Быстрые ингредиенты */}
            <div className="mb-4">
              <Label className="text-sm text-gray-600 mb-3">Быстрый выбор:</Label>
              <div className="flex flex-wrap gap-2">
                {commonIngredients.map(ingredient => (
                  <Button
                    key={ingredient}
                    type="button"
                    variant={ingredientChips.includes(ingredient.toLowerCase()) ? "default" : "outline"}
                    size="sm"
                    onClick={() => addIngredient(ingredient)}
                    className={ingredientChips.includes(ingredient.toLowerCase()) ? 'bg-[var(--light-green)]' : 'border-[var(--light-green)] text-[var(--light-green)]'}
                  >
                    {ingredient}
                  </Button>
                ))}
              </div>
            </div>

            {/* Ручной ввод ингредиентов */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Или введите свой ингредиент:
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={ingredientInput} 
                  onChange={e => setIngredientInput(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && ingredientInput.trim()) {
                      e.preventDefault()
                      addIngredient(ingredientInput.trim())
                      setIngredientInput('')
                    }
                  }} 
                  placeholder="Введите ингредиент..."
                  className="flex-1 bg-white border-[var(--light-green)]/30"
                />
                <Button 
                  type="button" 
                  onClick={() => { 
                    if (ingredientInput.trim()) { 
                      addIngredient(ingredientInput.trim())
                      setIngredientInput('') 
                    }
                  }} 
                  variant="outline"
                  className="border-[var(--light-green)] text-[var(--light-green)]"
                >
                  Добавить
                </Button>
              </div>
              
              {/* Список выбранных ингредиентов */}
              {ingredientChips.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {ingredientChips.map(ingredient => (
                      <span key={ingredient} className="px-3 py-1 bg-[var(--light-green)]/20 text-[var(--dark-green)] rounded-full text-sm flex items-center gap-1">
                        {ingredient}
                        <button 
                          onClick={() => setIngredientChips(chips => chips.filter(x => x !== ingredient))} 
                          className="text-red-500 hover:text-red-700 ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4 border-t border-[var(--light-green)]/20">
            <Button type="submit" variant="default" className="bg-[var(--light-green)] hover:bg-[var(--light-green)]/90 text-white px-8">
              🔍 Применить фильтры
            </Button>
            <Button type="button" variant="outline" onClick={resetAllFilters} className="border-gray-300 text-gray-600 hover:bg-gray-50">
              🗑️ Сбросить все
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}