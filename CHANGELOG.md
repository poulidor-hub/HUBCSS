# Changelog

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
