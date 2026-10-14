"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Archive,
  Award,
  Check,
  ChevronLeft,
  Coffee,
  Compass,
  Disc3,
  ListChecks,
  LoaderCircle,
  Lock,
  Map as MapIcon,
  MapPin,
  Mountain,
  Plus,
  Route,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  supabase,
  toVaultEntry,
  VAULT_ENTRY_COLUMNS,
  type VaultEntry,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

type AppTab = "discover" | "tours" | "profile";
type DetailTab = "up-next" | "vault";
type DialogKind = "memory" | "tour" | null;

interface TourSpot {
  id: string;
  title: string;
  note: string;
}

interface Tour {
  name: string;
  description: string;
  icon: LucideIcon;
  spots: TourSpot[];
}

interface MemoryDraft {
  title: string;
  category: string;
  content: string;
}

interface SurveyAnswers {
  location: string;
  interests: string[];
}

interface Recommendation {
  id: string;
  title: string;
  place: string;
  detail: string;
  interests: string[];
  icon: LucideIcon;
}

const INTEREST_OPTIONS = [
  "Fine dining",
  "Nightlife",
  "Hiking",
  "Cafes",
  "Landmarks",
  "Live music",
] as const;

const SEED_TOURS: Tour[] = [
  {
    name: "Michelin Tour",
    description: "Starred rooms, long menus, and the tables you plan a night around.",
    icon: UtensilsCrossed,
    spots: [
      {
        id: "michelin-counter",
        title: "Counter seating at a starred room",
        note: "Ask for the kitchen-side chairs.",
      },
      {
        id: "michelin-neighborhood",
        title: "A no-menu neighborhood dinner",
        note: "Go early and let the bar decide.",
      },
      {
        id: "michelin-dessert",
        title: "Dessert on the walk home",
        note: "Something small, still warm.",
      },
    ],
  },
  {
    name: "EDM DJ Tour",
    description: "Late sets, big systems, and the rooms that stay open.",
    icon: Disc3,
    spots: [
      {
        id: "edm-warehouse",
        title: "Warehouse set after midnight",
        note: "Stay for the closing hour.",
      },
      {
        id: "edm-records",
        title: "Record shop before doors",
        note: "Pull one record for the ride home.",
      },
      {
        id: "edm-rooftop",
        title: "Sunrise closer on a rooftop",
        note: "Leave when the light comes up.",
      },
    ],
  },
  {
    name: "Hike/Sights Tour",
    description: "Ridges, lookouts, and the long way through a city.",
    icon: Mountain,
    spots: [
      {
        id: "hike-ridge",
        title: "Ridge line at golden hour",
        note: "Start with enough daylight to get down.",
      },
      {
        id: "hike-waterfall",
        title: "Waterfall spur",
        note: "Ten extra minutes off the main trail.",
      },
      {
        id: "hike-picnic",
        title: "Overlook picnic",
        note: "Pack something you actually want to eat.",
      },
    ],
  },
  {
    name: "Cafe Tour",
    description: "Morning counters, window seats, and a second coffee.",
    icon: Coffee,
    spots: [
      {
        id: "cafe-espresso",
        title: "First espresso at the corner bar",
        note: "Stand if the stools are full.",
      },
      {
        id: "cafe-window",
        title: "Window seat, slow pour-over",
        note: "Order the coffee they are proud of.",
      },
      {
        id: "cafe-pastry",
        title: "Rainy-day pastry crawl",
        note: "Two stops, one umbrella.",
      },
    ],
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "counter",
    title: "Eight-seat kitchen counter",
    place: "A room small enough to hear the pans",
    detail: "Fine dining, held to one seating and a short walk home.",
    interests: ["Fine dining"],
    icon: UtensilsCrossed,
  },
  {
    id: "warehouse",
    title: "Midnight warehouse set",
    place: "An address you get the day of",
    detail: "A long set, a heavy system, and no encore.",
    interests: ["Nightlife", "Live music"],
    icon: Disc3,
  },
  {
    id: "ridge",
    title: "Ridge before the city wakes",
    place: "High ground, clear morning",
    detail: "A short climb with the skyline still quiet below.",
    interests: ["Hiking", "Landmarks"],
    icon: Mountain,
  },
  {
    id: "espresso",
    title: "Corner espresso, no menu board",
    place: "Standing room at the bar",
    detail: "One drink, done well, before the day starts.",
    interests: ["Cafes"],
    icon: Coffee,
  },
  {
    id: "rooftop",
    title: "Rooftop closer",
    place: "Open air after the main room",
    detail: "The last hour, when the set gets sparse.",
    interests: ["Nightlife", "Live music"],
    icon: Disc3,
  },
  {
    id: "lookout",
    title: "Lookout above the river",
    place: "A path with a view at the end",
    detail: "Landmarks you earn by walking to them.",
    interests: ["Hiking", "Landmarks"],
    icon: Mountain,
  },
  {
    id: "pastry",
    title: "Pastry case worth the wait",
    place: "Late morning, one more stop",
    detail: "Something laminated, and a second coffee if you sit.",
    interests: ["Cafes", "Fine dining"],
    icon: Coffee,
  },
  {
    id: "listening",
    title: "Listening bar between sets",
    place: "Low light, no dance floor",
    detail: "A room for the records, not the queue.",
    interests: ["Live music", "Nightlife"],
    icon: Disc3,
  },
];

const CREW_LEVELS = ["Scout", "Pathfinder", "Regular", "Navigator", "Legend"];
const MEMORIES_PER_LEVEL = 5;

const PRIMARY_TABS: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "tours", label: "Our Tours", icon: MapIcon },
  { id: "profile", label: "Profile", icon: User },
];

function formatCreatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function crewProgress(memoryCount: number) {
  const level = Math.floor(memoryCount / MEMORIES_PER_LEVEL) + 1;
  const intoLevel = memoryCount % MEMORIES_PER_LEVEL;
  const name = CREW_LEVELS[Math.min(level, CREW_LEVELS.length) - 1] ?? "Legend";
  return {
    level,
    name,
    intoLevel,
    percent: (intoLevel / MEMORIES_PER_LEVEL) * 100,
    remaining: MEMORIES_PER_LEVEL - intoLevel,
  };
}

export default function HomePage() {
  const [tab, setTab] = useState<AppTab>("tours");
  const [tours, setTours] = useState<Tour[]>(SEED_TOURS);
  const [activeTourName, setActiveTourName] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("up-next");
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [doneSpots, setDoneSpots] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [draft, setDraft] = useState<MemoryDraft>({
    title: "",
    category: SEED_TOURS[0].name,
    content: "",
  });
  const [tourName, setTourName] = useState("");
  const [tourError, setTourError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [survey, setSurvey] = useState<SurveyAnswers | null>(null);
  const [surveyDraft, setSurveyDraft] = useState<SurveyAnswers>({
    location: "",
    interests: [],
  });
  const [surveyError, setSurveyError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl.startsWith("http")) {
      setError(
        "Replace the placeholders in .env.local with your real Supabase project URL and anon key, then restart next dev.",
      );
      setEntries([]);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("vault_entries")
      .select(VAULT_ENTRY_COLUMNS)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setEntries([]);
      return;
    }

    setEntries((data ?? []).map((row) => toVaultEntry(row)));
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

  useEffect(() => {
    if (!dialog) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [dialog]);

  const activeTour = tours.find((tour) => tour.name === activeTourName) ?? null;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      map.set(entry.category, (map.get(entry.category) ?? 0) + 1);
    }
    return map;
  }, [entries]);

  const tourEntries = useMemo(
    () => entries.filter((entry) => entry.category === activeTourName),
    [entries, activeTourName],
  );

  const rankedRecommendations = useMemo(() => {
    if (!survey) {
      return RECOMMENDATIONS.map((rec) => ({ rec, match: false }));
    }
    return RECOMMENDATIONS.map((rec, index) => ({
      rec,
      index,
      match: rec.interests.some((interest) => survey.interests.includes(interest)),
    }))
      .sort((a, b) => Number(b.match) - Number(a.match) || a.index - b.index)
      .map(({ rec, match }) => ({ rec, match }));
  }, [survey]);

  const checkedCount = Object.values(doneSpots).filter(Boolean).length;
  const progress = crewProgress(entries.length);
  const toursTouched = new Set(entries.map((entry) => entry.category).filter(Boolean)).size;

  const heading =
    tab === "discover" ? "Discover" : tab === "profile" ? "Profile" : "Our Tours";

  function selectTab(next: AppTab) {
    if (next === "tours" && tab === "tours") {
      setActiveTourName(null);
      setFlash(null);
    }
    setTab(next);
  }

  function openTour(name: string) {
    setFlash(null);
    setActiveTourName(name);
    setDetailTab("up-next");
  }

  function openMemoryDialog() {
    setFormError(null);
    setDraft({
      title: "",
      content: "",
      category: activeTour?.name ?? tours[0]?.name ?? SEED_TOURS[0].name,
    });
    setDialog("memory");
  }

  function openTourDialog() {
    setTourName("");
    setTourError(null);
    setDialog("tour");
  }

  function toggleSpot(id: string) {
    setDoneSpots((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleInterest(interest: string) {
    setSurveyDraft((current) => {
      const selected = current.interests.includes(interest);
      return {
        ...current,
        interests: selected
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      };
    });
  }

  function handleSurveySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const location = surveyDraft.location.trim();
    if (!location || surveyDraft.interests.length === 0) {
      setSurveyError("Add a location and at least one interest.");
      return;
    }
    setSurveyError(null);
    setSurvey({ location, interests: surveyDraft.interests });
    setSurveyOpen(false);
  }

  async function handleLogMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const content = draft.content.trim();
    const category = draft.category.trim();
    if (!title || !category) {
      setFormError("Title and category are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: Pick<VaultEntry, "title" | "category" | "content"> = {
      title,
      category,
      content,
    };

    const { error: insertError } = await supabase.from("vault_entries").insert(payload);

    if (insertError) {
      setSaving(false);
      setFormError(insertError.message);
      return;
    }

    await loadEntries();
    setSaving(false);
    setDialog(null);
    setFlash(`Saved “${title}”.`);
    setTab("tours");
    setActiveTourName(category);
    setDetailTab("vault");
  }

  function handleAddTour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = tourName.trim();
    if (!name) {
      setTourError("Name the tour before adding it.");
      return;
    }
    if (tours.some((tour) => tour.name.toLowerCase() === name.toLowerCase())) {
      setTourError("A tour with that name is already on the grid.");
      return;
    }

    setTours((current) => [
      ...current,
      {
        name,
        description: "A tour you added for this crew.",
        icon: Route,
        spots: [],
      },
    ]);
    setDialog(null);
  }

  return (
    <div className="min-h-dvh bg-[#0c0a09] text-stone-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-8 md:pb-10">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/80">
              <Sparkles className="size-3.5 shrink-0" />
              LifeVault
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
              {heading}
            </h1>
          </div>
          <button
            type="button"
            onClick={openMemoryDialog}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
          >
            <Plus className="size-4" />
            Log Memory
          </button>
        </header>

        <nav aria-label="Primary" className="mb-6 hidden gap-2 md:flex">
          {PRIMARY_TABS.map((item) => (
            <TabButton
              key={item.id}
              item={item}
              active={tab === item.id}
              onSelect={selectTab}
            />
          ))}
        </nav>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="mb-5 flex items-center gap-2 text-sm text-stone-400">
            <LoaderCircle className="size-4 animate-spin" />
            Syncing the vault…
          </p>
        ) : null}

        <main className="flex-1">
          {tab === "discover" ? (
            <DiscoverPanel
              survey={survey}
              surveyOpen={surveyOpen}
              surveyDraft={surveyDraft}
              surveyError={surveyError}
              recommendations={rankedRecommendations}
              onOpenSurvey={() => {
                setSurveyError(null);
                setSurveyDraft(
                  survey ?? {
                    location: "",
                    interests: [],
                  },
                );
                setSurveyOpen(true);
              }}
              onSurveyDraft={setSurveyDraft}
              onToggleInterest={toggleInterest}
              onSurveySubmit={handleSurveySubmit}
            />
          ) : null}

          {tab === "tours" && !activeTour ? (
            <TourGrid
              tours={tours}
              counts={counts}
              onOpen={openTour}
              onAdd={openTourDialog}
            />
          ) : null}

          {tab === "tours" && activeTour ? (
            <TourDetail
              tour={activeTour}
              detailTab={detailTab}
              entries={tourEntries}
              doneSpots={doneSpots}
              flash={flash}
              onBack={() => {
                setActiveTourName(null);
                setFlash(null);
              }}
              onDetailTab={setDetailTab}
              onToggleSpot={toggleSpot}
              onLog={openMemoryDialog}
            />
          ) : null}

          {tab === "profile" ? (
            <ProfilePanel
              memoryCount={entries.length}
              toursTouched={toursTouched}
              checkedCount={checkedCount}
              progress={progress}
            />
          ) : null}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-800 bg-[#0c0a09]/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-3">
          {PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 px-2 py-3 text-xs font-medium",
                  active ? "text-amber-200" : "text-stone-500",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {dialog === "memory" ? (
        <MemoryDialog
          draft={draft}
          tours={tours}
          saving={saving}
          formError={formError}
          onChange={setDraft}
          onClose={() => setDialog(null)}
          onSubmit={handleLogMemory}
        />
      ) : null}

      {dialog === "tour" ? (
        <AddTourDialog
          name={tourName}
          error={tourError}
          onName={setTourName}
          onClose={() => setDialog(null)}
          onSubmit={handleAddTour}
        />
      ) : null}
    </div>
  );
}

function TabButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof PRIMARY_TABS)[number];
  active: boolean;
  onSelect: (tab: AppTab) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
        active
          ? "border-amber-200/40 bg-amber-200/10 text-amber-100"
          : "border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </button>
  );
}

function TourGrid({
  tours,
  counts,
  onOpen,
  onAdd,
}: {
  tours: Tour[];
  counts: Map<string, number>;
  onOpen: (name: string) => void;
  onAdd: () => void;
}) {
  return (
    <section>
      <p className="mb-4 max-w-xl text-sm leading-6 text-stone-400">
        Pick a tour to see what is still ahead, and everything already in the vault.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tours.map((tour) => {
          const Icon = tour.icon;
          const count = counts.get(tour.name) ?? 0;
          return (
            <button
              key={tour.name}
              type="button"
              onClick={() => onOpen(tour.name)}
              className="flex cursor-pointer flex-col items-start rounded-3xl border border-stone-800 bg-stone-950/80 p-5 text-left transition hover:border-amber-200/40"
            >
              <span className="mb-4 flex w-full items-start justify-between gap-3">
                <span className="rounded-2xl bg-stone-900 p-2.5 text-amber-200">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full border border-stone-800 px-2.5 py-1 text-xs text-stone-400">
                  {count} {count === 1 ? "memory" : "memories"}
                </span>
              </span>
              <span className="text-lg font-semibold text-stone-50">{tour.name}</span>
              <span className="mt-1 text-sm leading-6 text-stone-400">
                {tour.description}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-40 cursor-pointer flex-col items-start justify-between rounded-3xl border border-dashed border-stone-700 p-5 text-left text-stone-300 transition hover:border-amber-200/50 hover:text-amber-100"
        >
          <span className="rounded-2xl border border-stone-800 p-2.5">
            <Plus className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-semibold text-stone-50">Add New Tour</span>
            <span className="mt-1 block text-sm leading-6 text-stone-500">
              Add another category the vault can filter on.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

function TourDetail({
  tour,
  detailTab,
  entries,
  doneSpots,
  flash,
  onBack,
  onDetailTab,
  onToggleSpot,
  onLog,
}: {
  tour: Tour;
  detailTab: DetailTab;
  entries: VaultEntry[];
  doneSpots: Record<string, boolean>;
  flash: string | null;
  onBack: () => void;
  onDetailTab: (tab: DetailTab) => void;
  onToggleSpot: (id: string) => void;
  onLog: () => void;
}) {
  const Icon = tour.icon;
  const upcoming = tour.spots.filter((spot) => !doneSpots[spot.id]);
  const finished = tour.spots.filter((spot) => doneSpots[spot.id]);

  return (
    <section>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-stone-400 hover:text-stone-100"
      >
        <ChevronLeft className="size-4" />
        All tours
      </button>

      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-stone-900 p-2.5 text-amber-200">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-50">
            {tour.name}
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-400">{tour.description}</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={`${tour.name} views`}
        className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-stone-800 bg-stone-950 p-1"
      >
        <DetailTabButton
          id="up-next"
          label="Up Next"
          icon={<ListChecks className="size-4" />}
          active={detailTab === "up-next"}
          onSelect={onDetailTab}
        />
        <DetailTabButton
          id="vault"
          label="The Vault"
          icon={<Archive className="size-4" />}
          active={detailTab === "vault"}
          onSelect={onDetailTab}
        />
      </div>

      {detailTab === "up-next" ? (
        <div className="space-y-3">
          {tour.spots.length === 0 ? (
            <EmptyState
              title="No stops on this tour yet."
              body="The checklist for a new tour will live here."
            />
          ) : null}
          {upcoming.length === 0 && tour.spots.length > 0 ? (
            <EmptyState
              title="You are clear on this tour."
              body="Every seeded stop is checked off. Logged memories still live in The Vault."
            />
          ) : null}
          {upcoming.map((spot) => (
            <SpotRow
              key={spot.id}
              spot={spot}
              done={false}
              onToggle={() => onToggleSpot(spot.id)}
            />
          ))}
          {finished.length > 0 ? (
            <div className="pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                Checked off
              </p>
              <div className="space-y-2">
                {finished.map((spot) => (
                  <SpotRow
                    key={spot.id}
                    spot={spot}
                    done
                    onToggle={() => onToggleSpot(spot.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {flash ? (
            <p className="rounded-2xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
              {flash}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-stone-400">
              {entries.length} {entries.length === 1 ? "memory" : "memories"} in{" "}
              {tour.name}
            </p>
            <button
              type="button"
              onClick={onLog}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-stone-700 px-3 text-sm text-stone-200 hover:border-amber-200/40"
            >
              <Plus className="size-3.5" />
              Log Memory
            </button>
          </div>
          {entries.length === 0 ? (
            <EmptyState
              title="The vault is empty for this tour."
              body="Log a memory in this category and it will show up here."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <article className="h-full rounded-3xl border border-stone-800 bg-stone-950/80 p-5">
                    <h3 className="text-base font-semibold text-stone-50">{entry.title}</h3>
                    {entry.content ? (
                      <p className="mt-2 text-sm leading-6 text-stone-400">{entry.content}</p>
                    ) : null}
                    <time
                      dateTime={entry.created_at}
                      className="mt-4 block text-xs uppercase tracking-[0.16em] text-stone-500"
                    >
                      {formatCreatedAt(entry.created_at)}
                    </time>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function DetailTabButton({
  id,
  label,
  icon,
  active,
  onSelect,
}: {
  id: DetailTab;
  label: string;
  icon: ReactNode;
  active: boolean;
  onSelect: (tab: DetailTab) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(id)}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium",
        active ? "bg-amber-200 text-stone-950" : "text-stone-400 hover:text-stone-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SpotRow({
  spot,
  done,
  onToggle,
}: {
  spot: TourSpot;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
        done
          ? "border-stone-800 bg-stone-950/40 text-stone-500"
          : "border-stone-800 bg-stone-950/80 text-stone-100 hover:border-stone-700",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border",
          done
            ? "border-amber-200 bg-amber-200 text-stone-950"
            : "border-stone-600 bg-stone-900",
        )}
      >
        {done ? <Check className="size-3.5" /> : null}
      </span>
      <span>
        <span className={cn("block text-sm font-medium", done && "line-through")}>
          {spot.title}
        </span>
        <span className="mt-0.5 block text-sm text-stone-500">{spot.note}</span>
      </span>
    </button>
  );
}

function DiscoverPanel({
  survey,
  surveyOpen,
  surveyDraft,
  surveyError,
  recommendations,
  onOpenSurvey,
  onSurveyDraft,
  onToggleInterest,
  onSurveySubmit,
}: {
  survey: SurveyAnswers | null;
  surveyOpen: boolean;
  surveyDraft: SurveyAnswers;
  surveyError: string | null;
  recommendations: { rec: Recommendation; match: boolean }[];
  onOpenSurvey: () => void;
  onSurveyDraft: (next: SurveyAnswers) => void;
  onToggleInterest: (interest: string) => void;
  onSurveySubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-200/30 bg-gradient-to-br from-amber-200/15 via-stone-950 to-stone-950 p-5 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/80">
          Onboarding
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
          Interest & Location Survey
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
          Tell Discover where you are and what you want next. The recommendation
          engine is still scaffolding — your answers reorder the curated grid below.
        </p>

        {survey && !surveyOpen ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-200">
              Tuned for <span className="font-medium text-amber-100">{survey.location}</span>
              {" · "}
              {survey.interests.join(", ")}
            </p>
            <button
              type="button"
              onClick={onOpenSurvey}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-amber-200/40 px-4 text-sm font-medium text-amber-100 hover:bg-amber-200/10"
            >
              Retake survey
            </button>
          </div>
        ) : null}

        {!survey && !surveyOpen ? (
          <button
            type="button"
            onClick={onOpenSurvey}
            className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-amber-200 px-5 text-sm font-semibold text-stone-950 hover:bg-amber-100"
          >
            Start survey
          </button>
        ) : null}

        {surveyOpen ? (
          <form onSubmit={onSurveySubmit} className="mt-5 space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-stone-200">Location</span>
              <span className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3">
                <MapPin className="size-4 shrink-0 text-stone-500" />
                <input
                  value={surveyDraft.location}
                  onChange={(event) =>
                    onSurveyDraft({ ...surveyDraft, location: event.target.value })
                  }
                  placeholder="Brooklyn, Lisbon, Kyoto"
                  className="h-11 w-full bg-transparent text-stone-100 outline-none placeholder:text-stone-600"
                />
              </span>
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm text-stone-200">Interests</legend>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = surveyDraft.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggleInterest(interest)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-sm",
                        selected
                          ? "border-amber-200 bg-amber-200 text-stone-950"
                          : "border-stone-700 text-stone-300 hover:border-stone-500",
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {surveyError ? <p className="text-sm text-red-300">{surveyError}</p> : null}
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-amber-200 px-5 text-sm font-semibold text-stone-950 hover:bg-amber-100"
            >
              Save answers
            </button>
          </form>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-50">
          {survey ? `Curated for ${survey.location}` : "Curated placeholders"}
        </h2>
        <p className="mt-1 mb-4 max-w-xl text-sm leading-6 text-stone-400">
          {survey
            ? "Matches from your survey sit first. These stops are stand-ins until location-aware recommendations are live."
            : "A preview of the grid Discover will fill once the survey knows your city and your taste."}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(({ rec, match }) => {
            const Icon = rec.icon;
            return (
              <article
                key={rec.id}
                className="rounded-3xl border border-stone-800 bg-stone-950/80 p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-2xl bg-stone-900 p-2.5 text-amber-200">
                    <Icon className="size-5" />
                  </span>
                  {match ? (
                    <span className="rounded-full bg-amber-200/10 px-2.5 py-1 text-xs text-amber-100">
                      Fits your interests
                    </span>
                  ) : null}
                </div>
                <h3 className="font-semibold text-stone-50">{rec.title}</h3>
                <p className="mt-1 text-sm text-stone-300">
                  {survey ? `On your list for ${survey.location}` : rec.place}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-500">{rec.detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProfilePanel({
  memoryCount,
  toursTouched,
  checkedCount,
  progress,
}: {
  memoryCount: number;
  toursTouched: number;
  checkedCount: number;
  progress: ReturnType<typeof crewProgress>;
}) {
  const badges = [
    {
      id: "first",
      name: "First Light",
      detail: "Log your first memory",
      unlocked: memoryCount >= 1,
    },
    {
      id: "hopper",
      name: "Tour Hopper",
      detail: "Log memories on two tours",
      unlocked: toursTouched >= 2,
    },
    {
      id: "keeper",
      name: "Vault Keeper",
      detail: "Five memories in the vault",
      unlocked: memoryCount >= 5,
    },
    {
      id: "crew",
      name: "Co-op Regular",
      detail: "Reach crew level 3",
      unlocked: progress.level >= 3,
    },
    {
      id: "spots",
      name: "Cartographer",
      detail: "Check off three stops",
      unlocked: checkedCount >= 3,
    },
    {
      id: "legend",
      name: "City Legend",
      detail: "Twenty memories with the crew",
      unlocked: memoryCount >= 20,
    },
  ];

  const stats = [
    { label: "Memories", value: memoryCount },
    { label: "Tours logged", value: toursTouched },
    { label: "Stops checked", value: checkedCount },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-900 text-amber-200">
            <User className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Your crew</p>
            <h2 className="text-xl font-semibold text-stone-50">You</h2>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-stone-900/80 px-3 py-3">
              <dt className="text-xs text-stone-500">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-stone-50">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200/80">
              <Users className="size-3.5" />
              Co-op level
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-50">
              Level {progress.level} · {progress.name}
            </h2>
          </div>
          <p className="text-right text-sm text-stone-400">
            {progress.intoLevel}/{MEMORIES_PER_LEVEL}
          </p>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-stone-800"
          role="progressbar"
          aria-valuenow={progress.intoLevel}
          aria-valuemin={0}
          aria-valuemax={MEMORIES_PER_LEVEL}
          aria-label="Co-op level progress"
        >
          <div
            className="h-full rounded-full bg-amber-200 transition-[width]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-stone-400">
          {progress.remaining}{" "}
          {progress.remaining === 1 ? "memory" : "memories"} with the crew until the
          next level.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-50">Achievements</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <li
              key={badge.id}
              className={cn(
                "rounded-3xl border p-4",
                badge.unlocked
                  ? "border-amber-200/30 bg-amber-200/10"
                  : "border-stone-800 bg-stone-950/50 text-stone-500",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-2xl p-2",
                    badge.unlocked ? "bg-amber-200 text-stone-950" : "bg-stone-900 text-stone-500",
                  )}
                >
                  {badge.unlocked ? <Award className="size-4" /> : <Lock className="size-4" />}
                </span>
              </div>
              <p className={cn("font-medium", badge.unlocked ? "text-stone-50" : "text-stone-400")}>
                {badge.name}
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-500">{badge.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MemoryDialog({
  draft,
  tours,
  saving,
  formError,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: MemoryDraft;
  tours: Tour[];
  saving: boolean;
  formError: string | null;
  onChange: (draft: MemoryDraft) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-memory-title"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="log-memory-title" className="text-lg font-semibold text-stone-50">
              Log a memory
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Saves a row to <code>vault_entries</code> and refreshes The Vault.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-stone-400 hover:bg-stone-900 hover:text-stone-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="text-stone-300">Title</span>
          <input
            required
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className="h-11 w-full rounded-xl border border-stone-800 bg-stone-900 px-3 text-stone-100 outline-none ring-amber-200/40 focus:ring-2"
            placeholder="Sunrise over the ridge"
          />
        </label>

        <label className="mt-4 block space-y-2 text-sm">
          <span className="text-stone-300">Category</span>
          <select
            required
            value={draft.category}
            onChange={(event) => onChange({ ...draft, category: event.target.value })}
            className="h-11 w-full cursor-pointer rounded-xl border border-stone-800 bg-stone-900 px-3 text-stone-100 outline-none ring-amber-200/40 [color-scheme:dark] focus:ring-2"
          >
            {tours.map((tour) => (
              <option key={tour.name} value={tour.name}>
                {tour.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block space-y-2 text-sm">
          <span className="text-stone-300">Content</span>
          <textarea
            value={draft.content}
            onChange={(event) => onChange({ ...draft, content: event.target.value })}
            rows={4}
            className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-amber-200/40 focus:ring-2"
            placeholder="What do you want to remember?"
          />
        </label>

        {formError ? <p className="mt-4 text-sm text-red-300">{formError}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-200 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Log Memory
        </button>
      </form>
    </div>
  );
}

function AddTourDialog({
  name,
  error,
  onName,
  onClose,
  onSubmit,
}: {
  name: string;
  error: string | null;
  onName: (name: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tour-title"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="add-tour-title" className="text-lg font-semibold text-stone-50">
              Add New Tour
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-400">
              Adds a category card and a matching option in Log Memory. The tour stays
              in this session. Memories you log under it still save to Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-stone-400 hover:bg-stone-900 hover:text-stone-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <label className="block space-y-2 text-sm">
          <span className="text-stone-300">Tour name</span>
          <input
            required
            value={name}
            onChange={(event) => onName(event.target.value)}
            className="h-11 w-full rounded-xl border border-stone-800 bg-stone-900 px-3 text-stone-100 outline-none ring-amber-200/40 focus:ring-2"
            placeholder="Jazz bars"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-stone-950 hover:bg-amber-100"
        >
          Add to Our Tours
        </button>
      </form>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-800 px-4 py-10 text-center">
      <p className="text-sm font-medium text-stone-300">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{body}</p>
    </div>
  );
}
