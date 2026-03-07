import { JSX } from 'react';

import { Button } from '@/components/ui';

type TTableEditSmallButtonProps = {
  onClick: () => void;
  text?: string;
  icon?: React.ReactNode;
};

/**
 * * 테이블 수정 작은 버튼 컴포넌트
 * @param {TTableEditSmallButtonProps} props - 테이블 수정 작은 버튼 컴포넌트 속성
 * @returns {JSX.Element} 테이블 수정 작은 버튼 컴포넌트
 */
export const TableEditSmallButton = ({ onClick, text = '수정', icon }: TTableEditSmallButtonProps): JSX.Element => {
  return (
    <Button type='button' variant={'teal'} size='table' onClick={onClick}>
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
