type TActionType = 'public' | 'private' | 'delete' | 'order';

interface IAIMenuActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  actionType: TActionType;
  menuName?: string;
}

const AIMenuActionModal = ({ isOpen, onClose, onConfirm, isLoading, actionType }: IAIMenuActionModalProps) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (actionType) {
      case 'public':
        return {
          title: '메뉴 공개',
          message: (
            <>
              OFF상태에서 ON상태로 변경하면 모든 사용자
              <br />
              화면에서 해당 메뉴가 노출됩니다.
              <br />
              ON 상태로 변경하시겠습니까?
            </>
          ),
        };
      case 'private':
        return {
          title: '메뉴 비공개',
          message: (
            <>
              ON상태에서 OFF상태로 변경하면 모든 사용자
              <br />
              화면에서 해당 메뉴가 노출되지 않습니다.
              <br />
              OFF 상태로 변경하시겠습니까?
            </>
          ),
        };
      case 'delete':
        return {
          title: '메뉴 삭제',
          message: (
            <>
              선택한 메뉴를 삭제하면 해당 메뉴가 목록에서
              <br />
              제거되며 사용자에게 노출되지 않습니다.
              <br />
              삭제하시겠습니까?
            </>
          ),
        };
      case 'order':
        return {
          title: '메뉴 순서 변경',
          message: (
            <>
              선택한 메뉴의 순서를 변경하면 사용자
              <br />
              화면에서 변경된 순서로 메뉴가 표시됩니다.
              <br />
              순서를 변경하시겠습니까?
            </>
          ),
        };
      default:
        return { title: '', message: '' };
    }
  };

  const { title, message } = getModalContent();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='flex w-[325px] flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 shadow-[0px_0px_20px_0px_rgba(167,167,167,0.20)]'>
        <h3 className='text-[20px] font-semibold text-[#252525]'>{title}</h3>

        {/*   {menuName && (
          <div className='text-center'>
            <p className='text-[16px] font-medium text-[#252525]'>{menuName}</p>
          </div>
        )} */}

        <div className='text-center'>
          <p className='text-[14px] text-[#5B5B5B]'>{message}</p>
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

export default AIMenuActionModal;
