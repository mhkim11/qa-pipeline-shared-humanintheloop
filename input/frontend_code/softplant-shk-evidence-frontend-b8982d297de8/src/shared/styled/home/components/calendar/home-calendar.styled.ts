import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GoDotFill } from 'react-icons/go';
import { SiNaver } from 'react-icons/si';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

type TColor = {
  $color: string;
};

export const ContainerWrapper = styled.div`
  ${tw`flex h-full w-full flex-col`}
`;

export const SContainer = styled.div`
  ${tw`flex h-full w-full gap-x-5`}
`;

export const Container = styled.div`
  ${tw`flex w-full flex-1 flex-col`}
`;

export const DotIcon = styled(GoDotFill)`
  ${tw`hidden h-2 w-2 lg:inline-block`}
`;

export const TitleWrapper = styled.div`
  ${tw`mt-2 flex w-full flex-col items-start gap-y-5 pb-5 md:flex-row md:items-center md:gap-y-0`}
`;

export const Title = styled.p`
  ${tw`text-xl pretendard-semibold`}
`;

export const ButtonGroup = styled.div`
  ${tw`hidden items-center gap-x-3 xs:flex`}
`;

export const NaverBox = withDefaultProps(
  styled.button`
    ${tw`flex items-center gap-2 rounded-lg bg-green-500 p-2`}
  `,
  { type: 'button' as const },
);

export const NaverIcon = styled(SiNaver)`
  ${tw`h-3 w-3 text-white`}
`;

export const CalendarWrapper = styled.div`
  ${tw`w-full overflow-y-auto`}
`;

export const CalendarBox = styled.div`
  ${tw`flex h-full flex-col`}
`;

export const LeftIcon = styled(ChevronLeft)`
  ${tw`h-9 w-9 cursor-pointer rounded-full p-1 text-neutral-800 transition-colors hover:bg-neutral-100`}
`;

export const RightIcon = styled(ChevronRight)`
  ${tw`h-9 w-9 cursor-pointer rounded-full p-1 text-neutral-800 transition-colors hover:bg-neutral-100`}
`;

export const SubCalendarWrapper = styled.div`
  ${tw`z-50 hidden h-[calc(90vh-53px)] max-h-[720px] max-w-[360px] flex-1 flex-col gap-y-2 bg-white lg:flex 2xl:h-[calc(85vh-53px)]`}
`;

export const SubCalendarBox = styled.div`
  ${tw`flex h-full min-w-[360px] flex-col items-center rounded-lg px-3 pb-4 pt-2 ring-1 ring-neutral-200`}
`;

export const SubCalendarButtonGroup = styled.div`
  ${tw`flex h-14 w-full items-center justify-between pb-2`}
`;

export const SubCalendarButtonText = styled.div`
  ${tw`pretendard-semibold`}
`;

export const SubCalendarMonth = styled.div`
  ${tw`grid h-full min-h-[56px] w-full grid-cols-7 rounded-xl`}
`;

export const SubCalendarDate = styled.div`
  ${tw`flex h-full w-full items-center justify-center`}
`;

export const SubCalendarContent = styled.div`
  ${tw`relative mb-1 flex h-full cursor-pointer items-end justify-center py-2 text-sm`}
`;

export const SubCalendarHighlight = styled.div`
  ${tw`absolute -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 px-3 !text-[10px] text-white pretendard-semibold lg:top-1 xl:top-2`}
`;

export const ReservationWrapper = styled.div`
  ${tw`flex h-[240px] w-full flex-col items-center justify-center`}
`;

export const Reservation = styled.div`
  ${tw`grid-rows-[repeat(8, minmax(0, 1fr))] grid h-full w-full grid-cols-1`}
`;

export const ReservationTitle = styled.div`
  ${tw`flex items-center justify-center text-xs pretendard-semibold 2xs:text-sm`}
`;

export const ReservationLineBox = styled.div`
  ${tw`flex items-center justify-center gap-x-3`}
`;

export const ReservationLine = styled.div<TColor>`
  background-color: ${({ $color }): string => $color};

  ${tw`h-1.5 w-[33.3%] rounded-md`}
`;

export const ReservationText = styled.div`
  ${tw`min-w-[64px] text-sm`}
`;

export const MobileSingleCalendarWrapper = styled.div`
  ${tw`relative flex w-full items-center rounded-md bg-white sm:hidden md:items-stretch`}
`;

export const SingleCalendarLeftButton = styled.button`
  ${tw`flex h-10 w-10 items-center justify-center rounded-l-md border-y border-l border-neutral-300 pr-1 text-neutral-400 hover:text-neutral-500 focus:relative md:w-9 md:pr-0 md:hover:bg-neutral-50`}
`;

export const SingleCalendarRightButton = styled.button`
  ${tw`flex h-10 w-10 items-center justify-center rounded-r-md border-y border-r border-neutral-300 pl-1 text-neutral-400 hover:text-neutral-500 focus:relative md:w-9 md:pl-0 md:hover:bg-neutral-50`}
`;

export const MobileSingleCalendarCenterButton = styled.button`
  ${tw`block h-10 flex-1 border-y border-neutral-300 px-1 py-0.5 text-sm text-neutral-900 pretendard-semibold hover:bg-neutral-50 focus:relative`}
`;

export const SingleCalendarCenterButton = styled.button`
  ${tw`hidden h-10 border-y border-neutral-300 px-1 py-0.5 text-sm text-neutral-900 pretendard-semibold hover:bg-neutral-50 focus:relative 2xs:block`}
`;

export const SelectorGroup = styled.div`
  ${tw`flex w-full items-center justify-between`}
`;

export const SingleCalendarWrapperBox = styled.div`
  ${tw`flex items-center gap-x-2`}
`;

export const SingleCalendarWrapper = styled.div`
  ${tw`relative hidden items-center rounded-md bg-white md:flex md:items-stretch lg:hidden xl:flex`}
`;

export const MonthDetailWrapperBox = styled.div`
  ${tw`z-50 flex min-h-[200px] w-full min-w-[360px] flex-col rounded-md ring-1 ring-neutral-200`}
`;

export const MonthDetailTitle = styled.div`
  ${tw`relative flex items-center justify-center py-4`}
`;

export const MonthDetailTitleText = styled.span`
  ${tw`pretendard-semibold`}
`;

export const MonthDetailEvent = styled.div`
  ${tw`flex w-full flex-col divide-y-1 divide-neutral-200`}
`;

export const DayEvent = withDefaultProps(
  styled.div`
    ${tw`flex min-h-[36px] w-full cursor-pointer px-5 py-3`}
  `,
  { className: 'group' },
);

export const DayEventTimeWrapperBox = styled.div`
  ${tw`flex-auto truncate`}
`;

export const DayEventTimeWrapper = styled.div`
  ${tw`flex items-center gap-x-1`}
`;

export const DayEventTime = styled.div`
  ${tw`ml-3 block flex-none text-neutral-500 group-hover:text-teal-600`}
`;

export const DayEventStatusColor = styled.div<TColor>`
  ${({ $color }) => {
    const colorTypeMap = {
      '0': tw`bg-pink-400`,
      '1': tw`bg-amber-400`,
      '2': tw`bg-green-400`,
      '3': tw`bg-indigo-400`,
      '4': tw`bg-blue-400`,
      '5': tw`bg-rose-400`,
      '6': tw`bg-red-600`,
    };

    return colorTypeMap[$color as keyof typeof colorTypeMap];
  }};
  ${tw`h-2 w-2 rounded-full`}
`;

export const DayEventNameText = styled.p`
  ${tw`truncate text-neutral-900 pretendard-semibold group-hover:text-teal-600`}
`;

export const PopoverContentWrapper = styled.div`
  ${tw`flex min-h-[350px] flex-col justify-between p-2`}
`;

export const PopoverContent = styled.div`
  ${tw`flex flex-col gap-y-4`}
`;

export const Status = styled.div<TColor>`
  ${({ $color }) => {
    const colorTypeMap = {
      '0': tw`bg-pink-400`,
      '1': tw`bg-amber-400`,
      '2': tw`bg-green-400`,
      '3': tw`bg-indigo-400`,
      '4': tw`bg-blue-400`,
      '5': tw`bg-rose-400`,
      '6': tw`bg-red-600`,
    };

    return colorTypeMap[$color as keyof typeof colorTypeMap];
  }};

  ${tw`w-full rounded-full py-2 text-center text-sm text-white pretendard-semibold`}
`;

export const StatusBox = styled.div`
  ${tw`flex items-center gap-x-2 text-sm text-neutral-700 pretendard-semibold`}
`;

export const StatusBoxText = styled.div`
  ${tw`text-sm text-neutral-700 pretendard-semibold`}
`;

export const SaleWrapper = styled.div`
  ${tw`flex min-w-[360px] flex-col items-center rounded-lg ring-1 ring-neutral-200`}
`;

export const SaleTitle = styled.div`
  ${tw`relative flex h-12 w-full items-center justify-center border-b border-neutral-200 p-2 text-base pretendard-semibold`}
`;

export const SaleContent = styled.div`
  ${tw`h-full w-full flex-col divide-y-1 divide-neutral-200`}
`;

export const SaleContentBox = styled.div`
  ${tw`flex items-center py-2 pl-2 pr-4`}
`;

export const SaleContentTitle = styled.div`
  ${tw`flex w-1/4 items-center gap-x-1 px-1 text-sm`}
`;

export const SaleContentText = styled.div`
  ${tw`w-3/4 truncate px-1 text-right text-sm`}
`;

export const SaleContentDot = styled(GoDotFill)`
  ${tw`h-2 w-2`}
`;
