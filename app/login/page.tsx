'use client'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const LoginClient = dynamic(() => import('./LoginClient'), { ssr: false })

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      {/* LoginClient uses useSearchParams() so it must be client and wrapped in Suspense */}
      <LoginClient />
    </Suspense>
  )
}