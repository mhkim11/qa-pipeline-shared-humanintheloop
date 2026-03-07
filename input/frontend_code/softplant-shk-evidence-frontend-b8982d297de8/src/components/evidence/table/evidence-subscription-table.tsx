import { FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Subscription from '@/assets/images/Subscription.png';
export const SubscriptionTable = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <>
      <div className='mb-20 flex w-full justify-center overflow-auto pt-[90px]'>
        <div className='mt-[90px] w-full max-w-[1200px]'>
          <div className='flex items-center justify-between'>
            <div className='mr-[75px] flex-1'>
              <div className='space-y-[12px]'>
                <div className='flex items-center gap-[8px]'>
                  <FaCheck className='text-[#1890FF]' />
                  <p className='text-[18px] font-normal text-[#5B5B5B]'>스캔된 PDF와 카톡, 통장 내역까지도 100% 디지털 변환</p>
                </div>
                <div className='flex items-center gap-[8px]'>
                  <FaCheck className='text-[#1890FF]' />
                  <p className='text-[18px] font-normal text-[#5B5B5B]'>증거목록과 동일한 구조의 디지털 증거 목록 구현</p>
                </div>
                <div className='flex items-center gap-[8px]'>
                  <FaCheck className='text-[#1890FF]' />
                  <p className='text-[18px] font-normal text-[#5B5B5B]'>수만 페이지의 전체 증거 문서를 한 번에 통합 검색</p>
                </div>
                <div className='flex items-center gap-[8px]'>
                  <FaCheck className='text-[#1890FF]' />
                  <p className='text-[18px] font-normal text-[#5B5B5B]'>사건 전체의 핵심 내용을 며칠 이내 자동 요약</p>
                </div>
                <div className='flex items-center gap-[8px]'>
                  <FaCheck className='text-[#1890FF]' />
                  <p className='text-[18px] font-normal text-[#5B5B5B]'>실시간 화면 동기화로 팀 내 모든 변호사가 동일한 사건 정보 공유</p>
                </div>
              </div>
              <div className='mt-[26px] flex items-center gap-[8px]'>
                <p className='text-[28px] font-bold text-[#212121]'>사건당</p>
                <p className='text-[42px] font-bold text-[#212121]'>19,000원</p>
                <p className='text-[28px] text-[#8E8E8E]'>/ 월</p>
              </div>
              <div className='text-[18px] text-[#1890FF]'>*팀원 추가시 인당 19,000원이 추가됩니다.</div>
              <div className='mt-[32px]'>
                <button
                  className='h-[52px] w-full rounded-[8px] bg-[#004AA4] text-white'
                  onClick={() => navigate('/?openUploadModal=true')}
                >
                  사건 등록하고 구독하기{' '}
                </button>
              </div>
            </div>

            <div className='flex-1'>
              <img src={Subscription} alt='subscription' className='rounded-[16px]' />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
