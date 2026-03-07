import { motion } from 'framer-motion';
import { Minus, Settings } from 'lucide-react';
import { GoDotFill } from 'react-icons/go';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';

import { styled, withDefaultProps } from '@/styles/transient-styled';

type TLink = {
  $isActive: boolean;
  $isDisabled?: boolean;
};

export const SContainer = styled.div`
  ${tw`relative z-[100] flex h-full min-h-screen w-full pb-16 lg:pb-16`}
`;

export const Container = styled(motion.div)`
  ${tw`absolute left-0 top-0 z-[100] hidden h-full w-[100px] bg-white shadow-lg lg:block`}
`;

export const CollapsedButtonWrapper = styled(motion.div)`
  ${tw`absolute top-[32px] z-50 hidden lg:block`}
`;

export const WrapperBox = styled.div`
  ${tw`relative z-50 flex h-full flex-col bg-neutral-50`}
`;

export const Wrapper = styled.div`
  ${tw`flex min-h-[56px] flex-col justify-center gap-x-5 px-2 lg:min-h-[70px] lg:px-2`}
`;

export const SLink = styled(Link)`
  ${tw`flex items-center gap-2 pretendard-semibold`}
`;

export const SettingIcon = styled(Settings)`
  ${tw`h-6 w-6 cursor-pointer text-neutral-700 hover:text-neutral-800`}
`;

export const Title = styled.div`
  ${tw`flex gap-x-5`}
`;

export const TitleText = styled.span`
  ${tw`pretendard-bold`}
`;

export const ButtonWrapper = styled.div`
  ${tw`w-full items-center text-xs`}
`;

export const ButtonBox = styled.div`
  ${tw`ml-auto text-xs text-primary`}
`;

export const Sidebar = styled.div`
  ${tw`max-h-[calc(100%-126px)] w-full flex-1 overflow-y-auto bg-neutral-50`}
`;

export const Nav = styled.nav`
  ${tw`grid items-start gap-y-2 text-sm font-medium`}
`;

export const NavLink = withDefaultProps(
  styled(Link)<TLink>`
    ${({ $isActive }) =>
      $isActive
        ? tw`bg-teal-50 text-teal-700 ring-1 ring-teal-500 hover:bg-teal-50`
        : tw`hover:bg-teal-50 hover:text-teal-700 hover:ring-1 hover:ring-teal-500`}
    ${({ $isDisabled }) => $isDisabled && tw`text-amber-600 hover:bg-amber-50 hover:text-amber-600 hover:ring-1 hover:ring-amber-500`}
        
    ${tw`mx-0.5 my-1 flex items-center gap-3 rounded-lg px-3 py-2 transition-all`}
  `,
  { className: 'group' },
);

export const NavBox = styled.div`
  ${tw`flex flex-col gap-y-0.5`}
`;

export const DotIcon = styled(GoDotFill)<TLink>`
  ${tw`h-3 w-3 group-hover:text-teal-700`}
  ${({ $isActive }) => ($isActive ? tw`text-teal-700` : tw`text-primary`)}
  ${({ $isDisabled }) => $isDisabled && tw`text-amber-600 group-hover:text-amber-600`}
`;

export const MainWrapper = styled.div`
  ${tw`flex w-full flex-col`}
`;

export const MainTopWrapper = styled.header`
  ${tw`flex w-full flex-col justify-center lg:h-[32px]`}
`;

export const SheetNav = styled.nav`
  ${tw`grid gap-2 text-lg pretendard-medium`}
`;

export const Main = styled.main`
  ${tw`mt-14 flex flex-1 flex-col border-l-1 border-neutral-300 p-4 lg:mt-0 lg:px-[32px] lg:py-4`}
`;

export const BellWrapper = styled.div`
  ${tw`relative hidden xs:block`}
`;

export const Notification = styled.div`
  ${tw`absolute -top-1 left-2 z-50 flex h-4 cursor-pointer items-center justify-center rounded-full px-1 text-white`}
`;

export const NotificationText = styled.span`
  ${tw`text-xs text-white pretendard-semibold`}
`;

export const DivideLine = styled(Minus)`
  ${tw`h-5 w-5 rotate-90 transform text-neutral-500`}
`;
