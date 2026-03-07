import { useId, useState, useRef } from 'react';

import { size } from 'lodash-es';
import { Eye, EyeOff } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TBasePasswordInput = {
  value: string;
  onValueChange: (value: string) => void;
  classNames?: {
    input?: string;
    inputFocused?: string;
  };
  placeholder?: string;
  onFocus?: () => void; //
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const BasePasswordInput = ({
  classNames,
  value,
  placeholder = '비밀번호를 입력해주세요',
  onValueChange,
  onKeyDown,
  onFocus,
}: TBasePasswordInput) => {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isBackspace, setIsBackspace] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ! react-hook-form 모음
  const { setValue, control } = useForm({
    mode: 'onChange',
    values: {
      password: value,
      passwordArray: value?.split('') ?? [],
    },
  });

  const aliasPassword = useWatch({ control, name: 'password' });
  const passwordArray = useWatch({ control, name: 'passwordArray' });

  const onSelectionChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart ?? 0);
      setSelectionRange({
        start: inputRef.current.selectionStart ?? 0,
        end: inputRef.current.selectionEnd ?? 0,
      });
    }
  };

  const onClear = () => {
    setValue('password', aliasPassword.replace(/./g, '•'));
    setValue('passwordArray', aliasPassword.replace(/./g, '•').split(''));
    setIsFocused(false);
    setIsBackspace(false);
  };

  const onToggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <div
      className={cn(
        'relative w-[98%] rounded-md ring-1 ring-neutral-300',
        isFocused && (classNames?.inputFocused ?? 'ring-2 ring-ring'),
        classNames?.input,
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      <Input
        ref={inputRef}
        id={id}
        className={cn('w-full pe-9 text-transparent opacity-0 selection:bg-transparent selection:text-transparent')}
        type={'text'}
        value={value}
        autoComplete='off'
        onChange={(e) => {
          onValueChange(e.target.value.trim());
          onSelectionChange();
          setValue('password', e.target.value.trim());
          setValue('passwordArray', e.target.value.trim().split(''));

          if (size(e.target.value) > size(aliasPassword)) {
            setIsBackspace(false);
          } else {
            setIsBackspace(true);
          }
        }}
        onSelect={onSelectionChange}
        onFocus={(_e) => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          onClear();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onClear();
          }

          onKeyDown?.(e);
        }}
      />
      {size(passwordArray) === 0 && <div className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#bababa]'>{placeholder}</div>}
      <div
        className={cn(
          'pointer-events-none absolute left-0 top-0 box-border flex h-full w-full items-center rounded-md p-3 pr-12 text-base text-gray-800',
        )}
      >
        <div className={cn('flex max-w-fit overflow-hidden')}>
          {cursorPosition === 0 && isFocused && (
            <div className='flex items-center'>
              <div className='ml-0.5 inline-block h-5 w-[1px] animate-[blink_1s_ease-in-out_infinite] bg-gray-800'></div>
            </div>
          )}
          {isVisible ? (
            <>
              {value.split('').map((char, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center text-sm',
                    selectionRange && index >= selectionRange.start && index < selectionRange.end && 'bg-blue-200',
                  )}
                >
                  {char}
                  {isFocused && index === cursorPosition - 1 && (
                    <div className='ml-0.5 inline-block h-5 w-[1px] animate-[blink_1s_ease-in-out_infinite] bg-gray-800'></div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {passwordArray.map((char: string, index: number) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center text-sm',
                    selectionRange && index >= selectionRange.start && index < selectionRange.end && 'bg-blue-200',
                  )}
                >
                  {isBackspace ? '•' : index === passwordArray.length - 1 ? char : '•'}
                  {isFocused && index === cursorPosition - 1 && (
                    <div className='ml-0.5 inline-block h-5 w-[1px] animate-[blink_1s_ease-in-out_infinite] bg-gray-800'></div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <button
        className='absolute inset-y-0 right-3 flex h-full w-12 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        type='button'
        onClick={onToggleVisibility}
        aria-label={!isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={!isVisible}
        aria-controls='password'
      >
        {!isVisible ? <EyeOff size={16} strokeWidth={2} aria-hidden='true' /> : <Eye size={16} strokeWidth={2} aria-hidden='true' />}
      </button>
    </div>
  );
};
