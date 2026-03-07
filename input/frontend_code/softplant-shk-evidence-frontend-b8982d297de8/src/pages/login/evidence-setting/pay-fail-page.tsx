import { useEffect } from 'react';

import { IoIosWarning } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BillingFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authKey = searchParams.get('authKey');
  const customerKey = searchParams.get('customerKey');

  useEffect(() => {
    if (authKey && customerKey) {
      fetch('/api/save-billing-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, customerKey }),
      });
    }
  }, [authKey, customerKey]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <IoIosWarning className='mb-4 h-12 w-12 text-red-500' />
          <h1 className='text-2xl font-bold'>카드 등록 실패</h1>
          <p className='text-gray-600'>카드 등록 실패. 다시 시도해주세요.</p>
        </div>
        <button className='mt-4 h-[48px] w-full rounded-lg bg-[#004AA4] py-2 text-white' onClick={() => navigate('/')}>
          메인으로 이동
        </button>
      </div>
    </div>
  );
};

export default BillingFailPage;
