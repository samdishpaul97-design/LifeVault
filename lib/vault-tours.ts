import type { VaultEntry } from "@/lib/supabase";
import type { Tour, TourAccent, TourSpot } from "@/lib/lifevault-data";

const ACCENTS: TourAccent[] = ["terracotta", "amber", "emerald", "violet", "sky"];

const CATEGORY_CHROME: Record<
  string,
  { emoji: string; description: string; cover: string; accent: TourAccent }
> = {
  "Michelin Tour": {
    emoji: "⭐",
    description: "The tasting-menu bucket list.",
    cover: "/images/madrid-tapas.png",
    accent: "violet",
  },
  "EDM DJ Tour": {
    emoji: "🎧",
    description: "Late sets and the rooms that stay open.",
    cover: "/images/arcade-cocktails.png",
    accent: "sky",
  },
  "Hike/Sights Tour": {
    emoji: "🥾",
    description: "Ridges, lookouts, and the long way through a city.",
    cover: "/images/cheltenham-badlands.png",
    accent: "emerald",
  },
  "Cafe Tour": {
    emoji: "☕",
    description: "Slow mornings, flat whites, and a second coffee.",
    cover: "/images/market-brunch.png",
    accent: "amber",
  },
};

function spotImage(url: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/")) return url;
  try {
    const host = new URL(url).hostname;
    if (host.endsWith("supabase.co")) return url;
  } catch {
    return undefined;
  }
  return undefined;
}

/** A stored vault row is a logged memory, so it belongs in The Vault. */
export function vaultEntryToSpot(entry: VaultEntry): TourSpot {
  const coords =
    entry.location_lat != null && entry.location_lng != null
      ? `${entry.location_lat}, ${entry.location_lng}`
      : "";
  const location = entry.content.trim() || coords || "TBD";
  const rating = entry.rating;
  const scored = rating != null && rating >= 0 && rating <= 10;

  return {
    id: entry.id,
    name: entry.title,
    location,
    xp: rating != null && !scored ? rating : (rating ?? 50),
    completed: true,
    image: spotImage(entry.image_url),
    caption: entry.review_text ?? undefined,
    samScore: scored ? rating : undefined,
  };
}

export function toursFromEntries(entries: VaultEntry[]): Tour[] {
  const groups = new Map<string, VaultEntry[]>();
  for (const entry of entries) {
    const category = entry.category.trim() || "Uncategorized";
    const list = groups.get(category);
    if (list) list.push(entry);
    else groups.set(category, [entry]);
  }

  return [...groups.entries()].map(([category, rows], index) => {
    const chrome = CATEGORY_CHROME[category];
    return {
      id: category,
      name: category,
      emoji: chrome?.emoji ?? "✨",
      description:
        chrome?.description ??
        `${rows.length} ${rows.length === 1 ? "memory" : "memories"} in the vault.`,
      cover: chrome?.cover ?? "/placeholder.svg",
      accent: chrome?.accent ?? ACCENTS[index % ACCENTS.length],
      spots: rows.map(vaultEntryToSpot),
    };
  });
}
