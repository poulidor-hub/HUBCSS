# Performance Budgets

The package is optimized for static rendering and low machine impact.

## Runtime Rules

- No CSS-in-JS runtime.
- No external font request.
- No icon path duplication in React component trees.
- Theme changes use CSS variables on `:root` or `[data-theme="dark"]`.
- Production UI icons use one SVG sprite and `<use>` references.
- Legacy Hub application icons use the local Bootstrap Icons font bundle when
	the Hub must preserve historic `bi-*` application icon choices.

## Initial Budgets

`npm run check:budgets` enforces these limits:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| `dist/global.css` | 96 KB | 32 KB |
| `dist/icons/lucide.svg` | 96 KB | 24 KB |

Tighten these numbers after the first real app consumes the package.
The Bootstrap Icons compatibility bundle is tracked through the packed manifest
but is not part of the core CSS/Lucide budgets because it preserves a legacy
application-icon contract rather than the primary HUBCSS component surface.

## Motion, Z-Index And Scroll Surface

The structural layer (`PageHeader`, `Modal`, `hub-panel--padded`) stays within the
budgets above and adds exactly one moving part, one scroll zone, and a tokenized
stacking order:

- One animation only: the modal scrim fade (`opacity`, 120ms,
  `--hub-easing-standard`). The global `prefers-reduced-motion` rule neutralizes
  it — no slide, no scale, nothing else animates.
- One new local scroll zone: `.hub-modal-body`. A page keeps the document as its
  single scroll source (`.hub-shell` is laid out on `100dvh`); any other
  app-level `max-height + overflow-y` pattern remains a violation.
- Z-index is tokenized on `:root`: `--hub-z-sticky: 100`, `--hub-z-overlay: 200`,
  `--hub-z-modal: 300`, `--hub-z-toast: 400`. The 400 slot is a reservation for
  future toast/message components — apps must not consume it yet. The scale is
  theme-agnostic, so `[data-theme="dark"]` needs no overrides.

## Demo Scenario

The reference scenario is the demo in `examples/minimal-react`. Use it to check
CSS size, sprite size, responsive behavior, table density, theme switching, and
whether the browser Network panel stays free of external runtime requests.
