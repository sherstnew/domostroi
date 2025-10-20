import { NextRequest, NextResponse } from 'next/server'
import { mockProducts } from '@/app/api/products/route'

function pickRandom(arr: any[], n = 5) {
  const copy = arr.slice()
  const res: any[] = []
  while (res.length < Math.min(n, copy.length)) {
    const i = Math.floor(Math.random() * copy.length)
    res.push(copy.splice(i, 1)[0])
  }
  return res
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // body.q - search query; for now we ignore and return random products
    const results = pickRandom(mockProducts, 6)
    return NextResponse.json({ results })
  } catch (e) {
    console.error('Search route error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
