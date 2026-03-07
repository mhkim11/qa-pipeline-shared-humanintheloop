import { XIcon } from 'lucide-react';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

export const Container = styled.div`
  ${tw`flex h-full w-full flex-col items-center justify-center`}
`;

export const Header = styled.div`
  ${tw`relative flex min-h-[32px] w-full items-center justify-center border-b border-neutral-200`}
`;

export const HeaderTitle = styled.span`
  ${tw`min-h-[32px] text-lg pretendard-semibold`}
`;

export const CloseBtn = withDefaultProps(
  styled.button`
    ${tw`absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-neutral-300 hover:bg-neutral-50`}
  `,
  { type: 'button' as const },
);

export const CloseIcon = styled(XIcon)`
  ${tw`h-5 w-5`}
`;

export const Content = styled.div`
  ${tw`flex w-full flex-1 flex-col py-0 md:flex-row`}
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
