import { NextRequest, NextResponse } from 'next/server'
import { mockStores } from '@/lib/data/stores'

export async function POST(request: NextRequest, context: any) {
  try {
    const params = (context && context.params) ? await context.params : {}
    const body = await request.json()
    const store = mockStores.find(s => s._id === params.id)
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    // In a real app we'd persist. Here we just simulate response.
    // body should contain productIds: string[] and optionally favorite boolean
  const s: any = store
  s.favorites = s.favorites || []
  const toAdd = Array.isArray(body.productIds) ? body.productIds : (body.productId ? [body.productId] : [])
  s.favorites = Array.from(new Set([...s.favorites, ...toAdd]))
  return NextResponse.json({ ok: true, favorites: s.favorites })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
