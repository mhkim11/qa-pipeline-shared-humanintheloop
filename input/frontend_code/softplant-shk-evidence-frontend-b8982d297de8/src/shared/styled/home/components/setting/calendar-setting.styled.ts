import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

export const TitleWrapper = styled.div`
  ${tw`flex w-full flex-col gap-y-2`}
`;

export const Title = styled.span`
  ${tw`text-lg pretendard-semibold`}
`;

export const SubTitle = styled.span`
  ${tw`text-sm text-neutral-400 pretendard`}
`;

export const SBox = styled.div`
  ${tw`mb-4 flex max-w-[640px] flex-col gap-y-2 sm:mb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-y-0`}
`;

export const BoxTitle = styled.span`
  ${tw`min-w-[120px] text-sm pretendard-medium sm:min-w-[240px] sm:text-base`}
`;

export const Box = styled.div`
  ${tw`flex`}
`;

export const STime = styled.div`
  ${tw`flex h-10 w-32 cursor-pointer rounded-md px-3 py-2 ring-1 ring-neutral-200`}
`;

export const TimeGuideText = styled.span`
  ${tw`text-xs sm:text-sm`}
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

export const InputWrapper = styled.div`
  ${tw`flex w-full flex-col gap-y-1`}
`;

export const InputBox = styled.div`
  ${tw`flex h-12 w-full items-center gap-x-4`}
`;
