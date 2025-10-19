import { Store } from '@/types'

export const mockStores: Store[] = [
  {
    _id: '1',
    name: 'GreenMarket Центр',
    address: 'ул. Центральная, 15, Москва',
    coordinates: { lat: 55.7558, lng: 37.6173 },
    phone: '+7 (495) 123-45-67',
    hours: {
      open: '08:00',
      close: '23:00',
      days: 'Ежедневно'
    },
    departments: ['Фрукты', 'Овощи', 'Молочные продукты', 'Мясо', 'Рыба', 'Бакалея', 'Органик']
  },
  {
    _id: '2',
    name: 'BioStore',
    address: 'пр. Экологичный, 42, Москва',
    coordinates: { lat: 55.7602, lng: 37.6175 },
    phone: '+7 (495) 234-56-78',
    hours: {
      open: '09:00',
      close: '22:00',
      days: 'Пн-Сб'
    },
    departments: ['Органик', 'Веганские продукты', 'Безглютеновые', 'Экологичные товары']
  },
  {
    _id: '3',
    name: 'FreshCorner',
    address: 'ул. Свежая, 8, Москва',
    coordinates: { lat: 55.7500, lng: 37.6000 },
    phone: '+7 (495) 345-67-89',
    hours: {
      open: '07:00',
      close: '24:00',
      days: 'Круглосуточно'
    },
    departments: ['Фрукты', 'Овощи', 'Молочные продукты', 'Готовые блюда', 'Здоровое питание']
  },
  {
    _id: '4',
    name: 'OrganicLife',
    address: 'бульвар Здоровья, 25, Москва',
    coordinates: { lat: 55.7456, lng: 37.6254 },
    phone: '+7 (495) 456-78-90',
    hours: {
      open: '10:00',
      close: '21:00',
      days: 'Ежедневно'
    },
    departments: ['Органик', 'Суперфуды', 'Веганские', 'Безглютеновые', 'Диабетические']
  },
  {
    _id: '5',
    name: 'VegaMarket',
    address: 'ул. Растительная, 33, Москва',
    coordinates: { lat: 55.7701, lng: 37.5955 },
    phone: '+7 (495) 567-89-01',
    hours: {
      open: '08:30',
      close: '21:30',
      days: 'Ежедневно'
    },
    departments: ['Веганские продукты', 'Растительное молоко', 'Органик', 'Экотовары']
  }
]