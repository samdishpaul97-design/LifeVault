"use client"

import Image from "next/image"
import { Heart, Lock } from "lucide-react"
import { badges, stickers, type Badge } from "@/lib/lifevault-data"

const tierStyles: Record<string, string> = {
  Bronze: "from-amber-700/40 to-amber-500/20 text-amber-300",
  Silver: "from-slate-400/40 to-slate-200/20 text-slate-200",
  Gold: "from-amber-warm/50 to-amber-300/20 text-amber-warm",
}

interface ProfileProps {
  level: number
  xp: number
  maxXp: number
  memories: number
  tours: number
  stops: number
}

export function Profile({ level, xp, maxXp, memories, tours, stops }: ProfileProps) {
  const pct = Math.min(100, Math.round((xp / maxXp) * 100))
  const remaining = Math.max(0, maxXp - xp)
  const unlocked = badges.filter((b) => b.unlocked).length

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your shared level, badges, and the sticker book you&apos;ve filled together.
        </p>
      </div>

      {/* Co-Op level card */}
      <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Avatar src="/images/avatar-sam.png" alt="Sam" className="z-10" />
            <span className="relative z-20 -mx-3 grid size-8 place-items-center rounded-full border border-amber-warm/50 bg-vault-bg shadow">
              <Heart className="size-4 fill-terracotta text-terracotta" />
            </span>
            <Avatar src="/images/avatar-priya.png" alt="Priya" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Co-Op Level
            </p>
            <h3 className="font-display text-2xl font-semibold text-cream">
              Level {level} Explorers
            </h3>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-warm">
              {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">
              {remaining.toLocaleString()} XP to Level {level + 1}
            </span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full border border-border bg-vault-bg">
            <div
              className="h-full rounded-full bg-gradient-to-r from-terracotta via-amber-warm to-amber-warm transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Memories" value={memories} />
        <Stat label="Tours" value={tours} />
        <Stat label="Stops" value={stops} />
      </div>

      {/* Badges */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Achievement Badges
          </h3>
          <span className="text-xs font-bold text-amber-warm">
            {unlocked} / {badges.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </div>

      {/* Sticker book */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Sticker Book
        </h3>
        <div className="flex flex-wrap gap-3 rounded-3xl border border-dashed border-border bg-card/50 p-5">
          {stickers.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="grid size-12 place-items-center rounded-2xl bg-vault-bg text-2xl shadow-inner transition-transform hover:-translate-y-1 hover:rotate-6"
              style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 text-center shadow-lg shadow-black/20">
      <p className="font-display text-2xl font-semibold tabular-nums text-cream">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function Avatar({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <span
      className={`block size-12 overflow-hidden rounded-full border-2 border-cream/80 bg-vault-panel shadow ${className}`}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={`${alt} avatar`}
        width={48}
        height={48}
        className="size-full object-cover"
      />
    </span>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-center ${
        badge.unlocked
          ? "border-amber-warm/30 bg-card/80"
          : "border-border bg-card/40"
      }`}
    >
      <div
        className={`mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${
          badge.unlocked ? tierStyles[badge.tier] : "from-secondary to-muted grayscale"
        } ${!badge.unlocked ? "opacity-40" : ""}`}
      >
        {badge.unlocked ? (
          badge.emoji
        ) : (
          <Lock className="size-5 text-muted-foreground" />
        )}
      </div>
      <p
        className={`mt-2 font-display text-sm font-bold ${
          badge.unlocked ? "text-cream" : "text-muted-foreground"
        }`}
      >
        {badge.name}
      </p>
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {badge.tier}
      </p>
      <p className="mt-1 text-xs text-cream/60">{badge.description}</p>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-black tabular-nums ${
          badge.unlocked
            ? "bg-amber-warm/15 text-amber-warm"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {badge.progress}
      </span>
    </div>
  )
}
