// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import { createElement, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container) {
  return Array.prototype.filter.call(
    container.querySelectorAll(FOCUSABLE_SELECTOR),
    (element) => element.tabIndex >= 0,
  );
}

// Module-level scroll-lock counter: stacked modals each hold one unit,
// body overflow is restored only when the last one closes.
let openModalCount = 0;

export function Modal({
  open = false,
  onClose,
  title,
  size = 'md',
  footer,
  children,
  closeOnBackdrop = true,
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  // The document keydown listener is registered once per open cycle; the
  // latest-ref pattern keeps it from calling a stale `onClose` prop.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    // Scroll-lock (d) + remember the trigger for focus restore (c).
    openModalCount += 1;
    document.body.style.overflow = 'hidden';
    const trigger = document.activeElement;

    // Initial focus on the first focusable (b) — the close button by default.
    const focusable = getFocusableElements(dialog);
    if (focusable.length > 0) focusable[0].focus();

    // Escape closes, Tab cycles focus inside the dialog (a).
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = getFocusableElements(dialog);
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const index = list.indexOf(document.activeElement);
      if (event.shiftKey && (index === 0 || index === -1)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (index === list.length - 1 || index === -1)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = '';
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const sizeClass = size !== 'md' ? ` hub-modal--${size}` : '';

  return createPortal(
    createElement(
      'div',
      {
        className: 'hub-modal-backdrop',
        onClick: () => {
          if (closeOnBackdrop) onClose();
        },
      },
      createElement(
        'div',
        {
          ref: dialogRef,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': titleId,
          className: `hub-modal${sizeClass}`,
          onClick: (event) => event.stopPropagation(),
        },
        createElement(
          'header',
          { className: 'hub-modal-header' },
          createElement('h2', { id: titleId, className: 'hub-modal-title' }, title),
          createElement(
            'button',
            {
              type: 'button',
              className: 'hub-icon-button',
              style: { marginLeft: 'auto' },
              'aria-label': 'Fermer',
              onClick: onClose,
            },
            '✕',
          ),
        ),
        createElement('div', { className: 'hub-modal-body' }, children),
        footer && createElement('footer', { className: 'hub-modal-footer' }, footer),
      ),
    ),
    document.body,
  );
}

export default Modal;
