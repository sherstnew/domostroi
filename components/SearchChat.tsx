"use client"

import { useState } from 'react'
import ProductCarousel from './ProductCarousel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SearchChat({ products = [], onClose }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [results, setResults] = useState<any[]>([])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(m => [...m, userMsg])
    // fake processing: filter products by name/description/tags
    const q = input.toLowerCase()
    const filtered = products.filter((p: any) => (p.name + ' ' + (p.description||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q))
    const botMsg = { role: 'bot', text: `Найдено ${filtered.length} товаров` }
    setMessages(m => [...m, botMsg])
    setResults(filtered)
    setInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="w-full md:w-3/4 lg:w-1/2 bg-white rounded-tl-xl rounded-tr-xl md:rounded-xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-[var(--text-color)]">Поиск (чат)</h4>
          <Button variant="ghost" onClick={onClose} className="px-2 py-1">Закрыть</Button>
        </div>
        <div className="h-40 overflow-auto mb-3 border p-2">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-[var(--light-green)] text-white' : 'bg-gray-100'}`}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Например: хочу что-нибудь к чаю" className="w-full" />
          <div className="mt-2 flex justify-end">
            <Button onClick={send} className="px-4">Отправить</Button>
          </div>
        </div>

        {results.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Результаты</h5>
            <ProductCarousel products={results} />
          </div>
        )}
      </div>
    </div>
  )
}
