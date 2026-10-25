import { NextRequest } from "next/server"

const TORONTO = { latitude: 43.6532, longitude: -79.3832 }

const VIBE_QUERIES: Record<string, { text: string; radius: number }> = {
  Cafe: { text: "best cafes in Toronto", radius: 20000 },
  Nightlife: { text: "best cocktail bars and nightlife in Toronto", radius: 20000 },
  Nature: { text: "best hiking trails and scenic parks near Toronto", radius: 50000 },
  Creative: { text: "best art galleries and creative studios in Toronto", radius: 25000 },
  Sanctuary: { text: "best spas and quiet sanctuaries in Toronto", radius: 25000 },
  Fitness: { text: "best fitness studios and gyms in Toronto", radius: 20000 },
}

const MIN_RATING = 4.3
const MIN_REVIEWS = 100

export interface DiscoverPlace {
  name: string
  rating: number
  review_count: number
  formatted_address: string
  place_id: string
  lat: number
  lng: number
  photo: string | null
}

interface LegacyResult {
  name?: string
  rating?: number
  user_ratings_total?: number
  formatted_address?: string
  place_id?: string
  geometry?: { location?: { lat?: number; lng?: number } }
  photos?: { photo_reference?: string }[]
}

interface NewPlace {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  location?: { latitude?: number; longitude?: number }
  photos?: { name?: string }[]
}

function apiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ""
}

function elite(rating: number, reviews: number) {
  return rating >= MIN_RATING && reviews > MIN_REVIEWS
}

function photoPath(reference: string) {
  return `/api/discover?photo=${encodeURIComponent(reference)}`
}

function safePhotoReference(value: string) {
  if (!value || value.length > 1800 || value.includes("://") || value.includes("..")) return null
  return value
}

async function searchLegacy(text: string, radius: number, key: string): Promise<DiscoverPlace[] | { error: string }> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json")
  url.searchParams.set("query", text)
  url.searchParams.set("location", `${TORONTO.latitude},${TORONTO.longitude}`)
  url.searchParams.set("radius", String(radius))
  url.searchParams.set("language", "en")
  url.searchParams.set("region", "ca")
  url.searchParams.set("key", key)

  const res = await fetch(url, { cache: "no-store" })
  const body = (await res.json()) as {
    status?: string
    error_message?: string
    results?: LegacyResult[]
  }

  if (body.status === "ZERO_RESULTS") return []
  if (body.status !== "OK") {
    return { error: body.error_message || body.status || "Places search failed" }
  }

  return (body.results ?? []).flatMap((place) => {
    const rating = place.rating ?? 0
    const review_count = place.user_ratings_total ?? 0
    const lat = place.geometry?.location?.lat
    const lng = place.geometry?.location?.lng
    const photoRef = place.photos?.[0]?.photo_reference
    if (!place.place_id || !place.name || lat == null || lng == null || !elite(rating, review_count)) {
      return []
    }
    return [
      {
        name: place.name,
        rating,
        review_count,
        formatted_address: place.formatted_address ?? "",
        place_id: place.place_id,
        lat,
        lng,
        photo: photoRef ? photoPath(photoRef) : null,
      },
    ]
  })
}

async function searchNew(text: string, radius: number, key: string): Promise<DiscoverPlace[] | { error: string }> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.photos",
    },
    body: JSON.stringify({
      textQuery: text,
      pageSize: 20,
      minRating: MIN_RATING,
      languageCode: "en",
      locationBias: {
        circle: {
          center: TORONTO,
          radius,
        },
      },
    }),
  })

  const body = (await res.json()) as { places?: NewPlace[]; error?: { message?: string } }
  if (!res.ok) {
    return { error: body.error?.message || "Places search failed" }
  }

  return (body.places ?? []).flatMap((place) => {
    const rating = place.rating ?? 0
    const review_count = place.userRatingCount ?? 0
    const lat = place.location?.latitude
    const lng = place.location?.longitude
    const name = place.displayName?.text
    const photoName = place.photos?.[0]?.name
    if (!place.id || !name || lat == null || lng == null || !elite(rating, review_count)) return []
    return [
      {
        name,
        rating,
        review_count,
        formatted_address: place.formattedAddress ?? "",
        place_id: place.id,
        lat,
        lng,
        photo: photoName ? photoPath(photoName) : null,
      },
    ]
  })
}

async function proxyPhoto(reference: string, key: string) {
  const upstream = reference.startsWith("places/")
    ? `https://places.googleapis.com/v1/${reference}/media?maxHeightPx=800&maxWidthPx=1200&key=${encodeURIComponent(key)}`
    : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(reference)}&key=${encodeURIComponent(key)}`

  const res = await fetch(upstream, { redirect: "follow", cache: "force-cache" })
  if (!res.ok || !res.body) return new Response(null, { status: 404 })

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  })
}

export async function GET(request: NextRequest) {
  const key = apiKey()
  if (!key) {
    return Response.json({ error: "Google Maps API key is not configured." }, { status: 500 })
  }

  const photo = request.nextUrl.searchParams.get("photo")
  if (photo) {
    const reference = safePhotoReference(photo)
    if (!reference) return new Response(null, { status: 400 })
    return proxyPhoto(reference, key)
  }

  const vibe = request.nextUrl.searchParams.get("vibe")?.trim() ?? ""
  const query = VIBE_QUERIES[vibe]
  if (!query) {
    return Response.json({ error: "Unknown vibe." }, { status: 400 })
  }

  try {
    const modern = await searchNew(query.text, query.radius, key)
    const places = "error" in modern ? await searchLegacy(query.text, query.radius, key) : modern
    if ("error" in places) {
      return Response.json({ error: places.error }, { status: 502 })
    }

    places.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
    return Response.json(places)
  } catch {
    return Response.json({ error: "Places search failed." }, { status: 502 })
  }
}
