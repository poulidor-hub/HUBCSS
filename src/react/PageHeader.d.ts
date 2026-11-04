// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  back?: {
    onClick: () => void;
    label?: string;
  };
  badge?: ReactNode;
  version?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export declare const PageHeader: (props: PageHeaderProps) => import('react').ReactElement;
export default PageHeader;
