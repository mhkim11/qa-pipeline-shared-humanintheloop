import { useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
// import { Spinner } from '@nextui-org/spinner';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
// import { useLoginStore } from '@stores/index';

import { EmailFormSchema } from '@apis/schema';
import { fetchCheckUserExist } from '@/apis/evidence-api';
import { TSendAuthEmailOutput } from '@/apis/type';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
import { useAuthNumberEmailRequest, useCheckAuthNumberEmailRequest } from '@/hooks/react-query/mutation/evidence/use-auth-email-request';
import useRegisterStore from '@/hooks/stores/use-register-store';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  email: string;
  name: string;
  inHouse: boolean;
  authNumber: string;
};

/**
 * * 이메일 인증 페이지
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const EmailPassPage = (): JSX.Element => {
  const { setEmail, setName, setInHouse } = useRegisterStore();
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5분 = 300초
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isEmailExists, setIsEmailExists] = useState<boolean>(false);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isNumberError, setIsNumberError] = useState<boolean>(false);
  const [hasRequestedAuth, setHasRequestedAuth] = useState<boolean>(false);
  const navigate = useNavigate();
  const [registrationData] = useState(() => {
    const data = sessionStorage.getItem('registrationData');
    return data ? JSON.parse(data) : { name: '', phone: '' };
  });

  const { onAuthNumberEmailRequest, isPending: isSendingAuthNumber } = useAuthNumberEmailRequest();
  const { onCheckAuthNumberEmailRequest, isPending: isCheckingAuthNumber } = useCheckAuthNumberEmailRequest();

  // ! react-hook-form 모음
  const {
    handleSubmit,
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
      inHouse: false,
      authNumber: '',
    },
  });

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 개인 이메일 도메인 리스트
  const personalDomains = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'hanmail.net',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'yahoo.co.kr',
    'nate.com',
    'kakao.com',
  ];

  // 개인 도메인인지 체크하는 함수
  const isPersonalDomain = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    return personalDomains.includes(domain);
  };

  // 이메일 형식 검증 상태
  const watchedEmail = watch('email');
  const isEmailValid = !errors.email && watchedEmail && watchedEmail.length > 0;

  // 인증번호 입력 상태
  const watchedAuthNumber = watch('authNumber');
  const isAuthNumberValid = watchedAuthNumber && watchedAuthNumber.length === 6;

  // 이메일 인증 요청 핸들러 수정
  const handleEmailVerification = async () => {
    await handleSubmit(async () => {
      try {
        // 먼저 사용자 존재 여부 확인
        const userCheckResponse = await fetchCheckUserExist(watch('email'));

        if (userCheckResponse.success && userCheckResponse.data?.exists && userCheckResponse.data?.isActive) {
          // 이미 가입된 활성 사용자인 경우
          setIsEmailExists(true);
          onMessageToast({ message: '이미 가입된 이메일입니다.' });
          return;
        }

        // 가입되지 않은 이메일이거나 비활성 사용자인 경우 인증번호 발송
        const response: TSendAuthEmailOutput = await onAuthNumberEmailRequest({
          email: watch('email'),
          name: registrationData.name,
        });

        if (response?.success) {
          setEmail(watch('email'));
          setName(registrationData.name);
          setInHouse(watch('inHouse'));
          setTimeLeft(300);
          setIsVerified(false);

          setIsEmailExists(false); // 에러 상태 초기화
          setIsTimerActive(true); // 타이머 활성화
          setHasRequestedAuth(true); // 인증 요청 상태 설정

          // code_id를 세션 스토리지에 저장
          const existingData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
          sessionStorage.setItem(
            'registrationData',
            JSON.stringify({
              ...existingData,
              email: watch('email'),
              name: registrationData.name,
              inHouse: watch('inHouse'),
              code_id: response.data?.code_id,
              birthdate: existingData.birthdate || '',
              gender: existingData.gender || '',
            }),
          );
          onMessageToast({ message: '인증번호가 발송되었습니다.' });
        }
      } catch (error) {
        console.error('Email verification error:', error);
      }
    })();
  };

  // 인증번호 확인
  const onAuthNumberSubmit = async (data: TForm) => {
    try {
      // 세션 스토리지에서 code_id 가져오기
      const sessionData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
      const code_id = sessionData.code_id;

      if (!code_id) {
        onMessageToast({ message: '인증번호 발송을 먼저 진행해주세요.' });
        return;
      }
      console.log('code_id:', code_id, 'authNumber:', data.authNumber);
      console.log('data:', data);
      const response = await onCheckAuthNumberEmailRequest({
        code_id: code_id,
        verify_code: watch('authNumber'),
      });
      console.log('response', response);

      if (response.success) {
        setIsVerified(true);

        setIsTimerActive(false); // 타이머 비활성화
        onMessageToast({ message: '이메일 인증이 완료되었습니다.' });

        const existingData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');

        // 응답에서 office_nm 저장 및 개인 도메인 여부 체크
        const currentEmail = watch('email');
        const isPersonal = isPersonalDomain(currentEmail);

        sessionStorage.setItem(
          'registrationData',
          JSON.stringify({
            ...existingData,
            email: currentEmail,
            name: registrationData.name,
            inHouse: watch('inHouse'), // 사내변호사 여부 저장
            office_nm: (response as any).data?.result?.office_nm || '', // API 응답에서 받은 office_nm 저장
            isPersonalDomain: isPersonal, // 개인 도메인 여부 저장
            birthdate: existingData.birthdate || '',
            gender: existingData.gender || '',
          }),
        );

        // register_pw 페이지로 이동 (비밀번호 등록)
        navigate(`/register_pw`);
      } else {
        setIsNumberError(true);
      }
    } catch (error) {
      setIsNumberError(true);
      console.error('Auth number check error:', error);
    }
  };

  // const ReSendEmail = async () => {
  //   if (timeLeft === 0) {
  //     onMessageToast({
  //       message: '인증 시간이 만료되었습니다. 이메일 인증을 처음부터 다시 시도해주세요.',
  //     });
  //     setIsPassModalOpen(false);
  //     return;
  //   }

  //   setIsPassModalOpen(false);
  //   handleEmailVerification();
  // };

  // 이메일 입력 시 에러 상태 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmailExists(false);
    setHasRequestedAuth(false); // 인증 요청 상태 초기화
    setIsTimerActive(false); // 타이머 비활성화
    const inputValue = e.target.value;
    if (inputValue.length > 255) {
      setValue('email', inputValue.slice(0, 255));
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0 && !isVerified) {
      // 타이머 설정
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsTimerActive(false);
            setHasRequestedAuth(false);
            onMessageToast({ message: '인증 시간이 초과되었습니다. 이메일 인증을 다시 시도해주세요.' });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, timeLeft, isVerified]);

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
                <div className='text-[25px] text-[#BEC1C6]'>
                  <strong className='text-[28px] text-[#212121]'>이메일 주소 인증</strong>
                </div>

                <S.FormWrapper>
                  <div className='pt-[10px] text-[14px] text-[#5B5B5B]'>
                    <ul className=''>
                      <li className=''>
                        AiLex ID로 사용하실 <strong className='text-[#5b5b5b]'>이메일 주소</strong>를 입력해주세요.
                      </li>
                      <li>기업, 관공서 소속의 사내변호사인 경우 '사내변호사'를 선택해주세요</li>
                    </ul>
                  </div>
                </S.FormWrapper>
                <Label className='text-[14px] text-[#5B5B5B]'>이메일(아이디)</Label>
                <div className='mt-[8px] flex items-center'>
                  <Input
                    id='email'
                    type='text'
                    placeholder='이메일 주소'
                    style={{ height: '40px', border: ' #E5E5E5', borderRadius: '8px' }}
                    className={cn((errors?.email?.message || isEmailExists) && 'mb-2 border-red-500 focus-visible:ring-red-500')}
                    {...register('email', {
                      onChange: handleEmailChange,
                      onBlur: () => {
                        clearErrors('email');
                      },
                    })}
                  />

                  <button
                    className={`ml-2 h-[40px] w-[140px] rounded-[8px] border text-[14px] transition-colors ${
                      isEmailValid && !isSendingAuthNumber
                        ? 'bg-[#004AA4] text-white hover:bg-blue-600'
                        : 'cursor-not-allowed bg-[#E5E5E5] text-[#BABABA]'
                    }`}
                    onClick={handleEmailVerification}
                    disabled={!isEmailValid || isSendingAuthNumber}
                  >
                    {isSendingAuthNumber ? '발송 중...' : hasRequestedAuth ? '재전송' : '인증번호 받기'}
                  </button>
                </div>
                <div className=''>
                  {errors?.email?.message && (
                    <S.ErrorWrapper data-testid='user-id-error'>
                      <S.ErrorIcon />
                      {errors?.email?.message}
                    </S.ErrorWrapper>
                  )}

                  {isEmailExists && (
                    <S.ErrorWrapper data-testid='email-exists-error'>
                      <S.ErrorIcon />
                      이미 가입된 이메일입니다.
                    </S.ErrorWrapper>
                  )}
                </div>
                <form onSubmit={handleSubmit(onAuthNumberSubmit)} className='space-y-4'>
                  <div className='mt-[8px]'>
                    <Label className='text-[14px] text-[#5B5B5B]'>인증번호</Label>
                    <div className='relative mt-[8px]'>
                      <Input
                        type='text'
                        className='h-[40px] w-full rounded-[8px] pr-[80px] text-[14px] placeholder:text-[#BABABA]'
                        placeholder='인증번호를 입력해주세요'
                        maxLength={6}
                        {...register('authNumber', {
                          required: '인증번호를 입력해주세요',
                          minLength: { value: 6, message: '인증번호는 6자리입니다' },
                        })}
                      />
                      {isTimerActive && timeLeft > 0 && (
                        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#004AA4]'>
                          {formatTime(timeLeft)}
                        </div>
                      )}
                    </div>
                    {errors?.authNumber?.message && (
                      <S.ErrorWrapper data-testid='auth-number-error'>
                        <S.ErrorIcon />
                        {errors?.authNumber?.message}
                      </S.ErrorWrapper>
                    )}
                    {isNumberError && (
                      <S.ErrorWrapper data-testid='auth-number-error' className='mt-2'>
                        <S.ErrorIcon />
                        인증번호가 일치하지 않습니다
                      </S.ErrorWrapper>
                    )}
                  </div>
                  {/* 사내변호사 체크 */}
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      className='mr-2 h-[16px] w-[16px] rounded-[4px] border-[1.5px] border-[#E5E5E5] text-[#004AA4] focus:ring-[#004AA4]'
                      id='inHouse'
                      {...register('inHouse')}
                    />
                    <label htmlFor='inHouse' className='text-[14px] text-[#5B5B5B]'>
                      사내변호사
                    </label>
                  </div>
                  <div className='flex pt-[24px]'>
                    <button
                      type='submit'
                      className={`h-[48px] w-full rounded-[12px] transition-colors ${
                        isAuthNumberValid && !isCheckingAuthNumber
                          ? 'bg-[#004AA4] text-white hover:bg-blue-600'
                          : 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]'
                      }`}
                      disabled={!isAuthNumberValid || isCheckingAuthNumber}
                    >
                      {isCheckingAuthNumber ? (
                        <span className='flex items-center justify-center'>
                          <svg className='mr-2 h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                          </svg>
                          확인 중...
                        </span>
                      ) : (
                        '이메일 인증'
                      )}
                    </button>
                    {/*  <button
                      type='button'
                      className='flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50'
                      onClick={ReSendEmail}
                      disabled={isSendingAuthNumber}
                    >
                      {isSendingAuthNumber ? (
                        <span className='flex items-center justify-center'>
                          <svg className='mr-2 h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                          </svg>
                          발송 중...
                        </span>
                      ) : (
                        '재전송'
                      )}
                    </button> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
      {/*    {isPassModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='relative w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
            <button
              onClick={() => setIsPassModalOpen(false)}
              className='absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            <div className='mb-6'>
              <h3 className='text-xl font-semibold text-gray-800'>이메일 인증</h3>
              <p className='mt-2 text-sm text-gray-600'>인증번호를 입력하여 이메일을 확인해주세요</p>
            </div>

            <div className='space-y-4'>
              <div className='rounded-lg bg-blue-50 p-4'>
                <p className='text-center text-sm font-medium text-blue-800'>'{watch('email')}'로 인증번호를 전송하였습니다.</p>
                <p className='mt-1 text-center text-xs'>이메일에서 받은 인증번호를 입력해주세요.</p>
                <p className='mt-1 text-center text-xs'>이메일이 보이지 않으면 스팸메일함을 확인해주세요.</p>
              </div>

              <div className='text-center'>
                <p className='text-lg font-bold text-blue-500'>남은시간: {formatTime(timeLeft)}</p>
              </div>

              <form onSubmit={handleSubmit(onAuthNumberSubmit)} className='space-y-4'>
                <div>
                  <input
                    type='text'
                    className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-lg font-medium placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                    placeholder='인증번호 6자리 입력'
                    maxLength={6}
                    {...register('authNumber', {
                      required: '인증번호를 입력해주세요',
                      minLength: { value: 6, message: '인증번호는 6자리입니다' },
                    })}
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    type='submit'
                    className='flex-1 rounded-xl bg-[#1890FF] py-3 font-medium text-white transition-all hover:bg-[#096DD9] focus:outline-none focus:ring-2 focus:ring-[#1890FF]/20 disabled:cursor-not-allowed disabled:bg-gray-300'
                    disabled={isCheckingAuthNumber}
                  >
                    {isCheckingAuthNumber ? (
                      <span className='flex items-center justify-center'>
                        <svg className='mr-2 h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        확인 중...
                      </span>
                    ) : (
                      '인증 확인'
                    )}
                  </button>
                  <button
                    type='button'
                    className='flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50'
                    onClick={ReSendEmail}
                    disabled={isSendingAuthNumber}
                  >
                    {isSendingAuthNumber ? (
                      <span className='flex items-center justify-center'>
                        <svg className='mr-2 h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        발송 중...
                      </span>
                    ) : (
                      '재전송'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )} */}
    </S.SContainer>
  );
};

export default EmailPassPage;
