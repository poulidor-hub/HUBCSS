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
- `react/Icon.js` et `react/Icon.d.ts`, `react/HighlightText.js`, `react/SearchBadgeBar.js`, `react/SearchInput.js`, `react/Skeleton.js`, `react/EmptyState.js`, `react/Timeline.js`, `react/StatCard.js`, `react/PageHeader.js`, `react/Modal.js` et leurs typages `.d.ts` pour la bibliothèque optionnelle de composants React.
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
- `@poutchouli/design-system/react` pour le barrel (tous les composants React).
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

## Structure de page

Au-dessus des atomes (`hub-button`, `hub-input`, `hub-panel`…), HUBCSS fournit un
étage structurel : `PageHeader`, `Modal`, la variante `hub-panel--padded` et une
règle de scroll. Une page d'application standard se construit alors sans CSS ad hoc,
en suivant la recette ci-dessous.

### Recette canonique

```txt
Header global (app) > hub-container > PageHeader > toolbar unique > hub-panel
```

```jsx
<div className="hub-shell">
  {/* Header global de l'application — hors périmètre HUBCSS */}
  <main className="hub-container">
    <PageHeader
      title="Employés"
      version="2.28.2"
      meta="128 employés · 3 sites"
      actions={
        <>
          <button className="hub-button" type="button">Nouvel employé</button>
          <button className="hub-button hub-button-secondary" type="button">Exporter</button>
        </>
      }
    />
    <section className="hub-panel hub-panel--padded">
      <div className="hub-toolbar">{/* filtres, tri, recherche — un seul */}</div>
      {/* contenu : table, liste, formulaire… */}
    </section>
  </main>
</div>
```

Le **document** est la source de scroll de la page : `.hub-shell` occupe `100dvh` et
la page scrolle normalement. Les zones de scroll local autorisées sont exclusivement
le body de `.hub-modal` (géré par le composant, voir plus bas) et le scroll
horizontal des tables. Tout `max-height + overflow-y` improvisé dans une app est une
violation de la règle.

### Les 4 règles

1. **Un seul retour par page.** Le bouton retour est porté par `PageHeader`
   (`back`). Le Header global n'en rend pas ; une page racine n'en rend pas non plus.
2. **Une seule toolbar par page.** Filtres, tri et recherche vivent dans un unique
   `.hub-toolbar`, premier enfant du panel de contenu.
3. **Modal ≠ page.** Si le contenu a besoin d'onglets ou de navigation, c'est une
   route, pas une modal. La modal reste une action courte (confirmation, formulaire).
4. **Pas de carte dans carte.** Le contenu se pose dans `hub-panel hub-panel--padded`
   ; ne pas empiler des `.hub-panel` ou `.hub-surface` décoratifs à l'intérieur.

### PageHeader

```jsx
import { PageHeader } from '@poutchouli/design-system/react';

<PageHeader
  title="Poste de travail LT-4218"
  back={{ onClick: () => navigate('/inventaire'), label: "Retour à l'inventaire" }}
  badge={<span className="hub-badge hub-badge-success">Actif</span>}
  version="2.28.2"
  meta="Modifié le 07/10/2026 par Camille D. · Révision 12"
  actions={
    <>
      <button className="hub-button" type="button">Redémarrer</button>
      <button className="hub-button hub-button-secondary" type="button">Exporter</button>
    </>
  }
/>
```

Rendu inline (pas de portal), composant pur sans état interne ; `version` et `meta`
coexistent sur la même ligne meta, version en premier.

| Prop | Type | Requis | Rôle |
| --- | --- | :---: | --- |
| `title` | `ReactNode` | oui | Titre de page, rendu dans le `<h1>` — unique par page |
| `back` | `{ onClick, label? }` | non | Bouton ← ; `label` alimente l'`aria-label` (défaut « Retour ») |
| `badge` | `ReactNode` | non | Élément à côté du titre, typiquement `hub-badge` |
| `version` | `string` | non | Pastille `vX.Y.Z` (`tabular-nums`) ; alimentée par l'app, jamais calculée par la DS |
| `meta` | `ReactNode` | non | Ligne secondaire sous le titre (muted, petite taille) |
| `actions` | `ReactNode` | non | Boutons d'action, alignés à droite ; passent sous le titre sous 640px |

Classes CSS correspondantes :

| Classe | Rôle |
| --- | --- |
| `.hub-page-header` | Conteneur flex wrap (`align-items: flex-start`, gap `--hub-space-3`) |
| `.hub-page-header-back` | Bouton retour 40×40 (même style que `hub-icon-button`) |
| `.hub-page-header-heading` | Bloc titre + meta (flex column, `min-width: 0`) |
| `.hub-page-header-titlerow` | Ligne titre + badge (flex `align-items: center`) |
| `.hub-page-header-title` | Porté par le `<h1>` (`--hub-font-size-xl`, semibold) |
| `.hub-page-header-badge` | Hook de placement du badge, sans style propre |
| `.hub-page-header-meta` | Ligne meta (muted, `--hub-font-size-sm`, flex wrap) |
| `.hub-version-pill` | Pastille `vX.Y.Z` (bordure, radius full, `tabular-nums`) |
| `.hub-page-header-actions` | Actions (`margin-left: auto`, wrap ; sous le titre sous 640px) |

### Modal

Confirmation courte (`sm`) :

```jsx
import { Modal } from '@poutchouli/design-system/react';

<Modal
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Supprimer le fichier ?"
  size="sm"
  footer={
    <>
      <button className="hub-button hub-button-secondary" type="button" onClick={() => setConfirmOpen(false)}>Annuler</button>
      <button className="hub-button" type="button" onClick={confirmerSuppression}>Supprimer</button>
    </>
  }
>
  <div className="hub-alert hub-alert-danger">Cette action est définitive.</div>
</Modal>
```

Formulaire (`md`, taille par défaut) :

```jsx
<Modal
  open={formOpen}
  onClose={() => setFormOpen(false)}
  title="Déclarer un nouvel équipement"
  footer={
    <>
      <button className="hub-button hub-button-secondary" type="button" onClick={() => setFormOpen(false)}>Annuler</button>
      <button className="hub-button" type="button">Enregistrer</button>
    </>
  }
>
  <label className="hub-field">
    <span className="hub-label">Nom</span>
    <input className="hub-input" />
  </label>
  {/* …autres champs : le body scrolle seul, header et footer restent fixes */}
</Modal>
```

Le composant gère lui-même : rendu en portal vers `document.body` (`null` si
`open` est faux), fermeture par Escape, ✕ et clic sur le fond (désactivable via
`closeOnBackdrop`), focus trap avec focus initial et restauration du focus sur
l'élément déclencheur, et scroll-lock du body (compatible modals empilées).
Sous 640px, la modal se pose en panneau bas pleine largeur.

| Prop | Type | Requis | Défaut | Rôle |
| --- | --- | :---: | --- | --- |
| `open` | `boolean` | oui | — | Contrôle d'ouverture |
| `onClose` | `() => void` | oui | — | Appelé par Escape, ✕ et clic sur le fond |
| `title` | `ReactNode` | oui | — | Titre de la dialog, lié par `aria-labelledby` |
| `size` | `'sm' \| 'md' \| 'lg'` | non | `'md'` | Largeur maximale : 400 / 560 / 720 px |
| `children` | `ReactNode` | oui | — | Contenu du body, seule zone scrollable |
| `footer` | `ReactNode` | non | — | Zone d'actions fixe sous le body |
| `closeOnBackdrop` | `boolean` | non | `true` | Fermeture au clic sur le fond |

Classes CSS correspondantes :

| Classe | Rôle |
| --- | --- |
| `.hub-modal-backdrop` | Scrim `fixed` plein écran (`--hub-z-overlay`, fade 120ms) |
| `.hub-modal` | Dialog flex column (`--hub-z-modal`, `max-height: 85dvh`) |
| `.hub-modal--sm` / `.hub-modal--lg` | `max-width` 400px / 720px (le `md` implicite fait 560px) |
| `.hub-modal-header` | En-tête fixe : titre + bouton ✕ |
| `.hub-modal-title` | Titre de la dialog (`<h2>`, semibold) |
| `.hub-modal-body` | Body — **seule zone scrollable** de la modal |
| `.hub-modal-footer` | Pied fixe : actions alignées à droite, fond `--hub-color-surface-muted` |

### Échelle z-index

Ne jamais coder de z-index en dur dans une app : utiliser les tokens ci-dessous, en
respectant l'ordre des couches.

| Token | Valeur | Usage |
| --- | ---: | --- |
| `--hub-z-sticky` | 100 | Éléments sticky de l'app (Header global) |
| `--hub-z-overlay` | 200 | Scrim de la modal |
| `--hub-z-modal` | 300 | Dialog, au-dessus du scrim |
| `--hub-z-toast` | 400 | Réserve pour les toasts/messages — ne pas consommer avant l'existence du composant |

L'échelle est theme-agnostique : aucune redéfinition sous `[data-theme="dark"]`. Les
z-index internes des composants DS existants (Timeline : 1 à 10) restent sous cette
échelle ; leur tokenisation est prévue dans un lot ultérieur.

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

- `docs/CASCADE.md` for the layer/cascade contract between `global.css` and app
  CSS — mandatory reading before styling an app (resets, utility set, hub-*
  overrides).
- `docs/LOCAL_ASSETS.md` for Hub runtime assets and local fallback seeds.
- `docs/VERDACCIO.md` for development-only private registry checks.
- `docs/DEMO.md` for the reference validation flow.
