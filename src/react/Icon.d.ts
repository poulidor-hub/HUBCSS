// SPDX-License-Identifier: MIT
// Copyright (C) 2026 POULIDOR Audit & Développement (Valérian Poulidor)

import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  title?: string;
  size?: number | string;
  spriteHref?: string;
}

export declare const Icon: import('react').MemoExoticComponent<(props: IconProps) => import('react').ReactElement>;
export declare function setIconSpriteHref(href: string): void;
export default Icon;