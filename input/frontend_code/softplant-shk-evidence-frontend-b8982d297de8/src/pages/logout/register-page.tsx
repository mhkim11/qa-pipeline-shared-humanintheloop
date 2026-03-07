import { useRef, useState } from 'react';

import { IoIosArrowForward, IoIosWarning } from 'react-icons/io';
import { Link } from 'react-router-dom';

import { unAuthClient } from '@apis/index';
import { PrivacyPolicySection } from '@/components/common/privacy-policy-section';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { TermsOfServiceSection } from '@/components/common/terms-of-service-section';
import { onMessageToast } from '@/components/utils';
import useNicePayStore from '@/hooks/stores/use-nice-pay-store';
import { loginPageStyle as S } from '@/shared/styled';
// import { useNavigate } from 'react-router-dom';

/**
 * * 회원가입 페이지(약관 동의)
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const RegisterPage = (): JSX.Element => {
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isServiceChecked, setIsServiceChecked] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  // - 나이스페이 관련 store
  const { setNicePayPhoneCertification } = useNicePayStore();

  // ! react-hook-form 모음
  const onCheck = async () => {
    // 인증 시도 횟수 체크
    const attempts = localStorage.getItem('authAttempts');
    const lastAttemptTime = localStorage.getItem('lastAttemptTime');
    const currentTime = new Date().getTime();

    // 24시간이 지났으면 시도 횟수 초기화
    if (lastAttemptTime && currentTime - parseInt(lastAttemptTime) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('authAttempts');
      localStorage.removeItem('lastAttemptTime');
    } else if (attempts && parseInt(attempts) >= 5) {
      setIsPassModalOpen(true); // 모달 열기
      return;
    }

    localStorage.setItem('marketingConsent', isMarketingChecked ? 'true' : 'false');
    const baseUrl = `https://api.ailex.co.kr/api/v1/auth/nice/encrypt/data`;
    const returnUrl = `${process.env.VITE_FRONTEND_URL}/register/certify`;
    const redirectUrl = `${process.env.VITE_FRONTEND_URL}/register_id`;

    try {
      const response = await unAuthClient.post(baseUrl, {
        return_url: returnUrl,
        popup_yn: 'Y',
        method_type: 'get',
        receive_data: redirectUrl,
      });

      const encodeData = response.data.data;
      const form = document.getElementById('form') as HTMLFormElement;

      // 모바일 환경 감지
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // 모바일에서는 현재 창에서 리다이렉트
        form.target = '_self';
        form.action = 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb';
        form.token_version_id.value = encodeData.token_version_id;
        form.enc_data.value = encodeData.enc_data;
        form.integrity_value.value = encodeData.integrity_value;

        setNicePayPhoneCertification({
          symmetricKey: encodeData.symmetricKey,
          encData: encodeData.enc_data,
          integrityValue: encodeData.integrity_value,
        });

        form.submit();
      } else {
        // 데스크톱에서는 팝업 사용
        const left = screen.width / 2 - 500 / 2;
        const top = screen.height / 2 - 800 / 2;
        const option = `width=500, height=550, top=${top}, left=${left}, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no`;

        const popup = window.open('', 'nicePopup', option);

        // 팝업이 차단되었는지 확인
        if (!popup || popup.closed || typeof popup.closed == 'undefined') {
          onMessageToast({
            message: '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
            icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
          });
          return;
        }

        form.target = 'nicePopup';
        form.action = 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb';
        form.token_version_id.value = encodeData.token_version_id;
        form.enc_data.value = encodeData.enc_data;
        form.integrity_value.value = encodeData.integrity_value;

        form.submit();

        setNicePayPhoneCertification({
          symmetricKey: encodeData.symmetricKey,
          encData: encodeData.enc_data,
          integrityValue: encodeData.integrity_value,
        });
      }
    } catch (error) {
      onMessageToast({
        message: '본인인증에 실패했습니다. 다시 시도해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      console.error(error);
    }
  };

  // 전체 선택 클릭 이벤트
  const handleAllCheck = () => {
    const newCheckedState = !isAllChecked;
    setIsAllChecked(newCheckedState);
    setIsServiceChecked(newCheckedState);
    setIsPrivacyChecked(newCheckedState);
    setIsMarketingChecked(newCheckedState);
  };

  // 개별 체크박스 클릭 시 전체 선택 상태 업데이트
  const handleIndividualCheck = () => {
    const newAllChecked = isServiceChecked && isPrivacyChecked && isMarketingChecked;
    setIsAllChecked(newAllChecked);
  };
  const serviceRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const marketingRef = useRef<HTMLDivElement>(null);
  // 스크롤 이동 함수
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleJoin = () => {
    if (!isServiceChecked || !isPrivacyChecked) {
      onMessageToast({
        message: '필수 약관에 동의해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }
    onCheck();
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
            <div className=''>
              <div className='min-w-[340px] lg:min-w-[480px]'>
                <div className='mt-10 text-[25px] text-[#BEC1C6] lg:mt-0'>
                  <strong className='text-[28px] text-[#212121]'>약관동의</strong>
                </div>

                <div className='pt-[10px] text-[14px] text-[#5B5B5B]'>필수 약관에 동의 후 본인 인증을 진행해주세요</div>
                <div className='mt-[20px] max-h-[180px] min-h-[150px] max-w-[600px] overflow-y-auto rounded border p-5 text-[#595959] sm:max-h-[150px] md:max-h-[200px] 2xl:max-h-[300px]'>
                  <TermsOfServiceSection serviceRef={serviceRef} />
                  <PrivacyPolicySection privacyRef={privacyRef} />
                  <section id='marketing' ref={marketingRef} className='mt-10'>
                    <h1 className='text-[25px] font-bold'>마케팅 수신 동의</h1>
                    <p className='pt-6'>
                      A2D2는 회원님이 수집 및 이용에 동의한 개인정보를 이용하여 SMS(MMS), 카카오톡 메시지, 이메일, 푸시 알림 등 다양한 전자
                      전송 매체를 통해 신규 서비스 및 기능 출시 안내, 프로모션, 할인 혜택 정보 등을 전송할 수 있습니다. 본 동의는 거부하실
                      수 있으나, 거부 시 이벤트 및 프로모션 안내, 유용한 광고를 받아보실 수 없습니다.
                      <br /> 광고성정보수신의 변경은 고객센터(02-538-3337, contact@a2d2.co.kr)로 요청하여 언제든지 변경할 수 있습니다.
                    </p>
                  </section>
                </div>
                <div className='mt-[36px] flex items-center border-b-2 pb-2'>
                  <input
                    type='checkbox'
                    id='all'
                    checked={isAllChecked}
                    onChange={handleAllCheck}
                    className='h-[16px] w-[16px] rounded-[4px] border-[1.5px] border-[#E5E5E5] text-[#004AA4] focus:ring-[#004AA4]'
                  />
                  <p className='pl-[10px] text-[16px] text-[#212121]'>전체 약관에 모두 동의</p>
                </div>
                <div className='flex w-full items-center pt-[15px]'>
                  <div className='flex w-full items-center'>
                    <input
                      type='checkbox'
                      checked={isServiceChecked}
                      onChange={() => {
                        setIsServiceChecked(!isServiceChecked);
                        handleIndividualCheck();
                      }}
                      className='h-[16px] w-[16px] rounded-[4px] border-[1.5px] border-[#E5E5E5] text-[#004AA4] focus:ring-[#004AA4]'
                    />
                    <div
                      className='flex cursor-pointer items-center pl-[10px] text-[14px] text-[#202124]'
                      onClick={() => scrollToSection(serviceRef)}
                    >
                      <p className='text-[#7D7D7D]'>(필수)</p>
                      <p className='pl-1 text-[#212121]'>서비스 이용약관</p>
                    </div>
                  </div>

                  <div className='flex w-1/2 cursor-pointer justify-end' onClick={() => scrollToSection(serviceRef)}>
                    <IoIosArrowForward className='text-[18px] text-[#5B5B5B]' />
                  </div>
                </div>
                <div className='flex items-center pt-[10px]'>
                  <div className='flex w-full items-center'>
                    <input
                      type='checkbox'
                      checked={isPrivacyChecked}
                      onChange={() => {
                        setIsPrivacyChecked(!isPrivacyChecked);
                        handleIndividualCheck();
                      }}
                      className='h-[16px] w-[16px] rounded-[4px] border-[1.5px] border-[#E5E5E5] text-[#004AA4] focus:ring-[#004AA4]'
                    />
                    <div
                      className='flex cursor-pointer items-center pl-[10px] text-[14px] text-[#202124]'
                      onClick={() => scrollToSection(privacyRef)}
                    >
                      <p className='text-[#7D7D7D]'>(필수)</p>
                      <p className='pl-1 text-[#212121]'>개인정보 수집 및 이용동의</p>
                    </div>
                  </div>

                  <div className='flex w-1/5 cursor-pointer justify-end' onClick={() => scrollToSection(privacyRef)}>
                    <IoIosArrowForward className='text-[18px] text-[#5B5B5B]' />
                  </div>
                </div>
                <div className='flex items-center pt-[10px]'>
                  <form name='form' id='form' action='https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb'>
                    <input type='hidden' id='m' name='m' value='service' />
                    <input type='hidden' id='token_version_id' name='token_version_id' value='' />
                    <input type='hidden' id='enc_data' name='enc_data' />
                    <input type='hidden' id='integrity_value' name='integrity_value' />
                  </form>
                  <div className='flex w-full items-center'>
                    <input
                      type='checkbox'
                      checked={isMarketingChecked}
                      onChange={() => {
                        setIsMarketingChecked(!isMarketingChecked);
                        handleIndividualCheck();
                      }}
                      className='h-[16px] w-[16px] rounded-[4px] border-[1.5px] border-[#E5E5E5] text-[#004AA4] focus:ring-[#004AA4]'
                    />
                    <div
                      className='flex cursor-pointer items-center pl-[10px] text-[14px] text-[#202124]'
                      onClick={() => scrollToSection(marketingRef)}
                    >
                      <p className='text-[#7D7D7D]'>(선택)</p>
                      <p className='pl-1 text-[#212121]'>마케팅 수신 동의</p>
                    </div>
                  </div>

                  <div className='flex w-1/2 cursor-pointer justify-end' onClick={() => scrollToSection(marketingRef)}>
                    <IoIosArrowForward className='text-[18px] text-[#5B5B5B]' />
                  </div>
                </div>
                {/*    <p className='pl-6 pt-2 text-[13px] text-[#656565]'>새로운 기능 등의 정보를 이메일로 받아보실 수 있습니다.</p> */}
                <div className='flex w-full items-center justify-center gap-4'>
                  <button
                    className={`mt-[50px] h-[50px] w-full rounded-md text-[15px] ${
                      isServiceChecked && isPrivacyChecked ? 'bg-[#004AA4] text-white' : 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]'
                    }`}
                    onClick={handleJoin}
                    disabled={!isServiceChecked || !isPrivacyChecked}
                  >
                    동의 후 본인인증
                  </button>
                  <Link
                    className='mt-[50px] flex h-[50px] w-full items-center justify-center rounded-md border border-[#E5E5E5] bg-[#fff] text-[15px] text-[#212121]'
                    to='/'
                  >
                    취소
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
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
            <button className='w-full rounded-md bg-[#87CEEB] py-2 text-white' onClick={() => (window.location.href = '/')}>
              홈페이지로 이동
            </button>
          </div>
        </div>
      )}
    </S.SContainer>
  );
};

export default RegisterPage;
