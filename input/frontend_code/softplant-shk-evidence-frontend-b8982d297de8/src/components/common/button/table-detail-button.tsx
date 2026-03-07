import React from 'react';

import { BiMessageSquareDetail } from 'react-icons/bi';

import { Button } from '@components/ui';

type TTableDetailButtonProps = {
  onClick: () => void;
};

/**
 * * 테이블 상세 보기 버튼 컴포넌트
 * @returns {JSX.Element} 테이블 상세 보기 버튼 컴포넌트
 */
export const TableDetailButton = ({ onClick }: TTableDetailButtonProps): JSX.Element => {
  return (
    <Button variant='outline' onClick={onClick} className='flex gap-1'>
      상세보기
      <BiMessageSquareDetail />
    </Button>
  );
};
