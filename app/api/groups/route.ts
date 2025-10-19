import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try { const cookie = request.cookies.get('token'); if (cookie) token = cookie.value } catch {}
    }
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    const payload = await verifyToken(token)
    const userId = payload.userId

    const client = await clientPromise
    const db = client.db()

    const groups = await db.collection('productGroups').find({ userId }).toArray()
    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Groups GET error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try { const cookie = request.cookies.get('token'); if (cookie) token = cookie.value } catch {}
    }
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    const payload = await verifyToken(token)
    const userId = payload.userId

    const body = await request.json()
    const { name } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const client = await clientPromise
    const db = client.db()

    const group = {
      userId,
      name,
      products: [],
      totalCalories: 0,
      totalPrice: 0,
      createdAt: new Date()
    }

    const result = await db.collection('productGroups').insertOne(group)
    return NextResponse.json({ group: { ...group, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error('Groups POST error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
