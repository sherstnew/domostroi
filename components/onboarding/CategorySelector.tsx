'use client'

interface CategorySelectorProps {
  options: string[]
  selectedOptions: string[]
  onOptionToggle: (option: string) => void
}

export default function CategorySelector({ 
  options, 
  selectedOptions, 
  onOptionToggle 
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onOptionToggle(option)}
          className={`
            p-4 rounded-xl border-2 transition-all duration-200 text-center
            ${selectedOptions.includes(option)
              ? 'bg-[var(--light-green)] border-[var(--light-green)] text-white shadow-lg'
              : 'bg-white border-gray-200 text-[var(--text-color)]/90 hover:border-[var(--light-green)] hover:shadow-md'
            }
          `}
        >
          <span className="font-medium">{option}</span>
        </button>
      ))}
    </div>
  )
}