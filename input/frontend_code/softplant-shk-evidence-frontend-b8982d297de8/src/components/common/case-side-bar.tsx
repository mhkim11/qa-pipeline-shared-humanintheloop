import type { JSX } from 'react';

import { PanelLeft, Settings, Users } from 'lucide-react';
type TCaseSideBarItem = {
  key: string;
  label: string;
  icon?: JSX.Element;
  isActive?: boolean;
  children?: TCaseSideBarItem[];
  onClick: () => void;
};

type TCaseSideBarProps = {
  items: TCaseSideBarItem[];
  topSlot?: JSX.Element;
  bottomSlot?: JSX.Element;

  /** true면 사이드바를 접어서(좁게) 표시 */
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;

  /** 하단 푸터 아바타 */
  avatar?: {
    /** 이니셜 1글자 */
    text: string;
    imageUrl?: string;
    bgColor?: string;
    onClick?: () => void;
  };

  /** 하단 사람(멤버/권한관리) 아이콘 클릭 */
  onClickUsers?: () => void;

  /** 설정 클릭 */
  onClickSettings?: () => void;
};

export const CaseSideBar = ({
  items,
  topSlot,
  bottomSlot,
  isCollapsed = false,
  onToggleCollapsed,
  avatar,
  onClickUsers,
  onClickSettings,
}: TCaseSideBarProps): JSX.Element => {
  const computeItemActive = (item: TCaseSideBarItem) => {
    if (item.isActive) return true;
    if (Array.isArray(item.children) && item.children.length > 0) return item.children.some((c) => !!c.isActive);
    return false;
  };

  const footer = (() => {
    if (bottomSlot) return bottomSlot;
    if (!avatar && !onToggleCollapsed && !onClickUsers && !onClickSettings) return null;

    if (isCollapsed) {
      return (
        <div className='flex h-[190px] w-full flex-col items-center justify-between self-stretch border-t border-[#D4D4D8] px-[6px] py-[12px]'>
          <div className='flex w-full flex-col items-center gap-[8px]'>
            <button
              type='button'
              onClick={avatar?.onClick}
              className='flex h-[32px] w-[32px] items-center justify-center'
              title='내 프로필'
              disabled={!avatar?.onClick}
            >
              <div
                className='flex h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-full text-[16px] font-bold text-[#2B2B2B]'
                style={{ backgroundColor: avatar?.bgColor || '#E5E7EB' }}
              >
                {avatar?.imageUrl ? <img src={avatar.imageUrl} alt='프로필' className='h-full w-full object-cover' /> : avatar?.text}
              </div>
            </button>
            <button
              type='button'
              onClick={onClickUsers}
              className='flex h-[32px] w-[32px] items-center justify-center font-extrabold text-[#8A8A8E] hover:text-[#3F3F46]'
              title='권한 관리'
              disabled={!onClickUsers}
            >
              <Users className='h-[18px] w-[18px]' />
            </button>

            <button
              type='button'
              onClick={onClickSettings}
              className='flex h-[32px] w-[32px] items-center justify-center text-[#8A8A8E] hover:text-[#3F3F46]'
              title='설정'
              disabled={!onClickSettings}
            >
              <Settings className='h-[18px] w-[18px]' />
            </button>
          </div>

          <button
            type='button'
            onClick={onToggleCollapsed}
            className='flex h-[32px] w-[32px] items-center justify-center text-[#8A8A8E] hover:text-[#3F3F46]'
            title='사이드바 펼치기'
            disabled={!onToggleCollapsed}
          >
            <PanelLeft className='h-[18px] w-[18px]' />
          </button>
        </div>
      );
    }

    return (
      <div
        className={`flex h-[48px] w-full self-stretch border-t border-[#D4D4D8] p-[6px] ${isCollapsed ? 'flex-col items-center gap-6' : 'flex-col items-start'}`}
      >
        <div className={`flex w-full ${isCollapsed ? 'flex-col items-center gap-2' : 'items-center justify-between'}`}>
          <div className={`${isCollapsed ? 'flex-col items-center gap-2' : 'flex items-center gap-3'}`}>
            <button
              type='button'
              onClick={avatar?.onClick}
              className='flex items-center justify-center'
              title='내 프로필'
              disabled={!avatar?.onClick}
            >
              <div
                className='flex h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-full text-[16px] font-bold text-[#2B2B2B]'
                style={{ backgroundColor: avatar?.bgColor || '#E5E7EB' }}
              >
                {avatar?.imageUrl ? <img src={avatar.imageUrl} alt='프로필' className='h-full w-full object-cover' /> : avatar?.text}
              </div>
            </button>
            <button
              type='button'
              onClick={onClickUsers}
              className='flex h-[32px] w-[32px] items-center justify-center font-extrabold text-[#8A8A8E] hover:text-[#3F3F46]'
              title='권한 관리'
              disabled={!onClickUsers}
            >
              <Users className='h-[18px] w-[18px]' />
            </button>
            <button
              type='button'
              onClick={onClickSettings}
              className='text-[#8A8A8E] hover:text-[#3F3F46]'
              title='설정'
              disabled={!onClickSettings}
            >
              <Settings className='h-[18px] w-[18px]' />
            </button>
          </div>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-6' : 'gap-3'}`}>
            <button
              type='button'
              onClick={onToggleCollapsed}
              className='text-[#8A8A8E] hover:text-[#3F3F46]'
              title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              disabled={!onToggleCollapsed}
            >
              <PanelLeft className='h-[18px] w-[18px]' />
            </button>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <aside
      className='relative flex h-full flex-col bg-[#f4f4f5]'
      style={{
        width: isCollapsed ? 60 : 180,
        padding: 12,
      }}
    >
      <div className='w-full'>
        {topSlot}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => {
            const isActive = computeItemActive(item);
            return (
              <div key={item.key} className='w-full'>
                <button
                  type='button'
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    height: 32,
                    padding: 'var(--semantic-2xs, 4px) var(--absolute-3, 12px)',
                    alignItems: 'center',
                    gap: 'var(--semantic-xs, 8px)',
                    alignSelf: 'stretch',
                    width: '100%',
                    borderRadius: 8,
                    backgroundColor: isActive ? '#E4E4E7' : 'transparent',
                    color: isActive ? '#18181B' : '#8A8A8E',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  title={item.label}
                >
                  {isCollapsed ? (
                    item.icon ? (
                      <span className='text-[#8A8A8E]'>{item.icon}</span>
                    ) : (
                      <span className='text-[#8A8A8E]'>{item.label.trim().charAt(0)}</span>
                    )
                  ) : (
                    <>
                      {item.icon ? <span className='text-[#8A8A8E]'>{item.icon}</span> : null}
                      <span>{item.label}</span>
                    </>
                  )}
                </button>

                {!isCollapsed && Array.isArray(item.children) && item.children.length > 0 ? (
                  <div className='relative mt-1 w-full pl-[22px]'>
                    <div className='absolute left-[14px] top-0 h-full w-px bg-[#D4D4D8]' />
                    <div className='flex flex-col gap-[6px]'>
                      {item.children.map((child) => {
                        const childActive = !!child.isActive;
                        return (
                          <button
                            key={child.key}
                            type='button'
                            onClick={child.onClick}
                            className={`flex h-[32px] w-full items-center rounded-[8px] px-[12px] text-left text-[14px] ${
                              childActive ? 'bg-[#E4E4E7] font-bold text-[#18181B]' : 'font-medium text-[#8A8A8E]'
                            }`}
                            title={child.label}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* footer는 레이아웃을 차지하지 않도록 overlay로 처리 */}
      {footer ? <div className='absolute bottom-0 left-0 right-0 z-10'>{footer}</div> : null}
    </aside>
  );
};
