import { useEffect, useRef, useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { IoIosWarning } from 'react-icons/io';
import { useLocation } from 'react-router-dom';

import { unAuthClient } from '@apis/index';
import { TNicePayApiResponse } from '@apis/type/nice-pay.type';
import { initialNicePayPhoneCertificationAtom } from '@/atoms/default/nice-pay-atom';
import { onMessageToast } from '@/components/utils';
import useNicePayStore from '@/hooks/stores/use-nice-pay-store';
import useRegisterStore from '@/hooks/stores/use-register-store';

const RegisterCertifyPage = () => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const {
    nicePayPhoneCertification: { symmetricKey },
    setNicePayPhoneCertification,
    setNicePayPhoneResponseResult,
  } = useNicePayStore();
  const { setPhone, setName } = useRegisterStore();

  // ! react-router-dom 모음
  const location = useLocation();

  // 이미 실행되었는지 여부를 추적하는 ref
  const hasRun = useRef(false);

  useEffect(() => {
    // 인증 시도 횟수 체크
    const checkAuthAttempts = () => {
      const attempts = localStorage.getItem('authAttempts');
      const lastAttemptTime = localStorage.getItem('lastAttemptTime');
      const currentTime = new Date().getTime();

      // 24시간이 지났으면 시도 횟수 초기화
      if (lastAttemptTime && currentTime - parseInt(lastAttemptTime) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('authAttempts');
        localStorage.removeItem('lastAttemptTime');
        return true;
      }

      if (attempts && parseInt(attempts) >= 5) {
        setIsPassModalOpen(true);
        return false;
      }

      return true;
    };

    if (!symmetricKey) return;
    if (hasRun.current) return;
    if (!checkAuthAttempts()) return;

    hasRun.current = true;

    const encDataResult = new URLSearchParams(location.search).get('enc_data');
    const integrityValueResult = new URLSearchParams(location.search).get('integrity_value');

    const niceApiCallback = async () => {
      try {
        // API 호출 시도 시 카운트 증가
        const currentAttempts = parseInt(localStorage.getItem('authAttempts') || '0');
        localStorage.setItem('authAttempts', (currentAttempts + 1).toString());
        localStorage.setItem('lastAttemptTime', new Date().getTime().toString());

        const response = await unAuthClient.post('https://api.ailex.co.kr/api/v1/auth/nice/decrypt/data', {
          encData: encDataResult,
          integrityValue: integrityValueResult,
          symmetricKey,
        });

        // 성공 시 시도 횟수 초기화
        localStorage.removeItem('authAttempts');
        localStorage.removeItem('lastAttemptTime');

        const nicePayApiResponse = response as unknown as TNicePayApiResponse;
        setNicePayPhoneResponseResult(nicePayApiResponse);

        if (nicePayApiResponse.data?.data?.isRegistered == true) {
          // 모바일 환경에서는 window.opener가 없으므로 현재 창에서 처리
          if (window.opener) {
            // 팝업 환경 (데스크톱)
            window.opener.sessionStorage.setItem(
              'authFailedData',
              JSON.stringify({
                email: nicePayApiResponse.data.data.email,
                name: nicePayApiResponse.data.data.name,
                phone: nicePayApiResponse.data.data.phone,
                joindate: nicePayApiResponse.data.data.joindate,
                isResign: nicePayApiResponse.data.data.isResign,
                birth: nicePayApiResponse.data.data.birthdate,
                gender: nicePayApiResponse.data.data.gender,
                /*    office_nm: nicePayApiResponse.data.data.office_nm, */
              }),
            );
            window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/auth_failed`;
            window.close();
          } else {
            // 모바일 환경 (현재 창)
            sessionStorage.setItem(
              'authFailedData',
              JSON.stringify({
                email: nicePayApiResponse.data.data.email,
                name: nicePayApiResponse.data.data.name,
                phone: nicePayApiResponse.data.data.phone,
                joindate: nicePayApiResponse.data.data.joindate,
                isResign: nicePayApiResponse.data.data.isResign,
                birth: nicePayApiResponse.data.data.birthdate,
                gender: nicePayApiResponse.data.data.gender,
                /*      office_nm: nicePayApiResponse.data.data.office_nm, */
              }),
            );
            window.location.href = `${process.env.VITE_FRONTEND_URL}/auth_failed`;
          }
        } else {
          // 모바일 환경에서는 window.opener가 없으므로 현재 창에서 처리
          if (window.opener) {
            // 팝업 환경 (데스크톱)
            window.opener.sessionStorage.setItem(
              'registrationData',
              JSON.stringify({
                name: nicePayApiResponse.data.data.name,
                phone: nicePayApiResponse.data.data.phone,
                birthdate: nicePayApiResponse.data.data.birthdate,
                gender: nicePayApiResponse.data.data.gender,
                /*   office_nm: nicePayApiResponse.data.data.office_nm, */
              }),
            );
            window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/register_email`;
            window.close();
          } else {
            // 모바일 환경 (현재 창)
            sessionStorage.setItem(
              'registrationData',
              JSON.stringify({
                name: nicePayApiResponse.data.data.name,
                phone: nicePayApiResponse.data.data.phone,
                birthdate: nicePayApiResponse.data.data.birthdate,
                gender: nicePayApiResponse.data.data.gender,
                /*   office_nm: nicePayApiResponse.data.data.office_nm, */
              }),
            );
            window.location.href = `${process.env.VITE_FRONTEND_URL}/register_email`;
          }
        }

        return true;
      } catch (error) {
        console.error('error', error);
        onMessageToast({
          message: '휴대폰 인증에 실패했습니다 다시 시도해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });

        // 모바일 환경에서는 window.opener가 없으므로 현재 창에서 처리
        if (window.opener) {
          // 팝업 환경 (데스크톱)
          window.opener.location.href = `${process.env.VITE_FRONTEND_URL}/register`;
          window.close();
        } else {
          // 모바일 환경 (현재 창)
          window.location.href = `${process.env.VITE_FRONTEND_URL}/register`;
        }
      } finally {
        setNicePayPhoneCertification(initialNicePayPhoneCertificationAtom);
      }
    };

    const callback = niceApiCallback();

    callback.then((isSuccess) => {
      if (isSuccess) {
        console.log('isSuccess', isSuccess);
      }
    });
  }, [location, symmetricKey, setNicePayPhoneCertification, setNicePayPhoneResponseResult, setPhone, setName]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <Spinner color='current' size='lg' />
      {isPassModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-[400px] rounded-lg bg-white p-6'>
            <div className='mb-4 flex items-center'>
              <IoIosWarning className='mr-2 h-6 w-6 text-red-500' />
              <h2 className='text-lg font-bold'>본인인증 시도 횟수 초과</h2>
            </div>
            <p className='mb-6 text-gray-600'>
              5회 실패하여 오늘은 더이상 진행할 수 없습니다
              <br />
              24시간 뒤에 다시 시도해주세요.
            </p>
            <button
              className='w-full rounded-md bg-[#87CEEB] py-2 text-white'
              onClick={() => {
                if (window.opener) {
                  // 팝업 환경 (데스크톱)
                  window.opener.location.href = '/';
                  window.close();
                } else {
                  // 모바일 환경 (현재 창)
                  window.location.href = '/';
                }
              }}
            >
              홈페이지로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterCertifyPage;
