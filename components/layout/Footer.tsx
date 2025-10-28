export default function Footer() {
  return (
    <footer className="bg-[var(--dark-green)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-serif">В своей тарелке</h3>
            <p className="text-gray-300 text-sm">
              Помогаем вам находить идеальные продукты для здорового питания с учетом ваших потребностей и ограничений.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-bold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/products" className="hover:text-white transition-colors">Продукты</a></li>
              <li><a href="/stores" className="hover:text-white transition-colors">Магазины</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Профиль</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}