import { createContext, useContext } from 'react';

import type { TComboboxItemBase } from '@/components/ui/combobox/types';

import type { UseComboboxReturnValue } from 'downshift';

export type TComboboxContextValue = Partial<
  Pick<
    UseComboboxReturnValue<TComboboxItemBase>,
    | 'getInputProps'
    | 'getItemProps'
    | 'getMenuProps'
    | 'highlightedIndex'
    | 'inputValue'
    | 'isOpen'
    | 'selectedItem'
    | 'selectItem'
    | 'setInputValue'
  > & {
    filteredItems: TComboboxItemBase[];
    items: TComboboxItemBase[];
    onItemsChange: (items: TComboboxItemBase[]) => void;
    onValueChange: (value: string | null) => void;
    openedOnce: boolean;
    telNoValue: string;
  }
>;

export const ComboboxContext = createContext<TComboboxContextValue>({});

export const useComboboxContext = () => useContext(ComboboxContext);
