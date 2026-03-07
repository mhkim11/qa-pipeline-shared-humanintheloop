import tw from 'twin.macro';

import { Button, Label, RadioGroup } from '@components/ui';
import { styled } from '@/styles/transient-styled';

export const FilterWrapper = styled.div`
  ${tw`grid grid-cols-2 border-b-1 border-l-1 border-r-1 border-zinc-200`}
`;

export const FilterItem = styled.div`
  ${tw`flex items-center border-t-1 border-zinc-200 bg-zinc-100`}
`;

export const FilterItemLabel = styled.div`
  ${tw`w-[200px] px-4 py-2 text-sm text-zinc-800 pretendard-semibold`}
`;

export const FilterItemLabelRequired = styled.span`
  ${tw`ml-0.5 text-medium text-red-500`}
`;

export const FilterItemValue = styled.div`
  ${tw`flex h-full min-h-[44px] flex-1 items-center gap-x-5 bg-white px-4 py-2 text-sm text-zinc-800`}
`;

export const FilterRadioGroup = styled(RadioGroup)`
  ${tw`flex`}
`;

export const FilterRadioItem = styled.div`
  ${tw`flex w-[120px] cursor-pointer items-center space-x-2`}
`;

export const FilterRadioLabel = styled(Label)`
  ${tw`cursor-pointer`}
`;

export const FilterSearchButton = styled(Button)`
  ${tw`ml-auto mt-3 flex w-[110px] items-center justify-center gap-1.5`}
`;
