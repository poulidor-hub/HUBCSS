# Hub Runtime Asset Serving

The production delivery model is Hub-served runtime assets with a local fallback
seed in each application.

## Canonical Runtime Mode

HUBCSS is built once, packed as `dist.tar.gz`, uploaded to the Hub, and then
served from versioned Hub URLs. Applications do not point directly at this
repository and do not install separate HUBCSS package versions in production.

Runtime flow:

1. Hub exposes `/api/design-system/manifest`.
2. The app backend downloads the listed files, verifies sha256, and swaps the
   local `current/` bundle atomically.
3. The app frontend loads `/design-system/current/global.css`, `fonts.css`,
   `bootstrap-icons/bootstrap-icons.css`, and `icons/lucide.svg` from its own
   NGINX container.
4. SSE or page reloads pick up new Hub versions without rebuilding the app.

## Local Seed Fallback

The template embeds one HUBCSS seed in the backend image and frontend assets.
It exists for first boot, offline development, and Hub outages. It is not the
long-term source of truth once the Hub has an active design-system version.

Typical app runtime layout:

```txt
/var/lib/app/design-system/current/global.css
/var/lib/app/design-system/current/fonts.css
/var/lib/app/design-system/current/bootstrap-icons/bootstrap-icons.css
/var/lib/app/design-system/current/bootstrap-icons/fonts/bootstrap-icons.woff2
/var/lib/app/design-system/current/icons/lucide.svg
```

## Development Package Modes

The package, tarball, Verdaccio registry, and workspace path workflows remain
useful for local HUBCSS development and demo validation. They are documented as
development tools, not as production distribution models for Hub apps.

Versioned Hub assets can use immutable caching. Manifests, app HTML, and local
`current/` pointers should stay revalidated or no-store.
