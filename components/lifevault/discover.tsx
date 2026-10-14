"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, MapPin, Plus } from "lucide-react"
import {
  INSPO_CATEGORY_META,
  suggestions,
  type InspoCategory,
  type Suggestion,
} from "@/lib/lifevault-data"

const FILTERS: (InspoCategory | "All")[] = [
  "All",
  "Best Pizza",
  "Scenic Hikes",
  "Date Night",
  "Travel Escapes",
]

interface DiscoverProps {
  onAdd: (s: Suggestion) => void
  addedNames: Set<string>
}

export function Discover({ onAdd, addedNames }: DiscoverProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")

  const list =
    filter === "All"
      ? suggestions
      : suggestions.filter((s) => s.category === filter)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Discover</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hand-picked spots for your next adventure. Tap to drop one onto a tour.
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const isActive = filter === f
          const meta = f === "All" ? null : INSPO_CATEGORY_META[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition-all ${
                isActive
                  ? "border-amber-warm bg-amber-warm/15 text-amber-warm"
                  : "border-border text-muted-foreground hover:text-cream"
              }`}
            >
              {meta && <span aria-hidden="true">{meta.emoji}</span>}
              {f}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((s) => {
          const added = addedNames.has(s.name)
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
                  onClick={() => onAdd(s)}
                  className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    added
                      ? "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      : "bg-amber-warm/15 text-amber-warm hover:bg-amber-warm hover:text-primary-foreground"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="size-4" />
                      On a tour · add again
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Add to a Tour
                    </>
                  )}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
