import { JSX } from 'react';

import { Spinner } from '@nextui-org/spinner';

import { Button } from '@/components/ui';
import { baseDialogStyle as S } from '@/shared/styled';

type TDialogActionButtonProps = {
  buttons: {
    text: string;
    variant:
      | 'default'
      | 'pagination'
      | 'pagination-ghost'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link'
      | 'purple'
      | 'teal'
      | 'white'
      | 'rose'
      | 'amber';
    onClick: () => void;
    disabled?: boolean;
    isPending?: boolean;
    loadingColor?: 'current' | 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'dialog' | 'table' | 'full';
  }[];
};

/**
 * * 다이얼로그 액션 버튼 컴포넌트
 * @param {TDialogActionButtonProps} props 다이얼로그 액션 버튼 컴포넌트 속성
 * @returns {JSX.Element} 다이얼로그 액션 버튼 컴포넌트
 */
export const DialogActionButton = ({ buttons }: TDialogActionButtonProps): JSX.Element => {
  return (
    <S.ButtonWrapper>
      {buttons.map((button, index) => (
        <Button
          key={`DIALOG-ACTION-BUTTON-${index}`}
          onClick={button.onClick}
          variant={button.variant}
          size={button?.size ?? 'dialog'}
          disabled={button?.disabled}
        >
          {button?.isPending ? <Spinner color={button?.loadingColor} /> : button.text}
        </Button>
      ))}
    </S.ButtonWrapper>
  );
};
