import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { IoIosArrowForward, IoIosWarning } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

import { EmailFormSchema } from '@apis/schema';
import { PrivacyPolicySection } from '@/components/common/privacy-policy-section';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { TermsOfServiceSection } from '@/components/common/terms-of-service-section';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils';
import { useLesSignupAilexAuthentication } from '@/hooks/react-query/mutation/users/use-les-signup-authencation';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';
import '@/components/evidence/table/evidence.css';
type TForm = {
  email: string;
  name: string;
  phone: string;
  ailexCode: string;
};
/**
 * * 회원가입 페이지(약관 동의)
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const ResRegisterPage = (): JSX.Element => {
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isServiceChecked, setIsServiceChecked] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);

  const [isEmailExists, setIsEmailExists] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const navigate = useNavigate();

  // - LES 간편 회원가입 뮤테이션
  const { isPending, onLesSignupAilexAuthentication } = useLesSignupAilexAuthentication();

  // ! react-hook-form 모음
  const {
    // handleSubmit,
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(EmailFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      ailexCode: '',
    },
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmailExists(false);

    const inputValue = e.target.value;
    if (inputValue.length > 255) {
      setValue('email', inputValue.slice(0, 255));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length > 255) {
      setValue('name', inputValue.slice(0, 255));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출

    // 최대 11자리로 제한
    if (inputValue.length > 11) {
      inputValue = inputValue.slice(0, 11);
    }

    // 하이픈 추가 (010-1234-5678 형식)
    let formattedValue = '';
    if (inputValue.length <= 3) {
      formattedValue = inputValue;
    } else if (inputValue.length <= 7) {
      formattedValue = `${inputValue.slice(0, 3)}-${inputValue.slice(3)}`;
    } else {
      formattedValue = `${inputValue.slice(0, 3)}-${inputValue.slice(3, 7)}-${inputValue.slice(7, 11)}`;
    }

    setValue('phone', formattedValue);
  };

  const handleAilexCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length > 10) {
      setValue('ailexCode', inputValue.slice(0, 10));
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

  const handleLesSignup = async () => {
    const nameValue = watch('name');
    const phoneValue = watch('phone');
    const emailValue = watch('email');

    // 하이픈 제거한 휴대폰번호
    const phoneWithoutHyphen = phoneValue.replace(/-/g, '');

    const result = await onLesSignupAilexAuthentication({
      office_id: 'off_01KBY5EG0RM5VTE8CDD6ERV82J',
      email: emailValue.trim(),
      name: nameValue.trim(),
      phone: phoneWithoutHyphen,
    });

    if (result?.isSuccess) {
      // 성공 모달 표시
      setIsSuccessModalOpen(true);
    } else {
      onMessageToast({
        message: result?.message || '회원가입에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
    }
  };
  const handleJoin = () => {
    if (!isServiceChecked || !isPrivacyChecked) {
      onMessageToast({
        message: '필수 약관에 동의해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    const nameValue = watch('name');
    const phoneValue = watch('phone');
    const emailValue = watch('email');
    const ailexCodeValue = watch('ailexCode');

    if (!nameValue || nameValue.trim() === '') {
      onMessageToast({
        message: '이름을 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    if (!phoneValue || phoneValue.trim() === '') {
      onMessageToast({
        message: '휴대폰번호를 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    if (!emailValue || emailValue.trim() === '') {
      onMessageToast({
        message: '이메일을 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    if (!ailexCodeValue || ailexCodeValue.trim() === '') {
      onMessageToast({
        message: 'AILEX 인증코드를 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    if (ailexCodeValue.trim() !== '20241118') {
      onMessageToast({
        message: '인증코드가 올바르지 않습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
      });
      return;
    }

    handleLesSignup();
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
            <div className='max-h-[95vh] overflow-y-auto p-5'>
              <div className='min-w-[340px] lg:min-w-[480px]'>
                <div className='mt-10 text-[25px] text-[#BEC1C6] lg:mt-0'>
                  <strong className='text-[28px] text-[#212121]'>간편 회원가입</strong>
                </div>
                <div className='mt-[20px]'>
                  <Label className='text-[14px] text-[#5B5B5B]'>이름</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='이름을 입력해주세요'
                    className={cn(errors?.name?.message && 'mb-2 border-red-500 focus-visible:ring-red-500')}
                    {...register('name', {
                      onChange: handleNameChange,
                    })}
                    style={{ height: '40px', marginTop: '8px', width: '100%' }}
                  />
                </div>
                <div className='mt-[20px]'>
                  <Label className='text-[14px] text-[#5B5B5B]'>휴대전화번호</Label>
                  <Input
                    id='phone'
                    type='text'
                    placeholder='휴대폰번호를 입력해주세요'
                    className={cn(errors?.phone?.message && 'mb-2 border-red-500 focus-visible:ring-red-500')}
                    {...register('phone', {
                      onChange: handlePhoneChange,
                    })}
                    style={{ height: '40px', marginTop: '8px', width: '100%' }}
                  />
                </div>
                <div className='mt-[20px]'>
                  <Label className='text-[14px] text-[#5B5B5B]'>이메일</Label>
                  {/*              <div className='pt-1 text-[12px] text-[#888888]'> *입력하신 이메일로 임시 비밀번호가 발송됩니다.</div> */}
                  <Input
                    id='email'
                    type='text'
                    data-cy='userIdInput'
                    data-testid='email'
                    placeholder='아이디를 입력해주세요'
                    className={cn((errors?.email?.message || isEmailExists) && 'mb-2 border-red-500 focus-visible:ring-red-500')}
                    {...register('email', {
                      onChange: handleEmailChange,
                      onBlur: () => {
                        clearErrors('email');
                      },
                    })}
                    style={{ height: '40px', marginTop: '8px', width: '100%' }}
                  />
                </div>
                <div className='mt-[20px]'>
                  <Label className='text-[14px] text-[#5B5B5B]'>AILEX 인증코드</Label>
                  {/*              <div className='pt-1 text-[12px] text-[#888888]'> *입력하신 이메일로 임시 비밀번호가 발송됩니다.</div> */}
                  <Input
                    id='ailexCode'
                    type='text'
                    placeholder='인증코드를 입력해주세요'
                    className={cn((errors?.ailexCode?.message || isEmailExists) && 'mb-2 border-red-500 focus-visible:ring-red-500')}
                    {...register('ailexCode', {
                      onChange: handleAilexCodeChange,
                      onBlur: () => {
                        clearErrors('ailexCode');
                      },
                    })}
                    style={{ height: '40px', marginTop: '8px', width: '100%' }}
                  />
                </div>
                <div className='evidence-table-scroll mt-[20px] max-h-[100px] min-h-[100px] max-w-[600px] overflow-y-auto rounded border p-5 text-[#595959] sm:max-h-[50px] md:max-h-[50px] 2xl:max-h-[100px]'>
                  <TermsOfServiceSection serviceRef={serviceRef} />
                  <PrivacyPolicySection privacyRef={privacyRef} />
                  <section id='marketing' ref={marketingRef} className='mt-10'>
                    <h1 className='text-[25px] font-bold'>마케팅 수신 동의</h1>
                    <p className='pt-6'>
                      A2D2는 회원님이 수집 및 이용에 동의한 개인정보를 이용하여 SMS(MMS), 카카오톡 메시지, 이메일, 푸시 알림 등 다양한 전자
                      전송 매체를 통해 신규 서비스 및 기능 출시 안내, 프로모션, 할인 혜택 정보 등을 전송할 수 있습니다. <br />
                      <br />본 동의는 거부하실 수 있으나, 거부 시 이벤트 및 프로모션 안내, 유용한 광고를 받아보실 수 없습니다.
                      <br />
                      광고성정보수신의 변경은 고객센터(02-538-3337, cs@ailex.co.kr)로 요청하여 언제든지 변경할 수 있습니다.
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
                      isServiceChecked && isPrivacyChecked && !isPending
                        ? 'bg-[#004AA4] text-white'
                        : 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]'
                    }`}
                    onClick={handleJoin}
                    disabled={!isServiceChecked || !isPrivacyChecked || isPending}
                  >
                    {isPending ? '처리 중...' : '동의 후 가입하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
      {isSuccessModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-[400px] rounded-lg bg-white p-6'>
            <div className='mb-4 flex items-center'>
              <IoIosWarning className='mr-2 h-6 w-6 text-green-500' />
              <h2 className='text-lg font-bold'>회원가입 완료</h2>
            </div>
            <p className='mb-6 text-gray-600'>
              회원가입이 완료되었습니다.
              <br />
              이메일을 통해 받으신 임시비밀번호로 로그인 하실 수 있습니다.
            </p>
            <button
              className='w-full rounded-md bg-[#004AA4] py-2 text-white hover:bg-[#003d8a]'
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate('/');
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </S.SContainer>
  );
};

export default ResRegisterPage;
