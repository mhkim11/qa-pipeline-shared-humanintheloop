import { useState } from 'react';

import { onMessageToast } from '@/components/utils';

// 전체 무료 결제상태 변경 모달 컴포넌트
interface IAdminFreePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (endDate: string | null) => void;
  isPending: boolean;
}

export const AdminFreePaymentModal = ({ isOpen, onClose, onConfirm, isPending }: IAdminFreePaymentModalProps) => {
  const [endDateOption, setEndDateOption] = useState<'none' | 'set'>('none');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  const handleConfirm = () => {
    if (endDateOption === 'set') {
      if (!selectedEndDate) {
        onMessageToast({ message: '종료일을 선택해주세요.' });
        return;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(selectedEndDate)) {
        onMessageToast({ message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' });
        return;
      }
      onConfirm(selectedEndDate);
    } else {
      onConfirm(null);
    }
  };

  const handleClose = () => {
    setEndDateOption('none');
    setSelectedEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div
        className='flex w-[431px] flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8'
        style={{
          boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
        }}
      >
        {/* 헤더 */}
        <div className='relative flex w-full items-center justify-center'>
          <h2 className='text-center text-[18px] font-bold text-[#252525]'>무료 결제상태 변경</h2>
        </div>

        {/* 설명 */}
        <p className='w-full text-center text-[14px] text-[#666666]'>
          전체 결제상태를 무료로 변경할 경우
          <br /> '신규 사건 등록'시 무료로 사건이 등록됩니다.
        </p>

        {/* 라디오 버튼 */}
        <div className='flex w-full items-center justify-center gap-4'>
          <label className='flex cursor-pointer items-center gap-3'>
            <div className='relative flex h-5 w-5 items-center justify-center'>
              <input
                type='radio'
                name='endDateOption'
                value='none'
                checked={endDateOption === 'none'}
                onChange={() => setEndDateOption('none')}
                disabled={isPending}
                className='sr-only'
              />
              <div
                className={`absolute inset-0 transition-all ${isPending ? 'opacity-50' : ''}`}
                style={{
                  borderRadius: '32px',
                  border: endDateOption === 'none' ? '8px solid #004AA4' : '2px solid #D1D5DB',
                  background: '#FFF',
                }}
              />
            </div>
            <span className='text-sm text-gray-700'>종료일 없음</span>
          </label>

          <label className='flex cursor-pointer items-center gap-3'>
            <div className='relative flex h-5 w-5 items-center justify-center'>
              <input
                type='radio'
                name='endDateOption'
                value='set'
                checked={endDateOption === 'set'}
                onChange={() => setEndDateOption('set')}
                disabled={isPending}
                className='sr-only'
              />
              <div
                className={`absolute inset-0 transition-all ${isPending ? 'opacity-50' : ''}`}
                style={{
                  borderRadius: '32px',
                  border: endDateOption === 'set' ? '8px solid #004AA4' : '2px solid #D1D5DB',
                  background: '#FFF',
                }}
              />
            </div>
            <span className='text-sm text-gray-700'>종료일 설정</span>
          </label>
        </div>
        {endDateOption === 'set' && (
          <div className='w-full'>
            <label className='mb-2 block text-left text-sm font-medium text-gray-700'>종료일 선택</label>
            <input
              type='date'
              value={selectedEndDate}
              onChange={(e) => setSelectedEndDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max='9999-12-31'
              disabled={isPending}
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#004AA4] focus:outline-none focus:ring-1 focus:ring-[#004AA4] disabled:opacity-50'
              placeholder='YYYY. MM. DD'
            />
          </div>
        )}

        {/* 버튼 */}
        <div className='flex w-full justify-center gap-3'>
          <button
            onClick={handleConfirm}
            disabled={(endDateOption === 'set' && !selectedEndDate) || isPending}
            className={`h-[46px] w-full rounded-lg text-sm font-medium text-white transition-colors ${
              (endDateOption === 'set' && !selectedEndDate) || isPending
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-[#004AA4] hover:bg-[#004AA4]/90'
            }`}
          >
            {isPending ? '변경 중...' : '변경하기'}
          </button>
          <button
            onClick={handleClose}
            disabled={isPending}
            className='w-full rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
