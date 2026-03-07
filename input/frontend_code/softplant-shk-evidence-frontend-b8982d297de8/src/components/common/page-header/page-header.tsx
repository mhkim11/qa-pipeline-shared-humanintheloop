import React from 'react';

import { GoDotFill } from 'react-icons/go';

import { Button } from '@components/ui';
import { cn } from '@lib/utils.ts';

// 페이지 헤더 컴포넌트 Props
type TPageHeaderProps = {
  title: string;
  buttons?: Array<{
    text: string | JSX.Element;
    onClick: () => void;
    className?: string; // 커스텀 스타일을 위한 클래스 이름
    icon?: JSX.Element; // 버튼 아이콘
  }>;
};

/**
 * 공통 페이지 헤더 컴포넌트
 * @returns {JSX.Element} 공통 페이지 헤더 컴포넌트
 */
export const PageHeader = ({ title, buttons = [] }: TPageHeaderProps): JSX.Element => {
  return (
    <div className='mb-4 mt-4 w-full items-start gap-y-3'>
      <div className='flex h-[42px] items-center'>
        <div className='flex w-full items-center gap-x-1 text-2xl text-company-toss-black pretendard-semibold'>
          <GoDotFill className='h-5 w-5 text-teal-600' />
          {title}
        </div>

        <div className='flex gap-x-1.5'>
          {buttons?.map((button, index) => (
            <Button key={`header-button-${index}`} onClick={button.onClick} className={cn(button.className, 'gap-1')}>
              {button.text}
              {button.icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
