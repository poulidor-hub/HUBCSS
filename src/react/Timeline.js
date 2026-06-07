import { createElement } from 'react';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Maintenant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const DOT_VARIANTS = {
  default: '',
  muted: 'hub-timeline-dot--muted',
  accent: 'hub-timeline-dot--accent',
  danger: 'hub-timeline-dot--danger',
  success: 'hub-timeline-dot--success',
  warning: 'hub-timeline-dot--warning',
};

const TAG_VARIANTS = {
  info: 'hub-timeline-tag--info',
  action: 'hub-timeline-tag--action',
  danger: 'hub-timeline-tag--danger',
  success: 'hub-timeline-tag--success',
  warning: 'hub-timeline-tag--warning',
};

export function Timeline({ events = [], emptyText = 'Aucun \u00e9v\u00e9nement', className = '' }) {
  if (!events.length) {
    return createElement(
      'div',
      { className: `hub-empty-state ${className}`.trim() },
      createElement('p', { className: 'hub-empty-state-description' }, emptyText),
    );
  }

  return createElement(
    'div',
    { className: `hub-timeline ${className}`.trim() },
    events.map((evt, i) =>
      createElement(
        'div',
        { className: 'hub-timeline-event', key: evt.id || i, style: { animationDelay: `${i * 50}ms` } },
        createElement('div', {
          className: `hub-timeline-dot ${DOT_VARIANTS[evt.dot] || ''}`.trim(),
        }),
        createElement(
          'div',
          { className: 'hub-timeline-time' },
          createElement('span', null, formatTime(evt.timestamp)),
          evt.tag &&
            createElement('span', {
              className: `hub-timeline-tag ${TAG_VARIANTS[evt.tag] || TAG_VARIANTS.info}`.trim(),
            }, evt.tag),
        ),
        evt.title &&
          createElement('p', { className: 'hub-timeline-title' }, evt.title),
        evt.description &&
          createElement('p', { className: 'hub-timeline-description' }, evt.description),
      ),
    ),
  );
}

export default Timeline;
