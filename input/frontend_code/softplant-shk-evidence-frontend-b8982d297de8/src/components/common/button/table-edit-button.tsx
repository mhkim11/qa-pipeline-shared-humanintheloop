import React from 'react';

import { RiEditBoxLine } from 'react-icons/ri';

import { Button } from '@components/ui';

type TTableEditButtonProps = {
  onClick: () => void;
};

/**
 * * 테이블 수정 버튼 컴포넌트
 * @returns {JSX.Element} 테이블 수정 버튼 컴포넌트
 */
export const TableEditButton = ({ onClick }: TTableEditButtonProps): JSX.Element => {
  return (
    <Button variant='outline' onClick={onClick} className='flex gap-1'>
      수정하기
      <RiEditBoxLine />
    </Button>
  );
};
