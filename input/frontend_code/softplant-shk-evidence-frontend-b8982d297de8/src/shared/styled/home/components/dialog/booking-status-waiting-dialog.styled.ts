import { ComponentProps } from 'react';

import { Clock9, Plus, X, XIcon } from 'lucide-react';
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
  ${tw`min-h-[32px] text-lg pretendard-semibold lg:text-xl`}
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
  ${tw`flex w-full flex-1 flex-col gap-y-5 py-0`}
`;

export const STime = styled.div`
  ${tw`flex h-10 w-full cursor-pointer rounded-md px-3 py-2 ring-1 ring-neutral-200`}
`;

export const TimeTitle = styled.span`
  ${tw`mt-2 flex w-full items-center justify-center text-sm pretendard-semibold`}
`;

export const TimeWrapperBox = styled.div`
  ${tw`flex w-full justify-between`}
`;

export const TimeBox = styled.div`
  ${tw`flex w-full flex-col gap-y-1 p-1`}
`;

export const AddressTextWrapper = styled.div`
  ${tw`mb-3 flex w-full items-center justify-between`}
`;

export const AddressText = styled.p`
  ${tw`mt-2 text-xl sm:mt-5`}
`;

export const EmptyListWrapper = styled.div`
  ${tw`flex h-full w-full items-center justify-center`}
`;

export const EmptyText = styled.div`
  ${tw`hidden text-neutral-500 lg:block`}
`;

export const EmptyIconWrapper = styled.div`
  ${tw`block py-2 lg:hidden`}
`;

export const EmptyXIcon = styled(X)`
  ${tw`h-3 w-3 text-neutral-500`}
`;

export const Menu = styled.div`
  ${tw`mt-0 flex cursor-pointer items-center justify-center gap-x-2 rounded-md bg-teal-500 text-[10px] text-white hover:underline md:text-xs lg:mt-2 lg:justify-start lg:rounded-none lg:bg-white lg:text-sm lg:text-black xl:text-base`}
`;

export const MenuPlus = styled(Plus)`
  ${tw`hidden h-4 w-4 md:inline-block`}
`;

export const MoreText = styled.span`
  ${tw`text-sm pretendard-semibold`}
`;

export const MenuText = styled.span`
  ${tw`hidden text-xs lg:inline-block`}
`;

export const ClockIcon = styled(Clock9)`
  ${tw`hidden h-3 w-3 lg:inline-block`}
`;
