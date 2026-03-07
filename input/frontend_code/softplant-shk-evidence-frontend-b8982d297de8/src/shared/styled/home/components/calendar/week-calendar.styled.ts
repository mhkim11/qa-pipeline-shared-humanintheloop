import { ComponentProps } from 'react';

import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import { FaPersonWalkingDashedLineArrowRight } from 'react-icons/fa6';
import { GoDotFill } from 'react-icons/go';
import { LuAlarmClock } from 'react-icons/lu';
import { RiProhibited2Line } from 'react-icons/ri';
import tw from 'twin.macro';

import { cn } from '@/lib/utils';
import { styled, withDefaultProps } from '@/styles/transient-styled';

type TColor = {
  $color: string;
  $isEndTime?: boolean;
};

type TBlock = {
  $isBlock: boolean;
};

export const Container = styled.div`
  ${tw`relative max-h-[calc(100vh-204px)] max-w-0`}
`;

export const CurrentTimeLineWrapper = styled.div`
  ${tw`absolute h-[1px] bg-rose-300`}
`;

export const CurrentTimeLine = styled.div`
  ${tw`relative`}
`;

export const TimeLine = styled.div`
  ${tw`absolute -bottom-2 -left-0.5 flex min-w-[60px] items-center justify-center`}
`;

export const TimeLineText = styled.div`
  ${tw`rounded-full bg-rose-500 px-1 text-[10px] text-white`}
`;

export const Thead = styled.thead`
  ${tw`border-1`}
`;

export const Th = styled.th`
  ${tw`border-1 text-center`}
`;

export const ThText = styled.div`
  ${tw`flex items-center justify-center`}
`;

export const ColorBox = styled.div<TColor>`
  background-color: ${({ $color }) => `#${$color}`};
  ${tw`h-4 w-4 rounded-md ring-1 ring-neutral-200`}
`;

export const StaffNameText = styled.div`
  ${tw`text-sm pretendard-semibold`}
`;

export const StaffContentBox = styled.div<TBlock>`
  ${({ $isBlock }) => $isBlock && tw`text-amber-500`}
  ${tw`flex w-full cursor-pointer items-center gap-x-1 rounded-md py-2 transition-colors pretendard-medium hover:bg-neutral-100`}
`;

export const DetailBox = styled(motion.div)`
  ${tw`absolute z-50 flex min-h-[180px] w-32 rounded-md bg-white px-2 py-2 shadow-sm ring-1 ring-neutral-400`}
`;

export const DotIcon = styled(GoDotFill)`
  ${tw`h-4 w-4 pr-1`}
`;

export const Tbody = styled.tbody`
  ${tw`border-1`}
`;

export const Td = styled.td`
  ${tw`border-1 p-0 text-center`}
`;

export const TdText = styled.div`
  ${tw`flex items-center justify-center`}
`;

export const TimeTd = styled.td`
  ${tw`relative border-1 p-0 text-center hover:bg-neutral-100`}
`;

export const TimeContentBox = styled.div`
  ${tw`absolute left-0 top-0 flex h-full w-full items-center justify-center text-sm`}
`;

export const SameTimeWrapperBox = styled.div`
  ${tw`absolute right-0 top-0 min-h-[120px] w-44`}
`;

export const SameTimeButton = styled.div`
  ${tw`absolute right-1 top-1 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-1 border-teal-600 bg-teal-500 text-white pretendard-semibold`}
`;

export const SameTimeWrapper = styled(motion.div)`
  ${tw`absolute right-1 top-6 z-[60] flex min-h-[120px] w-44 flex-col gap-y-2 rounded-md bg-white p-2 shadow-sm ring-1 ring-neutral-400`}
`;

export const SameTime = styled.div`
  ${tw`flex w-full items-center justify-between`}
`;

export const SameTimeText = styled.div`
  ${tw`text-xs text-teal-500 pretendard-semibold`}
`;

export const SameTimeInsideButton = styled.div`
  ${tw`flex h-4 w-10 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-[10px] text-white hover:bg-teal-600`}
`;

export const TimeContentHighlight = styled.div<TColor>`
  color: ${({ $color }) => $color};

  ${tw`absolute left-0 top-0 z-20 h-full w-2 rounded-bl-md rounded-tl-md`}
`;

export const TimeContentWrapper = withDefaultProps<ComponentProps<ReturnType<typeof styled.div<TColor>>>, TColor>(
  styled.div<TColor>`
    ${({ $color }) => {
      const colorTypeMap = {
        '0': tw`border-pink-300 bg-pink-50 ring-pink-300 hover:bg-pink-100`,
        '1': tw`border-amber-300 bg-amber-50 ring-amber-300 hover:bg-amber-100`,
        '2': tw`border-green-300 bg-green-50 ring-green-300 hover:bg-green-100`,
        '3': tw`border-indigo-300 bg-indigo-50 ring-indigo-300 hover:bg-indigo-100`,
        '4': tw`border-blue-300 bg-blue-50 ring-blue-300 hover:bg-blue-100`,
        '5': tw`border-rose-300 bg-rose-50 ring-rose-300 hover:bg-rose-100`,
        '6': tw`border-red-400 bg-red-100 ring-red-400 hover:bg-red-200`,
      };

      return colorTypeMap[$color as keyof typeof colorTypeMap];
    }};

    ${tw`absolute left-0 top-0 z-10 flex w-full cursor-pointer flex-col overflow-y-auto rounded-md border-l-[7px] ring-1 scroll-bar`}
  `,
  ({ props }) => ({
    className: cn(props?.$isEndTime && `border-b`),
  }),
);
export const TimeContent = styled.div<TColor>`
  ${tw`px-2 py-1`}
`;

export const TimeContentTitle = styled.p<TColor>`
  color: ${({ $color }) => `#${$color}`};

  ${tw`w-full text-left text-xs`}
`;

export const TimeContentText = styled.p<TColor>`
  color: ${({ $color }) => `#${$color}`};

  ${tw`w-full text-left text-xs pretendard-semibold`}
`;

export const TimeContentSubText = styled.div<TColor>`
  color: ${({ $color }) => `#${$color}`};

  ${tw`flex w-full items-center text-xs`}
`;

export const ColorDot = styled(GoDotFill)<TColor>`
  color: ${({ $color }) => `#${$color}`};
  ${tw`h-2 w-2`}
`;

export const ButtonWrapperBox = styled.div`
  ${tw`flex h-full w-full justify-center py-1`}
`;

export const ButtonBox = styled.div`
  ${tw`flex w-full flex-col gap-y-1`}
`;

export const HoverText = styled.div`
  ${tw`pointer-events-none absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center text-sm opacity-0 pretendard-semibold`}
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

export const SpinnerWrapper = styled.div`
  ${tw`flex h-full min-h-[calc(100vh-204px)] flex-1 items-center justify-center rounded-md bg-neutral-100 blur-[1px]`}
`;

export const OkIcon = styled(FaPersonWalkingDashedLineArrowRight)`
  ${tw`mr-1 h-5 w-5`}
`;

export const SmallProhibitIcon = styled(RiProhibited2Line)`
  ${tw`mr-1 h-5 w-5`}
`;
