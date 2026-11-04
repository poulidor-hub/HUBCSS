## [0.3.5] - 4 November 2026

### ⚡ Open-source documentation cleanup

- Internal `docs/superpowers/` artifacts untracked (kept locally) and gitignored
- `docs/HOW2USE.md` fully translated to English (page structure section, build outputs, barrel npm notes) — all `hub-*` class names and `--hub-*` tokens unchanged
- Version badge synced to package.json (0.3.5)

## [0.3.4] - 4 novembre 2026

### ⚡ Licence open source MIT + en-têtes SPDX

- `LICENSE` (**MIT**) au nom de POULIDOR Audit & Développement - Valérian Poulidor — remplace `LICENSE.md` (MIT au nom « Poutchouli ») ; le design system devient clairement réutilisable dans des projets propriétaires
- En-têtes SPDX (`MIT` + copyright POULIDOR Audit & Développement) sur les **38 fichiers** (composants TS/TSX, CSS, exemples, 11 `.d.ts` manuscrits)

## [0.3.3] - 21 octobre 2026

### Fixed

- **Sécurité (dev-deps)** : `source-map-js` 1.2.1 → 1.2.2 (GHSA-68fv-2mgg-jv7q,
  DoS event-loop) — `npm audit` : **0 vulnérabilités**. Les autres alertes
  Dependabot (vite, nanoid, postcss) étaient déjà couvertes par le lock v0.3.1.
  Dépendances de build uniquement : aucun asset runtime modifié (shas dist
  identiques, manifest inchangé hors version).
- **Docs** : `docs/LOCAL_ASSETS.md` aligné sur le mode vendor canonique
  (HOW2USE v0.3.2) — le modèle Hub-served requalifié en extension future.

## [0.3.2] - 21 octobre 2026

### Changed

- **Contrat** : `docs/HOW2USE.md` — le mode **vendor** (assets committés dans
  l'app, `make update-ds`) est le mode canonique des apps du parc ; le modèle
  Hub-served (upload admin, manifest, swap runtime) est requalifié en extension
  future non implémentée côté Hub.
- **Fix pack** : `manifest.json` régénéré via `npm run pack` — les sha256
  committés étaient périmés par rapport au build déterministe (v0.3.1).

## [0.3.1] - 10 octobre 2026

### Changed
- ROADMAP: recorded the 0.3.0 structural-layer direction (Done section) and
  tightened the expansion rule per the park simplicity directive — the DS
  ships only what removes work for the AI (one structure, one set of classes,
  four rules); expansion is a cost before it is a feature.
- package-lock.json: peerDependencies resynced to match the package manifest
  (`react-dom` declared since 0.3.0). No runtime or build changes.
## [0.3.0] - 2026-10-08

### Added
- Structural layer: `PageHeader` (CSS `hub-page-header*` + React component — single `h1`, optional back/badge, dynamic version pill via `meta`, wrapping actions) and `Modal` (CSS `hub-modal*` + React component — portal, Escape, focus trap with latest-ref handler, body-only scrolling, module-level scroll-lock counter, sizes sm/md/lg, mobile bottom sheet < 640px, real scrim fade keyframe). Both zero-dependency, createElement-style, with `.d.ts` and package exports (`./react/PageHeader`, `./react/Modal`).
- z-index tokens `--hub-z-sticky/overlay/modal/toast` (100/200/300/400).
- `.hub-panel--padded` variant; `.hub-shell` upgraded to `100dvh` with a minifier-proof `@supports` `100vh` fallback.
- `setIconSpriteHref()`: app-level override of the default Lucide sprite URL (template apps serve the sprite under `/design-system/current/`, the DS server at the root) — internal Icon consumers (StatCard, EmptyState, SearchInput, SearchBadgeBar) inherit the setting.
- `react-dom` declared as a peerDependency; example app Vite config dedupes react/react-dom (fixes dual-React production demo bundle).
- Demo sections for PageHeader (root/detail/long-actions variants) and Modal (sm/md/lg + scrollable body) in `examples/minimal-react`; verified desktop + mobile, light + dark.
- Docs: "Structure de page" recipe in HOW2USE (canonical page layout + the 4 rules: single back, single toolbar, modal ≠ page, no card-in-card) + component class/props tables; PERFORMANCE.md notes (z tokens, scrim fade, modal body as the only new local scroll zone).
- Spec & implementation plan: `docs/superpowers/specs/2026-10-07-hubcss-lot1-structure-design.md`, `docs/superpowers/plans/2026-10-07-hubcss-lot1-structure.md` (executed subagent-driven, 7 tasks + final review + end-to-end validation in a fresh template app).

### Changed
- `manifest.json` version resynced (was left at 0.2.1 while package was 0.2.4 — drift fix, now maintained at 0.3.0).
# Changelog

## [0.2.3] - 2026-09-14

### Added
- `docs/CASCADE.md`: the cascade/layers styling contract — layer stack of the
  compiled `global.css` (properties/theme/base/components/utilities), the
  unlayered-beats-layered rule, the ban on universal resets in app CSS, the
  exact curated utility set shipped in the bundle (and the notable absent
  ones, e.g. `mb-2`/`mb-3`), safe `hub-*` extension patterns, and the real
  world case study from the `exports` app (v0.1.2 crushed-tables bug).

### Changed
- `docs/HOW2USE.md` (Related Docs) and `README.md` (Documentation) now link
  to `docs/CASCADE.md`.

## [0.2.4] - 2026-09-17

### Changed
- README: added version badge and a new "Place In The POULIDOR Park" section
  (Mermaid diagram of the Hub-served runtime distribution model, links to sibling
  repos). Version badge set to 0.2.4 (0.2.3 was already released with
  `docs/CASCADE.md`). No runtime or build changes.

## [0.2.2] - 2026-07-05

### Added
- `.hub-skeleton-text` CSS class for `SkeletonText` container.
- `.hub-badge--pill-lg` CSS class: larger pill variant with increased padding and font-size.
- `./react/SkeletonText` subpath export in `package.json`.

### Changed
- `SearchInput` and `SearchBadgeBar` React components now use the Lucide sprite
  (`<Icon>`) instead of inline SVG elements — lighter bundle, consistent rendering.

### Fixed
- `docs/HOW2USE.md` and `README.md` now list all 8 React components and their
  `.d.ts` typings (previously only `Icon.js` was documented).
- `docs/VERDACCIO.md`: removed reference to non-existent `.npmrc.example`.
- `.github/workflows/ci.yml` now runs `npm run demo:build` as quality gate.

## [0.2.1] - 2026-06-07

### Added
- `.hub-timeline` component: vertical timeline with color-coded dots and event cards.
- `.hub-timeline-dot`: variants `--muted`, `--accent`, `--danger`, `--success`, `--warning`.
- `.hub-timeline-time`, `.hub-timeline-title`, `.hub-timeline-description` sub-elements.
- `.hub-timeline-tag`: event type tags with variants `--info`, `--action`, `--danger`, `--success`, `--warning`.
- `.hub-stat-card` component: dashboard stat widget with icon, label, value, trend indicator.
- `.hub-stat-card-trend`: variants `--up`, `--down`, `--neutral` with arrow icons.
- React component `Timeline`: renders event arrays with staggered fade-in animation.
- React component `StatCard`: renders stat cards with optional icon and trend.
- TypeScript declarations for both new React components.

### Changed
- Version bump to `0.2.1`.
- All 9 React components now included in barrel exports and build pipeline.

## [0.2.0] - 2026-06-07

### Added
- New color tokens: `--hub-color-accent-soft`, `--hub-color-accent-strong`, `--hub-color-highlight-bg`.
- Spacing scale tokens: `--hub-space-1` through `--hub-space-16` (4px grid).
- Typography scale tokens: `--hub-font-size-xs` through `--hub-font-size-4xl`.
- Font weight tokens: `--hub-font-weight-normal` through `--hub-font-weight-extrabold`.
- Animation tokens: `--hub-transition-fast/base/slow`, `--hub-easing-standard/emphasized`.
- New CSS components: `.hub-skeleton`, `.hub-empty-state` (with `-icon`, `-title`, `-description`), `.hub-divider` (with `--labeled`, `--dashed`), `.hub-avatar` (with `--sm`, `--md`, `--lg`), `.hub-spinner` (with `--sm`, `--lg`).
- Button variants: `.hub-button--sm`, `--lg`, `--danger`, `--success`, `--ghost`, `--loading`.
- Input variants: `.hub-input--sm`, `--lg`, `--invalid`.
- Badge variants: `.hub-badge--dot`, `--pill`.
- Table variants: `.hub-table--striped`, `--compact`, `--bordered`.
- Search components: `.hub-highlight-mark`, `.hub-search-input-wrapper/icon/clear`, `.hub-search-badge-bar/label/badge/reset`.
- Animation keyframes: `hub-pulse`, `hub-spin`, `hub-fade-in`, `hub-slide-up`, `hub-slide-down`, `hub-scale-in`.
- Animation utility classes: `.hub-animate-fade-in`, `.hub-animate-slide-up`, `.hub-animate-slide-down`, `.hub-animate-scale-in`.
- New React components: `HighlightText`, `SearchBadgeBar`, `SearchInput`, `Skeleton`, `SkeletonText`, `EmptyState`.
- React barrel export: `index.js` + `index.d.ts`.
- Python helper module: `src/python/match_fields.py` for reusable badge search backend logic.
- `build:python` npm script, `dist/python/` in distribution.
- `prefers-reduced-motion` support disabling all animations/transitions.
- `--radius-hub-full: 999px` and `--shadow-hub-raised` tokens.
- Dark theme values for all new color tokens.

### Changed
- `:root` tokens moved to dedicated block with light/dark color-scheme.
- `@layer base` now includes `prefers-reduced-motion` media query.
- `@theme` block expanded with new color, radius, and shadow tokens.
- `build-react.mjs` now copies all 7 components (Icon + 6 new).
- Package version bumped to `0.2.0`.
- `package.json` exports expanded with individual paths for all React components + barrel.

## [0.1.0] - 2026-05-11

### Added

- Initial local-first design system package.
- Tailwind CSS v4 source stylesheet with CSS-first tokens.
- Lucide SVG sprite generation from a controlled icon manifest.
- Optional React `Icon` helper using SVG `<use>` references.
- Offline URL scan, CSS/sprite budget checks, Verdaccio notes, and NGINX config.
- Official React demo page covering tokens, components, theme switching, icons,
  tables, local sprite checks, and responsive layout.
