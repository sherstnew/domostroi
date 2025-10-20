"use client";

import Link from "next/link";
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // if user will be redirected, render a minimal placeholder
  if (user) return <div className="min-h-screen flex items-center justify-center">Перенаправление...</div>

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center h-screen hero">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--light-green)]/10 to-[var(--dark-green)]/5" />

        {/* Decorative veggies inside hero (3D figurine look) */}
        {/* <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <img src="/Carrot (1).webp" alt="" className="absolute left-8 bottom-12 w-56 rounded-2xl transform rotate-6 translate-y-4 opacity-95" />
          <img src="/Eggplant Vegetable.webp" alt="" className="absolute right-10 top-24 w-72 rounded-2xl transform -rotate-6 opacity-90" />
          <img src="/Broccoli from Recraft.webp" alt="" className="absolute left-1/3 top-12 w-48 rounded-2xl transform rotate-3 opacity-85" />
          <img src="/Asparagus from Recraft.webp" alt="" className="absolute right-1/3 bottom-24 w-44 rounded-2xl transform -rotate-3 opacity-80" />
          <img src="/Celery from Recraft.webp" alt="" className="absolute right-30 bottom-30 w-44 rounded-2xl scale-150 transform -rotate-3 opacity-80" />
          <img src="/Tomato from Recraft.webp" alt="" className="absolute left-8 top-12 w-56 rounded-2xl transform rotate-6 translate-y-10 opacity-95" />
          <img src="/Avocado from Recraft.webp" alt="" className="absolute top-70 left-70 w-56 rounded-2xl transform rotate-10 translate-y-10 opacity-95" />
        </div> */}

        {/* Content (above the decorative veggies) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
          <div className="flex justify-center gap-8 items-center py-20">
            <div className="text-center lg:text-left flex items-center flex-col">
              <img src="/logo.svg" alt="" className='w-4/5' />
              <div className="relative px-4 py-2 mb-5 w-4/5">
                <p className="text-xl text-center md:text-2xl text-gray-700 max-w-3xl mx-auto lg:mx-0">
                  Покупайте осознанно. Экономьте время.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Начать путешествие
                </Link>
                <Link href="/login" className="btn-accent text-lg px-8 py-3">
                  Войти в аккаунт
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-4">Популярные продукты</h2>
          <p className="text-gray-600">Просмотрите нашу подборку.</p>
        </div>
      </section> */}
    </div>
  );
}
