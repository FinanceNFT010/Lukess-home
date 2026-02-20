'use client'
import { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import type { LeafletEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PIN_ICON = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#ef4444" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  className: '',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
})

export interface DeliveryMapPickerProps {
  lat: number
  lng: number
  draggable?: boolean
  height?: number
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function DeliveryMapPicker({
  lat,
  lng,
  draggable = true,
  height = 280,
  onLocationSelect,
}: DeliveryMapPickerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>([lat, lng])

  const handleDragEnd = (e: LeafletEvent) => {
    const pos = (e.target as L.Marker).getLatLng()
    setMarkerPos([pos.lat, pos.lng])
    onLocationSelect?.(pos.lat, pos.lng)
  }

  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: `${height}px`, width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={markerPos}
          draggable={draggable}
          icon={PIN_ICON}
          eventHandlers={draggable ? { dragend: handleDragEnd } : {}}
        />
      </MapContainer>
      {draggable && (
        <div className="bg-gray-50 border-t border-gray-200 px-3 py-2">
          <p className="text-xs text-gray-500 text-center">
            Arrastra el pin 📍 a la ubicación exacta de entrega
          </p>
        </div>
      )}
    </div>
  )
}
