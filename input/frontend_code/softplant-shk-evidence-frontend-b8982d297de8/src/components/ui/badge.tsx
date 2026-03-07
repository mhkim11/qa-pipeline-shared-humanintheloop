import * as React from 'react';

import { type VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@/components/ui/badge-variants';
import { cn } from '@/lib/utils';

export interface IBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * * 뱃지 컴포넌트
 * @param {IBadgeProps} props 뱃지 프롭스
 * @returns {React.ReactElement} 뱃지 컴포넌트
 */
function Badge({ className, variant, ...props }: IBadgeProps): React.ReactElement {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
