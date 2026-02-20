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
  images: string[] | null  // Array de URLs de imágenes para galería
  is_active: boolean
  is_new?: boolean  // Badge "NUEVO" - productos de la nueva colección
  is_best_seller?: boolean  // Badge "MÁS VENDIDO"
  discount: number | null  // Descuento en porcentaje (0-100)
  discount_percentage?: number | null  // Alias para compatibilidad
  is_featured: boolean | null  // Producto destacado
  collection?: string | null  // Colección: 'primavera', 'verano', etc.
  subcategory?: string | null  // Subcategoría: 'manga-larga', 'oversize', 'elegante', etc.
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
  shipping_cost?: number
  total: number
  status: string
  payment_method: string
  delivery_method?: 'delivery' | 'pickup'
  shipping_address?: string | null
  shipping_reference?: string | null
  pickup_location?: string | null
  gps_lat?: number | null
  gps_lng?: number | null
  gps_distance_km?: number | null
  maps_link?: string | null
  recipient_name?: string | null
  recipient_phone?: string | null
  delivery_instructions?: string | null
  created_at: string
}
