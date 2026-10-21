"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { supabase } from "@/lib/supabase"

interface MappedMemory {
  id: string
  title: string
  category: string
  rating: number | null
  lat: number
  lng: number
}

const memoryIcon = L.divIcon({
  className: "vault-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
  html: "<span></span>",
})

const DARK_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
const DARK_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"

export function VaultLeafletMap() {
  const [memories, setMemories] = useState<MappedMemory[]>([])
  const [error, setError] = useState<string | null>(null)
  const points = useMemo(
    () => memories.map((memory) => [memory.lat, memory.lng] as [number, number]),
    [memories],
  )

  useEffect(() => {
    let cancelled = false

    async function loadMemories() {
      const { data, error: queryError } = await supabase
        .from("vault_entries")
        .select("id, title, category, rating, location_lat, location_lng")
        .not("location_lat", "is", null)
        .not("location_lng", "is", null)

      if (cancelled) return

      if (queryError) {
        setError(queryError.message)
        setMemories([])
        return
      }

      setMemories(toMappedMemories(data ?? []))
    }

    void loadMemories()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm font-semibold text-terracotta">{error}</p> : null}

      <div className="vault-map relative z-0 isolate h-[60vh] min-h-[500px] overflow-hidden rounded-2xl border border-zinc-800 shadow-lg shadow-black/20">
        <MapContainer center={[20, 0]} zoom={2} maxZoom={16} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            url={DARK_BASE}
            maxZoom={16}
          />
          <TileLayer url={DARK_LABELS} maxZoom={16} />
          <FitMemories points={points} />
          {memories.map((memory) => (
            <Marker key={memory.id} position={[memory.lat, memory.lng]} icon={memoryIcon}>
              <Popup>
                <div className="min-w-36">
                  <p className="font-semibold leading-snug text-[#f4ead7]">{memory.title}</p>
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">
                    {memory.category || "Uncategorized"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#f5b642]">
                    {memory.rating == null ? "No XP" : `${memory.rating} XP`}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

function FitMemories({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 12)
      return
    }
    map.fitBounds(points, { padding: [48, 48], maxZoom: 12 })
  }, [map, points])

  return null
}

function toMappedMemories(
  rows: {
    id: string
    title: string | null
    category: string | null
    rating: number | string | null
    location_lat: number | string | null
    location_lng: number | string | null
  }[],
): MappedMemory[] {
  return rows.flatMap((row) => {
    const lat = finite(row.location_lat)
    const lng = finite(row.location_lng)
    if (lat == null || lng == null) return []
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return []

    const rating = finite(row.rating)
    return [
      {
        id: row.id,
        title: row.title?.trim() || "Untitled",
        category: row.category?.trim() || "Uncategorized",
        rating,
        lat,
        lng,
      },
    ]
  })
}

function finite(value: number | string | null | undefined) {
  if (value == null || value === "") return null
  const number = typeof value === "number" ? value : Number(value)
  return Number.isFinite(number) ? number : null
}
