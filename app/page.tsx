"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CoopHeader } from "@/components/lifevault/coop-header";
import { NavBar, type TabId } from "@/components/lifevault/nav-bar";
import { ToursHub } from "@/components/lifevault/tours-hub";
import { TourDetail } from "@/components/lifevault/tour-detail";
import { Discover } from "@/components/lifevault/discover";
import { Profile } from "@/components/lifevault/profile";
import { AddSpotModal } from "@/components/lifevault/add-spot-modal";
import { AddToTourModal } from "@/components/lifevault/add-to-tour-modal";
import { Toast } from "@/components/lifevault/toast";
import type { Suggestion, Tour } from "@/lib/lifevault-data";
import {
  supabase,
  toVaultEntry,
  VAULT_ENTRY_COLUMNS,
  type VaultEntry,
} from "@/lib/supabase";
import { toursFromEntries } from "@/lib/vault-tours";

const BASE_XP = 1160;
const LEVEL_MAX_XP = 2000;
const LEVEL = 4;

type SpotDraft = {
  name: string;
  location: string;
  xp: number;
  image?: string;
};

export default function Page() {
  const [tab, setTab] = useState<TabId>("tours");
  const [tours, setTours] = useState<Tour[]>([]);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [addSpotTourId, setAddSpotTourId] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<Suggestion | null>(null);
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
      setTours([]);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("vault_entries")
      .select(VAULT_ENTRY_COLUMNS)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setTours([]);
      return;
    }

    const entries = (data ?? []).map((row) => toVaultEntry(row));
    setTours(toursFromEntries(entries));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      await loadEntries();
      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadEntries]);

  const earnedXp = useMemo(
    () =>
      tours.reduce(
        (sum, tour) =>
          sum + tour.spots.filter((spot) => spot.completed).reduce((total, spot) => total + spot.xp, 0),
        0,
      ),
    [tours],
  );
  const displayXp = BASE_XP + earnedXp;

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

  const addedNames = useMemo(
    () => new Set(tours.flatMap((tour) => tour.spots.map((spot) => spot.name))),
    [tours],
  );

  const addSpotTour = tours.find((tour) => tour.id === addSpotTourId) ?? null;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-4 pb-28 sm:px-6 md:pb-10">
        <CoopHeader level={LEVEL} xp={displayXp} />

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
            <Discover addedNames={addedNames} onAdd={(suggestion) => setPendingSuggestion(suggestion)} />
          )}

          {!loading && tab === "tours" &&
            (activeTour ? (
              <TourDetail
                tour={activeTour}
                onBack={() => setActiveTourId(null)}
                onToggleSpot={(spotId) => toggleSpot(activeTour.id, spotId)}
                onAddSpot={() => setAddSpotTourId(activeTour.id)}
                onCelebrate={(name) => showToast(`Logged: ${name}`)}
              />
            ) : (
              <ToursHub tours={tours} onOpen={(id) => setActiveTourId(id)} />
            ))}

          {!loading && tab === "profile" && (
            <Profile level={LEVEL} xp={displayXp} maxXp={LEVEL_MAX_XP} />
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
        onSave={(data) => {
          if (!addSpotTourId) return;
          const tourName = addSpotTour?.name;
          void addSpot(addSpotTourId, data).then((saved) => {
            if (saved) showToast(`Added "${data.name}" to ${tourName}`);
          });
        }}
      />

      <AddToTourModal
        suggestion={pendingSuggestion}
        tours={tours}
        onClose={() => setPendingSuggestion(null)}
        onPick={(tourId) => {
          if (!pendingSuggestion) return;
          const suggestion = pendingSuggestion;
          const tourName = tours.find((tour) => tour.id === tourId)?.name;
          setPendingSuggestion(null);
          void addSpot(tourId, {
            name: suggestion.name,
            location: suggestion.location,
            xp: suggestion.xp,
            image: suggestion.image,
          }).then((saved) => {
            if (saved) showToast(`Added "${suggestion.name}" to ${tourName}`);
          });
        }}
      />

      <Toast message={toast} />
    </div>
  );
}
