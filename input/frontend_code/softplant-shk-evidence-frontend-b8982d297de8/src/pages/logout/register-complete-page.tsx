import { useEffect, useState } from 'react';

import { useLoginStore } from '@stores/index';
import Last from '@/assets/images/last.png';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { onMessageToast } from '@/components/utils/global-utils';
import { useAuthLogin } from '@/hooks/react-query';
import { loginPageStyle as S } from '@/shared/styled';

/**
 * * 아이디 찾기 후 연결 페이지
 * @returns {JSX.Element} 아이디 찾기 후 연결 페이지
 */
const RegisterCompletePage = () => {
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const { isPending, onAuthLogin } = useAuthLogin();
  const { dispatchLogin } = useLoginStore();
  // 회원가입 시 저장한 정보 불러오기
  useEffect(() => {
    const registrationData = sessionStorage.getItem('registrationData');
    const storedCredentials = registrationData ? JSON.parse(registrationData) : null;

    if (storedCredentials?.email && storedCredentials?.password) {
      setCredentials({
        email: storedCredentials.email,
        password: storedCredentials.password,
      });
    }
  }, []);

  // 자동 로그인 처리
  const handleConfirm = async () => {
    if (credentials?.email && credentials?.password) {
      try {
        dispatchLogin({ type: 'FETCHING' });

        // 로그인 시도
        const response = await onAuthLogin({
          email: credentials.email,
          password: credentials.password,
        });

        if (!response) {
          onMessageToast({ message: '로그인에 실패했습니다. 메인 페이지로 이동합니다.' });
          window.location.href = '/';
          return;
        }

        // 로그인 성공 처리
        dispatchLogin({
          type: 'LOGIN',
          payload: {
            success: true,
            message: '로그인 성공',
            data: {
              accessToken: response?.data.accessToken ?? '',
              user: {
                id: response?.data.user.user_id ?? '',
                email: response?.data.user.email ?? '',
                name: response?.data.user.name ?? '',
                role: response?.data.user.role ?? '',
                office_id: response?.data.user.office_id ?? '',
                office_nm: response?.data.user.office_nm ?? '',
                phone: response?.data.user.phone ?? '',
              },
            },
          },
        });

        // 로그인 후 세션스토리지 정리
        sessionStorage.removeItem('registrationData');

        // 메인 페이지로 이동
        window.location.href = '/';
      } catch (error) {
        console.error('자동 로그인 실패:', error);
        onMessageToast({ message: '로그인에 실패했습니다. 메인 페이지로 이동합니다.' });
        window.location.href = '/';
      }
    } else {
      // 저장된 로그인 정보가 없는 경우
      window.location.href = '/';
    }
  };

  return (
    <S.SContainer>
      <S.Container>
        {/*

          // ! 로그인 페이지 사이드바
        
        */}
        <LoginSidebar
          text={`며칠 만에 모든 문서를 라이브텍스트화, 클렌징, 정리, 요약하고\n소송을 이기는 핵심 증거를 AI가 찾아드립니다.`}
          isMd={true}
        />

        <S.FormTotalWrapper>
          <div className='flex h-full w-full items-center justify-center'>
            <div className='min-w-[340px] lg:min-w-[480px]'>
              <div className='text-[28px] font-bold text-[#212121]'>축하합니다!</div>
              <div className='text-[28px] font-bold text-[#1890FF]'>회원가입이 완료되었습니다.</div>
              <div className='mt-[10px] text-[14px] text-[#5B5B5B]'>가입하신 계정으로 로그인 후 이용해주세요.</div>
              <div className='mt-[16px] flex justify-center'>
                <div className='flex h-[150px] w-[150px] items-center justify-center rounded-full bg-[#F5F5F5]'>
                  <img src={Last} alt='register-complete' className='h-[100px] w-[100px]' />
                </div>
              </div>
              <div className=''>
                <button
                  className='mt-[42px] h-[40px] w-[400px] cursor-pointer rounded-md bg-[#004AA4] text-white'
                  onClick={handleConfirm}
                  disabled={isPending}
                >
                  {isPending ? '로그인 중...' : '로그인 하러 가기'}
                </button>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default RegisterCompletePage;
