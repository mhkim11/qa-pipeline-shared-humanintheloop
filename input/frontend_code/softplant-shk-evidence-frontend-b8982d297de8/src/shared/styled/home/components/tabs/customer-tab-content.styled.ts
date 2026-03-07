import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

export const CardWrapper = styled.div``;

export const CardButtonWrapper = styled.div``;

export const InputWrapper = styled.div`
  ${tw`w-full`}
`;

export const InputContentWrapper = styled.div`
  ${tw`max-h-[470px] w-full overflow-y-auto scroll-bar`}
`;

export const UserButton = withDefaultProps(
  styled.button`
    ${tw`mb-3 flex h-[6.5rem] w-full items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-6 transition-colors hover:bg-teal-100`}
  `,
  { type: 'button' as const },
);

export const TitleWrapper = styled.div`
  ${tw`flex w-full gap-x-5 xs:w-2/3`}
`;

export const ImageBox = styled.div`
  ${tw`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ring-1 ring-neutral-300`}
`;

export const Image = styled.img`
  ${tw`h-full w-full`};
`;

export const TitleBox = styled.div`
  ${tw`flex flex-col items-start`}
`;

export const Title = styled.p`
  ${tw`text-lg pretendard-semibold`}
`;

export const SubTitle = styled.p`
  ${tw`text-sm pretendard`}
`;

export const SubContentWrapper = styled.div`
  ${tw`hidden w-1/3 flex-col items-end xs:flex`}
`;

export const SubText = styled.div`
  ${tw`text-lg pretendard-semibold`}
`;

export const SubSmallText = styled.div`
  ${tw`text-sm pretendard`}
`;
// sky custom;
export const SearchWrapper = styled.div`
  ${tw`h-auto w-full rounded-md bg-white p-4 shadow-md`}
`;
export const TableWrapper = styled.div`
  ${tw`flex h-full w-full rounded-md bg-white p-4 shadow-md`}
`;

export const Container = styled.div`
  ${tw`flex w-full flex-1 flex-col`}
`;
