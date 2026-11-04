// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

export interface SearchBadgeBarProps {
  detectedFields?: string[];
  excludedFields?: Set<string>;
  fieldLabels?: Record<string, string>;
  onToggleField?: (field: string) => void;
  onReset?: () => void;
  searchTerm?: string;
  size?: 'sm' | 'lg';
}

export declare const SearchBadgeBar: (props: SearchBadgeBarProps) => import('react').ReactElement | null;
export default SearchBadgeBar;
