"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CoopHeader } from "@/components/lifevault/coop-header";
import { NavBar, type TabId } from "@/components/lifevault/nav-bar";
import { ToursHub } from "@/components/lifevault/tours-hub";
import { TourDetail } from "@/components/lifevault/tour-detail";
import { Discover } from "@/components/lifevault/discover";
import { BucketList } from "@/components/lifevault/bucket-list";
import { Profile } from "@/components/lifevault/profile";
import { AddSpotModal } from "@/components/lifevault/add-spot-modal";
import { GlobalMap } from "@/components/lifevault/global-map";
import { Toast } from "@/components/lifevault/toast";
import {
  LIFEVAULT_PROFILE_KEY,
  OnboardingModal,
  type LifevaultProfile,
} from "@/components/lifevault/onboarding-modal";
import type { Suggestion, Tour } from "@/lib/lifevault-data";
import {
  supabase,
  toVaultEntry,
  VAULT_ENTRY_COLUMNS,
  type VaultEntry,
} from "@/lib/supabase";
import { toursFromEntries } from "@/lib/vault-tours";

const XP_PER_LEVEL = 1000;

type SpotDraft = {
  name: string;
  location: string;
  xp: number;
  image?: string;
};

export default function Page() {
  const [tab, setTab] = useState<TabId>("tours");
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [addSpotTourId, setAddSpotTourId] = useState<string | null>(null);
  const [bookmarkedNames, setBookmarkedNames] = useState<Set<string>>(new Set());
  const [discoverView, setDiscoverView] = useState<"spots" | "planner">("spots");
  const [profile, setProfile] = useState<LifevaultProfile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current != null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const loadEntries = useCallback(async () => {
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl.startsWith("http")) {
      setError(
        "Replace the placeholders in .env.local with your real Supabase project URL and anon key, then restart next dev.",
      );
      setEntries([]);
      setTours([]);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("vault_entries")
      .select(VAULT_ENTRY_COLUMNS)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setEntries([]);
      setTours([]);
      return;
    }

    const nextEntries = (data ?? []).map((row) => toVaultEntry(row));
    setEntries(nextEntries);
    setTours(toursFromEntries(nextEntries));
  }, []);

  const loadBookmarks = useCallback(async () => {
    const { data, error: queryError } = await supabase.from("bucket_list").select("name");
    if (queryError || !data) return;
    setBookmarkedNames(
      new Set(
        data
          .map((row) => row.name)
          .filter((name): name is string => typeof name === "string" && name.length > 0),
      ),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function readProfile() {
      await Promise.resolve();
      if (cancelled) return;

      const raw = window.localStorage.getItem(LIFEVAULT_PROFILE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as LifevaultProfile;
          if (parsed.name && Array.isArray(parsed.vibes)) setProfile(parsed);
        } catch {
          window.localStorage.removeItem(LIFEVAULT_PROFILE_KEY);
        }
      }
      setProfileChecked(true);
    }

    void readProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const completeOnboarding = useCallback((next: LifevaultProfile) => {
    window.localStorage.setItem(LIFEVAULT_PROFILE_KEY, JSON.stringify(next));
    setProfile(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      await Promise.all([loadEntries(), loadBookmarks()]);
      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadEntries, loadBookmarks]);

  const totalXp = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0),
    [entries],
  );
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xp = totalXp % XP_PER_LEVEL;
  const maxXp = XP_PER_LEVEL;
  const memories = useMemo(() => tours.reduce((sum, tour) => sum + tour.spots.length, 0), [tours]);
  const stops = useMemo(
    () => tours.reduce((sum, tour) => sum + tour.spots.filter((spot) => spot.completed).length, 0),
    [tours],
  );

  const activeTour = useMemo(
    () => tours.find((tour) => tour.id === activeTourId) ?? null,
    [tours, activeTourId],
  );

  const changeTab = useCallback((id: TabId) => {
    setTab(id);
    setActiveTourId(null);
  }, []);

  const toggleSpot = useCallback((tourId: string, spotId: string) => {
    setTours((prev) =>
      prev.map((tour) =>
        tour.id === tourId
          ? {
              ...tour,
              spots: tour.spots.map((spot) =>
                spot.id === spotId ? { ...spot, completed: !spot.completed } : spot,
              ),
            }
          : tour,
      ),
    );
  }, []);

  const addSpot = useCallback(
    async (tourId: string, data: SpotDraft) => {
      const tour = tours.find((item) => item.id === tourId);
      const category = tour?.name ?? tourId;
      const payload: Pick<VaultEntry, "title" | "category" | "content" | "rating" | "image_url"> = {
        title: data.name,
        category,
        content: data.location,
        rating: data.xp,
        image_url: data.image ?? null,
      };

      const { error: insertError } = await supabase.from("vault_entries").insert(payload);
      if (insertError) {
        showToast(insertError.message);
        return false;
      }

      await loadEntries();
      return true;
    },
    [tours, loadEntries, showToast],
  );

  const deleteSpot = useCallback(
    async (spotId: string) => {
      const { error: deleteError } = await supabase.from("vault_entries").delete().eq("id", spotId);
      if (deleteError) {
        showToast(deleteError.message);
        return false;
      }

      await loadEntries();
      return true;
    },
    [loadEntries, showToast],
  );

  const onBookmark = useCallback(
    async (suggestion: Suggestion) => {
      const { error: insertError } = await supabase.from("bucket_list").insert({
        name: suggestion.name,
        location: suggestion.location,
        category: suggestion.category,
        xp_value: suggestion.xp,
        image_url: suggestion.image,
      });

      if (insertError) {
        showToast(insertError.message);
        return false;
      }

      setBookmarkedNames((current) => new Set(current).add(suggestion.name));
      showToast(`Saved ${suggestion.name} to your Planner!`);
      return true;
    },
    [showToast],
  );

  const addSpotTour = tours.find((tour) => tour.id === addSpotTourId) ?? null;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-4 pb-28 sm:px-6 md:pb-10">
        <CoopHeader level={level} xp={xp} maxXp={maxXp} name={profile?.name} />

        <NavBar active={tab} onChange={changeTab} className="hidden md:flex" />

        {error ? (
          <p className="mt-4 rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-cream">
            {error}
          </p>
        ) : null}

        <main className="mt-6 flex-1">
          {loading ? (
            <p className="text-sm text-muted-foreground">Syncing the vault…</p>
          ) : null}

          {!loading && tab === "discover" && (
            <div className="space-y-6">
              <div className="flex w-fit items-center gap-1 rounded-2xl border border-border bg-card/60 p-1.5">
                <button
                  type="button"
                  onClick={() => setDiscoverView("spots")}
                  aria-current={discoverView === "spots" ? "page" : undefined}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    discoverView === "spots"
                      ? "bg-amber-warm text-primary-foreground shadow-md shadow-amber-warm/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-cream"
                  }`}
                >
                  Discover
                </button>
                <button
                  type="button"
                  onClick={() => setDiscoverView("planner")}
                  aria-current={discoverView === "planner" ? "page" : undefined}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    discoverView === "planner"
                      ? "bg-amber-warm text-primary-foreground shadow-md shadow-amber-warm/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-cream"
                  }`}
                >
                  Planner
                </button>
              </div>

              {discoverView === "spots" ? (
                <Discover
                  key={(profile?.vibes ?? []).join("|")}
                  defaultFilters={profile?.vibes ?? []}
                  bookmarkedNames={bookmarkedNames}
                  onBookmark={onBookmark}
                />
              ) : (
                <BucketList
                  onError={showToast}
                  onRemoved={(name) => {
                    setBookmarkedNames((current) => {
                      const next = new Set(current);
                      next.delete(name);
                      return next;
                    });
                  }}
                  onLogged={(name) => {
                    void loadEntries();
                    showToast(`Logged "${name}" in the Vault.`);
                  }}
                />
              )}
            </div>
          )}

          {!loading && tab === "tours" &&
            (activeTour ? (
              <TourDetail
                tour={activeTour}
                onBack={() => setActiveTourId(null)}
                onToggleSpot={(spotId) => toggleSpot(activeTour.id, spotId)}
                onAddSpot={() => setAddSpotTourId(activeTour.id)}
                onDeleteSpot={(spotId) => {
                  void deleteSpot(spotId).then((removed) => {
                    if (removed) showToast("Memory removed from the Vault.");
                  });
                }}
                onCelebrate={(name) => showToast(`Logged: ${name}`)}
              />
            ) : (
              <ToursHub tours={tours} onOpen={(id) => setActiveTourId(id)} />
            ))}

          {!loading && tab === "map" && <GlobalMap />}

          {!loading && tab === "profile" && (
            <Profile
              level={level}
              xp={xp}
              maxXp={maxXp}
              memories={memories}
              tours={tours.length}
              stops={stops}
            />
          )}
        </main>
      </div>

      <NavBar
        active={tab}
        onChange={changeTab}
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        variant="bottom"
      />

      <AddSpotModal
        open={addSpotTourId !== null}
        tourName={addSpotTour?.name}
        onClose={() => setAddSpotTourId(null)}
        onSave={async (data) => {
          if (!addSpotTourId) return false;
          const tourName = addSpotTour?.name;
          const saved = await addSpot(addSpotTourId, {
            name: data.name,
            location: data.location,
            xp: data.xp,
            image: data.image,
          });
          if (saved) showToast(`Added "${data.name}" to ${tourName}`);
          return saved;
        }}
      />

      <OnboardingModal open={profileChecked && profile === null} onComplete={completeOnboarding} />

      <Toast message={toast} />
    </div>
  );
}
