import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type TToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * * shadcn Toaster 컴포넌트
 * @description Toaster 컴포넌트입니다.
 * @param {TToasterProps} props - Toaster props
 * @returns {JSX.Element} Toaster 컴포넌트
 */
const Toaster = ({ ...props }: TToasterProps): JSX.Element => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as TToasterProps['theme']}
      // DocumentSplitModal uses extremely high z-index (>= 2,147,483,000).
      // Keep toaster above all modals so error/success toasts are always visible.
      className='toaster group z-[2147483647]'
      toastOptions={{
        classNames: {
          toast:
            'ring-1 ring-zinc-200 group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: '!ring-0 !bg-white !text-zinc-800 border !border-zinc-200 size-6',
          title: 'text-sm sm:text-base',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
