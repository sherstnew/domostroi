import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function PATCH(request: NextRequest, context: any) {
  // params can be a Promise in Next.js route handlers, await to be safe
  const params = (context && context.params) ? await context.params : {}
  try {
  const groupId = params.id
    let token = getTokenFromHeaders(request.headers)
    if (!token) {
      try { const cookie = request.cookies.get('token'); if (cookie) token = cookie.value } catch {}
    }
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    const payload = await verifyToken(token)
    const userId = payload.userId

    const body = await request.json()
    const { action, productId } = body
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const client = await clientPromise
    const db = client.db()

    if (action === 'add') {
      // validate groupId to avoid BSONError when it's not a valid ObjectId
      if (!ObjectId.isValid(groupId)) {
        return NextResponse.json({ error: 'Invalid group id' }, { status: 400 })
      }
      await db.collection('productGroups').updateOne(
        { _id: new ObjectId(groupId), userId },
        { $addToSet: { products: productId } }
      )
      return NextResponse.json({ message: 'Добавлено в группу' })
    }

    if (action === 'remove') {
      if (!ObjectId.isValid(groupId)) {
        return NextResponse.json({ error: 'Invalid group id' }, { status: 400 })
      }
      await db.collection('productGroups').updateOne(
        { _id: new ObjectId(groupId), userId },
        ({ $pull: { products: productId } } as any)
      )
      return NextResponse.json({ message: 'Удалено из группы' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Group PATCH error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
