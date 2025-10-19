'use client'

import { useState } from 'react'
import { useToasts } from '@/components/ui/toast'

interface ProductSearchProps {
  onSearchResults: (results: any[]) => void
  products?: any[]
}

export default function ProductSearch({ onSearchResults, products = [] }: ProductSearchProps) {
  const toasts = useToasts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
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
    ingredients: '',
    breadUnits: '',
    maxPrice: ''
  })

  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredientChips, setIngredientChips] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Клиентская фильтрация
    let results: any[] = []
    try {
      results = products.filter((p: any) => {
      if (searchTerm && !(p.name + ' ' + p.description).toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (filters.carbsMin && p.carbs < Number(filters.carbsMin)) return false
      if (filters.carbsMax && p.carbs > Number(filters.carbsMax)) return false
      if (filters.proteinMin && p.protein < Number(filters.proteinMin)) return false
      if (filters.proteinMax && p.protein > Number(filters.proteinMax)) return false
      if (filters.fatMin && p.fat < Number(filters.fatMin)) return false
      if (filters.fatMax && p.fat > Number(filters.fatMax)) return false
      if (filters.calMin && p.calories < Number(filters.calMin)) return false
      if (filters.calMax && p.calories > Number(filters.calMax)) return false
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false
        // ingredients chips matching
        const parts = ingredientChips.map(s => s.toLowerCase()).filter(Boolean)
        for (const part of parts) {
          if (!((p.description || '').toLowerCase().includes(part) || (p.tags || []).join(' ').toLowerCase().includes(part))) return false
        }
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
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <section className="card p-6 mb-8">
      <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
        Поиск продуктов
      </h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Поисковая строка */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Найти продукты..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
          />
          <button type="submit" className="btn-primary px-6">
            Найти
          </button>
        </div>

        {/* Фильтры */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Калории ОТ/ДО
            </label>
            <div className="flex gap-2">
              <input type="number" value={filters.calMin} onChange={e => handleFilterChange('calMin', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="От" />
              <input type="number" value={filters.calMax} onChange={e => handleFilterChange('calMax', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="До" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Белки (г) ОТ/ДО
            </label>
            <div className="flex gap-2">
              <input type="number" value={filters.proteinMin} onChange={e => handleFilterChange('proteinMin', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="От" />
              <input type="number" value={filters.proteinMax} onChange={e => handleFilterChange('proteinMax', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="До" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Углеводы (г) ОТ/ДО
            </label>
            <div className="flex gap-2">
              <input type="number" value={filters.carbsMin} onChange={e => handleFilterChange('carbsMin', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="От" />
              <input type="number" value={filters.carbsMax} onChange={e => handleFilterChange('carbsMax', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="До" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Жиры (г) ОТ/ДО
            </label>
            <div className="flex gap-2">
              <input type="number" value={filters.fatMin} onChange={e => handleFilterChange('fatMin', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="От" />
              <input type="number" value={filters.fatMax} onChange={e => handleFilterChange('fatMax', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="До" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Макс. цена
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]"
              placeholder="1000"
            />
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Хлебные единицы (БУ)</label>
            <input type="number" value={filters.breadUnits} onChange={e => handleFilterChange('breadUnits', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--light-green)]" placeholder="БУ" />
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ингредиенты (теги)</label>
            <div className="flex gap-2">
              <input value={ingredientInput} onChange={e => setIngredientInput(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter' && ingredientInput.trim()) {
                  e.preventDefault()
                  setIngredientChips(chips => Array.from(new Set([...chips, ingredientInput.trim().toLowerCase()])))
                  setIngredientInput('')
                }
              }} placeholder="Введите и нажмите Enter" className="flex-1 px-3 py-2 border rounded" />
              <button type="button" onClick={() => { if (ingredientInput.trim()) { setIngredientChips(chips => Array.from(new Set([...chips, ingredientInput.trim().toLowerCase()]))) ; setIngredientInput('') }}} className="px-3 py-2 btn-primary">Добавить</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ingredientChips.map(c => (
                <span key={c} className="px-2 py-1 bg-[var(--light-green)]/20 text-[var(--dark-green)] rounded-full text-sm flex items-center gap-2">
                  {c}
                  <button onClick={() => setIngredientChips(chips => chips.filter(x => x !== c))} className="text-red-500 ml-2">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-1 flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Флаги</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.noSugar} onChange={e => setFilters(f => ({ ...f, noSugar: e.target.checked }))} /> Без сахара</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.natural} onChange={e => setFilters(f => ({ ...f, natural: e.target.checked }))} /> Натуральный состав</label>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-6">Применить</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={() => {
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
              ingredients: '',
              breadUnits: '',
              maxPrice: ''
            })
            setIngredientChips([])
          }}>Сбросить</button>
        </div>
      </form>
    </section>
  )
}