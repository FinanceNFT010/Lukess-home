// Haversine formula — distance between 2 GPS points in km
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Origin: Mercado Mutualista, Santa Cruz de la Sierra
const ORIGIN = { lat: -17.762778, lng: -63.161667 }

export const FREE_SHIPPING_THRESHOLD = 400  // Bs
export const MAX_DELIVERY_DISTANCE_KM = 20  // km — beyond this: WhatsApp only

// Returns shipping cost in Bs, or 'out_of_range' if > 20 km
export function calculateShippingCost(
  distanceKm: number,
  orderTotal: number,
): number | 'out_of_range' {
  if (distanceKm > MAX_DELIVERY_DISTANCE_KM) return 'out_of_range'
  if (orderTotal >= FREE_SHIPPING_THRESHOLD) return 0
  if (distanceKm <= 1) return 5
  if (distanceKm <= 3) return 10
  if (distanceKm <= 6) return 15
  if (distanceKm <= 10) return 20
  return 30  // 10–20 km
}

export function getDistanceFromMutualista(lat: number, lng: number): number {
  return calculateDistance(ORIGIN.lat, ORIGIN.lng, lat, lng)
}

export function getMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`
}

export const PICKUP_LOCATIONS = [
  {
    id: 'puesto-1',
    name: 'Puesto 1',
    aisle: 'Pasillo -2',
    stall: 'Caseta 47-48',
    hours: 'Lun-Sáb: 8:00 AM - 10:00 PM · Dom: 9:00 AM - 9:00 PM',
    mapsUrl: 'https://www.google.com/maps?q=-17.762778,-63.161667',
    mapsLabel: 'Ver en Google Maps →',
  },
  {
    id: 'puesto-2',
    name: 'Puesto 2',
    aisle: 'Pasillo -3',
    stall: 'Caseta 123',
    hours: 'Lun-Sáb: 8:00 AM - 10:00 PM · Dom: 9:00 AM - 9:00 PM',
    mapsUrl: 'https://www.google.com/maps?q=-17.762778,-63.161667',
    mapsLabel: 'Ver en Google Maps →',
  },
  {
    id: 'puesto-3',
    name: 'Puesto 3',
    aisle: 'Pasillo -5',
    stall: 'Caseta 228-229',
    hours: 'Lun-Sáb: 8:00 AM - 10:00 PM · Dom: 9:00 AM - 9:00 PM',
    mapsUrl: 'https://www.google.com/maps?q=-17.762778,-63.161667',
    mapsLabel: 'Ver en Google Maps →',
  },
] as const
