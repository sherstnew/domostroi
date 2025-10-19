'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--light-green)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-[var(--dark-green)] font-serif">
              GreenPlate
            </span>
          </Link>

          {/* Навигация */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/dashboard" 
                className={`font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-[var(--light-green)]' 
                    : 'text-gray-600 hover:text-[var(--light-green)]'
                }`}
              >
                Продукты
              </Link>
              {/* <Link 
                href="/products" 
                className={`font-medium transition-colors ${
                  isActive('/products') 
                    ? 'text-[var(--light-green)]' 
                    : 'text-gray-600 hover:text-[var(--light-green)]'
                }`}
              >
                Продукты
              </Link> */}
              <Link 
                href="/stores" 
                className={`font-medium transition-colors ${
                  isActive('/stores') 
                    ? 'text-[var(--light-green)]' 
                    : 'text-gray-600 hover:text-[var(--light-green)]'
                }`}
              >
                Магазины
              </Link>
            </nav>
          )}

          {/* Кнопки авторизации */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Привет, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-[var(--light-green)] font-medium"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-[var(--light-green)] font-medium"
                >
                  Вход
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}