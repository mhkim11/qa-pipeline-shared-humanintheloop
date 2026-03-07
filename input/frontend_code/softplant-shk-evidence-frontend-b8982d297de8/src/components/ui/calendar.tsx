import * as React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DropdownProps } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button-variants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type TCalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * * shadcn Calendar 컴포넌트
 * @param {TCalendarProps} props Calendar 컴포넌트 props
 * @returns {JSX.Element} Calendar 컴포넌트
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: TCalendarProps): JSX.Element {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption_start: 'is-start',
        caption_between: 'is-between',
        caption_end: 'is-end',
        caption: 'flex justify-center pt-1 relative items-center gap-1',
        caption_label: 'flex h-7 text-sm font-medium justify-center items-center grow [.is-multiple_&]:flex',
        caption_dropdowns: 'flex flex-row-reverse justify-center gap-1 grow dropdowns pl-8 pr-9',
        multiple_months: 'is-multiple',
        vhidden: 'hidden [.is-between_&]:flex [.is-end_&]:flex [.is-start.is-end_&]:hidden',
        nav: `flex items-center [&:has([name='previous-month'])]:order-first [&:has([name='next-month'])]:order-last gap-1`,
        nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 text-muted-foreground !transition-none'),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-teal-600',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal !transition-none aria-selected:!bg-teal-600 aria-selected:opacity-100',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-teal-600 text-primary-foreground hover:bg-teal-600 hover:text-primary-foreground focus:bg-teal-600 focus:text-primary-foreground',
        day_today: 'bg-teal-600 text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-teal-600 aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, children }: DropdownProps) => {
          const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          /**
           * * Handle change event
           * @param {string} handleValue - value
           * @returns {void}
           */
          const handleChange = (handleValue: string): void => {
            const changeEvent = {
              target: { value: handleValue },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(onChangeValue) => {
                handleChange(onChangeValue);
              }}
            >
              <SelectTrigger className='border-0 border-white pr-1.5 ring-0 ring-white focus:outline-none focus:ring-0 focus:ring-white'>
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position='popper' className='z-[9999]'>
                <ScrollArea className='min-h-16'>
                  {options.map((option, id: number) => (
                    <SelectItem key={`${option.props.value}_${id}`} value={option.props.value?.toString() ?? ''}>
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: () => <ChevronLeft data-cy='calendarLeft' className='h-4 w-4' />,
        IconRight: () => <ChevronRight data-cy='calendarRight' className='h-4 w-4' />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
