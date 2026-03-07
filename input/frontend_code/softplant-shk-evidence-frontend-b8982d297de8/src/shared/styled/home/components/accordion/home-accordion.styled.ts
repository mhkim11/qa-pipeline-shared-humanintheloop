import { Clock9, Plus, X } from 'lucide-react';
import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

export const AccordionWrapper = styled.div`
  ${tw`my-1 w-full`}
`;

export const TriggerWrapperBox = styled.div`
  ${tw`flex w-full`}
`;

export const TriggerWrapper = styled.div`
  ${tw`grid w-full grid-cols-7 grid-rows-1 divide-x-1 divide-neutral-300 border-1 border-neutral-300`}
`;

export const TriggerTitle = styled.div`
  ${tw`py-2 text-[10px] pretendard-semibold xs:text-xs md:text-sm lg:text-base`}
`;

export const TriggerCountText = styled.span`
  ${tw`ml-1 hidden pretendard-semibold lg:inline-block`}
`;

export const MenuAccordionWrapper = styled.div`
  ${tw`grid w-full max-w-[1270px] grid-cols-7 grid-rows-1 divide-x-1 divide-neutral-300 rounded-bl-md rounded-br-md border-1 border-neutral-300`}
`;

export const MenuAccordion = styled.div`
  ${tw`flex min-h-0 flex-col justify-between gap-x-2 border-neutral-300 p-1 xs:px-4 xs:py-2 lg:min-h-[200px]`}
`;

export const Menu = styled.div`
  ${tw`mt-0 flex cursor-pointer items-center justify-center gap-x-2 rounded-md bg-white text-[10px] text-company-toss-black hover:underline lg:mt-2 lg:justify-start lg:rounded-none lg:text-sm xl:text-base`}
`;

export const MenuText = styled.span`
  ${tw`hidden text-xs lg:inline-block`}
`;

export const MenuPlus = styled(Plus)`
  ${tw`hidden h-4 w-4 lg:inline-block`}
`;

export const ClockIcon = styled(Clock9)`
  ${tw`hidden h-3 w-3 2xl:inline-block`}
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

export const MoreText = styled.span`
  ${tw`text-[10px] pretendard-semibold sm:text-xs md:text-sm`}
`;
