// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@poutchouli/design-system/source.css';
import { Icon, PageHeader, Modal } from '@poutchouli/design-system/react';

const spriteHref = '/design-system/icons/lucide.svg';

const colorTokens = [
  ['page', 'var(--hub-color-page)'],
  ['surface', 'var(--hub-color-surface)'],
  ['surface-muted', 'var(--hub-color-surface-muted)'],
  ['text', 'var(--hub-color-text)'],
  ['muted', 'var(--hub-color-muted)'],
  ['primary', 'var(--hub-color-primary)'],
  ['accent', 'var(--hub-color-accent)'],
  ['success', 'var(--hub-color-success)'],
  ['warning', 'var(--hub-color-warning)'],
  ['danger', 'var(--hub-color-danger)'],
];

const iconNames = [
  'bell',
  'check',
  'copy',
  'download',
  'external-link',
  'eye',
  'info',
  'loader-circle',
  'menu',
  'pencil',
  'plus',
  'refresh-cw',
  'save',
  'search',
  'settings',
  'sun',
  'trash-2',
  'triangle-alert',
  'upload',
  'user',
  'x',
];

const assetRows = [
  { name: 'Tailwind v4 tokens', mode: 'CSS-first', status: 'ready', icon: 'settings' },
  { name: 'Lucide icon sprite', mode: 'SVG use', status: 'ready', icon: 'copy' },
  { name: 'Typography', mode: 'System font', status: 'ready', icon: 'eye' },
  { name: 'Theme switch', mode: 'CSS variables', status: 'ready', icon: 'sun' },
  { name: 'Offline guard', mode: 'npm script', status: 'watched', icon: 'triangle-alert' },
];

const equipmentFormFields = [
  { label: "Nom de l'asset", type: 'text', placeholder: 'LT-4218' },
  { label: 'Type', type: 'select', options: ['Portable', 'Tour', 'Écran', "Station d'accueil"] },
  { label: 'Marque', type: 'text', placeholder: 'Lenovo' },
  { label: 'Modèle', type: 'text', placeholder: 'ThinkPad T14 G5' },
  { label: 'Numéro de série', type: 'text', placeholder: 'PF-3ZK9-218' },
  { label: 'Site', type: 'select', options: ['Lyon-Villeurbanne', 'Paris', 'Nantes', 'Remote'] },
  { label: 'Service', type: 'text', placeholder: 'Maintenance' },
  { label: 'Utilisateur assigné', type: 'text', placeholder: 'camille.d' },
  { label: "Date d'achat", type: 'date' },
  { label: 'Garantie', type: 'select', options: ['1 an', '2 ans', '3 ans', '5 ans'] },
  { label: 'Adresse MAC', type: 'text', placeholder: '00:1A:2B:3C:4D:5E' },
  { label: 'Notes internes', type: 'text', placeholder: 'Sacoche fournie' },
];

const auditRows = [
  ['09:42', 'camille.d', 'Connexion', 'Hub SSO'],
  ['09:45', 'camille.d', 'Création', 'Fiche LT-4218'],
  ['09:51', 'martin.l', 'Modification', 'Fiche LT-4218 — champ garantie'],
  ['10:03', 'camille.d', 'Attribution', 'LT-4218 → martin.l'],
  ['10:12', 'system', 'Synchronisation', 'Inventaire Hub (342 éléments)'],
  ['10:27', 'sofia.k', 'Connexion', 'Hub SSO'],
  ['10:31', 'sofia.k', 'Création', 'Fiche SCR-1102'],
  ['10:44', 'martin.l', 'Export', 'inventaire-2026-10-07.csv'],
  ['11:02', 'camille.d', 'Suppression', 'Fiche DOC-0087'],
  ['11:15', 'system', 'Sauvegarde', 'Snapshot quotidien'],
  ['11:28', 'sofia.k', 'Modification', 'Fiche SCR-1102 — site Paris'],
  ['11:40', 'martin.l', 'Déconnexion', 'Hub SSO'],
  ['13:05', 'camille.d', 'Téléversement', 'rapport-q3.pdf (2,4 Mo)'],
  ['13:19', 'sofia.k', 'Connexion', 'Hub SSO'],
  ['13:33', 'system', 'Mise à jour', 'Agents MDM — 12 postes'],
  ['13:47', 'camille.d', 'Modification', 'Préférences de notification'],
];

function Badge({ children, tone = 'default' }) {
  const toneClass = tone === 'default' ? '' : ` hub-badge-${tone}`;
  return <span className={`hub-badge${toneClass}`}>{children}</span>;
}

function SectionHeader({ icon, title, eyebrow }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="hub-label flex items-center gap-2"><Icon name={icon} size={16} spriteHref={spriteHref} />{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal">{title}</h2>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('comfortable');
  const [query, setQuery] = useState('');
  const [strictMode, setStrictMode] = useState(true);
  const [spriteStatus, setSpriteStatus] = useState('checking');
  const [spriteCheckId, setSpriteCheckId] = useState(0);
  const [modalSmOpen, setModalSmOpen] = useState(false);
  const [modalMdOpen, setModalMdOpen] = useState(false);
  const [modalLgOpen, setModalLgOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    fetch(spriteHref, { cache: 'no-store' })
      .then((response) => {
        if (!cancelled) setSpriteStatus(response.ok ? 'ready' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setSpriteStatus('missing');
      });

    return () => {
      cancelled = true;
    };
  }, [spriteCheckId]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return assetRows;
    return assetRows.filter((row) => `${row.name} ${row.mode} ${row.status}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const spriteTone = spriteStatus === 'ready' ? 'success' : spriteStatus === 'checking' ? 'warning' : 'danger';
  const tablePadding = density === 'compact' ? 'py-2' : 'py-3';

  return (
    <main className="hub-shell py-8">
      <section className="hub-container space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success"><Icon name="circle-check" size={16} spriteHref={spriteHref} />Local-first</Badge>
              <Badge><Icon name="settings" size={16} spriteHref={spriteHref} />Tailwind v4</Badge>
              <Badge><Icon name="copy" size={16} spriteHref={spriteHref} />SVG sprite</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">Design system demo</h1>
            <p className="mt-3 max-w-2xl text-muted">
              One page to validate tokens, primitives, icons, forms, tables, theming, and local asset delivery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hub-segmented" aria-label="Theme selector">
              <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}><Icon name="sun" size={16} spriteHref={spriteHref} /> Light</button>
              <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}><Icon name="moon" size={16} spriteHref={spriteHref} /> Dark</button>
            </div>
            <button className="hub-icon-button" type="button" title="Refresh sprite check" onClick={() => { setSpriteStatus('checking'); setSpriteCheckId((value) => value + 1); }}>
              <Icon name="refresh-cw" spriteHref={spriteHref} />
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="hub-panel p-4">
            <p className="hub-label">Runtime</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <strong>Sprite</strong>
              <Badge tone={spriteTone}><Icon name={spriteStatus === 'ready' ? 'check' : 'triangle-alert'} size={16} spriteHref={spriteHref} />{spriteStatus}</Badge>
            </div>
          </div>
          <div className="hub-panel p-4">
            <p className="hub-label">Theme</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <strong>{theme}</strong>
              <Icon name={theme === 'light' ? 'sun' : 'moon'} spriteHref={spriteHref} />
            </div>
          </div>
          <div className="hub-panel p-4">
            <p className="hub-label">Mode</p>
            <label className="hub-switch mt-3">
              <input type="checkbox" checked={strictMode} onChange={(event) => setStrictMode(event.target.checked)} />
              <span>{strictMode ? 'Strict offline' : 'Visual only'}</span>
            </label>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="hub-surface p-5">
            <SectionHeader icon="settings" eyebrow="Tokens" title="Color and theme variables" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {colorTokens.map(([name, value]) => (
                <div className="hub-swatch" key={name}>
                  <span className="hub-swatch-token" style={{ background: value }} />
                  <strong className="text-sm">{name}</strong>
                  <code className="text-xs text-muted">--hub-color-{name}</code>
                </div>
              ))}
            </div>
          </div>

          <aside className="hub-surface p-5">
            <SectionHeader icon="info" eyebrow="Typography" title="Text scale" />
            <div className="space-y-4">
              <div>
                <p className="hub-label">Heading</p>
                <p className="mt-1 text-2xl font-semibold tracking-normal">Fast local UI</p>
              </div>
              <div>
                <p className="hub-label">Body</p>
                <p className="mt-1 text-muted">Static CSS, system fonts, and sprite icons keep the browser workload quiet.</p>
              </div>
              <div>
                <p className="hub-label">Code</p>
                <code className="rounded-hub-sm bg-surface-muted px-2 py-1 text-sm">@theme</code>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="hub-surface p-5">
            <SectionHeader icon="plus" eyebrow="Controls" title="Buttons, fields, and states" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="hub-field">
                <span className="hub-label">Search field</span>
                <input className="hub-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter assets" />
              </label>
              <label className="hub-field">
                <span className="hub-label">Density</span>
                <select className="hub-select" value={density} onChange={(event) => setDensity(event.target.value)}>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="hub-button" type="button"><Icon name="save" spriteHref={spriteHref} />Save</button>
              <button className="hub-button hub-button-secondary" type="button"><Icon name="upload" spriteHref={spriteHref} />Upload</button>
              <button className="hub-icon-button" type="button" title="Edit"><Icon name="pencil" spriteHref={spriteHref} /></button>
              <button className="hub-icon-button" type="button" title="Delete"><Icon name="trash-2" spriteHref={spriteHref} /></button>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="hub-alert hub-alert-success"><Icon name="check" spriteHref={spriteHref} /><span>Success state uses local tokens only.</span></div>
              <div className="hub-alert hub-alert-warning"><Icon name="triangle-alert" spriteHref={spriteHref} /><span>Warning state keeps contrast across themes.</span></div>
            </div>
          </div>

          <div className="hub-surface overflow-hidden">
            <div className="hub-toolbar border-b border-border px-4">
              <div>
                <p className="hub-label">Table</p>
                <strong>Asset contract</strong>
              </div>
              <Badge tone="success"><Icon name="check" size={16} spriteHref={spriteHref} />{filteredRows.length} rows</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.name}>
                      <td className={tablePadding}><span className="flex items-center gap-2"><Icon name={row.icon} size={16} spriteHref={spriteHref} />{row.name}</span></td>
                      <td className={tablePadding}>{row.mode}</td>
                      <td className={tablePadding}><Badge tone={row.status === 'ready' ? 'success' : 'warning'}>{row.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="hub-surface p-5">
          <SectionHeader icon="menu" eyebrow="Structure" title="PageHeader" />
          <div className="space-y-8">
            <div>
              <p className="hub-label">Racine — sans retour, version + meta, deux actions</p>
              <div className="mt-2">
                <PageHeader
                  title="Inventaire"
                  version="2.28.2"
                  meta="342 éléments · Dernière synchronisation il y a 2 h"
                  actions={
                    <>
                      <button className="hub-button" type="button" onClick={() => window.alert('Démo : nouvel élément')}><Icon name="plus" spriteHref={spriteHref} />Nouvel élément</button>
                      <button className="hub-button hub-button-secondary" type="button" onClick={() => window.alert('Démo : export CSV')}><Icon name="download" spriteHref={spriteHref} />Exporter</button>
                    </>
                  }
                />
              </div>
            </div>
            <div>
              <p className="hub-label">Détail — retour, badge, version, meta long</p>
              <div className="mt-2">
                <PageHeader
                  title="Poste de travail LT-4218"
                  back={{ onClick: () => window.alert('Démo : retour à la liste') }}
                  badge={<Badge tone="success">Actif</Badge>}
                  version="2.28.2"
                  meta="Modifié le 07/10/2026 à 14:32 par Camille D. · Révision 12 · Site Lyon-Villeurbanne · Service Maintenance · Garantie 3 ans"
                />
              </div>
            </div>
            <div>
              <p className="hub-label">Actions longues — cinq boutons, wrap attendu sur mobile</p>
              <div className="mt-2">
                <PageHeader
                  title="Périphérique MDM-4821"
                  actions={
                    <>
                      <button className="hub-button" type="button" onClick={() => window.alert('Démo : diagnostique')}><Icon name="search" spriteHref={spriteHref} />Diagnostiquer</button>
                      <button className="hub-button hub-button-secondary" type="button" onClick={() => window.alert('Démo : redémarrage')}><Icon name="refresh-cw" spriteHref={spriteHref} />Redémarrer</button>
                      <button className="hub-button hub-button-secondary" type="button" onClick={() => window.alert('Démo : journal')}><Icon name="copy" spriteHref={spriteHref} />Voir le journal</button>
                      <button className="hub-button hub-button-secondary" type="button" onClick={() => window.alert('Démo : verrouillage')}><Icon name="eye" spriteHref={spriteHref} />Verrouiller</button>
                      <button className="hub-button hub-button-secondary" type="button" onClick={() => window.alert('Démo : mise à jour')}><Icon name="upload" spriteHref={spriteHref} />Mettre à jour</button>
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="hub-surface p-5">
          <SectionHeader icon="bell" eyebrow="Structure" title="Modal" />
          <div className="flex flex-wrap gap-2">
            <button className="hub-button" type="button" onClick={() => setModalSmOpen(true)}>Confirmation (sm)</button>
            <button className="hub-button" type="button" onClick={() => setModalMdOpen(true)}>Formulaire 12 champs (md)</button>
            <button className="hub-button" type="button" onClick={() => setModalLgOpen(true)}>Journal dense (lg)</button>
          </div>
          <p className="mt-3 text-sm text-muted">Escape, clic sur le fond et bouton Fermer ferment ; le scroll de page est restauré à la fermeture.</p>

          <Modal
            open={modalSmOpen}
            onClose={() => setModalSmOpen(false)}
            title="Supprimer le fichier ?"
            size="sm"
            footer={
              <>
                <button className="hub-button hub-button-secondary" type="button" onClick={() => setModalSmOpen(false)}>Annuler</button>
                <button className="hub-button" type="button" onClick={() => { setModalSmOpen(false); window.alert('Démo : fichier supprimé'); }}>Supprimer</button>
              </>
            }
          >
            <div className="hub-alert hub-alert-danger"><Icon name="triangle-alert" spriteHref={spriteHref} /><span>Cette action est définitive : « rapport-q3.pdf » (2,4 Mo) sera supprimé pour tous les membres.</span></div>
          </Modal>

          <Modal
            open={modalMdOpen}
            onClose={() => setModalMdOpen(false)}
            title="Déclarer un nouvel équipement"
            size="md"
            footer={
              <>
                <button className="hub-button hub-button-secondary" type="button" onClick={() => setModalMdOpen(false)}>Annuler</button>
                <button className="hub-button" type="button" onClick={() => { setModalMdOpen(false); window.alert('Démo : équipement enregistré'); }}><Icon name="save" spriteHref={spriteHref} />Enregistrer</button>
              </>
            }
          >
            <div className="grid gap-4">
              {equipmentFormFields.map((field) => (
                <label className="hub-field" key={field.label}>
                  <span className="hub-label">{field.label}</span>
                  {field.type === 'select' ? (
                    <select className="hub-select">
                      {field.options.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="hub-input" type={field.type} placeholder={field.placeholder} />
                  )}
                </label>
              ))}
            </div>
          </Modal>

          <Modal
            open={modalLgOpen}
            onClose={() => setModalLgOpen(false)}
            title="Journal d'audit — aujourd'hui"
            size="lg"
            footer={
              <button className="hub-button hub-button-secondary" type="button" onClick={() => setModalLgOpen(false)}>Fermer</button>
            }
          >
            <div className="overflow-x-auto">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Cible</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map(([time, user, action, target]) => (
                    <tr key={time + action + target}>
                      <td className="py-2"><code className="text-xs">{time}</code></td>
                      <td className="py-2">{user}</td>
                      <td className="py-2">{action}</td>
                      <td className="py-2 text-muted">{target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
        </section>

        <section className="hub-surface p-5">
          <SectionHeader icon="copy" eyebrow="Lucide" title="Sprite icon gallery" />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {iconNames.map((name) => (
              <button className="hub-panel flex min-h-20 flex-col items-center justify-center gap-2 p-3 text-sm" type="button" key={name} title={name}>
                <Icon name={name} spriteHref={spriteHref} />
                <span className="max-w-full truncate text-muted">{name}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);