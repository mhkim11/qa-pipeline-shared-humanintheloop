import * as React from 'react';
import { useImperativeHandle } from 'react';

import { cn } from '@/lib/utils';

interface IUseAutoSizeTextAreaProps {
  textAreaRef: HTMLTextAreaElement | null;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
}

/**
 * * textarea auto size hook
 * @param {IUseAutoSizeTextAreaProps} props - props
 * @returns {void} 없음
 */
const useAutoSizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: IUseAutoSizeTextAreaProps): void => {
  const [isInit, setIsInit] = React.useState(true);
  React.useEffect(() => {
    // We need to reset the height momentarily to get the correct scrollHeight for the textarea
    // const offsetBorder = 2;
    if (textAreaRef) {
      if (isInit) {
        textAreaRef.style.minHeight = `${minHeight}px`;
        if (maxHeight > minHeight) {
          textAreaRef.style.maxHeight = `${maxHeight}px`;
        }
        setIsInit(false);
      }
      textAreaRef.style.height = `${minHeight}px`;
      const scrollHeight = textAreaRef.scrollHeight;
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      if (scrollHeight > maxHeight) {
        textAreaRef.style.height = `${maxHeight}px`;
      } else {
        textAreaRef.style.height = `${scrollHeight}px`;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAreaRef, triggerAutoSize]);
};

export type TAutoSizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
};

type TAutoSizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutoSizeTextarea = React.forwardRef<TAutoSizeTextAreaRef, TAutoSizeTextAreaProps>(
  (
    { maxHeight = Number.MAX_SAFE_INTEGER, minHeight = 40, className, onChange, value, ...props }: TAutoSizeTextAreaProps,
    ref: React.Ref<TAutoSizeTextAreaRef>,
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState('');

    useAutoSizeTextArea({
      textAreaRef: textAreaRef.current,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      maxHeight,
      minHeight,
    }));

    React.useEffect(() => {
      if (value) {
        setTriggerAutoSize(value as string);
      }
    }, [value]);

    return (
      <textarea
        {...props}
        value={value}
        ref={textAreaRef}
        className={cn(
          'focus:border-0 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'flex h-[40px] w-full rounded-md border-0 bg-transparent px-3 py-2.5 text-sm shadow-sm ring-1 ring-input transition-colors',
          className,
        )}
        onChange={(e) => {
          setTriggerAutoSize(e.target.value);
          onChange?.(e);
        }}
      />
    );
  },
);
AutoSizeTextarea.displayName = 'AutoSizeTextarea';
