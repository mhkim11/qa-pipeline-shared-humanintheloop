import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { loginPageStyle as S } from '@/shared/styled';
/**
 * * 아이디 찾기 후 연결 페이지
 * @returns {JSX.Element} 아이디 찾기 후 연결 페이지
 */
const ShowIdPage = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = decodeURIComponent(urlParams.get('name') || '');
  const emailsParam = urlParams.get('emails');
  const emailFromUrl = decodeURIComponent(urlParams.get('email') || '');

  const emails = useMemo(() => {
    if (emailsParam) {
      return decodeURIComponent(emailsParam)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return emailFromUrl ? [emailFromUrl] : [];
  }, [emailsParam, emailFromUrl]);

  const [selectedEmail, setSelectedEmail] = useState<string>(emails[0] || '');

  const handleLoginClick = () => {
    // 로컬 스토리지에 이메일 저장
    localStorage.setItem('savedEmail', selectedEmail);
    navigate('/');
  };
  const handleResetPasswordClick = () => {
    // 비밀번호 재설정 페이지로 이동하면서 tab=pw 파라미터 추가
    navigate('/find_id?tab=pw&email=' + encodeURIComponent(selectedEmail));
  };
  const handleSignUpClick = () => {
    navigate('/register_email');
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
          <div className='flex w-full items-center justify-center'>
            <div className='text-center'>
              {emails.length > 0 ? (
                <>
                  <div className='text-xl'>
                    <p>
                      {nameFromUrl}님의 가입 이메일주소는 총 <span className='text-[#1890FF]'>{emails.length}</span>건입니다.
                    </p>
                    <p className='pt-2'>로그인 혹은 비밀번호 재설정 하시겠습니까?</p>
                  </div>

                  <div className='mt-4 max-h-[300px] w-full overflow-y-auto rounded-[8px] border border-[#E5E5E5] p-[16px] text-left'>
                    {emails.map((email) => (
                      <label key={email} className='flex cursor-pointer items-center border-b border-[#E5E5E5] py-[12px]'>
                        <input
                          type='radio'
                          name='found-email'
                          checked={selectedEmail === email}
                          onChange={() => setSelectedEmail(email)}
                          className='text-[#004AA4]'
                        />
                        <span className='ml-[12px] text-[14px] text-[#111827]'>{email}</span>
                      </label>
                    ))}
                  </div>

                  <div className='mt-6 flex w-full'>
                    <button
                      type='button'
                      disabled={!selectedEmail}
                      className='h-[50px] rounded-md bg-[#87CEEB] px-4 text-white disabled:cursor-not-allowed disabled:opacity-50'
                      onClick={handleLoginClick}
                    >
                      로그인
                    </button>
                    <button
                      type='button'
                      disabled={!selectedEmail}
                      className='ml-4 h-[50px] rounded-md bg-[#87CEEB] px-4 text-white disabled:cursor-not-allowed disabled:opacity-50'
                      onClick={handleResetPasswordClick}
                    >
                      비밀번호 재설정
                    </button>
                    <button className='ml-4 h-[50px] rounded-md border px-4' type='button' onClick={() => navigate('/')}>
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className='text-xl'>
                    <p>{nameFromUrl}님의</p>
                    <p className='pt-2'>회원가입 내역이 없습니다.</p>
                    <p className='pt-2'>회원가입 하시겠습니까?</p>
                  </div>
                  <div className='mt-6 flex w-full justify-center'>
                    <button type='button' className='h-[50px] rounded-md bg-[#87CEEB] px-4 text-white' onClick={handleSignUpClick}>
                      회원가입
                    </button>
                    <button className='ml-4 h-[50px] rounded-md border px-4' type='button' onClick={() => navigate('/')}>
                      취소
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default ShowIdPage;
