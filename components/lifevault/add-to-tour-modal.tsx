"use client"

import { useEffect } from "react"
import Image from "next/image"
import { ChevronRight, X } from "lucide-react"
import { tourAccents, type Suggestion, type Tour } from "@/lib/lifevault-data"

interface AddToTourModalProps {
  suggestion: Suggestion | null
  tours: Tour[]
  onClose: () => void
  onPick: (tourId: string) => void
}

export function AddToTourModal({
  suggestion,
  tours,
  onClose,
  onPick,
}: AddToTourModalProps) {
  useEffect(() => {
    if (!suggestion) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [suggestion, onClose])

  if (!suggestion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-tour-title"
        className="animate-float-in relative w-full max-w-md rounded-t-3xl border border-border bg-vault-panel p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="add-to-tour-title"
              className="font-display text-xl font-semibold text-cream"
            >
              Add to a Tour
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Where should &ldquo;{suggestion.name}&rdquo; go?
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="space-y-2.5">
          {tours.map((t) => {
            const accent = tourAccents[t.accent]
            const done = t.spots.filter((s) => s.completed).length
            return (
              <li key={t.id}>
                <button
                  onClick={() => onPick(t.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card/70 p-2.5 text-left transition-all hover:border-amber-warm/40 hover:bg-card"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={t.cover || "/placeholder.svg"}
                      alt={t.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-bold text-cream">
                      {t.name}
                    </span>
                    <span className={`text-xs font-bold ${accent.text}`}>
                      {done} / {t.spots.length} spots
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-amber-warm" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
