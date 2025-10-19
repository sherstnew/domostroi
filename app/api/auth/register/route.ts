import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { generateToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Валидация
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Некорректный email' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Проверяем существование пользователя
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)

    // Создаем пользователя
    const user = {
      _id: new ObjectId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      preferences: {
        lifestyle: [],
        bju: [],
        forbidden: [],
        dietaryRestrictions: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(user)

    // Генерируем токен
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email
    })

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user

    const res = NextResponse.json(
      { 
        message: 'Пользователь создан успешно',
        token,
        user: userWithoutPassword
      },
      { status: 201 }
    )

    // Устанавливаем cookie с токеном (HttpOnly), чтобы middleware мог его прочитать
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production'
    })

    return res
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}