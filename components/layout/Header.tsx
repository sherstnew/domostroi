'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from '@/components/ui/sheet'
import { Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  const navigation = [
    { href: '/dashboard', label: 'Продукты' },
    { href: '/stores', label: 'Магазины' },
    { href: '/profile', label: 'Профиль' },
  ]

  // добавим ссылку на избранное отдельно (иконка)
  const favLink = { href: '/favorites', label: 'Избранное' }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo-without.svg" alt="Logo" className="h-10" />
          </Link>

          {user && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6 mx-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium transition-colors whitespace-nowrap ${
                      isActive(item.href) 
                        ? 'text-[var(--light-green)]' 
                        : 'text-gray-600 hover:text-[var(--light-green)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href={favLink.href} className={`text-gray-600 hover:text-[var(--light-green)]`}>
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Избранное</span>
                </Link>
              </nav>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-5 h-10 w-10">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Открыть меню</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
                    <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                    <div className="flex flex-col h-full">
                      {/* Header with welcome message */}
                      <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Добро пожаловать</p>
                        <p className="font-medium text-[var(--dark-green)] mt-1">
                          {user.name}
                        </p>
                      </div>

                      {/* Navigation Links */}
                      <nav className="flex-1 p-4 space-y-4">
                        {navigation.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
                              isActive(item.href)
                                ? 'bg-[var(--light-green)]/10 text-[var(--light-green)] border border-[var(--light-green)]/20'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-[var(--light-green)]'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <Link href={favLink.href} onClick={() => setOpen(false)} className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-[var(--light-green)]">
                          <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5" />
                            <span>Избранное</span>
                          </div>
                        </Link>
                      </nav>

                      {/* Logout Button */}
                      <div className="p-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full text-gray-700 hover:text-red-600 hover:border-red-200"
                        >
                          Выйти
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Добро пожаловать,
                </span>
                <span className="text-sm font-medium text-[var(--dark-green)] whitespace-nowrap">
                  {user.name}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 whitespace-nowrap"
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-[var(--light-green)] font-medium text-sm whitespace-nowrap"
                >
                  Вход
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary text-sm whitespace-nowrap"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}