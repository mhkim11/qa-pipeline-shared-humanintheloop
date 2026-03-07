import { ComponentProps } from 'react';

import { XIcon } from 'lucide-react';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

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
  ${tw`relative mb-1.5 flex min-h-[32px] w-full items-center justify-center border-neutral-300`}
`;

export const HeaderBorder = styled.div`
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

export const ContentWrapper = styled.div`
  ${tw`flex w-full flex-1 flex-col pb-0 pt-10 md:flex-row md:py-0`}
`;

export const Content = styled.div`
  ${tw`flex h-full w-full flex-col`}
`;

export const SCustomerContentWrapper = styled.div`
  ${tw`mt-2 grid h-full min-h-[630px] w-full grid-cols-5 gap-4 divide-x divide-neutral-300 border-t border-neutral-300`}
`;

export const SCustomerContent = styled.div`
  ${tw`col-span-2 h-full w-full`}
`;

export const TabText = styled.p`
  ${tw`max-w-[232px] whitespace-pre-wrap text-sm pretendard-semibold md:text-base`}
`;

export const SingleCalendarCenterButton = styled.button`
  ${tw`hidden h-10 border-y border-neutral-300 px-1 py-0.5 text-sm text-neutral-900 pretendard-semibold hover:bg-neutral-50 focus:relative 2xs:block`}
`;

export const BookingContentWrapper = styled.div`
  ${tw`flex min-h-[340px] w-full flex-col items-center`}
`;

export const BookingContent = styled.div`
  ${tw`flex w-full flex-1 flex-col gap-y-2`}
`;

export const BookingContentItem = styled.div`
  ${tw`flex min-h-[54px] w-full justify-between divide-x-1 divide-neutral-300 rounded-md px-4 ring-1 ring-neutral-300`}
`;

export const BookingContentItemText = styled.div`
  ${tw`flex w-full flex-col justify-center`}
`;

export const BookingContentButtonWrapper = styled.div`
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

export const CustomerInput = styled.div`
  ${tw`mt-2 flex min-h-[40px] items-center gap-x-2`}
`;

export const ComboboxWrapper = styled.div`
  ${tw`relative flex w-full max-w-[320px] items-center gap-x-2`}
`;

export const ComboboxInputWrapper = styled.div`
  ${tw`relative w-full`}
`;

export const HpNoText = styled.span`
  ${tw`pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 transform bg-white text-sm text-neutral-500`}
`;

export const SoundOnlyPageText = styled.span`
  ${tw`sr-only top-0 flex items-center justify-center`}
`;

export const NonCustomerWrapper = styled.div`
  ${tw`flex flex-col gap-y-2`}
`;

export const NonCustomerText = styled.div`
  ${tw`text-company-toss-black`}
`;

export const CheckboxWrapperBox = styled.div`
  ${tw`flex min-h-[40px] items-center gap-x-2`}
`;

export const CheckboxWrapper = styled.div`
  ${tw`flex items-center space-x-2`}
`;

export const TempCustomerWrapper = styled.div`
  ${tw`mt-5 flex h-full w-full flex-col gap-y-4 rounded-md p-5 ring-1 ring-neutral-300`}
`;

export const TempCustomerInputWrapper = styled.div`
  ${tw`grid grid-cols-3 grid-rows-1`}
`;

export const TempCustomerInput = styled.div`
  ${tw`col-span-2`}
`;

export const TempCustomerError = styled.p`
  ${tw`mt-2 text-sm text-destructive pretendard-medium`}
`;

export const EmptyTableWrapper = styled.div`
  ${tw`h-full min-h-[300px] w-full`}
`;

export const EmptyTable = styled.div`
  ${tw`flex h-full min-h-[300px] w-full items-center justify-center`}
`;

export const EmptyTableTextWrapper = styled.div`
  ${tw`flex flex-col items-center gap-y-3`}
`;

export const EmptyTableText = styled.div`
  ${tw`text-sm text-neutral-500`}
`;

export const TablePaginationWrapper = styled.div`
  ${tw`flex min-h-[32px] w-full gap-x-5`}
`;

export const TablePaginationContent = styled.div`
  ${tw`flex min-h-[32px] items-center`}
`;

export const CheckboxLabel = styled.label`
  ${tw`text-sm leading-none text-company-toss-black pretendard-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
`;

export const CheckboxTitle = styled.div`
  ${tw`flex min-w-[170px] items-center gap-x-2 pretendard-medium`}
`;

export const ButtonWrapper = styled.div`
  ${tw`flex w-full items-center justify-center gap-x-2 border-t border-neutral-300 pt-3 sm:justify-end`}
`;
