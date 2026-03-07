import { useState, useEffect } from 'react';

interface IReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
}

export const ReceiptModal = ({ isOpen, onClose, receiptUrl }: IReceiptModalProps): JSX.Element | null => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative max-h-[95vh] max-w-[95vw] overflow-auto rounded-lg bg-white shadow-lg'>
        {/* 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 p-4'>
          <h2 className='text-lg font-semibold text-gray-900'>영수증</h2>
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            ✕
          </button>
        </div>

        {/* 영수증 내용 */}
        <div className='relative'>
          {!iframeLoaded && (
            <div className='flex h-[600px] w-[800px] items-center justify-center bg-gray-50'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600'></div>
                <p className='text-gray-600'>영수증을 불러오는 중...</p>
              </div>
            </div>
          )}
          <iframe
            src={receiptUrl}
            className={`h-[600px] w-[800px] border-0 bg-white ${iframeLoaded ? 'block' : 'hidden'}`}
            title='영수증'
            onLoad={() => setIframeLoaded(true)}
            style={{ backgroundColor: 'white' }}
          />
        </div>

        {/* 하단 버튼 */}
        <div className='flex justify-end border-t border-gray-200 p-4'>
          <button onClick={onClose} className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
