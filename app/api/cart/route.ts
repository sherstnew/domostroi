import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

async function getUserIdFromRequest(req: NextRequest) {
  let token = getTokenFromHeaders(req.headers)
  if (!token) {
    try {
      const cookie = req.cookies.get('token')
      if (cookie) token = cookie.value
    } catch (e) {}
  }
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return payload.userId
  } catch (e) {
    return null
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const client = await clientPromise
  const db = client.db()
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

  return NextResponse.json({ cart: user.cart || [] })
}

export async function POST(req: NextRequest) {
  // Add or update single cart item: { productId, storeId, quantity }
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json()
  const { productId, storeId, quantity = 1, price } = body
  if (!productId || !storeId) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })

  const client = await clientPromise
  const db = client.db()
  // Read user, modify cart in JS to avoid complex update operator typing
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  const existingCart = Array.isArray(user.cart) ? user.cart.slice() : []
  const idx = existingCart.findIndex((it: any) => it.productId === productId && it.storeId === storeId)
  if (idx >= 0) {
    existingCart[idx] = { ...existingCart[idx], quantity, priceSnapshot: price || existingCart[idx].priceSnapshot }
  } else {
    existingCart.push({ productId, storeId, quantity, priceSnapshot: price || null })
  }

  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { cart: existingCart } })

  const updated = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  return NextResponse.json({ cart: updated?.cart || [] })
}

export async function PUT(req: NextRequest) {
  // Replace whole cart
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  const body = await req.json()
  const { cart } = body
  if (!Array.isArray(cart)) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })

  const client = await clientPromise
  const db = client.db()
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { cart } })
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  return NextResponse.json({ cart: user?.cart || [] })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  const body = await req.json()
  const { productId, storeId } = body
  if (!productId || !storeId) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })

  const client = await clientPromise
  const db = client.db()
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  const existingCart = Array.isArray(user.cart) ? user.cart.slice() : []
  const newCart = existingCart.filter((it: any) => !(it.productId === productId && it.storeId === storeId))
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { cart: newCart } })
  const updated = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  return NextResponse.json({ cart: updated?.cart || [] })
}
