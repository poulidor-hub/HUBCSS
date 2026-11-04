// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

export interface TimelineEvent {
  id?: string | number;
  timestamp?: string;
  created_at?: string;
  title?: string;
  description?: string;
  action?: string;
  actionLabel?: string;
  tag?: 'info' | 'action' | 'danger' | 'success' | 'warning';
  dot?: 'default' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
  username?: string;
  app_slug?: string;
}

export interface TimelineActionType {
  key: string;
  label: string;
}

export interface TimelineProps {
  events?: TimelineEvent[];
  emptyText?: string;
  className?: string;
  mode?: 'vertical' | 'horizontal';

  /* Horizontal mode props */
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (start: string, end: string) => void;
  selectedEventId?: string | number;
  onSelectEvent?: (event: TimelineEvent) => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: (show: boolean) => void;
  actionFilters?: Set<string>;
  onActionFiltersChange?: (filters: Set<string>) => void;
  allActionTypes?: TimelineActionType[];
  children?: any;
  filterSelect?: {
    placeholder?: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  };
}

export function Timeline(props: TimelineProps): JSX.Element;
export default Timeline;
