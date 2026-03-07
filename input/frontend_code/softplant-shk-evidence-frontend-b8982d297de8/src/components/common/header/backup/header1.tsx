import { useState, useRef } from 'react';

import ReactDOM from 'react-dom';
// const List = '/src/assets/images/list.svg';
const List = new URL('/src/assets/images/list.svg', import.meta.url).href;
const History = new URL('/src/assets/images/history.svg', import.meta.url).href;
const Close = new URL('/src/assets/images/close.svg', import.meta.url).href;
const AI = new URL('/src/assets/images/aiBtn.svg', import.meta.url).href;
import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useFindUserInfo } from '@query/query';

type THeaderProps = {
  onActionClick: (action: 'historyHandler' | 'authorityHandler') => void;
  fontSizeAdjustment?: number;
  setActiveComponent: (component: 'evidence' | 'history' | 'setting' | 'ai') => void;
};

const menuList = [
  { key: 'evidence', icon: List, label: '증거검색' },
  { key: 'history', icon: History, label: '히스토리' },
  { key: 'authority', icon: Close, label: '권한관리' },
  { key: 'ai', icon: AI, label: 'AI분석' },
];

export const Header = ({
  onActionClick,
  setActiveComponent,
}: THeaderProps & { onActionClick: (action: 'historyHandler' | 'authorityHandler' | 'aiHandler') => void }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('evidence');
  const [searchParams] = useSearchParams(); // 쿼리 파라미터 가져오기
  const [tooltip, setTooltip] = useState<{ key: string; left: number; top: number } | null>(null);
  const refs = {
    evidence: useRef<HTMLDivElement>(null),
    history: useRef<HTMLDivElement>(null),
    authority: useRef<HTMLDivElement>(null),
    ai: useRef<HTMLDivElement>(null),
  };

  const handleEvidenceListClick = () => {
    const currentProjectId = searchParams.get('project_id');
    const currentProjectName = searchParams.get('project_name');

    setActiveMenu('evidence');
    setActiveComponent('evidence');
    navigate(
      `/evidence/list${currentProjectId ? `?project_id=${currentProjectId}` : ''}${
        currentProjectName ? `&project_name=${encodeURIComponent(currentProjectName)}` : ''
      }`,
    );
  };

  const handleMouseEnter = (key: string) => {
    const ref = refs[key as keyof typeof refs].current;
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setTooltip({
        key,
        left: rect.left + rect.width / 2,
        top: rect.bottom,
      });
    }
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <header className='fixed top-[52px] w-full bg-white pt-[68px]'>
      <div className='h-[100px]'>
        <div className='flex items-center justify-center bg-white'>
          <div id='evidence-table-body' className='flex min-w-[90%] items-center 2xl:min-w-[90%]'>
            <div className=''>
              <div className='mt-[15px] flex h-[68px] w-[220px] items-center justify-center rounded-[16px] border border-[#e5e5e5] bg-[#f5f5f5] p-[6px]'>
                <div className='flex w-full items-center'>
                  {menuList.slice(0, 3).map((menu) => (
                    <div
                      key={menu.key}
                      ref={refs[menu.key as keyof typeof refs]}
                      className={`group relative flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[16px] ${activeMenu === menu.key ? 'border border-[#e5e5e5] bg-white' : ''} ${menu.key !== 'evidence' ? 'ml-[8px]' : ''}`}
                      onClick={() => {
                        setActiveMenu(menu.key);
                        if (menu.key === 'evidence') {
                          handleEvidenceListClick();
                        } else if (menu.key === 'history') {
                          onActionClick('historyHandler');
                        } else if (menu.key === 'authority') {
                          onActionClick('authorityHandler');
                        }
                      }}
                      onMouseEnter={() => handleMouseEnter(menu.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <img src={menu.icon} alt={menu.label} className='' />
                      {tooltip &&
                        tooltip.key === menu.key &&
                        ReactDOM.createPortal(
                          <div
                            className='fixed z-[9999] h-[36px] w-[80px] rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg'
                            style={{
                              left: tooltip.left - 40,
                              top: tooltip.top + 8,
                            }}
                          >
                            {menu.label}
                          </div>,
                          document.body,
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              ref={refs.ai}
              className='group relative ml-[8px] mt-[15px] flex h-[68px] w-[68px] cursor-pointer items-center justify-center rounded-[16px] border border-[#e5e5e5] bg-white'
              onClick={() => {
                setActiveMenu('ai');
                onActionClick('aiHandler');
              }}
              onMouseEnter={() => handleMouseEnter('ai')}
              onMouseLeave={handleMouseLeave}
            >
              <img src={AI} alt='ai' className='' />
              {tooltip &&
                tooltip.key === 'ai' &&
                ReactDOM.createPortal(
                  <div
                    className='fixed z-[9999] h-[36px] w-[80px] rounded-md border border-[#e5e5e5] bg-white text-center text-[14px] leading-[36px] text-[#666] shadow-lg'
                    style={{
                      left: tooltip.left - 40,
                      top: tooltip.top + 8,
                    }}
                  >
                    AI분석
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
