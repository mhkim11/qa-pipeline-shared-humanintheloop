interface ICaseClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
  isManager: boolean;
  onStatusChange?: () => void;
  onCaseDetailView?: () => void;
}

export const CaseClosedModal = ({ isOpen, onClose, isManager, onStatusChange }: ICaseClosedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
      <div
        style={{
          display: 'flex',
          width: '400px',
          padding: '32px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          borderRadius: '16px',
          background: '#FFF',
          boxShadow: '0 0 20px 0 rgba(167, 167, 167, 0.20)',
        }}
      >
        {/* 제목 */}
        <div className='text-center'>
          <h3 className='text-[18px] font-bold text-[#252525]'>사건이 종결되었습니다.</h3>
        </div>

        {/* 메시지 */}
        <div className='text-center'>
          {isManager ? (
            <p className='text-[14px] leading-[20px] text-[#666666]'>
              진행중으로 변경 시 참여자가
              <br />
              다시 사건에 접근할 수 있습니다.
            </p>
          ) : (
            <p className='text-[14px] leading-[20px]' style={{ color: '#888888' }}>
              관리자에 의해 진행중으로 변경되면
              <br />
              다시 이용할 수 있습니다.
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className='flex w-full gap-3'>
          {isManager ? (
            <>
              <button
                onClick={onStatusChange}
                className='h-[48px] flex-1 rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
              >
                진행중으로 변경
              </button>
              <button
                onClick={onClose}
                className='h-[48px] flex-1 rounded-lg bg-[#F3F3F3] text-[16px] font-medium text-[#212121] transition-colors hover:bg-[#D5D5D5]'
              >
                취소
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className='h-[48px] w-full rounded-lg bg-[#004AA4] text-[16px] font-medium text-white transition-colors hover:bg-[#004AA4]/90'
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
