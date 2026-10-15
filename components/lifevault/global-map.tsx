"use client"

import { Map as MapIcon } from "lucide-react"

export function GlobalMap() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Global Map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A place for every memory, once the coordinates are ready.
        </p>
      </div>

      <div className="grid min-h-[28rem] place-items-center rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-lg shadow-black/20">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-amber-warm">
            <MapIcon className="size-7" />
          </span>
          <p className="font-display text-lg font-semibold text-cream">
            Global Vault Map (Coordinates Loading...)
          </p>
        </div>
      </div>
    </section>
  )
}
