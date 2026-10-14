"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Check, MapPin, Plus, Sparkles, Star } from "lucide-react"
import { tourAccents, type Tour, type TourSpot } from "@/lib/lifevault-data"

interface TourDetailProps {
  tour: Tour
  onBack: () => void
  onToggleSpot: (spotId: string) => void
  onAddSpot: () => void
  onCelebrate: (name: string) => void
}

export function TourDetail({
  tour,
  onBack,
  onToggleSpot,
  onAddSpot,
  onCelebrate,
}: TourDetailProps) {
  const accent = tourAccents[tour.accent]
  const upNext = tour.spots.filter((s) => !s.completed)
  const visited = tour.spots.filter((s) => s.completed)
  const pct = tour.spots.length
    ? Math.round((visited.length / tour.spots.length) * 100)
    : 0

  return (
    <section className="space-y-8">
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-4" />
          All Tours
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-border">
          <Image
            src={tour.cover || "/placeholder.svg"}
            alt={tour.name}
            width={960}
            height={360}
            className="h-40 w-full object-cover sm:h-52"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vault-bg via-vault-bg/50 to-transparent" />
          <div className="absolute inset-x-5 bottom-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${accent.soft}`}
            >
              <span aria-hidden="true">{tour.emoji}</span>
              {tour.name}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-cream drop-shadow sm:text-3xl">
              {tour.name}
            </h2>
            <div className="mt-3 max-w-sm">
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span className={accent.text}>
                  {visited.length} / {tour.spots.length} spots
                </span>
                <span className="text-cream/70">{pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-border bg-vault-bg/80">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Up Next */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className={`size-4 ${accent.text}`} />
            Up Next
            <span className="text-cream/40">· {upNext.length}</span>
          </div>
          <button
            onClick={onAddSpot}
            className="hidden items-center gap-2 rounded-full border border-amber-warm/40 bg-amber-warm/10 px-3.5 py-1.5 text-sm font-bold text-amber-warm transition-colors hover:bg-amber-warm/20 sm:flex"
          >
            <Plus className="size-4" />
            Add New Spot
          </button>
        </div>

        {upNext.length > 0 ? (
          <ul className="space-y-3">
            {upNext.map((s) => (
              <SpotRow
                key={s.id}
                spot={s}
                accentText={accent.text}
                onToggle={onToggleSpot}
                onCelebrate={onCelebrate}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
            Every spot on this tour is in the Vault. Add a new one to keep the
            adventure going.
          </p>
        )}

        <button
          onClick={onAddSpot}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-bold text-muted-foreground transition-colors hover:border-amber-warm/50 hover:text-amber-warm sm:hidden"
        >
          <Plus className="size-4" />
          Add New Spot
        </button>
      </div>

      {/* The Vault */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Star className="size-4 fill-amber-warm text-amber-warm" />
          The Vault
          <span className="text-cream/40">· {visited.length}</span>
        </div>

        {visited.length > 0 ? (
          <div className="space-y-8">
            {visited.map((s, i) => (
              <ScrapbookCard
                key={s.id}
                spot={s}
                index={i}
                accentText={accent.text}
                onToggle={onToggleSpot}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center text-sm text-muted-foreground">
            No memories yet. Check off a spot above to start your scrapbook.
          </p>
        )}
      </div>
    </section>
  )
}

function SpotRow({
  spot,
  accentText,
  onToggle,
  onCelebrate,
}: {
  spot: TourSpot
  accentText: string
  onToggle: (id: string) => void
  onCelebrate: (name: string) => void
}) {
  const [burst, setBurst] = useState(false)

  const handleToggle = () => {
    onToggle(spot.id)
    setBurst(true)
    onCelebrate(spot.name)
    window.setTimeout(() => setBurst(false), 750)
  }

  return (
    <li className="animate-float-in">
      <div className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-4 transition-all hover:border-amber-warm/40 hover:shadow-lg hover:shadow-black/20">
        <button
          onClick={handleToggle}
          aria-label={`Mark ${spot.name} as visited`}
          className="relative grid size-9 shrink-0 place-items-center rounded-full border-2 border-muted-foreground/40 text-transparent transition-all hover:border-amber-warm"
        >
          <Check className="size-5" strokeWidth={3} />
          {burst && <Confetti />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold leading-snug text-cream">
            {spot.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className={`size-3.5 ${accentText}`} />
            {spot.location}
          </p>
        </div>

        <span className="shrink-0 rounded-xl bg-amber-warm/15 px-3 py-1.5 text-sm font-black tabular-nums text-amber-warm">
          +{spot.xp}
          <span className="ml-0.5 text-[0.65rem] font-bold">XP</span>
        </span>
      </div>
    </li>
  )
}

function ScrapbookCard({
  spot,
  index,
  onToggle,
}: {
  spot: TourSpot
  index: number
  accentText: string
  onToggle: (id: string) => void
}) {
  const hasScores = spot.samScore != null && spot.priyaScore != null

  return (
    <article
      className="animate-float-in relative rounded-2xl border border-border bg-cream p-3 shadow-xl shadow-black/30"
      style={{ transform: `rotate(${spot.rotation ?? 0}deg)` }}
    >
      <span
        className="absolute -top-3 left-1/2 h-6 w-24 rounded-sm bg-amber-warm/70 shadow-sm"
        style={{ transform: "translateX(-50%) rotate(-2deg)" }}
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-4 border-white shadow-md">
          {spot.image ? (
            <Image
              src={spot.image || "/placeholder.svg"}
              alt={spot.name}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-vault-panel to-secondary text-4xl">
              📸
            </div>
          )}
          <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-terracotta text-xs font-black text-white shadow">
            {index + 1}
          </span>
        </div>

        <div className="flex flex-col text-vault-bg">
          <h3 className="font-display text-xl font-bold leading-tight text-vault-bg">
            {spot.name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-terracotta">
            {spot.location}
          </p>

          {spot.caption && (
            <p className="mt-2 font-display text-sm italic leading-snug text-vault-bg/70">
              &ldquo;{spot.caption}&rdquo;
            </p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <ScoreChip name="Sam" score={spot.samScore} />
            <ScoreChip name="Priya" score={spot.priyaScore} />
          </div>

          {spot.mustTry && (
            <div className="mt-3 rounded-lg bg-vault-bg/5 p-2.5">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-terracotta">
                {spot.mustTryLabel ?? "Must-Try"}
              </p>
              <p className="text-sm font-bold text-vault-bg">{spot.mustTry}</p>
            </div>
          )}

          {spot.stickers && spot.stickers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {spot.stickers.map((s) => (
                <span
                  key={s}
                  className="rounded-full border-2 border-dashed border-terracotta/50 px-2.5 py-0.5 text-[0.7rem] font-black uppercase tracking-wide text-terracotta"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => onToggle(spot.id)}
            className="mt-auto self-start pt-3 text-xs font-bold text-vault-bg/40 underline-offset-2 transition-colors hover:text-terracotta hover:underline"
          >
            {hasScores ? "Move back to Up Next" : "Not visited yet? Undo"}
          </button>
        </div>
      </div>
    </article>
  )
}

function ScoreChip({ name, score }: { name: string; score?: number }) {
  return (
    <div className="rounded-lg bg-vault-bg/5 px-3 py-2">
      <p className="text-[0.65rem] font-black uppercase tracking-widest text-vault-bg/50">
        {name}
      </p>
      <p className="flex items-center gap-1 font-display text-lg font-black text-vault-bg">
        <Star className="size-4 fill-amber-warm text-amber-warm" />
        {score != null ? score.toFixed(1) : "—"}
        <span className="text-xs font-bold text-vault-bg/40">/10</span>
      </p>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 10 })
  const colors = ["#f5b642", "#e0714a", "#f4ead7", "#7dd3fc", "#c4b5fd"]
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const dist = 26 + (i % 3) * 6
        return (
          <span
            key={i}
            className="confetti-piece absolute size-1.5 rounded-[1px]"
            style={
              {
                backgroundColor: colors[i % colors.length],
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </span>
  )
}
