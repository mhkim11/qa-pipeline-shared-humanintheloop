import { useEffect, useState } from 'react';

import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { loginPageStyle as S } from '@/shared/styled';

/**
 * * 패스인증은 성공했으나 기타 이유로 가입에 실패한 페이지
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const AuthFailedPage = (): JSX.Element => {
  const [authFailedData, setAuthFailedData] = useState<any>(null);

  useEffect(() => {
    // sessionStorage에서 authFailedData 가져오기
    const data = sessionStorage.getItem('authFailedData');
    if (data) {
      setAuthFailedData(JSON.parse(data));
    }
  }, []);

  // 새로운 이메일로 회원가입 핸들러
  const handleNewEmailSignup = () => {
    if (authFailedData) {
      // 인증된 정보를 registrationData로 변환하여 저장
      sessionStorage.setItem(
        'registrationData',
        JSON.stringify({
          name: authFailedData.name,
          phone: authFailedData.phone,
          birthdate: authFailedData.birth,
          gender: authFailedData.gender,
          office_nm: authFailedData.office_nm,
        }),
      );

      // 기존 authFailedData 제거
      sessionStorage.removeItem('authFailedData');
    }

    // 이메일 인증 페이지로 이동
    window.location.href = '/register_email';
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
              <div className='min-w-[340px] lg:min-w-[480px]'>
                <div className='text-[25px] text-[#BEC1C6] lg:mt-0'>
                  <strong className='text-[28px] text-[#212121]'>이메일 계정 선택</strong>
                </div>
                <div className='pt-[10px] text-[#5B5B5B]'>입력하신 정보로 가입이력이 확인되었습니다.</div>
              </div>
              <div>
                <div className='mt-[32px] flex h-[156px] w-full flex-col items-center justify-center rounded-[8px] border border-[#E5E5E5]'>
                  <div className='text-center'>
                    <p className='text-[16px] text-[#212121]'>가입한 이메일 주소로 로그인</p>
                    <p className='pt-[16px] text-[14px] text-[#5B5B5B]'>이미 가입한 이메일로 로그인하세요</p>
                    <button
                      className='mt-[16px] h-[40px] w-full rounded-md bg-[#004AA4] text-[14px] text-white'
                      onClick={() => {
                        window.location.href = '/';
                      }}
                    >
                      로그인
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <div className='mt-[32px] flex h-[156px] w-full flex-col items-center justify-center rounded-[8px] border border-[#E5E5E5]'>
                  <div className='text-center'>
                    <p className='text-[16px] text-[#212121]'>새로운 이메일로 회원가입</p>
                    <p className='pt-[16px] text-[14px] text-[#5B5B5B]'>다른 이메일을 사용해 가입할 수 있어요</p>
                    <button
                      className='mt-[16px] h-[40px] w-full rounded-md bg-[#004AA4] text-[14px] text-white'
                      onClick={handleNewEmailSignup}
                    >
                      회원가입
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default AuthFailedPage;
