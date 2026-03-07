import type { ComponentPropsWithoutRef } from 'react';

import { useComboboxContext } from '@/components/ui/combobox/context';
import { cn } from '@/lib/utils';

export const ComboboxEmpty = ({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) => {
  const { filteredItems } = useComboboxContext();
  if (filteredItems && filteredItems.length > 0) return null;

  return (
    <div {...props} className={cn('p-4 text-center text-sm text-muted-foreground', className)}>
      {children}
    </div>
  );
};
