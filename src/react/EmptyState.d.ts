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
