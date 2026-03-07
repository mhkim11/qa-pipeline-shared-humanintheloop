// 전체 유료 결제상태 변경 모달 컴포넌트
interface IAdminPaidPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const AdminPaidPaymentModal = ({ isOpen, onClose, onConfirm, isPending }: IAdminPaidPaymentModalProps) => {
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
          <h2 className='text-center text-[18px] font-bold text-[#252525]'>유료 결제상태 변경</h2>
        </div>

        {/* 설명 */}
        <p className='w-full text-center text-[14px] text-[#666666]'>
          전체 결제상태를 유료로 변경할 경우
          <br />
          '신규 사건 등록'시 유료로 사건이 등록됩니다.
        </p>

        {/* 버튼 */}
        <div className='flex w-full justify-center gap-3'>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`h-[46px] w-full rounded-lg text-sm font-medium text-white transition-colors ${
              isPending ? 'cursor-not-allowed bg-gray-400' : 'bg-[#004AA4] hover:bg-[#004AA4]/90'
            }`}
          >
            {isPending ? '변경 중...' : '변경하기'}
          </button>
          <button
            onClick={onClose}
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
