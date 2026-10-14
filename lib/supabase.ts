import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createSupabaseClient(): SupabaseClient {
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return createClient("https://placeholder.supabase.co", "public-anon-key");
  }
}

export const supabase = createSupabaseClient();

/** Columns on public.vault_entries, in schema order. */
export const VAULT_ENTRY_COLUMNS =
  "id, vault_id, added_by, title, location_lat, location_lng, rating, review_text, image_url, created_at, category, content";

export interface VaultEntry {
  id: string;
  vault_id: string | null;
  added_by: string | null;
  title: string;
  location_lat: number | null;
  location_lng: number | null;
  rating: number | null;
  review_text: string | null;
  image_url: string | null;
  created_at: string;
  category: string;
  content: string;
}

interface VaultEntryRow {
  id: string;
  vault_id: string | null;
  added_by: string | null;
  title: string | null;
  location_lat: number | string | null;
  location_lng: number | string | null;
  rating: number | string | null;
  review_text: string | null;
  image_url: string | null;
  created_at: string;
  category: string | null;
  content: string | null;
}

function finiteOrNull(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function toVaultEntry(row: VaultEntryRow): VaultEntry {
  return {
    id: row.id,
    vault_id: row.vault_id,
    added_by: row.added_by,
    title: row.title ?? "",
    location_lat: finiteOrNull(row.location_lat),
    location_lng: finiteOrNull(row.location_lng),
    rating: finiteOrNull(row.rating),
    review_text: row.review_text,
    image_url: row.image_url,
    created_at: row.created_at,
    category: row.category ?? "",
    content: row.content ?? "",
  };
}
