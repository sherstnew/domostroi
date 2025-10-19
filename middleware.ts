import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Публичные маршруты, доступные без авторизации
const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']

// Маршруты, требующие авторизации
const protectedRoutes = ['/dashboard', '/onboarding', '/products', '/stores', '/api/user-preferences']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Проверяем, является ли маршрут публичным
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Если маршрут публичный - пропускаем
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Проверяем, является ли маршрут защищенным
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Если маршрут не защищенный - пропускаем
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Для защищенных маршрутов проверяем токен.
  // Сначала смотрим Authorization header, затем cookie "token" — клиент хранит токен в localStorage,
  // но middleware работает на сервере и не видит localStorage, поэтому важно устанавливать cookie при логине.
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  let token = headerToken || null

  // request.cookies.get(...) доступен в middleware — попробуем достать токен из cookie, если header пуст
  try {
    const cookie = request.cookies.get('token')
    if (!token && cookie) token = cookie.value
  } catch (e) {
    // request.cookies может не поддерживаться в старых рантаймах — игнорируем ошибку
    console.warn('Cookie read failed in middleware', e)
  }

  if (!token) {
    // Перенаправляем на логин с сохранением URL для возврата
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await verifyToken(token)
    return NextResponse.next()
  } catch (error) {
    // Токен невалиден - перенаправляем на логин
    console.log(error)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}