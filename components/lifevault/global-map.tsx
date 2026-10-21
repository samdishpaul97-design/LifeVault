"use client"

import dynamic from "next/dynamic"

const VaultLeafletMap = dynamic(
  () => import("@/components/lifevault/vault-leaflet-map").then((mod) => mod.VaultLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[60vh] min-h-[500px] rounded-2xl border border-zinc-800 bg-zinc-950/80"
        aria-hidden
      />
    ),
  },
)

export function GlobalMap() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cream">Global Map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Memories pinned where they happened.
        </p>
      </div>

      <VaultLeafletMap />
    </section>
  )
}
