"use client"

import { User } from "lucide-react"

interface CoopHeaderProps {
  level: number
  xp: number
  maxXp: number
  name?: string
}

export function CoopHeader({ level, xp, maxXp, name }: CoopHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-lg shadow-black/20 backdrop-blur sm:p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-full border-2 border-cream/80 bg-vault-panel text-cream shadow">
          <User className="size-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Level {level} Explorer
          </p>
          <h1 className="font-display text-xl font-semibold text-cream sm:text-2xl">
            {name ? `${name}'s Vault` : "Your Vault"}
          </h1>
        </div>
      </div>

      <span
        className="rounded-full border border-amber-warm/40 bg-amber-warm/10 px-4 py-2 text-sm font-black tabular-nums text-amber-warm"
        aria-label={`${xp.toLocaleString()} of ${maxXp.toLocaleString()} XP toward the next level`}
      >
        {xp.toLocaleString()} XP
      </span>
    </header>
  )
}
