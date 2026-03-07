import { useFindUserInfo } from '@/hooks/react-query';

interface IPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  onReceiptView: (receiptUrl: string) => void;
}

export const PaymentDetailModal = ({ isOpen, onClose, payment, onReceiptView }: IPaymentDetailModalProps) => {
  // 현재 사용자 정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();

  // 디버깅용 로그
  console.log('PaymentDetailModal Debug:', {
    payment,
    payer_id: (payment as any)?.payer_id,
    user_id: (payment as any)?.user_id,
    current_user_id: findEvidenceUserInfo?.data?.user_id,
    is_payer_me: (payment as any)?.payer_id === findEvidenceUserInfo?.data?.user_id,
    is_user_me: (payment as any)?.user_id === findEvidenceUserInfo?.data?.user_id,
  });

  if (!isOpen || !payment) return null;

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
      <div
        style={{
          display: 'flex',
          width: '500px',
          padding: '32px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '16px',
          background: '#FFF',
          boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
        }}
      >
        {/* 제목 */}
        <div className='mb-6 w-full text-left'>
          <h3 className='text-[24px] font-bold text-[#252525]'>결제 내역</h3>
        </div>

        {/* 결제 정보 */}
        <div className='w-full space-y-4'>
          {/* 결제자 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>결제자</span>
            <div className='flex w-[80%] items-center'>
              <span className='text-[14px] font-medium text-[#5B5B5B]'>{payment.payer_name || '-'}</span>
              {(() => {
                const payerId = (payment as any)?.payer_id;
                const currentUserId = findEvidenceUserInfo?.data?.user_id;
                // payer_id가 존재하고, currentUserId와 정확히 일치할 때만 "나" 표시
                const isPayerMe = Boolean(payerId && currentUserId && String(payerId).trim() === String(currentUserId).trim());
                console.log('결제자 비교:', {
                  payerId,
                  currentUserId,
                  isPayerMe,
                  payerIdType: typeof payerId,
                  currentUserIdType: typeof currentUserId,
                });
                return isPayerMe ? <span className='ml-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs'>나</span> : null;
              })()}
            </div>
          </div>

          {/* 이용자 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>이용자</span>
            <div className='flex w-[80%] items-center'>
              <span className='text-[14px] font-medium text-[#5B5B5B]'>
                {payment.user_name
                  ? `${payment.user_name}${(payment as any).email ? ` (${(payment as any).email})` : ''}`
                  : (payment as any).email || '-'}
              </span>
              {(() => {
                const userId = (payment as any)?.user_id;
                const currentUserId = findEvidenceUserInfo?.data?.user_id;
                const isUserMe = userId && currentUserId && userId === currentUserId;
                console.log('이용자 비교:', { userId, currentUserId, isUserMe });
                return isUserMe ? <span className='ml-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs'>나</span> : null;
              })()}
            </div>
          </div>

          {/* 상품명 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>상품명</span>
            <span className='w-[80%] text-[14px] font-medium text-[#5B5B5B]'>
              {payment.payment_type === 'case_subscription'
                ? '기본 플랜, 사건 전체 이용권'
                : payment.payment_type === 'case_participation'
                  ? '사건 참여'
                  : payment.payment_type}
            </span>
          </div>

          {/* 이용 기간 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>이용 기간</span>
            <span className='w-[80%] text-[14px] font-medium text-[#5B5B5B]'>
              {payment.payment_date
                ? (() => {
                    const startDate = new Date(payment.payment_date);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + 1);

                    const formatDate = (date: Date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}.${month}.${day}`;
                    };

                    return `${formatDate(startDate)}~${formatDate(endDate)}`;
                  })()
                : '-'}
            </span>
          </div>

          {/* 결제수단 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>결제수단</span>
            <div className='flex w-[80%] items-center space-x-2'>
              <span className='text-[14px] font-medium text-[#5B5B5B]'>
                {payment.card_name}, {payment.card_last4}
              </span>
              {payment.receipt_url && (
                <button
                  onClick={() => {
                    onClose();
                    onReceiptView(payment.receipt_url);
                  }}
                  className='text-[14px] text-[#1890FF] underline'
                >
                  매출전표
                </button>
              )}
            </div>
          </div>

          {/* 결제일 */}
          <div className='flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-[#212121]'>결제일</span>
            <span className='w-[80%] text-[14px] font-medium text-[#5B5B5B]'>
              {payment.payment_date
                ? (() => {
                    const date = new Date(payment.payment_date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}.${month}.${day} ${hours}:${minutes}`;
                  })()
                : '-'}
            </span>
          </div>

          {/* 총 결제금액 */}
          <div className='flex items-center justify-between border-t border-[#E5E5E5] pt-[17px]'>
            <span className='text-[16px] font-bold text-[#252525]'>총 결제금액</span>
            <span className='text-[18px] font-bold text-[#252525]'>{payment.amount?.toLocaleString()}원</span>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className='mt-[20px] w-full border-t border-[#E5E5E5] pt-[17px]'>
          <button
            onClick={onClose}
            className='h-[48px] w-full rounded-lg bg-[#F3F3F3] text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#D5D5D5]'
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
