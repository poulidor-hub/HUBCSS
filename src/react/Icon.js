import { createElement, memo } from 'react';

// Défaut modifiable globalement : les apps servent le sprite sous
// /design-system/current/icons/ (layout de seed template) alors que le
// serveur DS le sert à la racine. Chaque consommateur appelle
// setIconSpriteHref() une fois au boot ; les composants qui instancient
// Icon en interne (StatCard, EmptyState, SearchInput, SearchBadgeBar)
// héritent du réglage.
let defaultSpriteHref = '/design-system/icons/lucide.svg';

export function setIconSpriteHref(href) {
  defaultSpriteHref = href;
}

function normalizeIconName(name) {
  return name.startsWith('icon-') ? name : `icon-${name}`;
}

export const Icon = memo(function Icon({
  name,
  title,
  size = 20,
  spriteHref = defaultSpriteHref,
  className = 'hub-icon',
  ...props
}) {
  const symbolId = normalizeIconName(name);
  const ariaProps = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': 'true' };

  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      className,
      ...ariaProps,
      ...props,
    },
    title ? createElement('title', null, title) : null,
    createElement('use', { href: `${spriteHref}#${symbolId}` }),
  );
});

export default Icon;