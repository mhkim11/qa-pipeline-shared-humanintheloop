import { useMemo, type ComponentPropsWithoutRef } from 'react';

import { CircleIcon } from 'lucide-react';

import { useComboboxContext } from '@/components/ui/combobox/context';
import type { TComboboxItemBase } from '@/components/ui/combobox/types';
import { cn } from '@/lib/utils';

export type TComboboxItemProps = TComboboxItemBase & ComponentPropsWithoutRef<'li'>;

export const ComboboxItem = ({ label, value, disabled, className, children, ...props }: TComboboxItemProps) => {
  const { filteredItems, getItemProps, selectedItem } = useComboboxContext();

  const isSelected = selectedItem?.value === value;
  const item = useMemo(() => ({ disabled, label, value }), [disabled, label, value]);
  const index = (filteredItems || []).findIndex((itemValue) => itemValue.value.toLowerCase() === value.toLowerCase());
  if (index < 0) return null;

  return (
    <li
      {...props}
      data-index={index}
      className={cn(
        `relative flex cursor-default select-none flex-col rounded-sm px-3 py-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-selected:bg-accent aria-selected:text-accent-foreground`,
        !children && 'ps-8',
        className,
      )}
      {...getItemProps?.({ item, index })}
    >
      {children || (
        <>
          <span className='text-sm text-foreground'>{label}</span>
          {isSelected && (
            <span className='absolute start-3 top-0 flex h-full items-center justify-center'>
              <CircleIcon className='size-2 fill-current' />
            </span>
          )}
        </>
      )}
    </li>
  );
};
