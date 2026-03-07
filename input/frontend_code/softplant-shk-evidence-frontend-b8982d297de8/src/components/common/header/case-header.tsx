import { useState } from 'react';

import { Sparkle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import logo from '@/assets/images/AiLexLogo.png';
import { NotificationsModal } from '@/components/evidence/modal/evidence-notification-modal';
import { useUnreadNotificationCount } from '@/hooks/react-query';

type TCaseHeaderProps = {
  /** 읽지 않은 알림이 있으면 파란 점이 있는 아이콘으로 표시 */
  hasUnreadNotifications?: boolean;
  onClickNotification?: () => void;
  onClickSparkle?: () => void;
  onClickShare?: () => void;
};

export const CaseHeader = ({ hasUnreadNotifications, onClickNotification, onClickSparkle, onClickShare }: TCaseHeaderProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projectName = searchParams.get('project_name') || '';
  const clientName = searchParams.get('client_name') || '';

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { response: unreadNotificationResponse } = useUnreadNotificationCount();
  const unreadCount = unreadNotificationResponse?.data?.count ?? 0;
  const shouldShowUnreadDot = hasUnreadNotifications ?? unreadCount > 0;

  const handleListClick = () => {
    navigate('/');
  };

  return (
    <div className='fixed z-50 w-full'>
      <div className='flex h-[48px] items-center justify-between bg-[#f4f4f5] px-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <img src={logo} alt='홈아이콘' className='w-[80px] cursor-pointer' onClick={handleListClick} />

          {projectName && (
            <div className='ml-[14px] flex min-w-0 items-center gap-2'>
              <span className='text-[14px] font-semibold text-[#8A8A8E]'>민사</span>
              <span className='max-w-[520px] truncate text-[16px] font-semibold text-[#000]'>{projectName}</span>
              {clientName && (
                <span className='inline-flex h-[24px] min-w-[77px] max-w-[240px] items-center rounded-full bg-[#DBEAFE] px-2 text-[13px] font-semibold text-[#1D4ED8]'>
                  <span className='truncate'>피고: {clientName}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative'>
            <button
              type='button'
              aria-label='알림'
              onClick={() => {
                onClickNotification?.();
                setIsNotificationModalOpen((v) => !v);
              }}
              className='flex h-[32px] w-[32px] items-center justify-center'
            >
              <img
                src={shouldShowUnreadDot ? '/images/Notification-Center.svg' : '/images/Notification-Center-b.svg'}
                alt=''
                className='h-[32px] w-[32px]'
              />
            </button>

            {isNotificationModalOpen && (
              <NotificationsModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
            )}
          </div>

          <button
            type='button'
            aria-label='반짝'
            onClick={onClickSparkle}
            className='flex h-[14.5px] w-[14.5px] items-center justify-center'
          >
            <Sparkle className='text-[#8A8A8E]' />
          </button>

          <button
            type='button'
            onClick={onClickShare}
            className='flex h-[32px] w-[49px] items-center justify-center rounded-lg border border-[#D4D4D8] bg-white text-[14px] font-semibold text-[#09090B] hover:bg-[#FAFAFA]'
          >
            공유
          </button>
        </div>
      </div>
    </div>
  );
};
