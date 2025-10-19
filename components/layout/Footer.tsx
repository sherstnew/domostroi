export default function Footer() {
  return (
    <footer className="bg-[var(--dark-green)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-serif">GreenPlate</h3>
            <p className="text-gray-300 text-sm">
              Помогаем вам находить идеальные продукты для здорового питания с учетом ваших потребностей и ограничений.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-bold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/dashboard" className="hover:text-white transition-colors">Дашборд</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">Продукты</a></li>
              <li><a href="/stores" className="hover:text-white transition-colors">Магазины</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">О нас</a></li>
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h4 className="font-bold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/help" className="hover:text-white transition-colors">Помощь</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Контакты</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Условия</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-bold mb-4">Контакты</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Email: info@greenplate.ru</p>
              <p>Телефон: +7 (999) 123-45-67</p>
              <p>Москва, Россия</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2025 GreenPlate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}