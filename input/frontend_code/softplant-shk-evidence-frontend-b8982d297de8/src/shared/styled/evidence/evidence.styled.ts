import tw from 'twin.macro';

import { Button, Label, RadioGroup } from '@components/ui';
import { styled } from '@/styles/transient-styled';

export const AllBody = styled.div`
  ${tw`pt-[170px]`}
`;

export const AllBodyPreview = styled.div`
  ${tw`pt-[70px]`}
`;
export const NormalHead = styled.div`
  ${tw`sticky top-0 flex justify-center bg-white`}
`;
export const FilterBox = styled.div`
  ${tw`flex h-[60px] w-full cursor-pointer items-center justify-center rounded-[10px] border bg-[#F5F9F9] transition-colors duration-200`}

  &.active {
    ${tw`bg-[#096DD9]`}

    p {
      ${tw`text-white`}
    }
  }
`;
export const FilterBoxInner = styled.div`
  ${tw`flex w-full items-center pl-[10px] pr-[5px] 2xl:pb-[14px] 2xl:pl-[20px] 2xl:pr-[20px] 2xl:pt-[14px]`}
`;
export const FilterInner = styled.div`
  ${tw`flex w-full`}
`;
export const ImgBoxInner = styled.div`
  ${tw`flex w-1/2 items-center justify-end`}
`;

export const NormalBody = styled.div`
  ${tw`w-full lg:ml-[20px]`}
`;

export const ButtonContainer = styled.div`
  ${tw`mr-10 flex w-full justify-end`}
`;
export const CenterBody = styled.div`
  ${tw`flex items-center justify-center`}
`;
export const TextBody = styled.div`
  ${tw`flex text-[15px]`}
`;

export const MainButton = styled(Button)`
  ${tw`flex cursor-pointer items-center justify-center rounded-[10px] border bg-white text-center text-[#004F67] hover:bg-[#004F67] hover:text-white lg:h-[45px] lg:w-[140px]`}
`;

export const FilterItemLabelRequired = styled.span`
  ${tw`ml-0.5 text-medium text-red-500`}
`;

export const FilterRadioGroup = styled(RadioGroup)`
  ${tw`flex`}
`;

export const FilterRadioLabel = styled(Label)`
  ${tw`cursor-pointer`}
`;
