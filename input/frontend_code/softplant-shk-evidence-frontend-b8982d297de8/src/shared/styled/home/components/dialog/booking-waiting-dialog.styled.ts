import { ComponentProps } from 'react';

import { XIcon } from 'lucide-react';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

/**
 * @deprecated SContainer 로 대체되었습니다. SContainer 를 사용하지 말고 해당 컴포넌트를 사용한다면 적절히 파일을 분리해서 사용해주세요.
 * @see SContainer
 */
export const Container = styled.div`
  ${tw`flex h-full min-h-[80vh] w-full flex-col items-center justify-center`}
`;

export const SContainer = withDefaultProps<ComponentProps<ReturnType<typeof styled.div>>, { className?: string }>(
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

export const CloseIcon = styled(XIcon)`
  ${tw`h-5 w-5`}
`;

export const Content = styled.div`
  ${tw`flex w-full flex-1 flex-col pb-0 pt-10 md:flex-row md:py-0`}
`;

export const TabText = styled.p`
  ${tw`max-w-[232px] whitespace-pre-wrap text-sm pretendard-semibold md:text-base`}
`;

export const SingleCalendarCenterButton = styled.button`
  ${tw`hidden h-10 border-y border-neutral-300 px-1 py-0.5 text-sm text-neutral-900 pretendard-semibold hover:bg-neutral-50 focus:relative 2xs:block`}
`;

export const ReservationContentWrapper = styled.div`
  ${tw`flex min-h-[340px] w-full flex-col items-center`}
`;

export const ReservationContent = styled.div`
  ${tw`flex w-full flex-1 flex-col gap-y-2`}
`;

export const ReservationContentItem = styled.div`
  ${tw`flex min-h-[54px] w-full justify-between divide-x-1 divide-neutral-300 rounded-md px-4 ring-1 ring-neutral-300`}
`;

export const ReservationContentItemText = styled.div`
  ${tw`flex w-full flex-col justify-center`}
`;

export const ReservationContentButtonWrapper = styled.div`
  ${tw`flex w-16 items-center justify-end`}
`;

export const CustomerWrapper = styled.div`
  ${tw`relative flex flex-col gap-y-2`}
`;

export const XWrapper = styled.div`
  ${tw`absolute right-3 top-3 cursor-pointer rounded-full p-1 ring-1 ring-neutral-300 transition-colors hover:bg-neutral-100`}
`;

export const CustomerContent = styled.div`
  ${tw`flex min-h-[200px] flex-col gap-y-1 rounded-md px-4 py-3 ring-1 ring-neutral-300`}
`;

export const CustomerTitle = styled.div`
  ${tw`flex items-center gap-x-4 text-lg`}
`;

export const CustomerTitleText = styled.div`
  ${tw`flex min-w-[92px] items-center gap-x-1`}
`;

export const CustomerButton = withDefaultProps(
  styled.button`
    ${tw`h-6 w-16 rounded-md text-xs ring-1 ring-neutral-300 transition-colors pretendard-medium hover:bg-neutral-100`}
  `,
  { type: 'button' as const },
);

export const CustomerContentItem = styled.div`
  ${tw`flex items-center gap-x-2`}
`;

export const CustomerContentItemText = styled.div`
  ${tw`min-w-[100px] text-sm`}
`;

export const CustomerTextareaWrapper = styled.div`
  ${tw`flex gap-x-2`}
`;

export const BookingFormWrapperBox = styled.div`
  ${tw`col-span-3 h-full w-full px-4 py-3`}
`;

export const BookingFormWrapper = styled.div`
  ${tw`flex flex-col gap-y-2`}
`;
