import { useEffect, useRef, useState } from 'react';

import { FaArrowRightLong } from 'react-icons/fa6';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { DemoHeader, type TDemoMenuKey } from '@/components/common/header/demo/demo-header';
import { DemoMainHeader } from '@/components/common/header/demo/demo-main-header';
import { DEMO_CLIENT_NAME, DEMO_PROJECT_ID, DEMO_PROJECT_NAME } from '@/pages/logout/demo/demo-constants';
import DemoAIPage from '@/pages/logout/demo/evidence-demo-ai-page';
import { DemoAuthorityTable } from '@/pages/logout/demo/evidence-demo-authority-table';
import { DemoHistoryTable } from '@/pages/logout/demo/evidence-demo-history-table';
import EvidenceDemoTable from '@/pages/logout/demo/evidence-demo-table';

const EvidenceDemoMainPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TDemoMenuKey | null) || 'evidence';
  const [activeComponent, setActiveComponent] = useState<TDemoMenuKey>(initialTab);
  const navigate = useNavigate();
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const ensureDemoQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      const hasProjectId = !!params.get('project_id');
      if (!hasProjectId) {
        params.set('project_id', DEMO_PROJECT_ID);
        params.set('project_name', DEMO_PROJECT_NAME);
        params.set('client_name', DEMO_CLIENT_NAME);
        navigate({ pathname: '/demo', search: params.toString() }, { replace: true });
      }
    };
    ensureDemoQueryParams();
  }, [navigate]);

  useEffect(() => {
    const next = (searchParams.get('tab') as TDemoMenuKey | null) || 'evidence';
    setActiveComponent(next);
  }, [searchParams]);

  return (
    <>
      <>
        <div className='absolute bottom-[5%] right-4 z-[99999]'>
          {(() => {
            const ctaClassName =
              'demo-signup-cta group fixed bottom-0 right-[10%] z-[99999] flex h-[72px] w-[172px] text-white items-center justify-center rounded-full border border-white/50 bg-gradient-to-r from-[#1865FF] to-[#8772F7] shadow-[0_18px_50px_rgba(24,101,255,0.55)] ring-2 ring-white/70 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.08] hover:ring-white active:scale-[0.98] sm:right-6';
            return (
              <button
                type='button'
                aria-label='회원가입하러 가기'
                className={ctaClassName}
                onClick={() => {
                  // DEMO: 로그인 없이 데모 제공 - 회원가입은 새 탭으로 이동만 수행
                  window.open('https://app.ailex.co.kr/register', '_blank');
                }}
              >
                회원가입하러 가기
                <FaArrowRightLong className='relative z-10 ml-2 text-[22px] text-white drop-shadow' />
              </button>
            );
          })()}
        </div>
        <DemoMainHeader />
        <DemoHeader
          activeMenu={activeComponent}
          onMenuChange={(key) => {
            setActiveComponent(key);
            const params = new URLSearchParams(window.location.search);
            params.set('tab', key);
            navigate({ pathname: '/demo', search: params.toString() }, { replace: true });
          }}
        />
      </>

      {activeComponent === 'evidence' ? <EvidenceDemoTable /> : null}
      {activeComponent === 'history' ? <DemoHistoryTable /> : null}
      {activeComponent === 'authority' ? <DemoAuthorityTable /> : null}
      {activeComponent === 'ai' ? <DemoAIPage /> : null}
    </>
  );
};

export default EvidenceDemoMainPage;
