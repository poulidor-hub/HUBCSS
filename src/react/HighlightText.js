// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import { createElement, useMemo, Fragment } from 'react';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightText({ text, term, className = '', markClassName = 'hub-highlight-mark' }) {
  const parts = useMemo(() => {
    if (!term || !text) return null;
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    return String(text).split(regex);
  }, [text, term]);

  if (!parts) {
    return createElement('span', { className }, text);
  }

  return createElement(
    'span',
    { className },
    ...parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase()
        ? createElement('mark', { key: i, className: markClassName }, part)
        : createElement(Fragment, { key: i }, part),
    ),
  );
}

export default HighlightText;
