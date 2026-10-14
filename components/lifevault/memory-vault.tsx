"use client"

import Image from "next/image"
import { Lock } from "lucide-react"
import { badges, stickers, type Badge } from "@/lib/lifevault-data"

const polaroids = [
  {
    src: "/images/cheltenham-badlands.png",
    caption: "Badlands, October",
    rotation: -4,
  },
  {
    src: "/images/badiali-vodka-slice.png",
    caption: "That vodka slice",
    rotation: 3,
  },
  {
    src: "/images/rattlesnake-point.png",
    caption: "Cliffside picnic",
    rotation: -2,
  },
  {
    src: "/images/arcade-cocktails.png",
    caption: "Arcade date night",
    rotation: 4,
  },
]

const tierStyles: Record<string, string> = {
  Bronze: "from-amber-700/40 to-amber-500/20 text-amber-300",
  Silver: "from-slate-400/40 to-slate-200/20 text-slate-200",
  Gold: "from-amber-warm/50 to-amber-300/20 text-amber-warm",
}

export function MemoryVault() {
  const unlocked = badges.filter((b) => b.unlocked).length

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">
          Memory Vault
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every adventure, badge, and inside joke in one warm little archive.
        </p>
      </div>

      {/* Polaroid wall */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Recent Snapshots
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {polaroids.map((p) => (
            <figure
              key={p.caption}
              className="animate-float-in rounded-lg bg-cream p-2 pb-4 shadow-xl shadow-black/30 transition-transform hover:!rotate-0 hover:scale-105"
              style={{ transform: `rotate(${p.rotation}deg)` }}
            >
              <div className="relative aspect-square overflow-hidden rounded-sm">
                <Image
                  src={p.src || "/placeholder.svg"}
                  alt={p.caption}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-center font-display text-sm font-semibold italic text-vault-bg/70">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
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
