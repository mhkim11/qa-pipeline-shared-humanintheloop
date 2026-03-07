import { ComponentProps } from 'react';

import { X } from 'lucide-react';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

export const Container = withDefaultProps<ComponentProps<ReturnType<typeof styled.div>>, { className?: string }>(
  styled.div`
    ${tw`flex h-full w-full flex-col items-center justify-between`}
  `,
  ({ props }) => {
    return {
      className: props?.className ?? '',
    };
  },
);

export const Header = styled.div`
  ${tw`relative flex min-h-[32px] w-full items-center justify-center border-b border-neutral-300`}
`;

export const HeaderTitle = styled.span`
  ${tw`min-h-[32px] text-xl text-company-toss-black pretendard-semibold`}
`;

export const CloseBtn = withDefaultProps(
  styled.button`
    ${tw`absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-neutral-50`}
  `,
  { type: 'button' as const },
);

export const CloseIcon = styled(X)`
  ${tw`h-5 w-5`}
`;

export const Content = styled.div`
  ${tw`flex w-full flex-1 flex-col pb-0 pt-10 md:flex-row md:py-0`}
`;
