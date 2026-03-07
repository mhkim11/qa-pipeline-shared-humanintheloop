interface IModalProps {
  storageMessage: string;
  sendMessage: string;
  setIsModalOpen: () => void;
}

const WarningModal = ({ sendMessage, storageMessage, setIsModalOpen: setIsModalOpen }: IModalProps) => {
  return (
    <div className='fixed inset-0 z-[50] flex items-center justify-center'>
      <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
      <div className='z-[9999] w-[325px] rounded-[16px] border bg-[#fff] p-[32px] shadow-xl lg:h-auto'>
        <div className=''>
          <p className='text-center text-[18px] font-bold text-[#000]'>{sendMessage}</p>
          <p className='pt-[16px] text-center text-[14px] text-[#000]'>{storageMessage}</p>
        </div>
        <div className='mt-[24px] flex justify-center'>
          <button
            className='ml-4 h-[48px] w-full rounded-lg border border-[#DBDBDB] bg-[#fff] text-[#373737] hover:bg-gray-50'
            onClick={() => setIsModalOpen()}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
