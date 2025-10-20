'use client'

import { useState } from 'react'
import { useToasts } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProductSearchProps {
  onSearchResults: (results: any[]) => void
  products?: any[]
}

export default function ProductSearch({ onSearchResults, products = [] }: ProductSearchProps) {
  const toasts = useToasts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [savedFiltersForPreset, setSavedFiltersForPreset] = useState<any | null>(null)
  
  const [filters, setFilters] = useState<any>({
    // Основные фильтры
    noSugar: false,
    natural: false,
    
    // Макронутриенты
    carbsMin: '',
    carbsMax: '',
    proteinMin: '',
    proteinMax: '',
    fatMin: '',
    fatMax: '',
    calMin: '',
    calMax: '',
    
    // Бюджет
    maxPrice: '',
    
    // Дополнительные
    breadUnits: '',
    ingredients: ''
  })

  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredientChips, setIngredientChips] = useState<string[]>([])

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
        if (filters.calMin && p.calories < Number(filters.calMin)) return false
        if (filters.calMax && p.calories > Number(filters.calMax)) return false
        
        // Бюджет
        if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false
        
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value
    }))
    // если пользователь меняет фильтр вручную — деактивируем пресет
    if (activePreset) {
      setActivePreset(null)
      setSavedFiltersForPreset(null)
    }
  }

  const applyPresetFilter = (type: 'moreProtein' | 'lessFat' | 'lowCarb' | 'balanced') => {
    // toggle preset: deactivate if already active
    if (activePreset === type) {
      // restore saved filters if present
      if (savedFiltersForPreset) setFilters(savedFiltersForPreset)
      setActivePreset(null)
      setSavedFiltersForPreset(null)
      return
    }

    // activate preset — save current filters for possible restore
    setSavedFiltersForPreset(filters)
    setActivePreset(type)

    const newFilters = { ...filters }
    switch (type) {
      case 'moreProtein':
        newFilters.proteinMin = '20'
        newFilters.proteinMax = ''
        newFilters.fatMax = '15'
        newFilters.carbsMax = '30'
        break
      case 'lessFat':
        newFilters.fatMax = '10'
        newFilters.proteinMin = '15'
        newFilters.carbsMax = ''
        break
      case 'lowCarb':
        newFilters.carbsMax = '20'
        newFilters.proteinMin = '15'
        newFilters.fatMax = ''
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
      carbsMin: '',
      carbsMax: '',
      proteinMin: '',
      proteinMax: '',
      fatMin: '',
      fatMax: '',
      calMin: '',
      calMax: '',
      maxPrice: '',
      breadUnits: '',
      ingredients: ''
    })
    setIngredientChips([])
    // сбрасываем активный пресет
    setActivePreset(null)
    setSavedFiltersForPreset(null)
    // обновляем результаты поиска — показываем все продукты
    try {
      onSearchResults(products)
    } catch (e) {
      console.warn('Failed to update search results on reset', e)
    }
  }

  return (
    <section className="card p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
        Поиск продуктов
      </h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Поисковая строка */}
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Найти продукты..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white/60"
          />
          <Button type="submit" variant="default" className="bg-[var(--light-green)]">Найти</Button>
          <Button type="button" variant="outline" onClick={() => setFiltersOpen(o => !o)}>
            {filtersOpen ? 'Скрыть фильтры' : 'Фильтры'}
          </Button>
        </div>

        {/* Панель фильтров */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} transition-all space-y-6`}>
          
          {/* Режимы питания */}
          <div className="bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Какие продукты вы хотите?</h3>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={activePreset === 'moreProtein' ? 'default' : 'outline'} size="sm" onClick={() => applyPresetFilter('moreProtein')} className={activePreset === 'moreProtein' ? 'ring-2 ring-[var(--light-green)]' : ''}>
                Больше белка
              </Button>
              <Button type="button" variant={activePreset === 'lessFat' ? 'default' : 'outline'} size="sm" onClick={() => applyPresetFilter('lessFat')} className={activePreset === 'lessFat' ? 'ring-2 ring-[var(--light-green)]' : ''}>
                Меньше жиров
              </Button>
              <Button type="button" variant={activePreset === 'lowCarb' ? 'default' : 'outline'} size="sm" onClick={() => applyPresetFilter('lowCarb')} className={activePreset === 'lowCarb' ? 'ring-2 ring-[var(--light-green)]' : ''}>
                Низкоуглеводные
              </Button>
              <Button type="button" variant={activePreset === 'balanced' ? 'default' : 'outline'} size="sm" onClick={() => applyPresetFilter('balanced')} className={activePreset === 'balanced' ? 'ring-2 ring-[var(--light-green)]' : ''}>
                Сбалансированные
              </Button>
            </div>
          </div>

          {/* Сетка фильтров */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Калории */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Калории ОТ/ДО
              </label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={filters.calMin} 
                  onChange={e => handleFilterChange('calMin', e.target.value)} 
                  className="w-1/2" 
                  placeholder="От" 
                />
                <Input 
                  type="number" 
                  value={filters.calMax} 
                  onChange={e => handleFilterChange('calMax', e.target.value)} 
                  className="w-1/2" 
                  placeholder="До" 
                />
              </div>
            </div>

            {/* Белки */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Белки (г) ОТ/ДО
              </label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={filters.proteinMin} 
                  onChange={e => handleFilterChange('proteinMin', e.target.value)} 
                  className="w-1/2" 
                  placeholder="От" 
                />
                <Input 
                  type="number" 
                  value={filters.proteinMax} 
                  onChange={e => handleFilterChange('proteinMax', e.target.value)} 
                  className="w-1/2" 
                  placeholder="До" 
                />
              </div>
            </div>

            {/* Углеводы */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Углеводы (г) ОТ/ДО
              </label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={filters.carbsMin} 
                  onChange={e => handleFilterChange('carbsMin', e.target.value)} 
                  className="w-1/2" 
                  placeholder="От" 
                />
                <Input 
                  type="number" 
                  value={filters.carbsMax} 
                  onChange={e => handleFilterChange('carbsMax', e.target.value)} 
                  className="w-1/2" 
                  placeholder="До" 
                />
              </div>
            </div>

            {/* Жиры */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Жиры (г) ОТ/ДО
              </label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={filters.fatMin} 
                  onChange={e => handleFilterChange('fatMin', e.target.value)} 
                  className="w-1/2" 
                  placeholder="От" 
                />
                <Input 
                  type="number" 
                  value={filters.fatMax} 
                  onChange={e => handleFilterChange('fatMax', e.target.value)} 
                  className="w-1/2" 
                  placeholder="До" 
                />
              </div>
            </div>

            {/* Бюджет */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Макс. цена (₽)
              </label>
              <Input 
                type="number" 
                value={filters.maxPrice} 
                onChange={e => handleFilterChange('maxPrice', e.target.value)} 
                className="w-full" 
                placeholder="Бюджет" 
              />
            </div>

            {/* Хлебные единицы */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Хлебные единицы
              </label>
              <Input 
                type="number" 
                value={filters.breadUnits} 
                onChange={e => handleFilterChange('breadUnits', e.target.value)} 
                className="w-full" 
                placeholder="БУ" 
              />
            </div>

            {/* Ингредиенты */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ингредиенты (теги)
              </label>
              <div className="flex gap-2">
                <Input 
                  value={ingredientInput} 
                  onChange={e => setIngredientInput(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && ingredientInput.trim()) {
                      e.preventDefault()
                      setIngredientChips(chips => Array.from(new Set([...chips, ingredientInput.trim().toLowerCase()])))
                      setIngredientInput('')
                    }
                  }} 
                  placeholder="Введите и нажмите Enter" 
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  onClick={() => { 
                    if (ingredientInput.trim()) { 
                      setIngredientChips(chips => Array.from(new Set([...chips, ingredientInput.trim().toLowerCase()]))) 
                      setIngredientInput('') 
                    }
                  }} 
                  variant="outline"
                >
                  Добавить
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ingredientChips.map(c => (
                  <span key={c} className="px-2 py-1 bg-[var(--light-green)]/20 text-[var(--dark-green)] rounded-full text-sm flex items-center gap-2">
                    {c}
                    <button 
                      onClick={() => setIngredientChips(chips => chips.filter(x => x !== c))} 
                      className="text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Флаги */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Флаги</label>
              <label className="inline-flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filters.noSugar} 
                  onChange={e => setFilters((f: any) => ({ ...f, noSugar: e.target.checked }))} 
                /> 
                Без сахара
              </label>
              <label className="inline-flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filters.natural} 
                  onChange={e => setFilters((f: any) => ({ ...f, natural: e.target.checked }))} 
                /> 
                Натуральный состав
              </label>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="default" className="bg-[var(--light-green)]">
              Применить фильтры
            </Button>
            <Button type="button" variant="outline" onClick={resetAllFilters}>
              Сбросить все
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}