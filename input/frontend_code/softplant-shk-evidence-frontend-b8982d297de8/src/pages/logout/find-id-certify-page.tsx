import { useEffect, useRef, useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { IoIosWarning } from 'react-icons/io';
import { useLocation } from 'react-router-dom';

import { unAuthClient } from '@apis/index';
import { TNicePayApiResponse } from '@apis/type/nice-pay.type';
import { fetchFindAllIds } from '@/apis/auth-api';
import { initialNicePayPhoneCertificationAtom } from '@/atoms/default/nice-pay-atom';
import { onMessageToast } from '@/components/utils';
import useNicePayStore from '@/hooks/stores/use-nice-pay-store';
// import useRegisterStore from '@/hooks/stores/use-register-store';

const FindIdCertifyPage = () => {
  // ! jotai atom 모음
  // - 나이스페이 관련 store
  const {
    nicePayPhoneCertification: { symmetricKey },
    setNicePayPhoneCertification,
    setNicePayPhoneResponseResult,
  } = useNicePayStore();
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  // ! react-router-dom 모음
  const location = useLocation();

  // 이미 실행되었는지 여부를 추적하는 ref
  const hasRun = useRef(false);
  const GoRegister = () => {
    window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/register`;
  };

  useEffect(() => {
    if (!symmetricKey) return;
    // 이미 실행한 경우 더 이상 진행하지 않음
    if (hasRun.current) return;
    hasRun.current = true;

    const encDataResult = new URLSearchParams(location.search).get('enc_data');
    const integrityValueResult = new URLSearchParams(location.search).get('integrity_value');

    console.log('encDataResult', encDataResult);
    console.log('integrityValueResult', integrityValueResult);

    // generator 함수 내에서 API 요청 로직 실행
    const niceApiCallback = async () => {
      try {
        const response = await unAuthClient.post('https://api.ailex.co.kr/api/v1/auth/nice/decrypt/data', {
          encData: encDataResult,
          integrityValue: integrityValueResult,
          symmetricKey,
        });
        const nicePayApiResponse = response as unknown as TNicePayApiResponse;
        setNicePayPhoneResponseResult(nicePayApiResponse);

        const name = nicePayApiResponse.data?.data?.name || '';
        const phone = nicePayApiResponse.data?.data?.phone || '';

        const allIds = await fetchFindAllIds({ name, phone });
        const emails = Array.isArray(allIds.data?.emails) ? allIds.data.emails : [];

        if (allIds.success && emails.length > 0) {
          const qs = new URLSearchParams();
          qs.set('name', name);
          qs.set('emails', emails.join(','));
          window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/show_id/?${qs.toString()}`;
          window.close();
        } else {
          setIsPassModalOpen(true);
          window.close();
        }

        return true; // API 요청 성공 시 true
      } catch (error) {
        console.error('error', error);
        onMessageToast({
          message: '휴대폰 인증에 실패했습니다 다시 시도해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/register`;
        window.close();
      } finally {
        // 마지막 정리 작업
        setNicePayPhoneCertification(initialNicePayPhoneCertificationAtom);
      }
    };

    const callback = niceApiCallback();

    callback.then((isSuccess) => {
      if (isSuccess) {
        console.log('isSuccess', isSuccess);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, symmetricKey]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <Spinner color='current' size='lg' />
      {isPassModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
          <div className='z-10 w-[80%] rounded-lg bg-white p-4 shadow-xl lg:h-auto lg:w-[30%]'>
            <div className='border-b pb-2 text-[16px] font-semibold text-gray-500'>미가입자</div>
            <div className='mt-4'>
              <p className='pt-4 text-center text-[16px] font-semibold lg:pt-6 lg:text-lg'>회원가입 내역이 없습니다.</p>
              <p className='pt-2 text-center lg:text-lg'>회원가입을 하시겠습니까?</p>
            </div>
            <div className='mb-2 mt-2 flex justify-center' onClick={() => setIsPassModalOpen(false)}>
              <button className='w-full rounded-lg bg-[#87CEEB] py-2 text-white hover:bg-gray-700' onClick={GoRegister}>
                회원가입{' '}
              </button>
              <button className='ml-4 w-full rounded-lg bg-gray-400 py-2 text-white hover:bg-gray-700'>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindIdCertifyPage;
