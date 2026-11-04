// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

export interface HighlightTextProps {
  text?: string;
  term?: string;
  className?: string;
  markClassName?: string;
}

export declare const HighlightText: (props: HighlightTextProps) => import('react').ReactElement | null;
export default HighlightText;
