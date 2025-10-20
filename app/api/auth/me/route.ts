import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    // Попробуем взять токен из заголовка, затем из cookie
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch (e) {
        console.warn('Cookie read failed in /api/auth/me', e)
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    let userId: string
    try {
      const payload = await verifyToken(token as string)
      userId = payload.userId
    } catch (error) {
      return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Исключаем пароль
    )

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch (e) {
        console.warn('Cookie read failed in /api/auth/me PUT', e)
      }
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    let userId: string
    try {
      const payload = await verifyToken(token as string)
      userId = payload.userId
    } catch (error) {
      return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 })
    }

    const body = await request.json()
    const toSet: any = {}
    // Accept both name and fullName
    if (body.fullName) {
      toSet.name = body.fullName
      toSet['profile.fullName'] = body.fullName
    }
    if (body.name) {
      toSet.name = body.name
    }
    if (body.email) {
      toSet.email = body.email.toLowerCase().trim()
    }
    if (typeof body.weeklyBudget !== 'undefined') {
      toSet['profile.weeklyBudget'] = body.weeklyBudget
    }

    if (Object.keys(toSet).length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: toSet }
    )

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  // Support PATCH same as PUT for partial updates
  return PUT(request)
}