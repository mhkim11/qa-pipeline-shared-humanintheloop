interface IModalProps {
  storageMessage: string;
  header: string;
  sendMessage: string;
  setIsModalOpen: () => void;
}

const ModalComponent = ({ header, sendMessage, storageMessage, setIsModalOpen: setIsModalOpen }: IModalProps) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
      <div className='z-10 w-[80%] rounded-lg bg-white p-4 shadow-xl lg:h-auto lg:w-[30%]'>
        <div className='border-b pb-2 text-[16px] font-semibold text-gray-500'>{header}</div>
        <div className='mt-4'>
          <p className='pt-4 text-center text-[16px] font-semibold lg:pt-6 lg:text-xl'>{sendMessage}</p>
          <p className='mb-4 border-b pt-4 text-center text-[12px] lg:pb-8 lg:text-lg'>{storageMessage}</p>
        </div>
        <div className='mb-2 mt-2 flex justify-center' onClick={() => setIsModalOpen()}>
          <button className='w-full rounded-lg bg-gray-400 py-2 text-white hover:bg-gray-700'>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
