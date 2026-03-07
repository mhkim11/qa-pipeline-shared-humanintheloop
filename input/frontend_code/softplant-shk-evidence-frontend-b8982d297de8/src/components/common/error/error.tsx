import { ReactElement, useCallback, useState } from 'react';

import { ErrorDialog } from '@components/common';
import { onClearCachedImageDataAll } from '@/components/utils';
import { useLoginStore } from '@/hooks/stores';
import { errorStyle as S } from '@/shared/styled';

/**
 * * 에러 컴포넌트
 * @returns {ReactElement} 에러 컴포넌트
 */
export const Error = (): ReactElement => {
  // ! jotai atom 모음
  const { dispatchLogin } = useLoginStore();

  // ! 기본 state 모음
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(true);

  // ! useCallback 모음
  const onSetIsErrorOpen = useCallback((value: boolean) => {
    setIsErrorOpen(value);
  }, []);

  return (
    <>
      <S.Container>
        <S.WarningIcon />
        <S.Title>잠시 페이지에 문제가 생겼습니다!</S.Title>
        <S.Title>잠시 후 새로고침이 됩니다.</S.Title>
        <S.SubTitle>만약 새로고침이 되지 않는다면 아래 버튼을 눌러</S.SubTitle>
        <S.SubTitle>새로고침을 진행해주세요.</S.SubTitle>
        <S.ErrorButton
          type='button'
          onClick={async (): Promise<void> => {
            await onClearCachedImageDataAll();
            dispatchLogin({ type: 'LOGOUT' });
            window.location.reload();
          }}
        >
          새로고침
        </S.ErrorButton>
        {process.env.NODE_ENV === 'development' && (
          <S.ErrorButton type='button' onClick={(): void => setIsErrorOpen(true)}>
            에러 보기
          </S.ErrorButton>
        )}
      </S.Container>
      {process.env.NODE_ENV === 'development' && <ErrorDialog open={isErrorOpen} onSetOpen={onSetIsErrorOpen} />}
    </>
  );
};
