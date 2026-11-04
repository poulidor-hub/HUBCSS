# How To Use HUBCSS

This guide explains how HUBCSS is built, published to the Hub, and consumed by
applications at runtime.

## Canonical Production Model

**Vendor mode (canonical today)**: the HUBCSS runtime assets are
**committed inside each application** (`frontend/public/design-system/current/`,
embedded in the nginx image at build time). A version bump is a reviewable
commit, produced by the app's vendor script (`make update-ds`) which copies
the assets from the stack's HUBCSS checkout while verifying the `manifest.json`
sha256 checksums. This mode is the POULIDOR parc reference: no network
dependency at runtime, offline-first, auditable through `git diff`.

**Hub-served model (future extension, not implemented)**: the flow described
below (admin upload, manifest served by the Hub, runtime swap by the
apps) does **not** exist on the Hub side yet (no endpoint, no admin
page). It remains the target model documented here for the day it gets
built:

1. HUBCSS produces a versioned `dist.tar.gz`.
2. An administrator imports it into the Hub, under **Admin > Design System**.
3. The Hub validates the manifest and sha256 checksums, extracts the files,
   and serves them from versioned `/design-system/<version>/...` URLs.
4. Applications read `${HUB}/api/design-system/manifest`, verify the
   sha256 checksums, and atomically swap their `/design-system/current/` bundle.

The template seed is not a mere "fallback": in vendor mode, **it is the
production asset**, kept up to date by `make update-ds`.

## What An App Actually Uses

Applications do not read the HUBCSS repository directly at runtime. They either
use the local seed installed by the template or the versioned bundle served by
the Hub.

The build outputs exposed to the Hub and consumed by vendor seeds are:

- `global.css` for HUBCSS components and tokens.
- `fonts.css` for bundled local fonts.
- `bootstrap-icons/bootstrap-icons.css` and its `fonts/` files for legacy
  Bootstrap Icons classes used by Hub application icons.
- `icons/lucide.svg` for the generated Lucide sprite.
- `react/Icon.js` and `react/Icon.d.ts`, `react/HighlightText.js`, `react/SearchBadgeBar.js`, `react/SearchInput.js`, `react/Skeleton.js`, `react/EmptyState.js`, `react/Timeline.js`, `react/StatCard.js`, `react/PageHeader.js`, `react/Modal.js` and their `.d.ts` type definitions for the optional React component library.
- `manifest.json` with `{version, generated_at, files:[{path,size,sha256}]}`
  in the packed artifact; the Hub runtime manifest adds served URLs.

## Build The Hub Artifact

From the HUBCSS repository:

```bash
npm install
npm run pack
```

The expected deployable artifact is `dist.tar.gz`, next to `manifest.json`.
Upload that tarball to the Hub design-system admin page. Do not make each
application install HUBCSS from npm, a private registry, a tarball, or a
workspace path in production.

## Development-Only Package Modes

The npm package surface is still useful for the HUBCSS demo, local experiments,
and temporary development loops:

- `@poutchouli/design-system` for the prebuilt CSS.
- `@poutchouli/design-system/source.css` for Tailwind CSS v4 experiments.
- `@poutchouli/design-system/bootstrap-icons.css` for legacy Bootstrap Icons
  class compatibility in development-only package flows.
- `@poutchouli/design-system/react` for the barrel (all React components).
- `@poutchouli/design-system/icons.svg` for package-based sprite access.

Supported development retrieval methods are tarball, private registry, and
workspace/local path. They are not the production distribution contract for Hub
applications.

### Tarball (Development)

Use this for local reproducibility tests without a shared registry.

From the HUBCSS repository:

```bash
npm install
npm run build
npm pack
```

In the consuming app:

```bash
npm install ./poutchouli-design-system-0.1.0.tgz
```

### Private Registry (Development)

Use this when validating package publication mechanics locally.

Publish HUBCSS to your private registry, then install it from the consuming
application:

```bash
npm install @poutchouli/design-system --registry http://127.0.0.1:4873/
```

See `docs/VERDACCIO.md` for the detailed workflow.

### Workspace Or Local Path (Development)

Use this during local development when an app and HUBCSS evolve together.

Example dependency in the app:

```json
{
  "dependencies": {
    "@poutchouli/design-system": "file:../.."
  }
}
```

This is the model used by the reference demo.

## Recommended Integration For A Tailwind v4 App

This is useful for standalone experiments. Hub-connected apps should use the
template runtime sync described above.

1. Install `@poutchouli/design-system` using one of the development modes above.
2. Import the source stylesheet from the application CSS entry.
3. Copy the Lucide sprite into the app static assets.
4. Serve the sprite from a stable local URL.

Application CSS entry:

```css
@import "@poutchouli/design-system/source.css";
```

React usage:

```jsx
import { Icon } from '@poutchouli/design-system/react';

export function SaveButton() {
  return (
    <button className="hub-button">
      <Icon name="save" />
      Save
    </button>
  );
}
```

By default, the React helper reads the sprite from:

```txt
/design-system/icons/lucide.svg
```

If your app serves the sprite elsewhere, pass `spriteHref` explicitly.

## Integration For A Non-Tailwind App

Use the prebuilt stylesheet when the consuming app does not compile Tailwind v4
source CSS.

```js
import '@poutchouli/design-system';
```

You still need to serve the Lucide sprite locally if you use the icon helper or
SVG `<use>` references.

If you also need legacy Hub application icon classes such as `bi-app`, import
or serve `bootstrap-icons/bootstrap-icons.css` with its sibling `fonts/`
directory. Hub production deployments normally receive these files through the
runtime manifest.

## Page Structure

On top of the atoms (`hub-button`, `hub-input`, `hub-panel`…), HUBCSS provides a
structural layer: `PageHeader`, `Modal`, the `hub-panel--padded` variant, and a
scroll rule. A standard application page is then built without ad hoc CSS by
following the recipe below.

### Canonical Recipe

```txt
Global app header > hub-container > PageHeader > single toolbar > hub-panel
```

```jsx
<div className="hub-shell">
  {/* Global application header — outside the HUBCSS scope */}
  <main className="hub-container">
    <PageHeader
      title="Employees"
      version="2.28.2"
      meta="128 employees · 3 sites"
      actions={
        <>
          <button className="hub-button" type="button">New employee</button>
          <button className="hub-button hub-button-secondary" type="button">Export</button>
        </>
      }
    />
    <section className="hub-panel hub-panel--padded">
      <div className="hub-toolbar">{/* filters, sort, search — exactly one */}</div>
      {/* content: table, list, form… */}
    </section>
  </main>
</div>
```

The **document** is the page's scroll source: `.hub-shell` occupies `100dvh` and
the page scrolls normally. The only allowed local scroll areas are the body of
`.hub-modal` (handled by the component, see below) and horizontal table scroll.
Any improvised `max-height + overflow-y` in an app violates the rule.

### The 4 Rules

1. **One back action per page.** The back button is carried by `PageHeader`
   (`back`). The global header renders none; a root page renders none either.
2. **One toolbar per page.** Filters, sorting, and search live in a single
   `.hub-toolbar`, the first child of the content panel.
3. **Modal ≠ page.** If the content needs tabs or navigation, it is a route,
   not a modal. A modal stays a short action (confirmation, form).
4. **No card inside a card.** Content sits in `hub-panel hub-panel--padded`;
   do not stack decorative `.hub-panel` or `.hub-surface` inside it.

### PageHeader

```jsx
import { PageHeader } from '@poutchouli/design-system/react';

<PageHeader
  title="Workstation LT-4218"
  back={{ onClick: () => navigate('/inventory'), label: "Back to inventory" }}
  badge={<span className="hub-badge hub-badge-success">Active</span>}
  version="2.28.2"
  meta="Updated on 2026-10-07 by Camille D. · Revision 12"
  actions={
    <>
      <button className="hub-button" type="button">Restart</button>
      <button className="hub-button hub-button-secondary" type="button">Export</button>
    </>
  }
/>
```

Rendered inline (no portal), a pure component with no internal state; `version`
and `meta` share the same meta line, version first.

| Prop | Type | Required | Role |
| --- | --- | :---: | --- |
| `title` | `ReactNode` | yes | Page title, rendered in the `<h1>` — unique per page |
| `back` | `{ onClick, label? }` | no | ← button; `label` feeds the `aria-label` (default `Retour`) |
| `badge` | `ReactNode` | no | Element next to the title, typically `hub-badge` |
| `version` | `string` | no | `vX.Y.Z` pill (`tabular-nums`); fed by the app, never computed by the DS |
| `meta` | `ReactNode` | no | Secondary line under the title (muted, small size) |
| `actions` | `ReactNode` | no | Action buttons, right-aligned; wrap below the title under 640px |

Matching CSS classes:

| Class | Role |
| --- | --- |
| `.hub-page-header` | Flex wrap container (`align-items: flex-start`, gap `--hub-space-3`) |
| `.hub-page-header-back` | 40×40 back button (same style as `hub-icon-button`) |
| `.hub-page-header-heading` | Title + meta block (flex column, `min-width: 0`) |
| `.hub-page-header-titlerow` | Title + badge row (flex `align-items: center`) |
| `.hub-page-header-title` | Carried by the `<h1>` (`--hub-font-size-xl`, semibold) |
| `.hub-page-header-badge` | Badge placement hook, no styling of its own |
| `.hub-page-header-meta` | Meta line (muted, `--hub-font-size-sm`, flex wrap) |
| `.hub-version-pill` | `vX.Y.Z` pill (border, full radius, `tabular-nums`) |
| `.hub-page-header-actions` | Actions (`margin-left: auto`, wrap; below the title under 640px) |

### Modal

Short confirmation (`sm`):

```jsx
import { Modal } from '@poutchouli/design-system/react';

<Modal
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Delete this file?"
  size="sm"
  footer={
    <>
      <button className="hub-button hub-button-secondary" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
      <button className="hub-button" type="button" onClick={confirmDelete}>Delete</button>
    </>
  }
>
  <div className="hub-alert hub-alert-danger">This action is permanent.</div>
</Modal>
```

Form (`md`, the default size):

```jsx
<Modal
  open={formOpen}
  onClose={() => setFormOpen(false)}
  title="Declare a new equipment"
  footer={
    <>
      <button className="hub-button hub-button-secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
      <button className="hub-button" type="button">Save</button>
    </>
  }
>
  <label className="hub-field">
    <span className="hub-label">Name</span>
    <input className="hub-input" />
  </label>
  {/* …other fields: only the body scrolls, header and footer stay fixed */}
</Modal>
```

The component handles on its own: portal rendering into `document.body`
(`null` when `open` is false), closing on Escape, ✕, and backdrop click
(disable via `closeOnBackdrop`), a focus trap with initial focus and focus
restoration to the trigger element, and body scroll-lock (compatible with
stacked modals). Below 640px, the modal docks as a full-width bottom panel.

| Prop | Type | Required | Default | Role |
| --- | --- | :---: | --- | --- |
| `open` | `boolean` | yes | — | Open state control |
| `onClose` | `() => void` | yes | — | Called by Escape, ✕, and backdrop click |
| `title` | `ReactNode` | yes | — | Dialog title, linked by `aria-labelledby` |
| `size` | `'sm' \| 'md' \| 'lg'` | no | `'md'` | Max width: 400 / 560 / 720 px |
| `children` | `ReactNode` | yes | — | Body content, the only scrollable area |
| `footer` | `ReactNode` | no | — | Fixed action area under the body |
| `closeOnBackdrop` | `boolean` | no | `true` | Close on backdrop click |

Matching CSS classes:

| Class | Role |
| --- | --- |
| `.hub-modal-backdrop` | Full-screen `fixed` scrim (`--hub-z-overlay`, 120ms fade) |
| `.hub-modal` | Flex column dialog (`--hub-z-modal`, `max-height: 85dvh`) |
| `.hub-modal--sm` / `.hub-modal--lg` | `max-width` 400px / 720px (the implicit `md` is 560px) |
| `.hub-modal-header` | Fixed header: title + ✕ button |
| `.hub-modal-title` | Dialog title (`<h2>`, semibold) |
| `.hub-modal-body` | Body — **the only scrollable area** of the modal |
| `.hub-modal-footer` | Fixed footer: right-aligned actions, `--hub-color-surface-muted` background |

### Z-Index Scale

Never hardcode z-index values in an app: use the tokens below, respecting
the layer order.

| Token | Value | Usage |
| --- | ---: | --- |
| `--hub-z-sticky` | 100 | App sticky elements (global header) |
| `--hub-z-overlay` | 200 | Modal scrim |
| `--hub-z-modal` | 300 | Dialog, above the scrim |
| `--hub-z-toast` | 400 | Reserved for toasts/messages — do not consume before the component exists |

The scale is theme-agnostic: no redefinition under `[data-theme="dark"]`. The
internal z-indexes of the existing DS components (Timeline: 1 to 10) remain
below this scale; tokenizing them is planned in a later batch.

## Runtime Asset Requirement

For Hub applications, CSS, fonts, and the icon sprite are runtime assets served
through the app's `/design-system/current/` path. In vendor mode (the parc
canonical mode), these files are **committed inside the app** and updated
deliberately:

```bash
make update-ds   # copies assets from the stack's HUBCSS, sha256 verified
git diff         # the version is visible in current/manifest.json
git commit       # the version bump is a reviewable commit
```

Minimum expectation for one application:

```txt
public/design-system/current/global.css
public/design-system/current/fonts.css
public/design-system/current/bootstrap-icons/bootstrap-icons.css
public/design-system/current/bootstrap-icons/fonts/bootstrap-icons.woff2
public/design-system/current/icons/lucide.svg
public/design-system/current/manifest.json
```

The template ships this bundle committed; `make update-ds` keeps it aligned
with the HUBCSS checkout of the stack. The Hub-side seeding/polling described
below remains a future extension:

1. The backend seeds `/var/lib/app/design-system/current/` from the embedded
  bundle if the volume is empty.
2. The backend polls the Hub manifest, verifies sha256, then swaps `current/`.
3. NGINX serves `/design-system/current/...` from the shared volume.

## Hub Runtime Asset Mode

The Hub is the shared runtime asset server. Versioned assets are served under
the Hub frontend and referenced by manifest URLs.

Example layout:

```txt
https://hub.local/design-system/0.1.0/global.css
https://hub.local/design-system/0.1.0/bootstrap-icons/bootstrap-icons.css
https://hub.local/design-system/0.1.0/icons/lucide.svg
https://hub.local/api/design-system/manifest
```

In this mode:

1. Upload one versioned asset set to the Hub.
2. Let applications sync through the manifest instead of hardcoding asset URLs.
3. Cache versioned assets aggressively.
4. Keep manifests revalidated or no-store.

## Build Outputs Produced By HUBCSS

After `npm run build`, HUBCSS produces:

- `dist/global.css`
- `dist/fonts.css`
- `dist/bootstrap-icons/bootstrap-icons.css`
- `dist/bootstrap-icons/fonts/bootstrap-icons.woff`
- `dist/bootstrap-icons/fonts/bootstrap-icons.woff2`
- `dist/icons/lucide.svg`
- `dist/react/Icon.js` `dist/react/Icon.d.ts`
- `dist/react/HighlightText.js` `dist/react/HighlightText.d.ts`
- `dist/react/SearchBadgeBar.js` `dist/react/SearchBadgeBar.d.ts`
- `dist/react/SearchInput.js` `dist/react/SearchInput.d.ts`
- `dist/react/Skeleton.js` `dist/react/Skeleton.d.ts`
- `dist/react/EmptyState.js` `dist/react/EmptyState.d.ts`
- `dist/react/Timeline.js` `dist/react/Timeline.d.ts`
- `dist/react/StatCard.js` `dist/react/StatCard.d.ts`
- `dist/react/PageHeader.js` `dist/react/PageHeader.d.ts`
- `dist/react/Modal.js` `dist/react/Modal.d.ts`

These are the artifacts your applications consume either directly or through
package exports.

## Recommended Adoption Pattern

For Hub-connected teams (future extension — not implemented Hub-side yet):

1. Build and pack HUBCSS.
2. Upload `dist.tar.gz` to the Hub.
3. Keep the committed vendor seed as the runtime asset (`make update-ds`).
4. Once built, applications would sync runtime assets from the Hub manifest.

Until then, vendor mode keeps all applications aligned through reviewed
commits while preserving offline startup.

## Validation Checklist

After integration, verify:

1. `npm run build` and `npm run pack` produce `dist.tar.gz` and `manifest.json`.
2. The Hub accepts the upload and exposes `/api/design-system/manifest`.
3. The app can fetch `/design-system/current/global.css`,
  `/design-system/current/bootstrap-icons/bootstrap-icons.css`, and
  `/design-system/current/icons/lucide.svg` after sync.
4. Icons render correctly in the UI.
5. `npm run check:offline` still passes in HUBCSS after package changes.

## Related Docs

- `docs/CASCADE.md` for the layer/cascade contract between `global.css` and app
  CSS — mandatory reading before styling an app (resets, utility set, hub-*
  overrides).
- `docs/LOCAL_ASSETS.md` for Hub runtime assets and local fallback seeds.
- `docs/VERDACCIO.md` for development-only private registry checks.
- `docs/DEMO.md` for the reference validation flow.
