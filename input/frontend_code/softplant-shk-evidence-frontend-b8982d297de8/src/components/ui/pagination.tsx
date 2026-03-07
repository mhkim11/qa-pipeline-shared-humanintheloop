import * as React from 'react';

import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';

import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

/**
 * * Pagination 컴포넌트
 * @param {React.ComponentProps<'nav'>} props - 네비게이션 컴포넌트에 필요한 props
 * @returns  {JSX.Element} Pagination 컴포넌트
 */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>): JSX.Element => (
  <nav role='navigation' aria-label='pagination' className={cn('flex', className)} {...props} />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type TPaginationLinkProps = {
  isActive?: boolean;
  size?: 'dialog' | 'table' | 'icon' | 'default' | 'sm' | 'lg' | 'small-icon' | 'full' | null;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
/**
 * * PaginationLink 컴포넌트
 * @param {TPaginationLinkProps} props - 페이지 링크 컴포넌트에 필요한 props
 * @returns {JSX.Element} PaginationLink 컴포넌트
 */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: TPaginationLinkProps): JSX.Element => (
  <button
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'pagination' : 'pagination-ghost',
        size,
      }),
      'rounded-sm transition-none',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

/**
 * * PaginationPrevious 컴포넌트
 * @param {React.ComponentProps<typeof PaginationLink>} props - 페이지 이전 컴포넌트에 필요한 props
 * @returns {JSX.Element} PaginationPrevious 컴포넌트
 */
const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>): JSX.Element => (
  <PaginationLink aria-label='Go to previous page' className={cn('gap-1', className)} {...props}>
    <ChevronLeftIcon className='h-4 w-4' />
    <span className='sr-only'>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

/**
 * * PaginationNext 컴포넌트
 * @param {React.ComponentProps<typeof PaginationLink>} props - 페이지 다음 컴포넌트에 필요한 props
 * @returns {JSX.Element} PaginationNext 컴포넌트
 */
const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>): JSX.Element => (
  <PaginationLink aria-label='Go to next page' className={cn('gap-1', className)} {...props}>
    <span className='sr-only'>Next</span>
    <ChevronRightIcon className='h-4 w-4' />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

/**
 * * PaginationEllipsis 컴포넌트
 * @param {React.ComponentProps<'span'>} props - 페이지 이전 컴포넌트에 필요한 props
 * @returns {JSX.Element} PaginationEllipsis 컴포넌트
 */
const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>): JSX.Element => (
  <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <DotsHorizontalIcon className='h-4 w-4' />
    <span className='sr-only'>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis };
