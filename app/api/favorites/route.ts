import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    // список избранных для пользователя
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch {}
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const payload = await verifyToken(token)
    const userId = payload.userId

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { favorites: 1 } })
    return NextResponse.json({ favorites: user?.favorites || [] })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenHeader = getTokenFromHeaders(request.headers)
    let token = tokenHeader
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch {}
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const payload = await verifyToken(token)
    const userId = payload.userId

    const body = await request.json()
    const { productId, groupId } = body
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const client = await clientPromise
    const db = client.db()

    // Добавляем в общий список избранных у пользователя
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favorites: productId } }
    )

    // Если указан groupId — добавим в группу
    if (groupId) {
      await db.collection('productGroups').updateOne(
        { _id: new ObjectId(groupId), userId },
        { $addToSet: { products: productId } }
      )
    }

    return NextResponse.json({ message: 'Добавлено в избранное' })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tokenHeader = getTokenFromHeaders(request.headers)
    let token = tokenHeader
    if (!token) {
      try {
        const cookie = request.cookies.get('token')
        if (cookie) token = cookie.value
      } catch {}
    }

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const payload = await verifyToken(token)
    const userId = payload.userId

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const client = await clientPromise
    const db = client.db()

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      ({ $pull: { favorites: productId } } as any)
    )

    return NextResponse.json({ message: 'Удалено из избранного' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
