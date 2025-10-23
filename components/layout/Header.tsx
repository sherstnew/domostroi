"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToasts } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from '@/components/ui/sheet'
import { Menu, Heart, ShoppingCart } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import MiniCart from '@/components/layout/MiniCart'

export default function Header() {
  const pathname = usePathname()
  const { user, logout, login, updateUser } = useAuth()
  const toasts = useToasts()
  const [cartCount, setCartCount] = useState(0)
  const [selectedStoreName, setSelectedStoreName] = useState<string | null>((user as any)?.selectedStoreName || (user as any)?.selectedStore || null)
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  useEffect(() => {
    const initial = (user as any)?.cart?.length ?? 0
    setCartCount(initial)

    const handler = (e: any) => {
      if (e?.detail?.count != null) setCartCount(e.detail.count)
      else {
        ;(async () => {
          try {
            const token = localStorage.getItem('token')
            if (!token) return
            const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } })
            if (!res.ok) return
            const jd = await res.json()
            setCartCount(jd.cart?.length ?? 0)
          } catch (err) { console.error(err) }
        })()
      }
    }

    window.addEventListener('cartUpdated', handler as EventListener)
    return () => window.removeEventListener('cartUpdated', handler as EventListener)
  }, [user])

  useEffect(() => {
    const id = (user as any)?.selectedStore
    const name = (user as any)?.selectedStoreName
    if (!name && id) {
      ;(async () => {
        try {
          const res = await fetch(`/api/stores/${id}`)
          if (!res.ok) return
          const jd = await res.json()
          const store = jd.store
          if (store?.name) setSelectedStoreName(store.name)
        } catch (e) { console.error(e) }
      })()
    } else if (name) setSelectedStoreName(name)
  }, [user])

  const navigation = [
    { href: '/dashboard', label: 'Продукты' },
    { href: '/stores', label: 'Магазины' },
    { href: '/profile', label: 'Профиль' },
  ]

  const favLink = { href: '/favorites', label: 'Избранное' }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo-without.svg" alt="Logo" className="h-10" />
          </Link>

          {user && (
            <>
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center space-x-6 mx-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium transition-colors whitespace-nowrap ${
                      isActive(item.href) ? 'text-[var(--light-green)]' : 'text-gray-600 hover:text-[var(--light-green)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="flex items-center space-x-3">
                  <Link href={favLink.href} className="text-gray-600 hover:text-[var(--light-green)]">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Избранное</span>
                  </Link>
                  {/* Desktop cart button opens global cart sheet */}
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[var(--light-green)]" onClick={() => setCartOpen(true)}>
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && <span className="ml-1 text-sm text-[var(--accent-orange)]">{cartCount}</span>}
                    <span className="sr-only">Корзина</span>
                  </Button>
                </div>
              </nav>

              {/* Mobile nav: cart + menu */}
              <div className="md:hidden">
                <div className="flex items-center">
                  {/* Render mobile menu only on client to avoid SSR id mismatch from Radix primitives */}
                  {mounted && (
                    <>
                      <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2 h-10 w-10">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Открыть меню</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-[400px] bg-white">
                          <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                          <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200">
                              <p className="text-sm text-gray-600">Добро пожаловать</p>
                              <p className="font-medium text-[var(--dark-green)] mt-1">{user.name}</p>
                            </div>

                            <nav className="flex-1 p-4 space-y-4">
                              <button onClick={() => { setOpen(false); setCartOpen(true) }} className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
                                <div className="flex items-center gap-3">
                                  <ShoppingCart className="h-5 w-5" />
                                  <span>Корзина{cartCount > 0 ? ` (${cartCount})` : ''}</span>
                                </div>
                              </button>
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

                              {/* Selected store area: show chosen store and allow cancel */}
                              {((user as any)?.selectedStoreName || (user as any)?.selectedStore) && (
                                <div className="mt-4 border-t pt-4">
                                  <div className="text-sm text-gray-600 mb-2">Магазин</div>
                                  <div className="flex items-center justify-between gap-2">
                                    <Link href={typeof (user as any)?.selectedStore === 'string' ? `/stores/${(user as any).selectedStore}` : '/stores'} onClick={() => setOpen(false)} className="font-medium text-[var(--dark-green)]">{(user as any)?.selectedStoreName || (user as any)?.selectedStore}</Link>
                                    <div className="flex gap-2">
                                      <button className="px-3 py-1 bg-red-600 text-white rounded" disabled>Выбрано</button>
                                      <button onClick={async () => {
                                        try {
                                          const token = localStorage.getItem('token')
                                          if (!token) { window.location.href = '/login'; return }
                                          const res = await fetch('/api/user/store', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
                                          if (!res.ok) throw new Error('fail')
                                          const jd = await res.json()
                                          try { setOpen(false); if (updateUser) updateUser(jd.user) } catch (e) {}
                                          toasts.add('Выбор магазина отменён', 'success')
                                        } catch (e) { console.error(e); toasts.add('Ошибка при отмене выбора магазина', 'error') }
                                      }} className="px-3 py-1 border rounded text-red-600">Отменить</button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </nav>

                            <div className="p-4 border-t border-gray-200">
                              <Button variant="outline" onClick={handleLogout} className="w-full text-gray-700 hover:text-red-600 hover:border-red-200">Выйти</Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                {selectedStoreName && (
                  <div className="text-sm text-gray-600 mr-2">Магазин: <span className="font-medium text-[var(--dark-green)]"><Link href={typeof (user as any)?.selectedStore === 'string' ? `/stores/${(user as any).selectedStore}` : '/stores'}>{selectedStoreName}</Link></span></div>
                )}
                <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-red-600 whitespace-nowrap">Выйти</Button>
              </div>
            ) : (
              <>
                {/* Desktop: show login/register */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login" className="text-gray-600 hover:text-[var(--light-green)] font-medium text-sm whitespace-nowrap">Вход</Link>
                  <Link href="/register" className="btn-primary text-sm whitespace-nowrap">Регистрация</Link>
                </div>

                {/* Mobile: put login/register into side menu */}
                <div className="md:hidden">
                  <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-10 w-10">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Открыть меню</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[400px] bg-white">
                      <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm text-gray-600">Добро пожаловать</p>
                          <p className="font-medium text-[var(--dark-green)] mt-1">Гость</p>
                        </div>

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

                        <div className="p-4 border-t border-gray-200 space-y-2">
                          <button
                            onClick={async () => {
                              setOpen(false)
                              try {
                                const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@test.com', password: 'qwerty' }) })
                                const data = await res.json()
                                if (!res.ok) throw new Error(data.error || 'Ошибка быстрого входа')
                                login(data.token, data.user)
                                toasts.add('Быстрый вход выполнен', 'success')
                              } catch (e: any) {
                                console.error(e)
                                toasts.add(e?.message || 'Ошибка быстрого входа', 'error')
                              }
                            }}
                            className="block w-full text-center py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Быстрый вход
                          </button>
                          <Link href="/login" onClick={() => setOpen(false)} className="block w-full text-center py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100">Вход</Link>
                          <Link href="/register" onClick={() => setOpen(false)} className="block w-full text-center py-3 rounded-lg btn-primary">Регистрация</Link>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Global cart sheet (opened by desktop button or mobile menu) */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] bg-white">
          <SheetTitle className="sr-only">Корзина</SheetTitle>
          <MiniCart onClose={() => setCartOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}