import { JSX, useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { delay } from 'lodash-es';
import { Search } from 'lucide-react';

import { baseFilterStyle as S } from '@styled/common';

type TFilterSearchButtonProps = {
  onClickSearchButton: () => void;
};

/**
 * 필터 검색 버튼 컴포넌트
 * @param {() => void} onClickSearchButton  검색 버튼 클릭 이벤트
 * @returns {JSX.Element} 필터 검색 버튼 컴포넌트
 */
export const FilterSearchButton = ({ onClickSearchButton }: TFilterSearchButtonProps): JSX.Element => {
  // ! 기본 state 모음
  const [isPending, setIsPending] = useState(false);

  return (
    <S.FilterSearchButton
      onClick={() => {
        setIsPending(true);

        onClickSearchButton();

        delay(() => {
          setIsPending(false);
        }, 300);
      }}
      variant='teal'
    >
      {isPending ? (
        <Spinner color='white' size='sm' />
      ) : (
        <>
          <Search className='h-4 w-4' /> 조회하기
        </>
      )}
    </S.FilterSearchButton>
  );
};
