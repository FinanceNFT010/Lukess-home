export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  cost: number
  brand: string | null
  sizes: string[] | null
  colors: string[] | null
  image_url: string | null
  images?: string[] | null  // Array de URLs de imágenes para galería
  is_active: boolean
  is_new?: boolean  // Badge "NUEVO"
  is_best_seller?: boolean  // Badge "MÁS VENDIDO"
  discount_percentage?: number | null  // Descuento (20-30%)
  category_id: string | null
  created_at: string
  categories?: {
    name: string
  }
  inventory?: {
    quantity: number
    location_id: string
    locations?: {
      name: string
    }
  }[]
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  subtotal: number
  discount: number
  total: number
  status: string
  payment_method: string
  created_at: string
}
