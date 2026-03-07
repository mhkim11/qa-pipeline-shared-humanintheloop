import type { ComponentPropsWithoutRef } from 'react';

import { PopoverAnchor } from '@radix-ui/react-popover';
import { ChevronDownIcon } from 'lucide-react';

import { useComboboxContext } from '@/components/ui/combobox/context';
import { Input } from '@/components/ui/input';

import type { UseComboboxGetInputPropsReturnValue } from 'downshift';

export type TComboboxInputProps = Omit<ComponentPropsWithoutRef<'input'>, keyof UseComboboxGetInputPropsReturnValue>;

export const ComboboxInput = (props: TComboboxInputProps) => {
  const { getInputProps } = useComboboxContext();

  if (typeof getInputProps !== 'function') return null;

  return (
    <div className='relative w-full' data-combobox-input-wrapper=''>
      <PopoverAnchor asChild>
        <Input {...props} {...getInputProps()} />
      </PopoverAnchor>
      <div className='pointer-events-none absolute inset-y-0 end-3 grid h-full place-items-center'>
        <ChevronDownIcon className='size-4 opacity-50' />
      </div>
    </div>
  );
};
