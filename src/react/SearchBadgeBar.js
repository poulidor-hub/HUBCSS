import { createElement, Fragment } from 'react';

export function SearchBadgeBar({
  detectedFields = [],
  excludedFields = new Set(),
  fieldLabels = {},
  onToggleField,
  onReset,
  searchTerm,
  size = 'sm',
}) {
  if (!searchTerm || detectedFields.length === 0) return null;

  const sizeClass = size === 'lg' ? 'hub-badge--pill-lg' : '';

  return createElement(
    'div',
    { className: 'hub-search-badge-bar' },
    createElement('span', { className: 'hub-search-badge-label' }, 'Trouv\u00e9 dans :'),
    ...detectedFields.map((field) => {
      const excluded = excludedFields.has(field);
      const label = fieldLabels[field] || field;

      return createElement(
        'button',
        {
          key: field,
          type: 'button',
          className: `hub-badge hub-search-badge ${excluded ? 'hub-search-badge--excluded' : ''} ${sizeClass}`.trim(),
          'aria-pressed': !excluded,
          title: excluded
            ? `R\u00e9activer les r\u00e9sultats via \u00ab\u00a0${label}\u00a0\u00bb`
            : `Exclure les r\u00e9sultats via \u00ab\u00a0${label}\u00a0\u00bb`,
          onClick: () => onToggleField?.(field),
        },
        label,
        createElement(
          'svg',
          {
            width: 12,
            height: 12,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            className: 'hub-search-badge-icon',
          },
          createElement('path', {
            d: excluded ? 'M12 5v14M5 12h14' : 'M18 6L6 18M6 6l12 12',
          }),
        ),
      );
    }),
    excludedFields.size > 0 &&
      createElement(
        'button',
        {
          key: 'reset',
          type: 'button',
          className: 'hub-search-badge-reset',
          onClick: () => onReset?.(),
        },
        'Tout r\u00e9activer',
      ),
  );
}

export default SearchBadgeBar;
