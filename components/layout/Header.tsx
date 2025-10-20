'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--light-green)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-[var(--dark-green)] font-serif">GreenPlate</span>
          </Link>

          {user && (
            <>
              <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="menu">☰</button>

              {/* Desktop nav */}
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className={`font-medium transition-colors ${isActive('/dashboard') ? 'text-[var(--light-green)]' : 'text-gray-600 hover:text-[var(--light-green)]'}`}>
                  Продукты
                </Link>
                <Link href="/stores" className={`font-medium transition-colors ${isActive('/stores') ? 'text-[var(--light-green)]' : 'text-gray-600 hover:text-[var(--light-green)]'}`}>
                  Магазины
                </Link>
                <Link href="/profile" className={`font-medium transition-colors ${isActive('/profile') ? 'text-[var(--light-green)]' : 'text-gray-600 hover:text-[var(--light-green)]'}`}>
                  Профиль
                </Link>
              </nav>

              {/* Mobile nav overlay */}
              {open && (
                <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden z-50">
                  <div className="flex flex-col p-4 space-y-2">
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2">Продукты</Link>
                    <Link href="/stores" onClick={() => setOpen(false)} className="py-2">Магазины</Link>
                    <Link href="/profile" onClick={() => setOpen(false)} className="py-2">Профиль</Link>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-[var(--text-color)]/90">Привет, {user.name}</span>
                <Button variant="ghost" onClick={handleLogout} className="text-[var(--text-color)]/90">Выйти</Button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-[var(--light-green)] font-medium">Вход</Link>
                <Link href="/register" className="btn-primary">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}