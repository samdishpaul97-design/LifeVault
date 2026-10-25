"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { MapPin, Zap } from "lucide-react"
import { AddSpotModal } from "@/components/lifevault/add-spot-modal"
import { supabase } from "@/lib/supabase"

interface PlannerSpot {
  id: string
  name: string
  location: string
  category: string
  xp: number
  imageUrl: string | null
  location_lat?: number | null
  location_lng?: number | null
}

interface BucketListProps {
  onRemoved?: (name: string) => void
  onLogged?: (name: string, xp: number) => void
  onError?: (message: string) => void
}

export function BucketList({ onRemoved, onLogged, onError }: BucketListProps) {
  const [spots, setSpots] = useState<PlannerSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conquerSpot, setConquerSpot] = useState<PlannerSpot | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const withCoords = await supabase
        .from("bucket_list")
        .select("id, name, location, category, xp_value, image_url, location_lat, location_lng")
      const missingCoords =
        withCoords.error?.message.includes("location_lat") ||
        withCoords.error?.message.includes("location_lng")
      const { data, error: queryError } = missingCoords
        ? await supabase.from("bucket_list").select("id, name, location, category, xp_value, image_url")
        : withCoords

      if (cancelled) return
      if (queryError) {
        setError(queryError.message)
        setSpots([])
        setLoading(false)
        return
      }

      setSpots((data ?? []).map(toPlannerSpot))
      setError(null)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const deletePlannerSpot = async (spot: PlannerSpot) => {
    const { error: deleteError } = await supabase.from("bucket_list").delete().eq("id", spot.id)
    return deleteError
  }

  const removeSpot = async (spot: PlannerSpot) => {
    const deleteError = await deletePlannerSpot(spot)
    if (deleteError) {
      onError?.(deleteError.message)
      return
    }

    setSpots((current) => current.filter((item) => item.id !== spot.id))
    onRemoved?.(spot.name)
  }

  const logConqueredSpot = async (data: {
    name: string
    location: string
    xp_value: number
    category?: string
    image?: string
    location_lat?: number | null
    location_lng?: number | null
  }) => {
    if (!conquerSpot) return false

    const { xp_value } = data
    const { error: insertError } = await supabase.from("vault_entries").insert({
      title: data.name,
      category: data.category || conquerSpot.category || "Uncategorized",
      content: data.location,
      rating: xp_value,
      image_url: data.image ?? conquerSpot.imageUrl,
      location_lat: data.location_lat ?? conquerSpot.location_lat ?? null,
      location_lng: data.location_lng ?? conquerSpot.location_lng ?? null,
    })
    if (insertError) {
      onError?.(insertError.message)
      return false
    }

    const deleteError = await deletePlannerSpot(conquerSpot)
    if (deleteError) {
      onError?.(deleteError.message)
      return false
    }

    const loggedName = conquerSpot.name
    const loggedId = conquerSpot.id
    setSpots((current) => current.filter((item) => item.id !== loggedId))
    onRemoved?.(loggedName)
    onLogged?.(loggedName, xp_value)
    return true
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Our Bucket List</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {spots.length} {spots.length === 1 ? "spot" : "spots"} saved to the planner
        </p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Syncing the planner…</p> : null}

      {error ? (
        <p className="rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-cream">
          {error}
        </p>
      ) : null}

      {!loading && !error && spots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
          Nothing saved yet. Bookmark a spot in Discover.
        </p>
      ) : null}

      <ul className="space-y-3">
        {spots.map((spot) => (
          <li key={spot.id} className="animate-float-in">
            <article className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-4 transition-all hover:border-amber-warm/40 hover:shadow-lg hover:shadow-black/20">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-vault-panel">
                {spot.imageUrl ? (
                  <Image
                    src={spot.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-xl" aria-hidden="true">
                    📍
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold leading-snug text-cream">
                  {spot.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5 text-terracotta" />
                  <span className="truncate">{spot.location || "TBD"}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {spot.category ? (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] font-bold text-muted-foreground">
                      {spot.category}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setConquerSpot(spot)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-warm underline-offset-2 transition-colors hover:underline"
                  >
                    <Zap className="size-3.5" />
                    Conquer
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeSpot(spot)}
                    className="text-xs font-bold text-muted-foreground underline-offset-2 transition-colors hover:text-terracotta hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <span className="shrink-0 rounded-xl bg-amber-warm/15 px-3 py-1.5 text-sm font-black tabular-nums text-amber-warm">
                +{spot.xp}
                <span className="ml-0.5 text-[0.65rem] font-bold">XP</span>
              </span>
            </article>
          </li>
        ))}
      </ul>

      <AddSpotModal
        open={conquerSpot !== null}
        proofOnly
        defaults={
          conquerSpot
            ? {
                name: conquerSpot.name,
                location: conquerSpot.location,
                category: conquerSpot.category,
                location_lat: conquerSpot.location_lat,
                location_lng: conquerSpot.location_lng,
              }
            : undefined
        }
        onClose={() => setConquerSpot(null)}
        onSave={logConqueredSpot}
      />
    </section>
  )
}

function toPlannerSpot(row: {
  id: string
  name: string | null
  location: string | null
  category: string | null
  xp_value: number | string | null
  image_url: string | null
  location_lat?: number | string | null
  location_lng?: number | string | null
}): PlannerSpot {
  const xp = typeof row.xp_value === "number" ? row.xp_value : Number(row.xp_value)
  const imageUrl = row.image_url && row.image_url.startsWith("/") ? row.image_url : null

  return {
    id: row.id,
    name: row.name?.trim() || "Untitled",
    location: row.location ?? "",
    category: row.category ?? "",
    xp: Number.isFinite(xp) ? xp : 0,
    imageUrl,
    location_lat: finiteCoord(row.location_lat),
    location_lng: finiteCoord(row.location_lng),
  }
}

function finiteCoord(value: number | string | null | undefined) {
  if (value == null || value === "") return null
  const number = typeof value === "number" ? value : Number(value)
  return Number.isFinite(number) ? number : null
}
