// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import { createElement, useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon.js';

export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Rechercher...',
  debounceMs = 400,
  className = '',
  autoFocus = false,
  clearable = true,
}) {
  const [inputValue, setInputValue] = useState(controlledValue ?? '');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const isControlled = controlledValue !== undefined;
  const displayValue = isControlled ? controlledValue : inputValue;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const emitSearch = useCallback(
    (term) => {
      if (onSearch) onSearch(term);
      if (onChange) onChange(term);
    },
    [onSearch, onChange],
  );

  const handleInput = useCallback(
    (e) => {
      const v = e.target.value;
      if (!isControlled) setInputValue(v);
      if (onChange) onChange(v);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        emitSearch(v);
      }, debounceMs);
    },
    [isControlled, onChange, emitSearch, debounceMs],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) setInputValue('');
    emitSearch('');
    if (inputRef.current) inputRef.current.focus();
  }, [isControlled, emitSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear],
  );

  return createElement(
    'div',
    { className: `hub-search-input-wrapper ${className}`.trim() },
    createElement(Icon, {
      name: 'search',
      size: 16,
      className: 'hub-icon hub-search-input-icon',
    }),
    createElement('input', {
      ref: inputRef,
      type: 'text',
      className: 'hub-input hub-search-input',
      placeholder,
      value: displayValue,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      autoComplete: 'off',
      spellCheck: false,
    }),
    clearable &&
      displayValue &&
      createElement(
        'button',
        {
          type: 'button',
          className: 'hub-search-input-clear',
          onClick: handleClear,
          'aria-label': 'Effacer la recherche',
          tabIndex: -1,
        },
        createElement(
          'svg',
          {
            width: 14,
            height: 14,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
          },
          createElement('path', { d: 'M18 6 6 18M6 6l12 12' }),
        ),
      ),
  );
}

export default SearchInput;
