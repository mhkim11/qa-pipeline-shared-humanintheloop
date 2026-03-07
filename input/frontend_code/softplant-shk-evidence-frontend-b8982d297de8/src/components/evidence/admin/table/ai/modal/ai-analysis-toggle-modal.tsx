interface IAIAnalysisToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isActivating: boolean; // true면 ON으로 변경, false면 OFF로 변경
}

const AIAnalysisToggleModal = ({ isOpen, onClose, onConfirm, isLoading, isActivating }: IAIAnalysisToggleModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='flex w-[325px] flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 shadow-[0px_0px_20px_0px_rgba(167,167,167,0.20)]'>
        <h3 className='text-[20px] font-semibold text-[#252525]'>{isActivating ? 'AI분석 버튼 공개' : 'AI분석 버튼 비공개'}</h3>

        <div className='text-center'>
          <p className='text-[14px] text-[#5B5B5B]'>
            {isActivating ? (
              <>
                OFF상태에서 ON상태로 변경하면 모든 사용자
                <br />
                화면에서 AI분석 버튼이 노출됩니다.
                <br />
                사건별 ON/OFF 상태는 유지가 되며 사건별
                <br />
                ON/OFF상태에 영향을 주지 않습니다.
                <br />
                ON 상태로 변경하시겠습니까?
              </>
            ) : (
              <>
                ON상태에서 OFF상태로 변경하면 모든 사용자
                <br />
                화면에서 AI분석 버튼이 노출되지 않습니다.
                <br />
                사건별 ON/OFF 상태는 유지가 되며 사건별
                <br />
                ON/OFF상태에 영향을 주지 않습니다.
                <br />
                OFF 상태로 변경하시겠습니까?
              </>
            )}
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='h-[48px] w-[136px] rounded-lg bg-[#004AA4] text-[14px] font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? '처리 중...' : '확인'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='h-[48px] w-[136px] rounded-lg border border-[#E5E5E5] bg-white text-[14px] font-medium text-[#212121] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisToggleModal;
