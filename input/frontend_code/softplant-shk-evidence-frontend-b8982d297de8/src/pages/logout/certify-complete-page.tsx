import { useEffect, useState } from 'react';

import { Spinner } from '@nextui-org/spinner';
import { useSearchParams } from 'react-router-dom';

import { fetchVerifyEmailToken } from '@apis/evidence-api';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { onMessageToast } from '@/components/utils/global-utils';
import { loginPageStyle as S } from '@/shared/styled';

/**
 * * 이메일 인증 완료 페이지
 * @returns {JSX.Element} 이메일 인증 완료 페이지
 */
const CertifyCompletePage = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationMessage, setVerificationMessage] = useState<string>('이메일 인증 중입니다...');

  // URL에서 토큰을 추출하여 이메일 인증 검증
  useEffect(() => {
    const token = searchParams.get('token');

    const verifyToken = async () => {
      setIsVerifying(true);
      try {
        const response = await fetchVerifyEmailToken(token ?? '');
        console.log('인증 응답 전체:', JSON.stringify(response, null, 2));
        console.log('success 값:', response.success);

        // 아주 단순하게 true인 경우만 처리
        if (response.success === true) {
          console.log('인증 성공 처리 실행');
          setIsVerified(true);
          setVerificationMessage('이메일 인증이 완료되었습니다.');
          onMessageToast({ message: '이메일 인증이 완료되었습니다.' });
        } else {
          console.log('인증 실패 처리 실행');
          setIsVerified(false);
          setVerificationMessage('이메일 인증에 실패했습니다. 다시 시도해주세요.');
          onMessageToast({ message: '이메일 인증에 실패했습니다. 다시 시도해주세요.' });
        }
      } catch (error) {
        console.error('인증 오류:', error);
        setIsVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
    // 의존성 배열에 포함할 항목 최소화
  }, [searchParams]);

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
          <div className='flex w-full items-center justify-center'>
            <div className='text-center'>
              {isVerifying ? (
                <div className='flex flex-col items-center'>
                  <Spinner size='lg' />
                  <div className='mt-4 text-2xl font-bold'>이메일 인증 중입니다</div>
                  <div className='mt-2 text-gray-600'>잠시만 기다려주세요...</div>
                </div>
              ) : (
                <>
                  <div className='text-2xl font-bold'>{verificationMessage}</div>
                  {isVerified ? (
                    <div className='mt-2 text-lg'>기존 페이지로 돌아가서 다음 단계를 진행해주세요</div>
                  ) : (
                    <div className='mt-2 text-lg text-red-500'>인증 페이지로 다시 돌아가 재 진행해주세요</div>
                  )}
                </>
              )}
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default CertifyCompletePage;
