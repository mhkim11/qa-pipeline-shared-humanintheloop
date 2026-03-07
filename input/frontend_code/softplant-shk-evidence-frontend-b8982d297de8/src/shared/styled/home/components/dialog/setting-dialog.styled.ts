import { ComponentProps } from 'react';

import { XIcon } from 'lucide-react';
import { GoDotFill } from 'react-icons/go';
import tw from 'twin.macro';

import { styled, TTwStyle, withDefaultProps } from '@/styles/transient-styled';

type THighlight = {
  $isHighlight?: boolean;
};

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
  ${tw`relative flex min-h-[32px] w-full items-center justify-center border-b border-neutral-200`}
`;

export const HeaderTitle = styled.span`
  ${tw`min-h-[32px] text-xl pretendard-semibold`}
`;

export const CloseBtn = withDefaultProps(
  styled.button`
    ${tw`absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-neutral-50`}
  `,
  { type: 'button' as const },
);

export const CloseIcon = styled(XIcon)`
  ${tw`h-5 w-5`}
`;

export const Content = styled.div`
  ${tw`flex w-full flex-1 flex-col pb-0 pt-10 md:flex-row md:py-0`}
`;

export const ContentSidebar = styled.div`
  ${tw`hidden w-1/4 flex-col border-r border-neutral-200 px-2 py-3 md:flex xl:w-1/6`}
`;

export const MobileSelectBox = styled.div`
  ${tw`flex w-full flex-col items-center justify-center md:hidden`}
`;

export const Item = styled.div`
  ${tw`flex flex-col gap-y-2`}
`;

export const ItemTitle = styled.span`
  ${tw`pretendard-semibold`}
`;

export const ItemSubTitleWrapper = styled.div<THighlight>`
  ${({ $isHighlight }): TTwStyle<boolean> => $isHighlight && tw`border-l-2 border-primary`}
  ${tw`flex flex-col gap-y-1 px-2 py-1`}
`;

export const ItemSubTitle = styled.div`
  ${tw`flex cursor-pointer items-center gap-x-1 rounded-md px-2 py-1.5 text-sm transition-all pretendard`}
`;

export const DotIcon = styled(GoDotFill)`
  ${tw`h-2 w-2`}
`;

export const ContentMain = styled.div`
  ${tw`flex w-full flex-col px-0 pb-0 pt-5 md:w-4/5 md:px-5 md:py-3 xl:w-5/6`}
`;
