# LifeVault Roadmap

LifeVault is a single-player-first digital scrapbook and life-quest engine. One person can log places, photos, and memories now. Shared play comes later, once the scrapbook itself is solid.

## Phase 1: The Engine

**Status: Completed**

- UI
- Supabase database
- Storage
- Gamification
- Deletion

## Phase 2: The Discover Pipeline

**Status: Completed**

- Vibe Survey
- Bookmark to Planner
- Tour Assembly

## Phase 3: Visual Payoffs

**Status: In progress**

- Global Map
- Printable Albums
- Year-in-Review

## Phase 4: Co-op Expansion

- Player 2 Auth
- Shared Vaults
- Author Tags

## Detailed User Stories & Execution Modules

### Module 1: The Solo Discover Engine (Phase 2 - Current)
*   **Story 1.1:** As a solo explorer, I want to filter my Discover feed by "vibes" (e.g., Cafe, Nightlife) so the app matches my current mood. *(Status: Completed)*
*   **Story 1.2:** As an explorer, I want to "Bookmark" ideas to a Planner holding queue so I don't lose interesting spots. *(Status: Completed)*
*   **Story 1.3:** As a user, I want to click a "Conquer" button on a Planner item to instantly convert it into a Vault Memory without retyping the data. *(Status: Completed)*

### Module 2: The Onboarding & Identity Engine (Phase 3 - Upcoming)
*   **Story 2.1:** As a first-time user, I want a welcome modal to capture my name and primary vibes so the app instantly feels like my personal "Vault" rather than a generic template.
*   **Story 2.2:** As a user, I want my active vibes from onboarding to persist in `localStorage` so my Discover feed is pre-filtered every time I open the app.

### Module 3: The Visual Payoff & Mapping (Phase 3 - In Progress)
*   **Story 3.1:** As an explorer, I want an interactive, dark-mode global map that automatically drops pins on the coordinates of my logged Vault memories.
*   **Story 3.2:** As a user, I want to click a map pin and see a clean popup displaying the memory's title, category, and XP rating.
*   **Story 3.3:** As an archivist, I want a hidden Next.js route that formats a completed "Tour" (like my Spain trip) into a minimalist, CSS-styled grid specifically designed to be exported as a PDF or sent to a physical book publisher.

### Module 4: Gamification & Progress (Phase 3)
*   **Story 4.1:** As a user, I want my total XP to dynamically calculate my "Level" based on a 1000 XP threshold per level. *(Status: Completed)*
*   **Story 4.2:** As a user, I want the system to scan my `vault_entries` and automatically unlock specific Achievement Badges (e.g., "Cafe Hunter Bronze" for 5 cafe visits) and display them on my Profile tab.

### Module 5: Co-op & Party Mode (Phase 4 - Backlog)
*   **Story 5.1:** As a user, I want to generate a secure invite link to grant a partner or friend access to my specific `vault_id`.
*   **Story 5.2:** As a co-op participant, I want to see an `added_by` avatar tag on every Vault memory so I know who logged the experience.

### Module 6: Frictionless Execution (UX Polish)
Conquer pre-fills data, only asking for Photo & Rating.
*   **Story 6.1:** As a user, when I click "Conquer" on a Planner item, the modal should not require me to re-type the name, category, or location. It should only ask for the proof of execution: an uploaded photo and a friction rating.
*   **Story 6.2:** As a user, when I click "Bookmark" on a Discover card, it should save quietly to the Planner queue without opening any modals or interrupting my scrolling flow.

### Module 7: Algorithmic XP Engine (Deep Logic)
XP is calculated automatically based on real-world friction (Popularity + Difficulty + Wait Time). Manual slider removed.
*   **Story 7.1:** As an Admin, I want XP to be calculated from a friction level rather than a manual slider, so scores stay comparable.
*   **Story 7.2:** Low grants 10 XP, Medium grants 25 XP, High grants 50 XP, and Legendary grants 100 XP. A hard reservation or long line scores higher than an easy walk-in.
