interface IModalProps {
  storageMessage: string;
  confirmButtonText: string;
  sendMessage: string;
  handleSave: () => void;
  setIsModalOpen: () => void;
}

const ModalSelect = ({ sendMessage, storageMessage, confirmButtonText, setIsModalOpen: setIsModalOpen, handleSave }: IModalProps) => {
  return (
    <div className='fixed inset-0 z-[10000] flex items-center justify-center'>
      <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
      <div className='z-10 w-[390px] rounded-[16px] bg-[#fff] p-[32px] shadow-xl lg:h-auto'>
        <div className=''>
          <p className='text-center text-[18px] font-bold'>{sendMessage}</p>
          <div className='pt-[16px] text-center text-[14px] text-[#666]'>
            {storageMessage.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className='mt-[24px] flex justify-center'>
          <button className='h-[48px] w-full rounded-lg bg-[#0050B3] text-white hover:bg-sky-700' onClick={handleSave}>
            {confirmButtonText}
          </button>
          <button
            className='ml-4 h-[48px] w-full rounded-lg border border-[#DBDBDB] bg-[#fff] text-[#373737] hover:bg-gray-50'
            onClick={() => setIsModalOpen()}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelect;
