import dayjs from 'dayjs';
import { isHoliday } from 'korean-business-day';
import { Calendar, ClockIcon, Plus } from 'lucide-react';
import { LuAlarmClock } from 'react-icons/lu';
import { RiProhibited2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import tw, { TwStyle } from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

type TDate = { fullDate: string; date: string; currentMonth: boolean; isSelected?: boolean; isToday?: boolean; events?: any[] };

type TDayText = {
  $fullDate: string;
  $selectedDate: Date;
  $day: TDate;
};

type TDay = {
  $isCurrentMonth: boolean;
  $isSelectedDate: boolean;
};

type TColor = {
  $color: string;
};

type TWeekTypeMap =
  | 'notCurrentMonth'
  | 'today'
  | 'todayAndSaturday'
  | 'todayAndHoliday'
  | 'saturday'
  | 'holiday'
  | 'default'
  | 'isSelected';

export const Container = styled.div`
  ${tw`border-b border-t border-neutral-200 px-0.5 lg:flex lg:h-full lg:flex-col`}
`;

export const Content = styled.div`
  ${tw`ring-1 ring-neutral-200 lg:flex lg:flex-auto lg:flex-col`}
`;

export const HeaderWrapper = styled.div`
  ${tw`grid grid-cols-7 gap-px border-b border-neutral-300 bg-neutral-200 text-center text-xs font-semibold leading-6 text-neutral-700 lg:flex-none`}
`;

export const Header = styled.div`
  ${tw`bg-white py-2 pretendard-semibold`}
`;

export const SoundText = styled.span`
  ${tw`sr-only pretendard-semibold sm:not-sr-only`}
`;

export const DayWrapperBox = styled.div`
  ${tw`flex bg-neutral-200 text-xs leading-6 text-neutral-700 lg:flex-auto`}
`;

export const DayWrapper = styled.div`
  ${tw`hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px`}
`;

export const Day = styled.div<TDay>`
  ${tw`relative min-h-[108px] cursor-pointer bg-neutral-50 px-3 py-2 text-neutral-500 transition-all hover:bg-neutral-100`}
  ${({ $isCurrentMonth }) => $isCurrentMonth && tw`!bg-white !text-black hover:!bg-neutral-50`}
  ${({ $isSelectedDate }) => $isSelectedDate && tw`!bg-teal-50 ring-1 ring-teal-400 hover:!bg-teal-50 hover:ring-teal-200`}
`;

export const DayText = styled.div<TDayText>`
  ${({ $fullDate, $selectedDate, $day }) => {
    const isToday = dayjs($fullDate, 'YYYYMMDD').isSame(dayjs(), 'day');
    const isSaturday = dayjs($fullDate).locale('ko').format('ddd') === '토';
    const isHolidayDate = isHoliday(dayjs($fullDate).toDate());

    const weekTypeMap: Record<TWeekTypeMap, TwStyle> = {
      notCurrentMonth: tw`!text-neutral-300`,
      today: tw`rounded-full !bg-teal-900 !text-white`,
      todayAndSaturday: tw`rounded-full !bg-blue-500 !text-white`,
      todayAndHoliday: tw`rounded-full !bg-red-500 !text-white`,
      saturday: tw`!text-blue-500`,
      holiday: tw`!text-red-500`,
      default: tw`!text-neutral-500`,
      isSelected: tw`rounded-full !bg-teal-600 !text-white`,
    };

    /**
     * * 주간 타입 맵
     * @param {TDate} week 주간
     * @returns {TWeekTypeMap} 주간 타입 맵
     */
    const getWeekTypeMap = (week: TDate): TWeekTypeMap => {
      if (!week.currentMonth) return 'notCurrentMonth';
      if (dayjs(week.fullDate).isSame(dayjs($selectedDate), 'day')) return 'isSelected';
      if (isToday) {
        if (isSaturday) return 'todayAndSaturday';
        if (isHolidayDate) return 'todayAndHoliday';
        return 'today';
      }
      if (isSaturday) return 'saturday';
      if (isHolidayDate) return 'holiday';
      return 'default';
    };

    return weekTypeMap[getWeekTypeMap($day)];
  }}

  ${tw`flex h-6 w-6 items-center justify-center pretendard-semibold`}
`;

export const DayEvent = withDefaultProps(
  styled.div`
    ${tw`flex h-[20px]`}
  `,
  { className: 'group' },
);

export const DayEventNameWrapper = styled.div`
  ${tw`flex-auto truncate`}
`;

export const DayEventName = styled.div`
  ${tw`flex items-center gap-x-1`}
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

export const DayEventTime = styled.div`
  ${tw`hidden flex-none text-neutral-900 group-hover:text-teal-600 xl:block`}
`;

export const DayButtonWrapper = styled.div`
  ${tw`isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden`}
`;

export const DayButton = withDefaultProps(
  styled.button`
    ${tw`flex h-20 flex-col px-3 py-2 focus:z-10`}
  `,
  { type: 'button' as const },
);

export const DayButtonText = styled.span`
  ${tw`-mx-0.5 mt-auto flex flex-wrap-reverse`}
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
  ${tw`flex min-h-[24px] items-center gap-x-2 text-sm text-neutral-700 pretendard-semibold`}
`;

export const StatusBoxText = styled.div`
  ${tw`text-sm text-neutral-700 pretendard-semibold`}
`;

export const EventBall = styled.span`
  ${tw`mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-neutral-400`}
`;

export const MobileContainer = styled.div`
  ${tw`px-4 py-10 sm:px-6 lg:hidden`}
`;

export const MobileEvent = styled.ol`
  ${tw`divide-y divide-neutral-200 overflow-hidden rounded-lg bg-white text-sm ring-1 ring-neutral-200`}
`;

export const MobileEventList = withDefaultProps(
  styled.li`
    ${tw`flex p-4 pr-6 focus-within:bg-neutral-50 hover:bg-neutral-50`}
  `,
  { className: 'group' },
);

export const EventContent = styled.div`
  ${tw`flex-auto`}
`;

export const EventTitle = styled.p`
  ${tw`text-neutral-900 pretendard-semibold`}
`;

export const EventTime = styled.time`
  ${tw`mt-2 flex items-center text-neutral-700`}
`;

export const Clock = styled(ClockIcon)`
  ${tw`mr-2 h-5 w-5 text-neutral-400`}
`;

export const EventLink = styled(Link)`
  ${tw`ml-6 flex-none self-center rounded-md bg-white px-3 py-2 text-neutral-900 opacity-0 shadow-sm ring-1 ring-inset ring-neutral-300 pretendard-semibold hover:ring-neutral-400 focus:opacity-100 group-hover:opacity-100`}
`;

export const ModalWrapper = styled.div`
  ${tw`flex h-full w-full flex-col items-center justify-center gap-y-6 p-5`}
`;

export const ModalTitle = styled.div`
  ${tw`mb-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-neutral-100 text-lg text-black ring-1 ring-neutral-200 pretendard-semibold`}
`;

export const PlusIcon = styled(Plus)`
  ${tw`mr-1 h-6 w-6`}
`;

export const TimeIcon = styled(LuAlarmClock)`
  ${tw`mr-1 h-6 w-6`}
`;

export const ProhibitIcon = styled(RiProhibited2Line)`
  ${tw`mr-1 h-6 w-6`}
`;

export const CalendarIcon = styled(Calendar)`
  ${tw`mr-1 h-6 w-6`}
`;
