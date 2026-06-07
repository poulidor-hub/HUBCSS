import { createElement } from 'react';
import { Icon } from './Icon.js';

const TREND_CLASS = {
  up: 'hub-stat-card-trend--up',
  down: 'hub-stat-card-trend--down',
  neutral: 'hub-stat-card-trend--neutral',
};

const TREND_ICON = {
  up: 'arrow-up',
  down: 'arrow-down',
  neutral: '',
};

export function StatCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  className = '',
}) {
  return createElement(
    'div',
    { className: `hub-stat-card ${className}`.trim() },
    icon &&
      createElement(
        'div',
        { className: 'hub-stat-card-icon' },
        typeof icon === 'string'
          ? createElement(Icon, { name: icon, size: 20 })
          : icon,
      ),
    createElement(
      'div',
      { className: 'hub-stat-card-body' },
      createElement('p', { className: 'hub-stat-card-label' }, label),
      createElement('p', { className: 'hub-stat-card-value' }, value != null ? String(value) : '\u2014'),
      trend &&
        createElement(
          'span',
          { className: `hub-stat-card-trend ${TREND_CLASS[trend] || ''}`.trim() },
          TREND_ICON[trend] && createElement(Icon, { name: TREND_ICON[trend], size: 12 }),
          trendValue && createElement('span', null, trendValue),
        ),
    ),
  );
}

export default StatCard;
