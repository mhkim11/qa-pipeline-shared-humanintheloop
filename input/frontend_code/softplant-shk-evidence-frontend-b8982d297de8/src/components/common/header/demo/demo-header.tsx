import { useRef, useState } from 'react';

import ReactDOM from 'react-dom';
// const List = '/src/assets/images/list.svg';
const List = new URL('/src/assets/images/list.svg', import.meta.url).href;
const History = new URL('/src/assets/images/history.svg', import.meta.url).href;
const Close = new URL('/src/assets/images/close.svg', import.meta.url).href;
const AI = new URL('/src/assets/images/aiBtn2.svg', import.meta.url).href;

const menuList = [
  { key: 'evidence', icon: List, label: '증거검색' },
  { key: 'history', icon: History, label: '히스토리' },
  { key: 'authority', icon: Close, label: '권한관리' },
  // { key: 'ai', icon: AI, label: 'AI분석' },
];

export type TDemoMenuKey = 'evidence' | 'history' | 'authority' | 'ai';

type TDemoHeaderProps = {
  activeMenu: TDemoMenuKey;
  onMenuChange: (key: TDemoMenuKey) => void;
};

export const DemoHeader = ({ activeMenu, onMenuChange }: TDemoHeaderProps) => {
  const [tooltip, setTooltip] = useState<{ key: string; left: number; top: number } | null>(null);
  const refs = {
    evidence: useRef<HTMLDivElement>(null),
    history: useRef<HTMLDivElement>(null),
    authority: useRef<HTMLDivElement>(null),
    ai: useRef<HTMLDivElement>(null),
  };
  // DEMO: AI 버튼은 항상 노출
  const shouldShowAIButton = true;

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
    <header className='fixed top-0 w-full bg-white pt-[75px]'>
      <div className='h-[100px]'>
        <div className='flex items-center justify-center bg-white'>
          <div id='evidence-table-body' className='flex min-w-[90%] items-center'>
            <div className=''>
              <div className='mt-[15px] flex h-[68px] w-[220px] items-center justify-center rounded-[16px] border border-[#e5e5e5] bg-[#f5f5f5] p-[6px]'>
                <div className='flex w-full items-center'>
                  {menuList.slice(0, 3).map((menu) => (
                    <div
                      key={menu.key}
                      ref={refs[menu.key as keyof typeof refs]}
                      className={`group relative flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[16px] ${activeMenu === menu.key ? 'border border-[#e5e5e5] bg-white' : ''} ${menu.key !== 'evidence' ? 'ml-[8px]' : ''}`}
                      onClick={() => onMenuChange(menu.key as TDemoMenuKey)}
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
            {/* DEMO: AI 버튼 항상 표시 */}
            {shouldShowAIButton && (
              <div
                ref={refs.ai}
                className={`group relative ml-[8px] mt-[15px] flex h-[68px] w-[68px] cursor-pointer items-center justify-center rounded-[16px] border border-[#e5e5e5] bg-white ${
                  activeMenu === 'ai' ? 'border-[#e5e5e5] bg-white ring-1 ring-[#e5e5e5]' : ''
                }`}
                onClick={() => onMenuChange('ai')}
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
