import { SignalSlashIcon } from '@heroicons/react/24/outline';
import tw from 'twin.macro';

import { styled } from '@/styles/transient-styled';

export const Container = styled.div`
  ${tw`mt-20 flex h-[70vh] w-full flex-col items-center justify-center`}
`;

export const ErrorBoundaryWrapper = styled.div`
  ${tw`flex h-full min-h-[640px] w-full flex-1 flex-col items-center justify-center gap-y-5`}
`;

export const WarningIcon = styled(SignalSlashIcon)`
  ${tw`mb-5 h-24 w-24 text-black`}
`;

export const Title = styled.h2`
  ${tw`mt-2 text-2xl pretendard-semibold`}
`;
export const SubTitle = styled.h2`
  ${tw`mt-2 text-sm pretendard-semibold sm:text-base md:text-lg`}
`;

export const ErrorButton = styled.button`
  ${tw`mt-20 rounded-md bg-rose-500 px-5 py-2 text-white pretendard-semibold hover:bg-rose-600`}
`;

export const ErrorModalBox = styled.div`
  ${tw`mt-4 flex h-full w-full flex-col justify-center`}
`;

export const ErrorHighlight = styled.div`
  ${tw`mb-4 mt-6 flex h-full w-full flex-col items-center justify-center`}
`;

export const ErrorText = styled.div`
  ${tw`border-b border-rose-500 p-2 text-lg text-rose-500 pretendard-semibold focus:outline-none`}
`;
