"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface AddSpotModalProps {
  open: boolean
  tourName?: string
  onClose: () => void
  onSave: (data: { name: string; location: string; xp: number }) => void
}

export function AddSpotModal({
  open,
  tourName,
  onClose,
  onSave,
}: AddSpotModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <AddSpotForm tourName={tourName} onClose={onClose} onSave={onSave} />
  )
}

function AddSpotForm({
  tourName,
  onClose,
  onSave,
}: Omit<AddSpotModalProps, "open">) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [xp, setXp] = useState(50)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), location: location.trim() || "TBD", xp })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-spot-title"
        className="animate-float-in relative w-full max-w-md rounded-t-3xl border border-border bg-vault-panel p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="add-spot-title"
              className="font-display text-xl font-semibold text-cream"
            >
              Add New Spot
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {tourName ? `Drop a stop on ${tourName}.` : "Add a stop to this tour."}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="spot-name"
              className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Spot name
            </label>
            <input
              id="spot-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pizzeria Libretto"
              className="w-full rounded-xl border border-input bg-vault-bg px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-amber-warm focus:outline-none focus:ring-2 focus:ring-amber-warm/30"
            />
          </div>

          <div>
            <label
              htmlFor="spot-location"
              className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Neighborhood / location
            </label>
            <input
              id="spot-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ossington"
              className="w-full rounded-xl border border-input bg-vault-bg px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-amber-warm focus:outline-none focus:ring-2 focus:ring-amber-warm/30"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                XP Reward
              </span>
              <span className="rounded-lg bg-amber-warm/15 px-2 py-0.5 text-sm font-black text-amber-warm tabular-nums">
                +{xp} XP
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full accent-amber-warm"
              aria-label="XP reward"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Spot
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
