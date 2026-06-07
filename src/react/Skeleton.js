import { createElement } from 'react';

export function Skeleton({
  width,
  height = '1em',
  borderRadius,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const style = {};
  if (width) style.width = width;
  if (height && Tag === 'div') style.height = height;
  if (borderRadius) style.borderRadius = borderRadius;

  return createElement(Tag, {
    className: `hub-skeleton ${className}`.trim(),
    style: Object.keys(style).length > 0 ? style : undefined,
    'aria-hidden': 'true',
    ...props,
  });
}

export function SkeletonText({ lines = 3, gap = '0.75rem', lastWidth = '60%', className = '' }) {
  return createElement(
    'div',
    { className: `hub-skeleton-text ${className}`.trim(), style: { display: 'flex', flexDirection: 'column', gap }, 'aria-busy': 'true' },
    ...Array.from({ length: lines }, (_, i) =>
      createElement(Skeleton, {
        key: i,
        width: i === lines - 1 ? lastWidth : '100%',
        height: '0.875rem',
      }),
    ),
  );
}

export default Skeleton;
