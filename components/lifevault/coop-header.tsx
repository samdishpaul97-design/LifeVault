"use client"

import Image from "next/image"
import { Heart } from "lucide-react"

interface CoopHeaderProps {
  level: number
  xp: number
}

export function CoopHeader({ level, xp }: CoopHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-lg shadow-black/20 backdrop-blur sm:p-5">
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
            Sam &amp; Priya
          </p>
          <h1 className="font-display text-xl font-semibold text-cream sm:text-2xl">
            Level {level} Explorers
          </h1>
        </div>
      </div>

      <span className="rounded-full border border-amber-warm/40 bg-amber-warm/10 px-4 py-2 text-sm font-black tabular-nums text-amber-warm">
        {xp.toLocaleString()} XP
      </span>
    </header>
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
