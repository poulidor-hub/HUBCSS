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

## Demo Scenario

The reference scenario is the demo in `examples/minimal-react`. Use it to check
CSS size, sprite size, responsive behavior, table density, theme switching, and
whether the browser Network panel stays free of external runtime requests.
