import type { ReactNode } from 'react';

export interface StatCardProps {
  icon?: string | ReactNode;
  label: string;
  value: string | number | null | undefined;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard(props: StatCardProps): JSX.Element;
export default StatCard;
