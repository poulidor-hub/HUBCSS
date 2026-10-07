import { createElement } from 'react';

export function PageHeader({ title, back, badge, version, meta, actions }) {
  return createElement(
    'header',
    { className: 'hub-page-header' },
    back &&
      createElement(
        'button',
        {
          type: 'button',
          className: 'hub-page-header-back',
          'aria-label': back.label ?? 'Retour',
          onClick: back.onClick,
        },
        '←',
      ),
    createElement(
      'div',
      { className: 'hub-page-header-heading' },
      createElement(
        'div',
        { className: 'hub-page-header-titlerow' },
        createElement('h1', { className: 'hub-page-header-title' }, title),
        badge &&
          createElement('span', { className: 'hub-page-header-badge' }, badge),
      ),
      (version || meta) &&
        createElement(
          'div',
          { className: 'hub-page-header-meta' },
          version &&
            createElement('span', { className: 'hub-version-pill' }, `v${version}`),
          meta,
        ),
    ),
    actions &&
      createElement('div', { className: 'hub-page-header-actions' }, actions),
  );
}

export default PageHeader;
