import React from 'react';

import { MdOutlineDelete } from 'react-icons/md';

import { Button } from '@components/ui';

type TTableDeleteButtonProps = {
  onClick: () => void;
};

/**
 * * 테이블 삭제 버튼 컴포넌트
 * @returns {JSX.Element} 테이블 삭제 버튼 컴포넌트
 */
export const TableDeleteButton = ({ onClick }: TTableDeleteButtonProps): JSX.Element => {
  return (
    <Button variant='outline' onClick={onClick} className='flex gap-1'>
      삭제하기
      <MdOutlineDelete />
    </Button>
  );
};
