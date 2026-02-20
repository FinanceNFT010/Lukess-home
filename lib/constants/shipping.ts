export const SHIPPING_CONFIG = {
  FREE_THRESHOLD: 400,
  FLAT_RATE: 25,
  CITY: 'Santa Cruz',
  CITY_FULL: 'Santa Cruz de la Sierra, Bolivia',
} as const

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
