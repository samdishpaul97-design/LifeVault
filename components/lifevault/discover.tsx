"use client"

import { useEffect, useState } from "react"
import { ExternalLink, MapPin, Zap } from "lucide-react"
import { AddSpotModal } from "@/components/lifevault/add-spot-modal"
import { readLifevaultProfile } from "@/components/lifevault/onboarding-modal"

const VIBES = ["Cafe", "Nightlife", "Nature", "Creative", "Sanctuary", "Fitness"] as const

const CONQUER_XP = 50

interface DiscoverPlace {
  name: string
  rating: number
  review_count: number
  formatted_address: string
  place_id: string
  lat: number
  lng: number
  photo: string | null
  vibe: string
}

interface DiscoverProps {
  defaultFilters?: string[]
  onConquer: (data: {
    name: string
    location: string
    xp_value: number
    category?: string
    image?: string
    location_lat?: number | null
    location_lng?: number | null
  }) => void | Promise<boolean | void>
}

export function Discover({ defaultFilters = [], onConquer }: DiscoverProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(defaultFilters)
  const [places, setPlaces] = useState<DiscoverPlace[]>([])
  const [loading, setLoading] = useState(defaultFilters.length > 0)
  const [error, setError] = useState<string | null>(null)
  const [conquer, setConquer] = useState<DiscoverPlace | null>(null)
  const filterKey = activeFilters.join("|")

  useEffect(() => {
    let cancelled = false

    async function applySavedVibes() {
      await Promise.resolve()
      if (cancelled) return
      const saved = readLifevaultProfile()?.vibes ?? []
      const known = new Set<string>(VIBES)
      const next = saved.filter((vibe) => known.has(vibe))
      if (next.length === 0) return
      setActiveFilters((current) => (current.join("|") === next.join("|") ? current : next))
    }

    void applySavedVibes()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const vibes = filterKey ? filterKey.split("|") : []
    if (vibes.length === 0) {
      setPlaces([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setPlaces([])
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const batches = await Promise.all(
          vibes.map(async (vibe) => {
            const res = await fetch(`/api/discover?vibe=${encodeURIComponent(vibe)}`)
            const body = (await res.json()) as DiscoverPlace[] | { error?: string }
            if (!res.ok || !Array.isArray(body)) {
              const message =
                !Array.isArray(body) && body.error ? body.error : "Could not search places."
              throw new Error(message)
            }
            return body.map((place) => ({ ...place, vibe }))
          }),
        )
        if (cancelled) return

        const seen = new Set<string>()
        const next: DiscoverPlace[] = []
        for (const place of batches.flat()) {
          if (seen.has(place.place_id)) continue
          seen.add(place.place_id)
          next.push(place)
        }
        next.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
        setPlaces(next)
      } catch (err) {
        if (cancelled) return
        setPlaces([])
        setError(err instanceof Error ? err.message : "Could not search places.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [filterKey])

  const toggleFilter = (vibe: string) => {
    setActiveFilters((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe],
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Discover</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elite spots for your vibes. 4.3 stars or higher, with over 100 reviews.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Vibe Survey
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {VIBES.map((vibe) => {
            const isActive = activeFilters.includes(vibe)
            return (
              <button
                key={vibe}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleFilter(vibe)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "border-amber-warm bg-amber-warm/15 text-amber-warm"
                    : "border-border text-muted-foreground hover:text-cream"
                }`}
              >
                {vibe}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Searching for elite spots…</p> : null}

      {error ? (
        <p className="rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-cream">
          {error}
        </p>
      ) : null}

      {!loading && !error && places.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
          {activeFilters.length === 0
            ? "Choose a vibe to search Toronto."
            : "Nothing elite enough in this vibe yet. Try another filter."}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {places.map((place) => (
          <article
            key={place.place_id}
            className="animate-float-in group flex flex-col overflow-hidden rounded-3xl border border-border bg-card/80 shadow-lg shadow-black/20"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-vault-panel">
              {place.photo ? (
                // Google photo bytes are proxied through our route, so this is a plain image.
                <img src={place.photo} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-3xl" aria-hidden="true">
                  📍
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/80 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-vault-bg/80 px-2.5 py-1 text-xs font-bold text-cream backdrop-blur">
                {place.vibe}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-amber-warm px-2.5 py-1 text-xs font-black text-primary-foreground">
                ⭐ {place.rating.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-lg font-semibold text-cream">{place.name}</h3>
              <p className="mt-0.5 flex items-start gap-1 text-xs font-semibold text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
                <span>{place.formatted_address}</span>
              </p>
              <p className="mt-2 text-sm font-bold text-cream">
                ⭐ {place.rating.toFixed(1)}
                <span className="ml-2 font-semibold text-muted-foreground">
                  {place.review_count.toLocaleString()} reviews
                </span>
              </p>

              <div className="mt-4 flex gap-2">
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-amber-warm/40 hover:text-cream"
                >
                  <ExternalLink className="size-3.5" />
                  Inspect
                </a>
                <button
                  type="button"
                  onClick={() => setConquer(place)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-warm py-2.5 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90"
                >
                  <Zap className="size-3.5" />
                  Conquer +{CONQUER_XP} XP
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AddSpotModal
        open={conquer !== null}
        defaults={
          conquer
            ? {
                name: conquer.name,
                location: conquer.formatted_address,
                xp: CONQUER_XP,
                category: conquer.vibe,
                location_lat: conquer.lat,
                location_lng: conquer.lng,
              }
            : undefined
        }
        onClose={() => setConquer(null)}
        onSave={onConquer}
      />
    </section>
  )
}
