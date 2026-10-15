"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export interface SpotDraftDefaults {
  name?: string
  location?: string
  xp?: number
  category?: string
}

interface AddSpotModalProps {
  open: boolean
  tourName?: string
  defaults?: SpotDraftDefaults
  onClose: () => void
  onSave: (data: {
    name: string
    location: string
    xp: number
    category?: string
    image?: string
  }) => void | Promise<boolean | void>
}

export function AddSpotModal({
  open,
  tourName,
  defaults,
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
    <AddSpotForm
      key={`${defaults?.name ?? ""}-${defaults?.location ?? ""}-${defaults?.xp ?? ""}`}
      tourName={tourName}
      defaults={defaults}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function AddSpotForm({
  tourName,
  defaults,
  onClose,
  onSave,
}: Omit<AddSpotModalProps, "open">) {
  const [name, setName] = useState(defaults?.name ?? "")
  const [location, setLocation] = useState(defaults?.location ?? "")
  const [xp, setXp] = useState(defaults?.xp && defaults.xp > 0 ? defaults.xp : 50)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isUploading) return

    setUploadError(null)
    setIsUploading(true)

    let image: string | undefined
    if (file) {
      const safeName = file.name.replace(/[^\w.-]+/g, "_")
      const fileName = `${crypto.randomUUID()}-${safeName}`
      const { error } = await supabase.storage.from("vault_images").upload(fileName, file)

      if (error) {
        setUploadError(error.message)
        setIsUploading(false)
        return
      }

      const { data } = supabase.storage.from("vault_images").getPublicUrl(fileName)
      image = data.publicUrl
    }

    const saved = await onSave({
      name: name.trim(),
      location: location.trim() || "TBD",
      xp,
      category: defaults?.category,
      image,
    })
    if (saved === false) {
      setIsUploading(false)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isUploading) onClose()
        }}
        aria-hidden="true"
      />
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
              {defaults?.name ? "Conquer this spot" : "Add New Spot"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {defaults?.name
                ? "Add a photo, then save it to the vault."
                : tourName
                  ? `Drop a stop on ${tourName}.`
                  : "Add a stop to this tour."}
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
              autoFocus={!defaults?.name}
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
            <label
              htmlFor="spot-image"
              className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Photo
            </label>
            <input
              id="spot-image"
              type="file"
              accept="image/*"
              autoFocus={Boolean(defaults?.name)}
              disabled={isUploading}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-input bg-vault-bg px-4 py-3 text-sm text-cream file:mr-3 file:rounded-lg file:border-0 file:bg-amber-warm/15 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-amber-warm focus:border-amber-warm focus:outline-none focus:ring-2 focus:ring-amber-warm/30"
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

          {uploadError ? <p className="text-sm text-terracotta">{uploadError}</p> : null}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isUploading}
              className="flex-1 rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUploading ? (file ? "Uploading…" : "Saving…") : defaults?.name ? "Save" : "Add Spot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
