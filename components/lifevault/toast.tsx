"use client"

import { Sparkles } from "lucide-react"

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
      <div
        role="status"
        aria-live="polite"
        className="animate-float-in flex items-center gap-2 rounded-full border border-amber-warm/40 bg-vault-panel/95 px-4 py-2.5 text-sm font-semibold text-cream shadow-lg shadow-black/40 backdrop-blur"
      >
        <Sparkles className="size-4 text-amber-warm" />
        {message}
      </div>
    </div>
  )
}
