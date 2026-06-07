import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLElement> {
  width?: string;
  height?: string;
  borderRadius?: string;
  as?: keyof JSX.IntrinsicElements;
}

export declare const Skeleton: (props: SkeletonProps) => import('react').ReactElement;

export interface SkeletonTextProps {
  lines?: number;
  gap?: string;
  lastWidth?: string;
  className?: string;
}

export declare const SkeletonText: (props: SkeletonTextProps) => import('react').ReactElement;
export default Skeleton;
