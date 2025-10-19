import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function PUT(request: NextRequest) {
  try {
    // Сначала смотрим в заголовках, затем в cookie
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch (e) {
        console.warn('Cookie read failed in /api/user-preferences PUT', e)
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

    const preferences = await request.json()
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          preferences,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Предпочтения обновлены',
      preferences 
    })
  } catch (error) {
    console.error('Preferences update error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Сначала заголовки, затем cookie
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch (e) {
        console.warn('Cookie read failed in /api/user-preferences GET', e)
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
      { projection: { preferences: 1 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    return NextResponse.json({ preferences: user.preferences })
  } catch (error) {
    console.error('Preferences fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}