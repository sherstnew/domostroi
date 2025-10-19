'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Toast = { id: string; message: string; type?: 'error' | 'info' | 'success' }

const ToastsContext = createContext<any>(null)

export function useToasts() {
  return useContext(ToastsContext)
}

export function ToastsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString()
    const t = { id, message, type }
    setToasts(prev => [...prev, t])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, 4000)
  }

  const remove = (id: string) => setToasts(prev => prev.filter(x => x.id !== id))

  return (
    <ToastsContext.Provider value={{ add, remove }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`mb-2 max-w-sm w-full p-3 rounded shadow ${t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-white text-gray-900 border border-gray-200'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastsContext.Provider>
  )
}
