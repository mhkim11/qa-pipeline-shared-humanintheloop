import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors pretendard-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#404249] text-white hover:bg-[#404249]/90',
        pagination: 'bg-[#FAFAFC] text-primary ring-1 ring-[#E7E7EB] hover:bg-[#FAFAFC]/90',
        'pagination-ghost': 'hover:bg-[#FAFAFC]/80 hover:text-accent-foreground hover:ring-1 hover:ring-[#E7E7EB]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-neutral-300 bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        purple: 'bg-purple-500 text-white hover:bg-purple-400',
        teal: 'bg-teal-600 text-white hover:bg-teal-500',
        white: 'bg-white text-black hover:bg-neutral-50',
        rose: 'bg-rose-500 text-white hover:bg-rose-400',
        amber: 'bg-amber-500 text-white hover:bg-amber-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        'small-icon': 'h-8 w-8',
        dialog: 'h-10 w-full px-4 py-2 pretendard-semibold sm:w-32',
        table: 'h-7 px-4 py-2 text-xs',
        full: 'flex h-10 w-full items-center justify-center px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
