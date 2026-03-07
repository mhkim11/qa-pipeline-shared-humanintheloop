import { useEffect, useState } from 'react';

import { IoMdCheckmarkCircle, IoMdTime, IoMdCard } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BillingSuccessPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  // URL에서 사건명 가져오기
  const projectName = searchParams.get('projectName') || '김철수 vs 박영희 손해배상청구';

  useEffect(() => {
    const processBillingAuth = async () => {
      const authKey = searchParams.get('authKey');
      const customerKey = searchParams.get('customerKey');

      if (authKey && customerKey) {
        try {
          setTimeout(async () => {
            try {
              // 여기서 실제 빌링키 발급 및 결제 API 호출
              // const response = await processPayment(authKey, customerKey);

              setIsProcessing(false);
              setIsCompleted(true);
            } catch (err) {
              console.log(err);
              setIsProcessing(false);
              setError('결제 처리 중 오류가 발생했습니다.');
            }
          }, 5000);
        } catch (err) {
          console.log(err);
          setError('카드 등록 처리 중 오류가 발생했습니다.');
          setIsProcessing(false);
        }
      }
    };

    processBillingAuth();
  }, [searchParams]);

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='w-full max-w-[480px] rounded-lg bg-white p-8 text-center shadow-lg'>
          <div className='mb-6 flex justify-center'>
            <div className='rounded-full bg-red-100 p-3'>
              <IoMdCheckmarkCircle className='h-12 w-12 text-red-500' />
            </div>
          </div>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>오류가 발생했습니다</h1>
          <p className='mb-6 text-gray-600'>{error}</p>
          <button onClick={() => navigate('/payment')} className='w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600'>
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-[480px] rounded-lg bg-white p-8 shadow-lg'>
        {/* 단계별 표시 */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='rounded-full bg-green-100 p-2'>
                <IoMdCard className='h-6 w-6 text-green-500' />
              </div>
              <span className='ml-3 text-sm font-medium text-green-600'>카드 등록 완료</span>
            </div>
            <div className='flex items-center'>
              <div className={`rounded-full p-2 ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                <IoMdCheckmarkCircle className={`h-6 w-6 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              <span className={`ml-3 text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                빌링키 발급 {isCompleted ? '완료' : '진행중'}
              </span>
            </div>
          </div>
          <div className='mt-4 h-1 rounded-full bg-gray-200'>
            <div className={`h-1 rounded-full bg-blue-500 transition-all duration-1000 ${isCompleted ? 'w-full' : 'w-1/2'}`} />
          </div>
        </div>

        {/* 메인 메시지 */}
        <div className='mb-6 text-center'>
          {isProcessing ? (
            <>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-blue-100 p-3'>
                  <IoMdTime className='h-12 w-12 animate-pulse text-blue-500' />
                </div>
              </div>
              <h1 className='mb-2 text-2xl font-bold text-gray-900'>카드 등록이 완료되었습니다</h1>
              <p className='text-gray-600'>빌링키 발급을 진행하고 있습니다. 잠시만 기다려주세요.</p>
            </>
          ) : (
            <>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-green-100 p-3'>
                  <IoMdCheckmarkCircle className='h-12 w-12 text-green-500' />
                </div>
              </div>
              <h1 className='mb-2 text-2xl font-bold text-gray-900'>빌링키 발급이 완료되었습니다</h1>
              <p className='text-gray-600'>이제 매월 자동으로 결제됩니다.</p>
            </>
          )}
        </div>

        {/* 결제 정보 */}
        <div className='mb-6 rounded-lg border p-4'>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>사건명</span>
              <span className='font-semibold'>{projectName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>결제 금액</span>
              <span className='font-semibold'>₩19,000</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>결제 주기</span>
              <span className='font-semibold'>매월 {new Date().getDate()}일</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>결제 수단</span>
              <span className='font-semibold'>신용카드</span>
            </div>
            {isCompleted && (
              <div className='flex justify-between'>
                <span className='text-gray-600'>등록 일시</span>
                <span className='font-semibold'>
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        {isProcessing ? (
          <div className='mb-6 rounded-lg bg-yellow-50 p-4'>
            <p className='text-sm text-yellow-700'>
              • 카드 정보가 안전하게 등록되었습니다.
              <br />• 빌링키 발급을 진행하고 있습니다.
              <br />• 창을 닫지 마시고 잠시만 기다려주세요.
            </p>
          </div>
        ) : (
          <div className='mb-6 rounded-lg bg-blue-50 p-4'>
            <p className='text-sm text-blue-700'>
              • 다음 결제일은{' '}
              {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              입니다.
              <br />• 매월 {new Date().getDate()}일에 자동으로 결제됩니다.
              <br />• 구독 관리 페이지에서 언제든지 결제 정보를 변경하실 수 있습니다.
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className='flex flex-col gap-3'>
          {isCompleted ? (
            <>
              <button onClick={() => navigate('/')} className='w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600'>
                메인으로 이동
              </button>
              <button
                onClick={() => navigate('/payment')}
                className='w-full rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50'
              >
                결제 관리 페이지로 이동
              </button>
            </>
          ) : (
            <div className='flex justify-center'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingSuccessPage;
