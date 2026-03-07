import { useState, JSX, ReactElement, cloneElement, useEffect } from 'react';

// import { Spinner } from '@nextui-org/spinner';
// import { FolderOpen, Users, Sparkles, LogOut, CreditCard } from 'lucide-react';
import { FolderOpen, Users, Sparkles, LogOut, User } from 'lucide-react';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpandFilled } from 'react-icons/tb';
import { useEventListener, useWindowSize } from 'usehooks-ts';

import Logo from '@assets/images/AiLexLogo.png';
import { AdminPasswordChangeModal } from '@/components/evidence/modal/admin-password-change-modal';
import { useLoginStore, useSidebarStore } from '@/hooks/stores';
import { cn } from '@/lib/utils';
import { dashBoardStyle as S } from '@/shared/styled';

type TDashboardProps = {
  children: ReactElement;
};
const sidebarVariants = {
  open: {
    left: 0,
    transition: {
      type: 'linear',
      duration: 0.35,
    },
  },
  close: {
    left: -100,
    transition: {
      type: 'linear',
      duration: 0.35,
    },
  },
};

/**
 * * 대시보드 컴포넌트
 * @param {TDashboardProps} props 대시보드 컴포넌트 props
 * @returns {JSX.Element} 대시보드 컴포넌트
 */
export function AdminDashBoard({ children }: TDashboardProps): JSX.Element {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const { isCollapsed, dispatchIsCollapsed } = useSidebarStore();

  // 메뉴 상태 관리 - 기본값을 '사건관리'로 설정
  const [activeMenu, setActiveMenu] = useState<'case-management' | 'user-info' | 'ai-menu' | 'payment-menu'>('case-management');
  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // ! 기본 state 모음
  const { login, dispatchLogin } = useLoginStore();

  // ! usehooks-ts 모음
  const { width } = useWindowSize();

  useEventListener('resize', () => {
    if (width >= 1300) {
      dispatchIsCollapsed({
        type: 'open',
      });
    } else {
      dispatchIsCollapsed({
        type: 'close',
      });
    }
  });

  // 브라우저 히스토리 제어
  useEffect(() => {
    // 현재 페이지를 히스토리에 추가하여 뒤로가기 시 현재 페이지로 돌아오도록 함
    window.history.pushState({ page: 'admin-home' }, '', window.location.pathname);

    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기 시 메인 사건관리로 돌아가기
      setActiveMenu('case-management');
      setSelectedProjectId(null);
      setSelectedOfficeId(null);

      // /logout으로 이동하려고 하면 현재 페이지로 다시 푸시
      if (window.location.pathname === '/logout') {
        window.history.pushState({ page: 'admin-home' }, '', '/');
        event.preventDefault();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 페이지를 떠나려고 할 때 /logout이면 현재 페이지로 리다이렉트
      if (window.location.pathname === '/logout') {
        window.location.href = '/';
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 사건목록에서 사건 선택 시 처리
  const handleCaseSelect = (projectId: string, officeId: string) => {
    setSelectedProjectId(projectId);
    setSelectedOfficeId(officeId);
    setActiveMenu('case-management'); // 사건관리 탭으로 전환
  };

  const handleMenuClick = (menu: 'case-management' | 'user-info' | 'ai-menu' | 'payment-menu') => {
    setActiveMenu(menu);
    // 메뉴 변경 시 프로젝트 선택 해제
    setSelectedProjectId(null);
    setSelectedOfficeId(null);
  };

  return (
    <>
      {/* 사이드바가 닫혔을 때 보이는 토글 버튼 */}
      {!isCollapsed && (
        <button
          className='fixed left-4 top-4 z-[9999] flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white shadow-lg transition-all hover:bg-gray-50'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('토글 버튼 클릭됨, 현재 isCollapsed:', isCollapsed);
            dispatchIsCollapsed({
              type: 'open',
            });
          }}
        >
          <TbLayoutSidebarRightCollapse className='h-5 w-5 text-gray-600' />
        </button>
      )}

      <S.SContainer className={cn(isCollapsed ? 'lg:pl-[76px]' : '')}>
        <S.Container initial={false} animate={isCollapsed ? 'open' : 'close'} variants={sidebarVariants}>
          <S.WrapperBox>
            <S.Wrapper>
              <div className='flex items-center justify-between'>
                <div
                  className='flex cursor-pointer items-center justify-center'
                  onClick={() => {
                    // 메인 사건관리로 돌아가기 (상태 초기화)
                    setActiveMenu('case-management');
                    setSelectedProjectId(null);
                    setSelectedOfficeId(null);
                  }}
                >
                  <img src={Logo} alt='logo' className='w-[60px]' />
                </div>

                {/* 사이드바 닫기 버튼 */}
                <button
                  className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-all hover:bg-gray-200'
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatchIsCollapsed({
                      type: 'close',
                    });
                  }}
                >
                  <TbLayoutSidebarRightExpandFilled className='h-4 w-4 text-gray-600' />
                </button>
              </div>
            </S.Wrapper>
            <S.Sidebar>
              <S.Nav>
                <S.NavBox className='flex h-full w-full flex-col p-1'>
                  {/* 메인 메뉴 - 고정 영역 */}
                  <div className='mb-3 flex flex-shrink-0 flex-col gap-y-2 pb-16'>
                    <button
                      className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-all hover:bg-gray-100 ${
                        activeMenu === 'case-management' ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                      }`}
                      onClick={() => handleMenuClick('case-management')}
                    >
                      <FolderOpen className='h-6 w-6' />
                      <span className='text-xs font-medium'>사건관리</span>
                    </button>
                    <button
                      className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-all hover:bg-gray-100 ${
                        activeMenu === 'user-info' ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                      }`}
                      onClick={() => handleMenuClick('user-info')}
                    >
                      <Users className='h-6 w-6' />
                      <span className='text-xs font-medium'>회원정보</span>
                    </button>
                    <button
                      className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-all hover:bg-gray-100 ${
                        activeMenu === 'ai-menu' ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                      }`}
                      onClick={() => handleMenuClick('ai-menu')}
                    >
                      <Sparkles className='h-6 w-6' />
                      <span className='text-xs font-medium'>AI메뉴</span>
                    </button>

                    {/*  <button
                      className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-all hover:bg-gray-100 ${
                        activeMenu === 'payment-menu' ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                      }`}
                      onClick={() => handleMenuClick('payment-menu')}
                    >
                      <CreditCard className='h-6 w-6' />
                      <span className='text-xs font-medium'>결제관리</span>
                    </button> */}
                  </div>

                  {/* 사용자 정보 및 로그아웃 버튼 - 하단 고정 */}
                  <div className='absolute bottom-2 left-0 right-0 border-t border-gray-200 p-1'>
                    {/* 사용자 정보 및 마이페이지 */}
                    <button
                      className='mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-gray-700 transition-all hover:bg-gray-100'
                      onClick={() => {
                        setIsPasswordModalOpen(true);
                      }}
                    >
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900'>
                        <User className='h-4 w-4' />
                      </div>
                      <div className='flex-1 overflow-hidden'>
                        <div className='truncate text-xs font-medium text-gray-900'>{login?.data?.user?.name || '사용자'}</div>
                      </div>
                    </button>
                    {/* 로그아웃 버튼 */}
                    <button
                      className='flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-gray-700 transition-all hover:bg-red-50 hover:text-red-600'
                      onClick={async (): Promise<void> => {
                        dispatchLogin({ type: 'LOGOUT' });
                      }}
                    >
                      <LogOut className='h-6 w-6' />
                      <span className='text-xs font-medium'>로그아웃</span>
                    </button>
                  </div>
                </S.NavBox>
              </S.Nav>
            </S.Sidebar>
          </S.WrapperBox>
        </S.Container>
        <S.MainWrapper>
          {/* // ! main 컴포넌트 */}
          <S.Main>
            {activeMenu === 'case-management'
              ? cloneElement(children, {
                  selectedProjectId,
                  selectedOfficeId,
                  showUserInfo: false,
                  showAIAnalysisMenu: false,
                  showCaseManagement: true,
                  showPaymentMenu: false,
                  onCaseSelect: handleCaseSelect,
                })
              : cloneElement(children, {
                  selectedProjectId,
                  selectedOfficeId,
                  showUserInfo: activeMenu === 'user-info',
                  showAIAnalysisMenu: activeMenu === 'ai-menu',
                  showCaseManagement: false,
                  showPaymentMenu: activeMenu === 'payment-menu',
                  onCaseSelect: handleCaseSelect,
                })}
          </S.Main>
        </S.MainWrapper>
      </S.SContainer>
      {/* 비밀번호 변경 모달 */}
      <AdminPasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
        }}
      />
    </>
  );
}
