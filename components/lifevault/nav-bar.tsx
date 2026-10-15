"use client"

import { Compass, Globe, Map, User, type LucideIcon } from "lucide-react"

export type TabId = "discover" | "tours" | "map" | "profile"

const TABS: { id: TabId; label: string; short: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Discover", short: "Discover", icon: Compass },
  { id: "tours", label: "Our Tours", short: "Tours", icon: Map },
  { id: "map", label: "Map", short: "Map", icon: Globe },
  { id: "profile", label: "Profile", short: "Profile", icon: User },
]

interface NavBarProps {
  active: TabId
  onChange: (id: TabId) => void
  className?: string
  variant?: "top" | "bottom"
}

export function NavBar({
  active,
  onChange,
  className = "",
  variant = "top",
}: NavBarProps) {
  if (variant === "bottom") {
    return (
      <nav
        className={`border-t border-border bg-vault-panel/95 backdrop-blur ${className}`}
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-5xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const isActive = active === t.id
            return (
              <li key={t.id} className="flex-1">
                <button
                  onClick={() => onChange(t.id)}
                  aria-current={isActive ? "page" : undefined}
                  className="flex w-full flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold transition-colors"
                >
                  <span
                    className={`grid size-9 place-items-center rounded-2xl transition-all ${
                      isActive
                        ? "bg-amber-warm text-primary-foreground shadow-md shadow-amber-warm/25"
                        : "text-muted-foreground"
                    }`}
                  >
                    <t.icon className="size-5" />
                  </span>
                  <span className={isActive ? "text-cream" : "text-muted-foreground"}>
                    {t.short}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <nav
      className={`mt-4 items-center gap-1 rounded-2xl border border-border bg-card/60 p-1.5 ${className}`}
      aria-label="Primary"
    >
      {TABS.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              isActive
                ? "bg-amber-warm text-primary-foreground shadow-md shadow-amber-warm/20"
                : "text-muted-foreground hover:bg-secondary hover:text-cream"
            }`}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
