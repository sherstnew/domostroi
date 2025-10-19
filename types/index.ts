export interface User {
  _id?: string
  email: string
  password: string
  name: string
  preferences: UserPreferences
  createdAt: Date
}

export interface UserPreferences {
  lifestyle: string[]
  bju: string[]
  forbidden: string[]
  dietaryRestrictions: string[]
}

export interface Product {
  _id?: string
  name: string
  description: string
  price: number
  calories: number
  protein: number
  carbs: number
  fat: number
  image: string
  category: string
  tags: string[]
  stores: ProductStore[]
  nutritionalInfo: {
    glutenFree: boolean
    lactoseFree: boolean
    vegan: boolean
    diabeticFriendly: boolean
    lowGi: boolean
  }
}

export interface ProductStore {
  storeId: string
  available: boolean
  aisle?: string
  shelf?: string
  price?: number
  lastUpdated: Date
}

export interface Store {
  _id?: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  phone: string
  hours: {
    open: string
    close: string
    days: string
  }
  departments: string[]
}

export interface ProductGroup {
  _id?: string
  userId: string
  name: string
  products: string[]
  totalCalories: number
  totalPrice: number
  createdAt: Date
}