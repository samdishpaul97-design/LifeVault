"use client"

import { useState } from "react"

export const LIFEVAULT_PROFILE_KEY = "lifevault_profile"

export const ONBOARDING_VIBES = ["Foodie", "Nightlife", "Nature", "Creative", "Sanctuary"] as const

export interface LifevaultProfile {
  name: string
  vibes: string[]
}

interface OnboardingModalProps {
  open: boolean
  onComplete: (profile: LifevaultProfile) => void
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [vibes, setVibes] = useState<string[]>([])

  if (!open) return null

  const trimmedName = name.trim()

  const toggleVibe = (vibe: string) => {
    setVibes((current) => {
      if (current.includes(vibe)) return current.filter((item) => item !== vibe)
      if (current.length >= 3) return current
      return [...current, vibe]
    })
  }

  const finish = () => {
    if (!trimmedName || vibes.length !== 3) return
    onComplete({ name: trimmedName, vibes })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="animate-float-in w-full max-w-lg rounded-3xl border border-border bg-vault-panel p-6 shadow-2xl shadow-black/40 sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-amber-warm">
          Step {step} of 3
        </p>
        <h2 id="onboarding-title" className="mt-2 font-display text-2xl font-semibold text-cream">
          {step === 1 && "What should we call you?"}
          {step === 2 && "Pick your top 3 vibes"}
          {step === 3 && "Your vault is ready"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 && "This stays on this device and personalizes the scrapbook."}
          {step === 2 && `${vibes.length} of 3 selected. These tune Discover before you browse.`}
          {step === 3 && `${trimmedName}, we'll open the vault around ${vibes.join(", ")}.`}
        </p>

        {step === 1 ? (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (trimmedName) setStep(2)
            }}
          >
            <label
              htmlFor="vault-first-name"
              className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              First name
            </label>
            <input
              id="vault-first-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              autoComplete="given-name"
              placeholder="Sam"
              className="w-full rounded-xl border border-input bg-vault-bg px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-amber-warm focus:outline-none focus:ring-2 focus:ring-amber-warm/30"
            />
            <button
              type="submit"
              disabled={!trimmedName}
              className="mt-5 w-full rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ONBOARDING_VIBES.map((vibe) => {
                const selected = vibes.includes(vibe)
                return (
                  <button
                    key={vibe}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleVibe(vibe)}
                    className={`rounded-full border px-3.5 py-2.5 text-sm font-bold transition-all ${
                      selected
                        ? "border-amber-warm bg-amber-warm/15 text-amber-warm"
                        : "border-border text-muted-foreground hover:text-cream"
                    }`}
                  >
                    {vibe}
                  </button>
                )
              })}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
              >
                Back
              </button>
              <button
                type="button"
                disabled={vibes.length !== 3}
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe) => (
                <span
                  key={vibe}
                  className="rounded-full border border-amber-warm bg-amber-warm/15 px-3.5 py-2 text-sm font-bold text-amber-warm"
                >
                  {vibe}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
              >
                Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex-1 rounded-xl bg-amber-warm py-3 text-sm font-black text-primary-foreground shadow-md shadow-amber-warm/20 transition-all hover:bg-amber-warm/90"
              >
                Enter the Vault
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
