import { JSX } from 'react';

type TTableTitleProps = {
  title: string;
};

/**
 * * 테이블 타이틀 컴포넌트
 * @param {TTableTitleProps} props - 타이틀 속성
 * @returns {JSX.Element} 테이블 타이틀 컴포넌트
 */
export const TableTitle = ({ title }: TTableTitleProps): JSX.Element => {
  return (
    <div className='flex w-full items-center justify-between gap-y-5 py-1 md:gap-y-0'>
      <div className='flex min-h-[40px] min-w-[100px] items-center gap-x-1 text-xl pretendard-semibold xs:min-w-[120px]'>{title}</div>
    </div>
  );
};
