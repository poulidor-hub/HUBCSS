# Changelog

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
