import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Ищем пользователя
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователя не существует' },
        { status: 401 }
      )
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Генерируем токен
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email
    })

    // Обновляем время последнего входа
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user

    // Возвращаем токен и устанавливаем HttpOnly cookie, чтобы middleware мог его прочитать
    const res = NextResponse.json({
      message: 'Вход выполнен успешно',
      token,
      user: userWithoutPassword
    })

    // Сохраняем cookie на 7 дней, HttpOnly, Secure в проде
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production'
    })

    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}