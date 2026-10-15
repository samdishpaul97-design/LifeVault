export type TourAccent = "terracotta" | "amber" | "emerald" | "violet" | "sky"

export interface TourSpot {
  id: string
  name: string
  location: string
  xp: number
  completed: boolean
  /** Scrapbook fields — present on visited spots, optional on fresh ones. */
  image?: string
  caption?: string
  samScore?: number
  priyaScore?: number
  mustTry?: string
  mustTryLabel?: string
  stickers?: string[]
  rotation?: number
  createdAt?: string
}

export interface Tour {
  id: string
  name: string
  emoji: string
  description: string
  cover: string
  accent: TourAccent
  spots: TourSpot[]
}

export type InspoCategory =
  | "Best Pizza"
  | "Scenic Hikes"
  | "Date Night"
  | "Travel Escapes"

export interface Suggestion {
  id: string
  name: string
  category: InspoCategory
  emoji: string
  location: string
  blurb: string
  image: string
  xp: number
}

export interface Badge {
  id: string
  name: string
  tier: string
  description: string
  emoji: string
  unlocked: boolean
  progress: string
}

export const tourAccents: Record<
  TourAccent,
  { bar: string; soft: string; border: string; text: string; dot: string }
> = {
  terracotta: {
    bar: "bg-terracotta",
    soft: "bg-terracotta/15 text-terracotta",
    border: "border-terracotta/30",
    text: "text-terracotta",
    dot: "bg-terracotta",
  },
  amber: {
    bar: "bg-amber-warm",
    soft: "bg-amber-warm/15 text-amber-warm",
    border: "border-amber-warm/30",
    text: "text-amber-warm",
    dot: "bg-amber-warm",
  },
  emerald: {
    bar: "bg-emerald-400",
    soft: "bg-emerald-400/15 text-emerald-300",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  violet: {
    bar: "bg-violet-400",
    soft: "bg-violet-400/15 text-violet-300",
    border: "border-violet-400/30",
    text: "text-violet-300",
    dot: "bg-violet-400",
  },
  sky: {
    bar: "bg-sky-400",
    soft: "bg-sky-400/15 text-sky-300",
    border: "border-sky-400/30",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
}

export const INSPO_CATEGORY_META: Record<
  InspoCategory,
  { label: string; emoji: string }
> = {
  "Best Pizza": { label: "Best Pizza", emoji: "🍕" },
  "Scenic Hikes": { label: "Scenic Hikes", emoji: "🌲" },
  "Date Night": { label: "Date Night", emoji: "🍸" },
  "Travel Escapes": { label: "Travel Escapes", emoji: "✈️" },
}

export const suggestions: Suggestion[] = [
  {
    id: "s-pizza-1",
    name: "Pizzeria Badiali",
    category: "Best Pizza",
    emoji: "🍕",
    location: "Dovercourt",
    blurb: "Known for the Vodka slice with hot honey. Cash-only patio vibe, worth the line.",
    image: "/images/badiali-vodka-slice.png",
    xp: 50,
  },
  {
    id: "s-pizza-2",
    name: "Maker Pizza",
    category: "Best Pizza",
    emoji: "🍕",
    location: "Multiple locations",
    blurb: "Elite charred crust and cupped pepperoni. Takeout-friendly and dependable.",
    image: "/images/maker-pizza.png",
    xp: 50,
  },
  {
    id: "s-hike-1",
    name: "Cheltenham Badlands",
    category: "Scenic Hikes",
    emoji: "🌲",
    location: "Caledon",
    blurb: "Surreal red clay trail. Best in autumn when the escarpment glows.",
    image: "/images/cheltenham-badlands.png",
    xp: 80,
  },
  {
    id: "s-hike-2",
    name: "Rattlesnake Point",
    category: "Scenic Hikes",
    emoji: "🌲",
    location: "Milton",
    blurb: "Escarpment views and a cliffside walk. Bring a thermos and good boots.",
    image: "/images/rattlesnake-point.png",
    xp: 80,
  },
  {
    id: "s-date-1",
    name: "Arcade & Cocktails at Greta",
    category: "Date Night",
    emoji: "🍸",
    location: "Ossington",
    blurb: "Retro arcade energy with proper cocktails. Competitive but cute.",
    image: "/images/arcade-cocktails.png",
    xp: 55,
  },
  {
    id: "s-date-2",
    name: "St. Lawrence Market Brunch",
    category: "Date Night",
    emoji: "🍸",
    location: "Old Town",
    blurb: "Sunday peameal bacon sandwich and a slow stroll through the stalls.",
    image: "/images/market-brunch.png",
    xp: 45,
  },
  {
    id: "s-travel-1",
    name: "Madrid & Barcelona Tapas Crawl",
    category: "Travel Escapes",
    emoji: "✈️",
    location: "Spain",
    blurb: "Hidden vermouth bars and street terraces. A whole trip built on small plates.",
    image: "/images/madrid-tapas.png",
    xp: 200,
  },
]

export const badges: Badge[] = [
  {
    id: "b1",
    name: "Slice Hunter",
    tier: "Bronze",
    description: "5 Pizza spots logged",
    emoji: "🍕",
    unlocked: true,
    progress: "5 / 5",
  },
  {
    id: "b2",
    name: "Trail Blazer",
    tier: "Silver",
    description: "3 Hikes completed",
    emoji: "🥾",
    unlocked: true,
    progress: "3 / 3",
  },
  {
    id: "b3",
    name: "Passport Stamper",
    tier: "Gold",
    description: "International trip planned",
    emoji: "🛂",
    unlocked: false,
    progress: "0 / 1",
  },
  {
    id: "b4",
    name: "Night Owl Daters",
    tier: "Bronze",
    description: "10 late-night dates",
    emoji: "🌙",
    unlocked: false,
    progress: "6 / 10",
  },
  {
    id: "b5",
    name: "Caffeine Connoisseurs",
    tier: "Silver",
    description: "Visit 4 cafes together",
    emoji: "☕",
    unlocked: false,
    progress: "1 / 4",
  },
  {
    id: "b6",
    name: "Sunset Chasers",
    tier: "Bronze",
    description: "8 golden-hour walks",
    emoji: "🌅",
    unlocked: true,
    progress: "8 / 8",
  },
]

export const stickers = [
  "🍕",
  "🥾",
  "❤️",
  "🌮",
  "✨",
  "🧋",
  "🔥",
  "🧩",
  "🌙",
  "🍸",
  "📸",
  "⛰️",
]
