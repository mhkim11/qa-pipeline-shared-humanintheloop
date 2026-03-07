import { IoIosWarning } from 'react-icons/io';
import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

export const SContainer = styled.div`
  ${tw`flex h-full min-h-screen w-full overflow-hidden`}
`;

export const ImageWrapper = styled.div`
  ${tw`mb-4 flex min-h-[48px] w-full min-w-full items-center justify-center sm:min-w-[360px]`}
`;

export const Image = styled.img`
  ${tw`h-full w-full`}
`;

export const Container = styled.div`
  ${tw`flex min-h-screen w-full flex-col items-center justify-center md:flex-row`}
`;

export const FormTotalWrapper = styled.div`
  ${tw`flex h-full w-[80%] items-center justify-center`}
`;

export const ContentWrapper = styled.div`
  ${tw`flex w-full flex-col items-center justify-center`}
`;

export const FormWrapper = styled.div`
  ${tw`mb-[20px] grid gap-4`}
`;
export const LoginFormWrapper = styled.div`
  ${tw`mb-[20px] grid w-[360px] gap-4 lg:w-[400px]`}
`;

export const LabelWrapper = styled.div`
  ${tw`grid gap-[8px]`}
`;

export const LabelBox = styled.div`
  ${tw`flex w-full items-center`}
`;

export const LabelText = styled.span`
  ${tw`w-full text-[14px] text-[#5B5B5B] pretendard-medium`}
`;

export const ErrorWrapper = styled.div`
  ${tw`flex w-full items-center gap-x-1 text-sm text-rose-500 pretendard-semibold`}
`;

export const ErrorIcon = styled(IoIosWarning)`
  ${tw`h-5 w-5 text-rose-500`}
`;
