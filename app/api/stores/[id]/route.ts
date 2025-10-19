import { NextRequest, NextResponse } from 'next/server'
import { mockStores } from '@/lib/data/stores'

export async function GET(request: NextRequest, context: any) {
  try {
    const { params } = context
    const store = mockStores.find(s => s._id === params.id)

    if (!store) {
      return NextResponse.json(
        { error: 'Магазин не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}