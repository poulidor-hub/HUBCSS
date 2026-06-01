# How To Use HUBCSS

This guide explains how HUBCSS is built, published to the Hub, and consumed by
applications at runtime.

## Canonical Production Model

The production source of truth is the Hub runtime manifest:

1. HUBCSS produces one versioned `dist.tar.gz` artifact.
2. An administrator uploads that artifact in the Hub, under **Admin > Design System**.
3. The Hub validates the manifest and sha256 checksums, extracts the files, and
  serves them from versioned `/design-system/<version>/...` URLs.
4. Applications read `${HUB}/api/design-system/manifest`, download the listed
  assets, verify sha256 checksums, and atomically swap their local
  `/design-system/current/` bundle.

The application template ships a local HUBCSS seed only as a fallback for first
boot, offline development, and Hub outages. Once the Hub has an active design
system version, the Hub-served runtime bundle is canonical.

## What An App Actually Uses

Applications do not read the HUBCSS repository directly at runtime. They either
use the local seed installed by the template or the versioned bundle served by
the Hub.

The build outputs exposed to the Hub and to local fallback seeds are:

- `global.css` for HUBCSS components and tokens.
- `fonts.css` for bundled local fonts.
- `bootstrap-icons/bootstrap-icons.css` and its `fonts/` files for legacy
  Bootstrap Icons classes used by Hub application icons.
- `icons/lucide.svg` for the generated Lucide sprite.
- `react/Icon.js` and `react/Icon.d.ts` for the optional React `Icon` helper.
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
- `@poutchouli/design-system/react` for the optional React `Icon` helper.
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

## Runtime Asset Requirement

For Hub applications, CSS, fonts, and the icon sprite are runtime assets served
through the app's `/design-system/current/` path after sync from the Hub.

Minimum expectation for one application:

```txt
public/design-system/icons/lucide.svg
public/design-system/bootstrap-icons/bootstrap-icons.css
public/design-system/bootstrap-icons/fonts/bootstrap-icons.woff2
```

The template handles this automatically:

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
- `dist/react/Icon.js`
- `dist/react/Icon.d.ts`

These are the artifacts your applications consume either directly or through
package exports.

## Recommended Adoption Pattern

For Hub-connected teams:

1. Build and pack HUBCSS.
2. Upload `dist.tar.gz` to the Hub.
3. Keep the template seed fallback for first boot/offline safety.
4. Let applications sync runtime assets from the Hub manifest.

This keeps all applications on one centrally audited design-system version while
preserving local startup resilience.

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

- `docs/LOCAL_ASSETS.md` for Hub runtime assets and local fallback seeds.
- `docs/VERDACCIO.md` for development-only private registry checks.
- `docs/DEMO.md` for the reference validation flow.
