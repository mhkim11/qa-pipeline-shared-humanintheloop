import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';

type TPaginationProps = {
  currentPage: number; // 현재 페이지
  totalPages: number; // 총 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
};

export const EvidencePagination = ({ currentPage, totalPages, onPageChange }: TPaginationProps) => {
  // 특정 범위의 페이지 번호 생성 (현재 페이지 기준으로 표시)
  const getPageNumbers = () => {
    const range = 5; // 표시할 페이지 번호의 범위
    const start = Math.max(1, currentPage - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className='flex items-center justify-center space-x-2'>
      {/* 처음으로 이동 버튼 */}
      <button
        className={`flex h-8 w-[32px] items-center justify-center ${
          currentPage === 1 ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer text-gray-500'
        }`}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <MdKeyboardDoubleArrowLeft />
      </button>

      {/* 이전 버튼 */}
      <button
        className={`flex w-[72px] items-center justify-center ${
          currentPage === 1 ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer text-gray-500'
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <IoIosArrowBack />
        <span className='pl-[16px] text-[14px]'>이전</span>
      </button>

      {/* 페이지 번호 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[14px] hover:bg-gray-100 ${
            currentPage === page ? 'bg-[#e7f1fd] text-[#373737]' : 'bg-white text-gray-500'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        className={`flex w-[72px] items-center justify-center ${
          currentPage === totalPages ? 'cursor-not-allowed text-[#313131]' : 'cursor-pointer text-gray-500'
        }`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className='pr-[16px] text-[14px]'>다음</span>
        <IoIosArrowForward />
      </button>

      {/* 마지막으로 이동 버튼 */}
      <button
        className={`flex h-8 w-[32px] items-center justify-center ${
          currentPage === totalPages ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer text-gray-500'
        }`}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <MdKeyboardDoubleArrowRight />
      </button>
    </div>
  );
};

export default EvidencePagination;
