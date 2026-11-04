// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import { createElement } from 'react';
import { Icon } from './Icon.js';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return createElement(
    'div',
    { className: `hub-empty-state ${className}`.trim() },
    icon &&
      createElement(
        'div',
        { className: 'hub-empty-state-icon' },
        typeof icon === 'string'
          ? createElement(Icon, { name: icon, size: 24 })
          : icon,
      ),
    title &&
      createElement('p', { className: 'hub-empty-state-title' }, title),
    description &&
      createElement('p', { className: 'hub-empty-state-description' }, description),
    action &&
      createElement('div', null, action),
  );
}

export default EmptyState;
