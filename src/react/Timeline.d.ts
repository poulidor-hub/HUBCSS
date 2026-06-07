export interface TimelineEvent {
  id?: string | number;
  timestamp: string;
  title: string;
  description?: string;
  dot?: 'default' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
  tag?: 'info' | 'action' | 'danger' | 'success' | 'warning';
}

export interface TimelineProps {
  events?: TimelineEvent[];
  emptyText?: string;
  className?: string;
}

export function Timeline(props: TimelineProps): JSX.Element;
export default Timeline;
