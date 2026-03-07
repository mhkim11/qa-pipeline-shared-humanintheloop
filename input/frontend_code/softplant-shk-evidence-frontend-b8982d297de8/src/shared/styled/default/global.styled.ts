import { AiFillWarning } from 'react-icons/ai';
import { IoIosWarning } from 'react-icons/io';
import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

export const WarningIcon = styled(AiFillWarning)`
  ${tw`mb-5 text-6xl text-amber-400`}
`;

export const AuthErrorWrapper = styled.div`
  ${tw`fixed left-0 top-0 z-[99999] flex h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-black/80 backdrop-blur-sm`}
`;

export const AuthError = styled.div`
  ${tw`flex w-full flex-col items-center justify-center rounded-lg bg-white p-10 sm:w-[640px]`}
`;

export const AuthErrorTextWrapper = styled.div`
  ${tw`mb-10 flex flex-col items-center justify-center`}
`;

export const AuthErrorText = styled.p`
  ${tw`text-xl text-black pretendard-semibold sm:text-2xl`}
`;

export const ContainerWrapper = styled.div`
  ${tw`flex h-full min-h-screen w-full flex-col overflow-y-auto overflow-x-hidden`}
`;

export const Container = styled.div`
  ${tw`flex w-full justify-center`}
`;

export const ToastWarningIcon = styled(IoIosWarning)`
  ${tw`h-5 w-5 text-yellow-500`}
`;
