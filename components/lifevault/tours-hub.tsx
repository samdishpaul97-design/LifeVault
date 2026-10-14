"use client"

import Image from "next/image"
import { ChevronRight, MapPin } from "lucide-react"
import { tourAccents, type Tour } from "@/lib/lifevault-data"

interface ToursHubProps {
  tours: Tour[]
  onOpen: (tourId: string) => void
}

export function ToursHub({ tours, onOpen }: ToursHubProps) {
  const totalSpots = tours.reduce((n, t) => n + t.spots.length, 0)
  const totalDone = tours.reduce(
    (n, t) => n + t.spots.filter((s) => s.completed).length,
    0,
  )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Our Tours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tours.length} collections · {totalDone} of {totalSpots} spots conquered
          together
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tours.map((t) => (
          <TourCard key={t.id} tour={t} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

function TourCard({ tour, onOpen }: { tour: Tour; onOpen: (id: string) => void }) {
  const accent = tourAccents[tour.accent]
  const done = tour.spots.filter((s) => s.completed).length
  const total = tour.spots.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <button
      onClick={() => onOpen(tour.id)}
      className="group animate-float-in flex flex-col overflow-hidden rounded-3xl border border-border bg-card/80 text-left shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-amber-warm/40 hover:shadow-xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={tour.cover || "/placeholder.svg"}
          alt={tour.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/90 via-vault-bg/20 to-transparent" />
        <span
          className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur ${accent.soft}`}
        >
          <span aria-hidden="true">{tour.emoji}</span>
          {done === total ? "Complete" : `${total - done} to go`}
        </span>
        <div className="absolute inset-x-4 bottom-3">
          <h3 className="font-display text-xl font-semibold text-cream drop-shadow">
            {tour.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex-1 text-sm leading-relaxed text-cream/70">
          {tour.description}
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
            <span className={`flex items-center gap-1 ${accent.text}`}>
              <MapPin className="size-3.5" />
              {done} / {total} spots
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-border bg-vault-bg">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <span className="mt-4 flex items-center justify-end gap-1 text-sm font-bold text-amber-warm">
          Open tour
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}
