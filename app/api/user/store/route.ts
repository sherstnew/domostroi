import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

async function getUserIdFromRequest(req: NextRequest) {
  let token = getTokenFromHeaders(req.headers)
  if (!token) {
    try { const cookie = req.cookies.get('token'); if (cookie) token = cookie.value } catch (e) {}
  }
  if (!token) return null
  try { const payload = await verifyToken(token); return payload.userId } catch (e) { return null }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  const body = await req.json()
  const { storeId, storeName } = body
  if (!storeId) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })

  const client = await clientPromise
  const db = client.db()
  const toSet: any = { selectedStore: storeId }
  if (storeName) toSet.selectedStoreName = storeName
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: toSet })
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const client = await clientPromise
  const db = client.db()

  // remove selected store fields
  await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $unset: { selectedStore: '', selectedStoreName: '' } })
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
  return NextResponse.json({ user })
}
