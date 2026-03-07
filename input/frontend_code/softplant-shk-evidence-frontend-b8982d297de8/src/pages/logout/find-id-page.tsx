import { useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { IoIosWarning } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';

import { unAuthClient } from '@apis/index';
import { finePwFormSchema } from '@apis/schema';
import { fetchCheckAuthEmail, fetchSendResetPasswordEmail, fetchCheckUserExist } from '@/apis/evidence-api';
import { TSendResetPasswordEmailInput } from '@/apis/type';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils';
import useNicePayStore from '@/hooks/stores/use-nice-pay-store';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  email: string;
};

/**
 * * 비밀번호 찾기 페이지
 * @returns {JSX.Element} 비밀번호 찾기 페이지 컴포넌트
 */
const FindIdPage = () => {
  const [fineId, setFindId] = useState(true);
  const [finePw, setFindPw] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5분 = 300초
  const [currentCodeId, setCurrentCodeId] = useState<string>(''); // codeId 저장용 state 추가
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const emailParam = urlParams.get('email');
  const navigate = useNavigate();

  // - 나이스페이 관련 store
  const { setNicePayPhoneCertification } = useNicePayStore();
  // const { setNicePayPhoneCertification } = useNicePayStore();
  const {
    watch,
    register,
    setValue,
    clearErrors,

    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(finePwFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });
  // 인증 상태 체크 함수
  const checkEmailVerification = async (codeId: string) => {
    try {
      const response = await fetchCheckAuthEmail(codeId);
      console.log('Verification status:', response);

      if (response.success && response.data?.verified) {
        setIsPassModalOpen(false); // 모달 닫기
        onMessageToast({ message: '이메일 인증이 완료되었습니다.' });

        // 현재 URL의 모든 파라미터 가져오기
        const currentParams = new URLSearchParams(window.location.search);
        const allParams = Array.from(currentParams.entries())
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        const token = response.data?.token || '';

        // register_pw 페이지로 이동
        navigate(`/reset_password?${allParams}&token=${token}`);
      }
    } catch (error) {
      console.error('Verification check error:', error);
      onMessageToast({ message: '인증 상태 확인 중 오류가 발생했습니다.' });
    }
  };
  const resetAllTabs = () => {
    setFindId(false);
    setFindPw(false);
  };
  const handleTabClick = (tabSetter: any) => {
    resetAllTabs();
    tabSetter(true);
  };

  const handleApprove = async () => {
    const email = watch('email');
    if (!email) {
      onMessageToast({
        message: '이메일을 입력해주세요.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    try {
      // 이메일 존재 여부 확인
      const checkResult = await fetchCheckUserExist(email);

      // 이메일이 가입되어 있지 않은 경우
      if (!checkResult.success || !checkResult.data?.exists) {
        onMessageToast({
          message: '미가입된 이메일입니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }

      // 이메일이 가입되어 있는 경우 인증 메일 발송
      const input: TSendResetPasswordEmailInput = {
        email: email,
        successUrl: `${process.env.VITE_FRONTEND_URL}/certify_complete`,
        failUrl: `${process.env.VITE_FRONTEND_URL}/find_id?tab=pw`,
      };

      const response = await fetchSendResetPasswordEmail(input);

      if (response.success) {
        setTimeLeft(300); // 타이머 초기화 (5분)
        setIsPassModalOpen(true); // 모달 열기
        if (response.data?.code_id) {
          setCurrentCodeId(response.data.code_id);
        }
      } else {
        onMessageToast({
          message: '메일 발송에 실패했습니다.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error: any) {
      if (error.response?.data?.error?.status === 429 || error.response?.data?.error?.code === 'PASSWORD_RESET_LIMIT_EXCEEDED') {
        onMessageToast({
          message: '인증 시도 횟수를 초과했습니다.24시간 후에 다시 시도해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
        });
        return;
      }
      onMessageToast({
        message: '메일 발송에 실패했습니다.',
        icon: <IoIosWarning className='h-5 w-5 text-yellow-500' />,
      });
      console.error(error);
    }
  };
  const onCheck = async () => {
    const baseUrl = `https://api.ailex.co.kr/api/v1/auth/nice/encrypt/data`; // 본인인증 결과를 전달받을 api url
    const returnUrl = `${process.env.VITE_FRONTEND_URL}/id_certify`; // 본인인증 결과를 전달받을 url
    const redirectUrl = `${process.env.VITE_FRONTEND_URL}/`; // 본인인증 완료 후 이동할 url

    await unAuthClient
      .post(baseUrl, {
        return_url: returnUrl,
        popup_yn: 'Y',
        method_type: 'get',
        receive_data: redirectUrl,
      })
      .then((response) => {
        const encodeData = response.data.data;
        const form = document.getElementById('form') as HTMLFormElement;
        const left = screen.width / 2 - 500 / 2;
        const top = screen.height / 2 - 800 / 2;
        const option = `width=500, height=550, top=${top}, left=${left}, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no`;
        window.open('', 'nicePopup', option);
        form.target = 'nicePopup';
        form.action = 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb';
        form.token_version_id.value = encodeData.token_version_id;
        form.enc_data.value = encodeData.enc_data;
        form.integrity_value.value = encodeData.integrity_value;
        console.log('form', form);

        form.submit();
        console.log('form', form);
        return {
          symmetricKey: encodeData.symmetricKey,
          encData: encodeData.enc_data,
          integrityValue: encodeData.integrity_value,
        };
      })
      .then((response) => {
        setNicePayPhoneCertification({
          symmetricKey: response.symmetricKey,
          encData: response.encData,
          integrityValue: response.integrityValue,
        });
      })
      .catch((error) => {
        onMessageToast({
          message: '본인인증에 실패했습니다. 다시 시도해주세요.',
          icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
        });
        console.error(error);
      });
  };
  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const ReSendEmail = async () => {
    if (timeLeft === 0) {
      onMessageToast({
        message: '인증 시간이 만료되었습니다. 이메일 인증을 처음부터 다시 시도해주세요.',
      });
      setIsPassModalOpen(false);
      return;
    }

    setIsPassModalOpen(false);
    handleApprove();
  };
  // 타이머 useEffect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPassModalOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsPassModalOpen(false);
            onMessageToast({ message: '인증 시간이 초과되었습니다. 이메일 인증을 다시 시도해주세요.' });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isPassModalOpen, timeLeft]);
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    if (isPassModalOpen && currentCodeId) {
      checkInterval = setInterval(() => {
        checkEmailVerification(currentCodeId);
      }, 1000);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isPassModalOpen, currentCodeId]); // eslint-disable-line
  useEffect(() => {
    if (tabParam === 'pw') {
      setFindId(false);
      setFindPw(true);

      if (emailParam) {
        setValue('email', decodeURIComponent(emailParam));
      }
    }
  }, [tabParam, emailParam, setValue]);

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
            <div className='h-[580px]'>
              <div className='flex w-full justify-center gap-x-5 lg:gap-x-0'>
                <div className=''>
                  <button
                    className={cn(
                      'NotoSansKR h-[50px] w-full border-b-2 text-sm text-[#595959] lg:h-[65px] lg:w-[270px] lg:text-[20px]',
                      fineId ? 'rounded-none border-gray-500 lg:h-[65px] lg:w-[270px]' : '',
                    )}
                    onClick={() => handleTabClick(setFindId)}
                  >
                    아이디 찾기
                  </button>
                </div>
                <div className=''>
                  <button
                    className={cn(
                      'NotoSansKR h-[50px] w-full border-b-2 text-sm text-[#595959] lg:h-[65px] lg:w-[270px] lg:text-[20px]',
                      finePw ? 'rounded-none border-gray-500 lg:h-[65px] lg:w-[270px]' : '',
                    )}
                    onClick={() => handleTabClick(setFindPw)}
                  >
                    비밀번호 재설정
                  </button>
                </div>
              </div>
              {fineId && (
                <div className='mt-20 flex w-full items-center justify-center'>
                  <div>
                    <div className='text-center text-[25px]'>본인인증을 진행해주세요.</div>
                    <div className='flex justify-center'>
                      <button className='mt-10 h-[50px] w-[130px] rounded-md bg-[#87CEEB] text-white' type='button' onClick={onCheck}>
                        본인인증
                      </button>
                      <Link className='ml-4 mt-10 flex h-[50px] w-[130px] items-center justify-center rounded-md border' to='/'>
                        취소
                      </Link>
                      <form name='form' id='form' action='https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb'>
                        <input type='hidden' id='m' name='m' value='service' />
                        <input type='hidden' id='token_version_id' name='token_version_id' value='' />
                        <input type='hidden' id='enc_data' name='enc_data' />
                        <input type='hidden' id='integrity_value' name='integrity_value' />
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {finePw && (
                <div className='mt-20 flex w-full items-center justify-center'>
                  <div className='w-[80%]'>
                    <div className='mb-4 text-center text-[25px]'>가입 시 등록한 이메일 주소를 입력해주세요.</div>
                    <Label htmlFor='email' className=''>
                      <S.LabelText>이메일주소</S.LabelText>
                      {errors?.email?.message && (
                        <S.ErrorWrapper data-testid='user-id-error'>
                          <S.ErrorIcon />
                          {errors?.email?.message}
                        </S.ErrorWrapper>
                      )}
                    </Label>
                    <Input
                      id='email'
                      type='text'
                      placeholder='가입시 등록한 이메일 주소를 입력해주세요.'
                      style={{ height: '50px', marginTop: '10px' }}
                      className={cn(errors?.email?.message && 'focus-visible:ring-red-500', 'w-full')}
                      {...register('email', {
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                          const inputValue = event.target.value;
                          if (inputValue.length > 255) {
                            setValue('email', inputValue.slice(0, 255));
                          }
                        },
                        onBlur: () => {
                          if (errors?.email?.message) {
                            setValue('email', ''); // 오류 발생 시 초기화
                          }
                          clearErrors('email');
                        },
                      })}
                    />
                    <div className='flex w-full items-center justify-center md:justify-end'>
                      <button className='mt-4 h-[50px] w-[130px] rounded-md bg-[#87CEEB] text-white' type='button' onClick={handleApprove}>
                        인증 메일 보내기
                      </button>
                      <Link className='ml-4 mt-4 flex h-[50px] w-[130px] items-center justify-center rounded-md border' to='/'>
                        취소
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isPassModalOpen && (
            <div className='fixed inset-0 z-50 flex items-center justify-center'>
              <div className='absolute inset-0 h-auto bg-gray-500 opacity-75' />
              <div className='z-10 w-[80%] rounded-lg bg-white p-4 shadow-xl lg:h-auto lg:w-[30%]'>
                <div className='border-b pb-2 text-[16px] font-semibold text-gray-500'>이메일 인증</div>
                <div className='mt-4'>
                  <p className='pt-4 text-center text-[16px] font-semibold lg:pt-6 lg:text-lg'>
                    '{watch('email')}'로 이메일을 전송하였습니다.
                  </p>
                  <p className='pt-2 text-center lg:text-lg'>5분내 인증을 완료해주세요.</p>
                  <p className='pt-2 text-center text-sm text-gray-500'>이메일이 보이지 않으면 스팸메일함을 확인해주세요.</p>
                  <p className='mb-6 mt-2 border-b pb-2 pt-2 text-center text-xl font-bold text-[#87CEEB]'>
                    남은시간: {formatTime(timeLeft)}
                  </p>
                </div>
                <div className='mb-2 mt-2 flex justify-center' onClick={() => setIsPassModalOpen(false)}>
                  <button className='w-full rounded-lg bg-[#87CEEB] py-2 text-white hover:bg-gray-700' onClick={ReSendEmail}>
                    재전송{' '}
                  </button>
                  <button className='ml-4 w-full rounded-lg bg-gray-400 py-2 text-white hover:bg-gray-700'>닫기</button>
                </div>
              </div>
            </div>
          )}
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default FindIdPage;
