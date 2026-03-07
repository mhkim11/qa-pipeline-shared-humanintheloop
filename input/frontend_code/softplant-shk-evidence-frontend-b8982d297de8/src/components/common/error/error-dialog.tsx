import { ReactElement } from 'react';

import { includes, isArray, map } from 'lodash-es';
import { useRouteError } from 'react-router-dom';

import { DialogWrapperLayout } from '@/components/common';
import { cn } from '@/lib/utils';
import { errorStyle as S } from '@/shared/styled';

type TErrorDialogProps = {
  open: boolean;
  onSetOpen: (value: boolean) => void;
};

/**
 * * 에러 다이알로그 컴포넌트
 * @param {TErrorDialogProps} props - props
 * @returns {ReactElement} 에러 다이알로그 컴포넌트
 */
export const ErrorDialog = ({ open, onSetOpen }: TErrorDialogProps): ReactElement => {
  const error = useRouteError() as Error | undefined;

  const errorResult = includes(error?.stack, '\n') ? error?.stack?.split('\n') : error?.stack;

  return (
    <DialogWrapperLayout
      isOpen={open}
      onSetIsOpen={onSetOpen}
      title='에러'
      subTitle='에러 발생'
      className={cn({
        'min-h-[320px] max-w-[1024px] p-10': true,
      })}
    >
      <S.ErrorModalBox>
        {isArray(errorResult)
          ? map(errorResult, (err, index) => {
              return <div key={index}>{err}</div>;
            })
          : JSON.stringify(`${errorResult}`)}
        <S.ErrorHighlight>
          <S.ErrorText>자세한 사항은 개발자 도구에서 확인해주세요.</S.ErrorText>
        </S.ErrorHighlight>
      </S.ErrorModalBox>
    </DialogWrapperLayout>
  );
};
