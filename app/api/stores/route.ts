import { NextRequest, NextResponse } from 'next/server'
import { mockStores } from '@/lib/data/stores'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') // в км

    let stores = [...mockStores]

    // Здесь можно добавить логику фильтрации по местоположению
    if (lat && lng && radius) {
      // Простая имитация фильтрации по расстоянию
      stores = stores.filter((_, index) => index < 3) // Возвращаем первые 3 магазина
    }

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Stores fetch error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}