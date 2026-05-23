# Eshkon Page Builder

A full-stack, headless CMS page-builder built with Next.js 15 (App Router), TypeScript, Contentful, Drizzle ORM, Clerk authentication, and Redux Toolkit.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Redux Slice Responsibilities](#2-redux-slice-responsibilities)
3. [Contentful Model and Adapter](#3-contentful-model-and-adapter)
4. [Publish Flow and SemVer Logic](#4-publish-flow-and-semver-logic)
5. [Accessibility](#5-accessibility)
6. [What Is Incomplete and Why](#6-what-is-incomplete-and-why)

---

## 1. Architecture Overview

### Request flow

```
Browser
  │
  ├── GET /                   → Home page (Server Component)
  │     └── fetchAllPages()   → Contentful Delivery API → list of PageSummary cards
  │
  ├── GET /preview/[slug]     → Preview page (Server Component)
  │     └── fetchPageBySlug() → Contentful → Zod validate → PageRenderer
  │
  └── GET /studio/[slug]      → Studio (Client Component)
        ├── Load order:
        │     1. localStorage draft  (fastest, user's in-progress work)
        │     2. GET /api/publish/[slug]  (last published snapshot)
        │     3. GET /api/contentful/[slug]  (Contentful fallback)
        └── Renders StudioLayout → SectionList + PropertyPanel
```

### Folder structure

```
src/
  app/                   Next.js App Router pages and API routes
  components/
    home/                PageCard — home page card with viewer alert
    layout/              Header, Navbar, StudioActions
    studio/              StudioLayout, SectionList, PropertyPanel, editors/
    ui/                  Generic shadcn/ui components
    PageRenderer.tsx     Renders a Page object via the section registry
  db/
    schema.ts            Drizzle table definitions (users, releases, roleEnum)
  hooks/                 useRole — reads Clerk public metadata for the role
  lib/
    contentful.ts        Contentful delivery + preview client singletons
    constants/           roles, nav, storage, contentful constants
    validators/          Zod schemas (PageSchema, SectionSchema)
  services/
    contentful.service.ts  fetchAllPages, fetchPageBySlug + adapter
    publish.service.ts     getLatestRelease, publishDraft
  store/
    store.ts             Redux store
    slices/              draftPageSlice, uiSlice, publishSlice
  utils/
    semver.ts            diffPages, bumpVersion — pure SemVer diff logic
    apiError.ts          Typed ApiError class
```

### Key technology choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js App Router | Server Components for Contentful fetches; no client waterfall |
| Auth | Clerk | Webhook-driven user sync; public metadata stores role |
| Database | NeonDB (PostgreSQL) via Drizzle ORM | Typed schema; `pgEnum` enforces roles; `releases` append-only |
| CMS | Contentful | Headless; delivery/preview client split |
| State | Redux Toolkit | Predictable draft edits; async thunk for publish |
| Styling | Tailwind CSS + shadcn/ui | Utility-first; accessible component primitives |
| Tests | Vitest (unit) + Playwright + axe-core (e2e + a11y) | Fast unit loop; real-browser a11y scan |

---

## 2. Redux Slice Responsibilities

The store contains three slices. Each owns exactly one concern.

### `draftPageSlice`

**State:** `{ page: Page | null, isDirty: boolean, lastSaved: string | null }`

Owns the in-progress page that the editor is working on. All mutations go through this slice so the rest of the app always reads from a single source of truth.

| Action | What it does |
|--------|-------------|
| `loadDraft(page)` | Replaces the current draft; clears dirty flag |
| `addSection(section)` | Appends a new section; sets `isDirty` |
| `removeSection(sectionId)` | Filters out a section by ID; sets `isDirty` |
| `reorderSections({ fromIndex, toIndex })` | Moves a section in the array |
| `updateSectionProps({ sectionId, props })` | Merges new prop values into a section |
| `saveDraft()` | Persists draft to `localStorage`; clears dirty flag |

### `uiSlice`

**State:** `{ selectedSectionId: string | null, isPropertyPanelOpen: boolean }`

Owns transient editor UI state — which section is selected and whether the property panel is visible. Kept separate from draft data so UI interactions do not pollute the page model.

| Action | What it does |
|--------|-------------|
| `selectSection(id \| null)` | Opens the panel and selects a section; `null` closes |
| `closePropertyPanel()` | Deselects and closes the panel |

### `publishSlice`

**State:** `{ status, lastVersion, changelog, alreadyPublished, error }`

Owns the publish lifecycle. Contains one async thunk — `publishPage` — that reads the current draft from Redux state and sends it to the API. No arguments needed at the call site.

| State field | Meaning |
|-------------|---------|
| `status` | `"idle" \| "loading" \| "success" \| "error"` |
| `lastVersion` | SemVer string returned by the API after a successful publish |
| `changelog` | Array of human-readable change descriptions |
| `alreadyPublished` | `true` when the draft is identical to the latest release |
| `error` | Error message string on failure |

---

## 3. Contentful Model and Adapter

### Content model

Two content types live in Contentful:

**`page`**
```
slug        Short text   Unique identifier used in URLs
title       Short text   Page title shown in <title> and hero
sections    References   Array of linked section entries
```

**`section`**
```
sectionId   Short text   Stable UUID — survives edits, used as React key and diff ID
type        Short text   One of: hero | featureGrid | testimonial | cta
props       JSON         Arbitrary key/value pairs for that section type
```

### Adapter pattern

Raw Contentful entries contain `sys`, `metadata`, and link objects that are not part of the app's domain model. The adapter strips all of that:

```
Contentful Entry (raw)          →  App domain object
─────────────────────────────      ──────────────────────
entry.sys.id                   →  pageId
entry.fields.slug              →  slug
entry.fields.title             →  title
entry.fields.sections[n].fields →  sections[n] (via transformSection)
  .sectionId                   →  sectionId
  .type                        →  type
  .props                       →  props
```

After transformation the raw `unknown` value passes through `PageSchema.parse()` (Zod). If the shape is wrong the error surfaces immediately at the service boundary — nothing invalid can reach a component.

The service exposes two clients:
- **Delivery client** — published content; used everywhere by default.
- **Preview client** — draft content; passed via `options.preview = true` to `fetchPageBySlug`.

---

## 4. Publish Flow and SemVer Logic

### Overview

Publishing creates an immutable snapshot row in the `releases` table. The version number is calculated automatically by diffing the current draft against the last published release.

```
Editor clicks Publish
  │
  ├── Redux: publishPage thunk
  │     └── POST /api/publish/[slug]  { page: <current draft> }
  │
  └── API route → publish.service.ts
        1. Auth check (Clerk) — must be signed in
        2. Role check — must be "publisher"
        3. Zod validate request body
        4. getLatestRelease(slug) — query DB for last row
        5. diffPages(lastRelease.page, draft) → { bump, changes }
        6. If bump === "none" → return { alreadyPublished: true }
        7. bumpVersion(lastVersion, bump) → e.g. "1.2.0"
        8. INSERT INTO releases (slug, version, page, changelog)
        9. Return { version, changelog, alreadyPublished: false }
```

### SemVer diff rules (`src/utils/semver.ts`)

The diff compares two `Page` objects section-by-section using stable `sectionId` values.

| Change | Bump level |
|--------|-----------|
| Section removed | **major** |
| Section type changed | **major** |
| Prop key removed from a section | **major** |
| Section added | minor |
| New prop key added to a section | minor |
| Prop value changed (same keys) | patch |
| No difference | none |

When a single publish contains multiple change types, the **highest** bump level wins. Example: adding one section (minor) and changing a prop value (patch) results in a **minor** bump.

### Idempotency

If `diffPages` returns `bump === "none"`, no database row is inserted. The API returns `{ alreadyPublished: true }` and the UI shows "Up to date" instead of creating a duplicate release.

### Studio load order

When the studio opens it loads the page state in priority order:

1. **localStorage** — user's last in-progress draft (survives refresh)
2. **`GET /api/publish/[slug]`** — last published snapshot (survives sign-out)
3. **Contentful** — original CMS content (always available as fallback)

---

## 5. Accessibility

### Implemented

- **Semantic HTML** — `<section>`, `<aside>`, `<nav>`, `<header>`, `<main>` used throughout. Section list uses `role="list"` / `role="listitem"`.
- **Keyboard navigation** — All interactive controls (section items, move up/down, remove, add section) are reachable and activatable via keyboard. Section list items have `tabIndex={0}` and `onKeyDown` handlers.
- **ARIA labels** — All icon-only buttons carry `aria-label` ("Move up", "Move down", "Remove section"). Decorative icons have `aria-hidden="true"`.
- **Focus management** — CTA button in preview page has `data-testid="cta-button"` and is confirmed focusable by the Playwright smoke test.
- **Reduced motion** — `prefers-reduced-motion: reduce` media query in `globals.css` sets `animation-duration` and `transition-duration` to `0.01ms` for all elements.
- **WCAG tags tested** — axe-core scans the `/preview/home` route with `wcag2a`, `wcag2aa`, `wcag21aa` tags. The full report is written to `a11y-report.json`.

### axe-core test

CI runs `npm test` (Vitest unit tests). The Playwright a11y scan is run separately:

```bash
npx playwright test e2e/a11y.spec.ts
```

The test fails the build only on **critical** violations. Serious / moderate / minor violations are logged to the console and written to `a11y-report.json` for review.

### Evidence

Run the a11y test against a running dev server:

```bash
npm run dev &
npx playwright test e2e/a11y.spec.ts --reporter=list
cat a11y-report.json
```

---

## 6. What Is Incomplete and Why

### Contentful write-back

Editors and publishers cannot currently push changes from the studio back to Contentful. Contentful's Management API requires a server-side OAuth token and content-type-specific migration logic. The current architecture stores published snapshots in the `releases` table instead. The preview route reads from Contentful; a future version would either write back via the Management API or redirect preview to serve from the `releases` table directly.

### Drag-and-drop reordering

`reorderSections` is implemented in Redux and the move-up/move-down buttons work. A full drag-and-drop interface (e.g. `@dnd-kit`) was not added due to time constraints. The reducer is ready to accept it.

### Role assignment UI

Roles are assigned by manually updating a user's Clerk public metadata (`{ role: "publisher" | "editor" | "viewer" }`). There is no admin UI to manage roles from inside the app. In a production system this would be a protected settings page accessible only to publishers.

### E2E tests require a running server

The Playwright smoke and a11y tests depend on `http://localhost:3000` serving real data from Contentful. They are excluded from the GitHub Actions CI (`vitest.config.ts` excludes the `e2e/` directory) and must be run locally. Running them in CI would require injecting Contentful credentials and a seeded database, which was not set up within the project timeline.

### Preview page reads Contentful, not the latest release

`/preview/[slug]` currently calls `fetchPageBySlug` which hits the Contentful Delivery API. If an editor has published a change that is not yet reflected in Contentful (i.e. saved to `releases` only), the preview will show the Contentful version. A correct implementation would check `releases` first and fall back to Contentful only when no release exists.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env

# Push DB schema to NeonDB
npx drizzle-kit push

# Start dev server
npm run dev
```

### Required environment variables

```
DATABASE_URL                       NeonDB connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  Clerk frontend key
CLERK_SECRET_KEY                   Clerk backend key
CLERK_WEBHOOK_SECRET               Clerk webhook signing secret
CONTENTFUL_SPACE_ID                Contentful space ID
CONTENTFUL_DELIVERY_TOKEN          Contentful Delivery API token
CONTENTFUL_PREVIEW_TOKEN           Contentful Preview API token
```

### Running tests

```bash
# Unit tests (Vitest)
npm test

# Playwright smoke + a11y (requires dev server running)
npx playwright test
```
