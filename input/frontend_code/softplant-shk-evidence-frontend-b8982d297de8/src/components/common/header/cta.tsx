import { FaArrowRightLong } from 'react-icons/fa6';

import { onMessageToast } from '@/components/utils';
export const CTALine = (): JSX.Element => {
  const handleClick = () => {
    onMessageToast({
      message: '회원가입 페이지 이동 예정',
    });
  };
  return (
    <div
      className='absolute top-0 z-[9999] flex h-[52px] w-full'
      style={{
        background: 'linear-gradient(90deg, #1865FF 0%, #8772F7 100%)',
      }}
    >
      <div className='flex h-full w-full items-center justify-between text-[18px]'>
        <div className='pl-[200px] font-medium text-white'>AI를 통한 증거 문서 정리부터 요약까지 지금 바로 활용해보세요</div>
        <div className='flex cursor-pointer items-center gap-2 pr-[200px] font-semibold text-white' onClick={handleClick}>
          무료체험 신청하기
          <FaArrowRightLong className='text-white' />
        </div>
      </div>
    </div>
  );
};
