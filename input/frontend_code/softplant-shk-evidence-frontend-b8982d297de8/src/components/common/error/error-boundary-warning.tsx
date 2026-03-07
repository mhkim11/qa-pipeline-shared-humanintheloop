import { JSX } from 'react';

import { size } from 'lodash-es';
import { TwStyle } from 'twin.macro';

import { errorStyle as S } from '@styled/default';
import { Button } from '@/components/ui/button';

type TErrorBoundaryWarningProps = {
  error: any;
  resetErrorBoundary: () => void;
  titleTexts?: {
    title?: string[];
    subTitle?: string[];
  };
  classNames?: {
    wrapper?: TwStyle;
  };
};

/**
 * ErrorBoundaryWarning 컴포넌트
 * @param {TErrorBoundaryWarningProps} props ErrorBoundaryWarning 컴포넌트 props
 * @returns {ReactElement} ErrorBoundaryWarning 컴포넌트
 */
export const ErrorBoundaryWarning = ({ error: _error, resetErrorBoundary, titleTexts }: TErrorBoundaryWarningProps): JSX.Element => {
  return (
    <S.ErrorBoundaryWrapper>
      <S.WarningIcon />
      {size(titleTexts?.title) === 0 ? (
        <>
          <S.Title>{'네트워크 통신에 잠시 문제가 생겼습니다!'}</S.Title>
          <S.Title>{'새로고침을 진행 해주세요.'}</S.Title>
        </>
      ) : (
        titleTexts?.title?.map((text, index) => <S.Title key={index}>{text}</S.Title>)
      )}
      {size(titleTexts?.title) === 0 ? (
        <>
          <S.SubTitle>새로고침을 진행을 해도 문제가 지속될 경우,</S.SubTitle>
          <S.SubTitle className='text-rose-500'>로그아웃 후 다시 로그인 해주세요.</S.SubTitle>
        </>
      ) : (
        titleTexts?.subTitle?.map((text, index) => <S.SubTitle key={index}>{text}</S.SubTitle>)
      )}
      <Button
        onClick={() => {
          resetErrorBoundary();
        }}
      >
        {'새로고침'}
      </Button>
    </S.ErrorBoundaryWrapper>
  );
};
