// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: string | ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export declare const EmptyState: (props: EmptyStateProps) => import('react').ReactElement;
export default EmptyState;
