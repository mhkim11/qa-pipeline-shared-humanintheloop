import { JSX } from 'react';

import { Button } from '@/components/ui';

type TTableDetailSmallButtonProps = {
  onClick: () => void;
  text?: string;
  icon?: React.ReactNode;
};

/**
 * * 테이블 상세보기 작은 버튼 컴포넌트
 * @param {TTableDetailSmallButtonProps} props - 테이블 상세보기 작은 버튼 컴포넌트 속성
 * @returns {JSX.Element} 테이블 상세보기 작은 버튼 컴포넌트
 */
export const TableDetailSmallButton = ({ onClick, text = '상세보기', icon }: TTableDetailSmallButtonProps): JSX.Element => {
  return (
    <Button type='button' variant={'outline'} size='table' onClick={onClick}>
      {text ? (
        <>
          {text} {icon}
        </>
      ) : (
        <>{icon}</>
      )}
    </Button>
  );
};
