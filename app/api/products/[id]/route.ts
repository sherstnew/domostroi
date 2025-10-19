import { NextRequest, NextResponse } from 'next/server'
import { mockProducts } from '../route'

export async function GET(request: NextRequest, context: any) {
  // context.params may be a promise in Next.js; await to follow recommended pattern
  const { params } = (context && context.params) ? { params: await context.params } : { params: {} }
  try {
  const product = mockProducts.find(p => p._id === params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Продукт не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}