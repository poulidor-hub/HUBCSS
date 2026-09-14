# Cascade & Layers — The HUBCSS Styling Contract

How the compiled `global.css` is structured, how it interacts with an app's own
CSS, and the rules every app (and every agent) must follow to avoid silently
breaking the design system.

---

## Golden rules (read this first)

1. **Never ship a universal reset (`* { … }`) in app CSS.** The `@layer base`
   of `global.css` already resets margins, paddings and borders — correctly
   layered. An *unlayered* reset strips the padding/margin of **every**
   `hub-*` component (tables, buttons, badges, stat cards…).
2. **Unlayered CSS always beats layered CSS**, regardless of specificity or
   source order. Anything you write outside a `@layer` in `app.css` overrides
   the whole design system.
3. **Do not use the full Tailwind dialect in JSX.** The compiled bundle ships a
   *curated* utility set (see below). Classes like `mb-2`, `mb-3`, `w-full` or
   `text-base` do **not** exist in it — they silently resolve to nothing.
   Define the missing ones yourself in `app.css` (unlayered), or don't use them.
4. **App-specific component classes live in `app.css`, unlayered.** That is the
   sanctioned pattern: they legitimately win over `@layer components`, and they
   are yours.

---

## The layer stack of the compiled `global.css`

`global.css` is a Tailwind v4 build. Its author styles are **entirely layered**,
in this order (later layers win within layered styles):

| Layer | Content |
|---|---|
| `@layer properties` | `@property` fallback declarations (Tailwind internals) |
| `@layer theme` | Design tokens mapped to Tailwind theme variables (`--text-sm`, `--color-border`…) |
| `@layer base` | Universal reset (`box-sizing`, `margin: 0`, `padding: 0`, `border: 0 solid`, font inheritance) + element defaults + `:root`/`[data-theme]` token values |
| `@layer components` | **All `.hub-*` classes**: `hub-table`, `hub-button`, `hub-badge`, `hub-stat-card`, `hub-alert`, `hub-input`… |
| `@layer utilities` | The curated Tailwind utility set (list below) |

Everything else in the file (the trailing `:root { --hub-* }` block,
keyframes, `.hub-animate-*`) is **unlayered**.

---

## The one cascade rule that bites

Per CSS Cascading Level 5, for normal declarations:

> **Unlayered author styles take precedence over layered author styles —
> specificity and order do not matter across that boundary.**

Practical consequences:

| You write (unlayered, in `app.css`) | Effect on `global.css` layers |
|---|---|
| `* { padding: 0 }` | **Kills** the padding of every `hub-*` component (`hub-table` cells, `hub-button`, `hub-stat-card`…) — they cannot win back, ever |
| `.card { padding: 20px }` | Wins over everything layered — intended, this is your class |
| `.hub-button { padding: 0 }` in `app.css` | Overrides the DS button everywhere — avoid; use the documented variants or `@layer components { … }` to stay comparable |

---

## Rules for app CSS (`frontend/src/styles/app.css`)

**Do:**

- Keep the `:root` alias block (legacy variable names → `--hub-*` tokens).
- Define your app components (`.card`, `.stat-grid`, `.toolbar`, `.data-table…`)
  unlayered in `app.css`. They compose with, and legitimately sit above, the DS.
- Define any utility class your JSX needs but the bundle doesn't ship, in
  `app.css`, with values derived from `--hub-space-*` / `--hub-font-size-*`
  tokens (no hard-coded values).
- To extend or variant a `hub-*` class, append to the same layer:
  `@layer components { .hub-button--accent { … } }`.

**Don't:**

- No universal or element-wide resets (`*`, `div`, `button { … }`) outside a
  layer. The `base` layer owns resets.
- No hard-coded colors/shadows that duplicate tokens (`--hub-color-*`,
  `--shadow-hub*`).
- Don't rely on a utility class "just because Tailwind has it" — check the
  list below or grep the served `global.css`.

---

## Utilities shipped in the compiled bundle

Exact set (grep-verified against the build). Responsive variants live at the
end of the layer.

**Layout / display:** `block`, `flex`, `flex-col`, `flex-wrap`, `grid`,
`items-center`, `items-start`, `justify-between`, `justify-center`, `static`,
`relative`, `absolute`, `truncate`, `overflow-hidden`, `overflow-x-auto`,
`visible`, `table`, `columns-2`, `columns-3`, `filter`, `shadow`

**Spacing:** `mt-1`, `mt-3`, `mt-4`, `mt-5`, `mb-4`, `p-3`, `p-4`, `p-5`,
`px-2`, `px-4`, `py-1`, `py-2`, `py-3`, `py-8`, `pb-6`, `gap-2`, `gap-3`,
`gap-4`, `gap-6`, `space-y-4`, `space-y-6`, `min-h-20`, `max-w-2xl`,
`max-w-3xl`, `max-w-full`

**Typography & color:** `text-xs`, `text-sm`, `text-xl`, `text-2xl`,
`text-3xl`, `text-muted`, `font-semibold`, `tracking-normal`, `border-b`,
`border-border`, `bg-surface-muted`, `rounded-hub-sm`

**Responsive variants:** `sm:grid-cols-2` (≥ 40rem), `md:grid-cols-3` (≥ 48rem),
`lg:grid-cols-2`, `lg:grid-cols-5`, `lg:grid-cols-7`, `lg:flex-row`,
`lg:items-end`, `lg:justify-between` (≥ 64rem), `xl:grid-cols-[1fr_360px]`
(≥ 80rem)

**Notably absent** (do not use, or define them in `app.css`):
`mb-2`, `mb-3`, `mx-*`, `my-*`, `w-full`, `h-full`, `text-base`, `text-lg`,
`font-bold`, `rounded`, `gap-1`, `p-1`, `p-2`, `justify-end`, `items-end`.

This set is intentionally small: the bundle must stay lean
(see [PERFORMANCE.md](PERFORMANCE.md)). Extend it via `app.css`, not by
demanding every Tailwind class into the build.

---

## Case study — the `exports` app bug (fixed v0.1.2)

**Symptom:** crushed tables (zero cell padding), deformed buttons and badges,
"missing" padding — only in the browser, invisible in any static file review.

**Mechanism:** the app's `app.css` began with an unlayered
`* { box-sizing: border-box; margin: 0; padding: 0 }` (inherited from an older
template). That reset beat `@layer base` (it's unlayered), **and** it beat
`@layer components` — so every padding/margin declared by `hub-table`,
`hub-button`, `hub-badge`, `hub-stat-card`… resolved to `0`.

**Why it was sneaky:**

- The compiled `global.css` also ships the curated Tailwind utilities
  (`@layer utilities`) — but those lost to the reset for `padding`/`margin`
  just the same.
- The app JSX used Tailwind-style classes; some existed in the bundle
  (`flex`, `gap-4`…), some didn't (`mb-2`, `mb-3`) — a second, independent
  failure mode.
- Nothing in the source files *looks* wrong; only computed styles reveal it.

**Fix:** delete the reset (base layer already does it), define the missing
utilities unlayered in `app.css` with token values, move ad-hoc layout classes
(e.g. `.stat-grid`: 1 column mobile → 4 columns ≥ 768px) into `app.css`.

**Reference apps:** apps that define *all* their components in their own
unlayered `app.css` (e.g. `exemple-apps`) are structurally immune to this — but
they must then not rely on the shipped utility set either.

---

## Validation checklist

- [ ] No `*` / universal reset in `app.css` (grep `^\*` and `^\s*\*\s*\{`)
- [ ] JSX classNames all resolve: exist in the utility list above, in
      `hub-*`/documented DS classes, or defined in `app.css`
- [ ] Padding of a `hub-table` cell renders non-zero (computed style, real
      browser) on every page with tables — at mobile width too
- [ ] Custom utilities use `--hub-*` tokens, not raw px/rem values
- [ ] Component variants appended via `@layer components { … }`, not by
      unlayered overrides of `hub-*` classes

## Related docs

- [HOW2USE.md](HOW2USE.md) — integration modes and recommended adoption
- [PERFORMANCE.md](PERFORMANCE.md) — bundle budgets that justify the curated
  utility set
