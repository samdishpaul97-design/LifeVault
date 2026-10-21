"use client"

import { useEffect, useState } from "react"
import { Info, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

const FRICTION_TOOLTIP =
  "XP is calculated by friction: Distance + Wait Time + Cost + Reservation Difficulty. A walk-in coffee shop is Low Friction (10 XP). A 2-hour line at Badiali is High Friction (50 XP). A Michelin star reservation is Legendary (100 XP). *Future updates will auto-calculate this via web scraping.*"

const FRICTION_LEVELS = [
  { id: "low", label: "Low", detail: "Walk-in, easy, low effort", xp: 10 },
  { id: "medium", label: "Medium", detail: "Standard spot, minor wait", xp: 25 },
  { id: "high", label: "High", detail: "Hard reservation, long line, expensive", xp: 50 },
  { id: "legendary", label: "Legendary", detail: "Michelin star, multi-month wait, peak effort", xp: 100 },
] as const

type FrictionId = (typeof FRICTION_LEVELS)[number]["id"]

function frictionXp(id: FrictionId) {
  return FRICTION_LEVELS.find((level) => level.id === id)?.xp ?? 25
}

function finiteCoord(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function FrictionInfo() {
  return (
    <span className="group relative inline-flex normal-case tracking-normal">
      <button
        type="button"
        aria-label="How friction XP works"
        aria-describedby="friction-tooltip"
        className="grid size-4 place-items-center text-muted-foreground/80 transition-colors hover:text-cream focus-visible:text-cream"
      >
        <Info className="size-3.5" />
      </button>
      <span
        id="friction-tooltip"
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 text-left text-[0.7rem] font-medium leading-relaxed text-cream opacity-0 shadow-lg shadow-black/40 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {FRICTION_TOOLTIP}
      </span>
    </span>
  )
}

export interface SpotDraftDefaults {
  name?: string
  location?: string
  xp?: number
  category?: string
  location_lat?: number | null
  location_lng?: number | null
}

interface AddSpotModalProps {
  open: boolean
  tourName?: string
  defaults?: SpotDraftDefaults
  proofOnly?: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    location: string
    xp: number
    category?: string
    image?: string
    location_lat?: number | null
    location_lng?: number | null
  }) => void | Promise<boolean | void>
}

export function AddSpotModal({
  open,
  tourName,
  defaults,
  proofOnly = false,
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
      key={`${defaults?.name ?? ""}-${defaults?.location ?? ""}-${defaults?.category ?? ""}-${defaults?.xp ?? ""}`}
      tourName={tourName}
      defaults={defaults}
      proofOnly={proofOnly}
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function AddSpotForm({
  tourName,
  defaults,
  proofOnly = false,
  onClose,
  onSave,
}: Omit<AddSpotModalProps, "open">) {
  const [name, setName] = useState(defaults?.name ?? "")
  const [location, setLocation] = useState(defaults?.location ?? "")
  const [friction, setFriction] = useState<FrictionId>("medium")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const busy = isUploading || isPinning

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || busy) return

    setUploadError(null)

    let image: string | undefined
    if (file) {
      setIsUploading(true)
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
      setIsUploading(false)
    }

    const locationString = location.trim() || "TBD"
    let locationLat = finiteCoord(defaults?.location_lat)
    let locationLng = finiteCoord(defaults?.location_lng)

    if ((locationLat == null || locationLng == null) && locationString !== "TBD") {
      setIsPinning(true)
      try {
        const geoRes = await fetch(
          "https://nominatim.openstreetmap.org/search?format=json&q=" +
            encodeURIComponent(locationString),
        )
        const geoData = (await geoRes.json()) as { lat?: string; lon?: string }[]
        if (geoData[0]) {
          const lat = Number(geoData[0].lat)
          const lng = Number(geoData[0].lon)
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            locationLat = lat
            locationLng = lng
          }
        }
      } catch {
        // Save the memory even when the map lookup misses.
      } finally {
        setIsPinning(false)
      }
    }

    setIsUploading(true)
    const saved = await onSave({
      name: name.trim(),
      location: locationString,
      xp: frictionXp(friction),
      category: defaults?.category,
      image,
      location_lat: locationLat,
      location_lng: locationLng,
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
          if (!busy) onClose()
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
              {proofOnly ? "Conquer this spot" : "Add New Spot"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {proofOnly
                ? "Add a photo and rate the friction."
                : tourName
                  ? `Drop a stop on ${tourName}.`
                  : "Add a stop to this tour."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-cream disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {proofOnly ? (
            <div className="rounded-2xl border border-border bg-vault-bg/70 px-4 py-3">
              <p className="font-display text-base font-semibold text-cream">{name}</p>
              <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-widest text-amber-warm">
                {defaults?.category || "Uncategorized"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{location || "TBD"}</p>
            </div>
          ) : (
            <>
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
            </>
          )}

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
              autoFocus={proofOnly}
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-input bg-vault-bg px-4 py-3 text-sm text-cream file:mr-3 file:rounded-lg file:border-0 file:bg-amber-warm/15 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-amber-warm focus:border-amber-warm focus:outline-none focus:ring-2 focus:ring-amber-warm/30"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Friction level
                <FrictionInfo />
              </span>
              <span className="rounded-lg bg-amber-warm/15 px-2 py-0.5 text-sm font-black text-amber-warm tabular-nums">
                +{frictionXp(friction)} XP
              </span>
            </div>
            <div role="radiogroup" aria-label="Friction level" className="grid grid-cols-2 gap-2">
              {FRICTION_LEVELS.map((level) => {
                const selected = friction === level.id
                return (
                  <button
                    key={level.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFriction(level.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-amber-warm bg-amber-warm/15 text-cream"
                        : "border-border text-muted-foreground hover:border-amber-warm/40 hover:text-cream"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{level.label}</span>
                      <span className="text-xs font-black tabular-nums text-amber-warm">+{level.xp}</span>
                    </span>
                    <span className="mt-1 block text-[0.7rem] leading-snug">{level.detail}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {uploadError ? <p className="text-sm text-terracotta">{uploadError}</p> : null}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || busy}
              className="flex-1 rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPinning
                ? "Pinning to Map..."
                : isUploading
                  ? file
                    ? "Uploading…"
                    : "Saving…"
                  : proofOnly
                    ? "Save"
                    : "Add Spot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
