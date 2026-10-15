"use client"

import { useState } from "react"
import Image from "next/image"
import { Bookmark, MapPin } from "lucide-react"
import { suggestions, type Suggestion } from "@/lib/lifevault-data"

const VIBES = ["Foodie", "Nightlife", "Nature", "Creative", "Sanctuary"] as const

const SUGGESTION_VIBES: Record<string, string[]> = {
  "s-pizza-1": ["Foodie"],
  "s-pizza-2": ["Foodie"],
  "s-hike-1": ["Nature", "Sanctuary"],
  "s-hike-2": ["Nature", "Sanctuary"],
  "s-date-1": ["Nightlife", "Creative"],
  "s-date-2": ["Foodie", "Sanctuary"],
  "s-travel-1": ["Foodie", "Creative"],
}

interface DiscoverProps {
  onBookmark: (s: Suggestion) => Promise<boolean>
  bookmarkedNames: Set<string>
  defaultFilters?: string[]
}

export function Discover({
  onBookmark,
  bookmarkedNames,
  defaultFilters = [],
}: DiscoverProps) {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(defaultFilters)

  const toggleFilter = (vibe: string) => {
    setActiveFilters((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe],
    )
  }

  const list =
    activeFilters.length === 0
      ? suggestions
      : suggestions.filter((spot) =>
          (SUGGESTION_VIBES[spot.id] ?? []).some((vibe) => activeFilters.includes(vibe)),
        )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Discover</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hand-picked spots for your next adventure. Bookmark one for the planner.
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

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
          Nothing in this vibe yet. Clear a filter to see every spot.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((s) => {
          const saved = bookmarkedNames.has(s.name)
          const saving = savingId === s.id
          return (
            <article
              key={s.id}
              className="animate-float-in group flex flex-col overflow-hidden rounded-3xl border border-border bg-card/80 shadow-lg shadow-black/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={s.image || "/placeholder.svg"}
                  alt={s.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/80 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-vault-bg/80 px-2.5 py-1 text-xs font-bold text-cream backdrop-blur">
                  <span aria-hidden="true">{s.emoji}</span>
                  {s.category}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-amber-warm px-2.5 py-1 text-xs font-black text-primary-foreground">
                  +{s.xp} XP
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-lg font-semibold text-cream">
                  {s.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5 text-terracotta" />
                  {s.location}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/70">
                  {s.blurb}
                </p>

                <button
                  type="button"
                  aria-label={saved ? `${s.name} saved to planner` : `Save ${s.name} to planner`}
                  aria-pressed={saved}
                  disabled={saved || saving}
                  onClick={() => {
                    setSavingId(s.id)
                    void onBookmark(s).finally(() => setSavingId(null))
                  }}
                  className={`mt-4 grid size-10 place-items-center rounded-xl border transition-all disabled:cursor-default ${
                    saved
                      ? "border-amber-warm/40 bg-amber-warm/15 text-amber-warm"
                      : "border-border text-muted-foreground hover:border-amber-warm/40 hover:text-amber-warm"
                  }`}
                >
                  <Bookmark className={`size-4 ${saved ? "fill-amber-warm" : ""}`} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
