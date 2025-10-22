import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ToastsProvider from '@/components/ui/ToastProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'В своей тарелке - Здоровое питание',
  description: 'Приложение для здорового питания',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans">
        <AuthProvider>
          <ToastsProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ToastsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}