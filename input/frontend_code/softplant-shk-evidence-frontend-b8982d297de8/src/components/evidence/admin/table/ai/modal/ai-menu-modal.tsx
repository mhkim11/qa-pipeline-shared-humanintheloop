import { useEffect, useState } from 'react';

interface IAIMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (menuName: string) => void;
  isLoading: boolean;
  title: string;
  initialValue?: string;
  submitButtonText?: string;
}

const AIMenuModal = ({ isOpen, onClose, onSubmit, isLoading, title, initialValue = '', submitButtonText = '확인' }: IAIMenuModalProps) => {
  const [menuName, setMenuName] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (menuName.trim()) {
      onSubmit(menuName.trim());
      if (!initialValue) {
        // 등록 모드일 때만 초기화
        setMenuName('');
      }
    }
  };

  const handleClose = () => {
    if (!initialValue) {
      // 등록 모드일 때만 초기화
      setMenuName('');
    } else {
      // 수정 모드일 때는 원래 값으로 되돌리기
      setMenuName(initialValue);
    }
    onClose();
  };

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen && initialValue) {
      setMenuName(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md transform rounded-lg bg-white p-[32px] shadow-xl transition-all'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-[24px] font-semibold text-[#252525]'>{title}</h3>
          <button onClick={handleClose} className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='mb-6'>
            <label className='mb-2 block text-[14px] font-medium text-[#5B5B5B]'>
              메뉴명 <span className='text-[#1890FF]'>*</span>
            </label>
            <input
              type='text'
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className='h-[56px] w-full rounded-[8px] border border-[#E5E5E5] px-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='메뉴명을 입력하세요'
              required
              disabled={isLoading}
            />
          </div>
          <div className='border-b border-[#E5E5E5]'></div>
          <div className='mt-[24px] flex justify-center gap-3'>
            <button
              type='submit'
              disabled={isLoading || !menuName.trim()}
              className={`h-[48px] w-[136px] rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                isLoading || !menuName.trim()
                  ? 'bg-[#F3F3F3] text-[#BABABA]'
                  : 'bg-[#004AA4] text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? '처리 중...' : submitButtonText}
            </button>
            <button
              type='button'
              onClick={handleClose}
              disabled={isLoading}
              className='h-[48px] w-[136px] rounded-lg border border-[#E5E5E5] bg-white text-sm font-medium text-[#212121] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIMenuModal;
