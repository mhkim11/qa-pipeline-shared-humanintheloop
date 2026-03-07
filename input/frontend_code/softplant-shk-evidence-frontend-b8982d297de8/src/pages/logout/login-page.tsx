import { useRef, useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@nextui-org/spinner';
import { debounce } from 'lodash';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useLoginStore } from '@stores/index';
import { fetchCheckUserExist } from '@apis/evidence-api';
import { loginFormSchema } from '@apis/schema';
import { BasePasswordInput } from '@/components/common/input/base-password-input';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Button, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
import { useAuthLogin } from '@/hooks/react-query';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  email: string;
  password: string;
};

/**
 * * 로그인 페이지
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const LoginPage = (): JSX.Element => {
  // ! jotai atom 모음
  const { dispatchLogin } = useLoginStore();
  const navigate = useNavigate();

  // ! useRef 모음
  const submitRef = useRef<HTMLButtonElement>(null);

  // ! react-hook-form 모음
  // - useForm 모음
  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    control,
    formState: { errors, isValid },
  } = useForm<TForm>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
    values: {
      email: '',
      password: '',
    },
  });
  // - useWatch 모음
  const password = useWatch({ control, name: 'password' });
  const email = useWatch({ control, name: 'email' });

  // ! react-query 모음
  // - useQueryClient hook 모음
  const { isPending, onAuthLogin } = useAuthLogin();
  // 비밀번호 표시 상태 관리
  const [rememberId, setRememberId] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('');

  // 페이지 로드 시 localStorage에서 아이디 불러오기
  useEffect(() => {
    // 이전 로그인 세션 정리를 위한 이벤트 발생
    // 이 페이지에 접근했다는 것은 로그인이 필요한 상태이므로 캐시를 초기화
    window.dispatchEvent(new Event('storage-reset'));

    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberId(true);
    }
  }, [setValue]);

  // 아이디 저장 체크박스 변경 이벤트
  const handleRememberIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setRememberId(checked);

    if (!checked) {
      localStorage.removeItem('savedEmail');
    }
  };
  const handleTabClick = () => {
    navigate('/find_id?tab=pw');
  };
  // 이메일 체크를 위한 디바운스 함수
  const handlePasswordFocus = () => {
    if (email) {
      console.log(email);
      fetchCheckUserExist(email)
        .then((response) => {
          console.log('API 응답:', response);
          if (!response.success) {
            setEmailCheckMessage(response.message);
          } else if (!response.data?.exists) {
            setEmailCheckMessage('가입되지 않은 이메일입니다. 회원가입을 진행해주세요.');
          } else {
            setEmailCheckMessage('');
          }
        })
        .catch((error) => {
          console.error('이메일 확인 중 오류 발생:', error);
          setEmailCheckMessage('이메일 확인 중 오류가 발생했습니다.');
        });
    } else {
      console.log('이메일 없음');
    }
  };

  const handleDebouncedLogin = debounce(async (data: TForm) => {
    if (rememberId) {
      localStorage.setItem('savedEmail', data.email);
    }
    dispatchLogin({ type: 'FETCHING' });

    const response = await onAuthLogin({
      email: data.email,
      password: data.password,
    });

    if (!response) {
      onMessageToast({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

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
  }, 100);

  return (
    <S.SContainer>
      <S.Container>
        <LoginSidebar
          text={`며칠 만에 모든 문서를 라이브텍스트화, 클렌징, 정리, 요약하고\n소송을 이기는 핵심 증거를 AI가 찾아드립니다.`}
          isMd={true}
        />

        <S.FormTotalWrapper>
          <S.ContentWrapper className='flex min-h-full flex-col'>
            {/*   <div className='flex h-full w-full items-center pb-10 md:hidden'>
              <div className='text-[40px] font-bold text-black'>로그인</div>
            </div> */}
            <div className='flex flex-1 flex-col justify-center'>
              <S.LoginFormWrapper>
                <div className='text-[20px] font-bold text-[#252525] 2xl:mb-[24px] 2xl:text-[28px]'>로그인</div>
                <S.LabelWrapper>
                  <S.LabelBox>
                    <Label htmlFor='email' className='w-full items-center'>
                      <S.LabelText>아이디</S.LabelText>
                      <div className='pt-2'>
                        {(errors?.email?.message || emailCheckMessage) && (
                          <S.ErrorWrapper data-testid='user-id-error'>
                            <S.ErrorIcon />
                            {errors?.email?.message || emailCheckMessage}
                          </S.ErrorWrapper>
                        )}
                      </div>
                    </Label>
                  </S.LabelBox>
                  <Input
                    id='email'
                    type='text'
                    data-cy='userIdInput'
                    data-testid='email'
                    placeholder='아이디를 입력해주세요'
                    className={cn(
                      (errors?.email?.message || emailCheckMessage) &&
                        'border-[#E5E5E5] placeholder:text-[#BABABA] focus-visible:ring-red-500',
                    )}
                    {...register('email', {
                      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                        if (event.target.value.length > 255) {
                          setValue('email', event.target.value.slice(0, 255));
                        }
                      },
                      onBlur: () => clearErrors('email'),
                    })}
                    style={{ height: '40px' }}
                  />
                </S.LabelWrapper>
                <S.LabelWrapper>
                  <S.LabelBox>
                    <Label htmlFor='password' className='items-center gap-x-2'>
                      <S.LabelText>비밀번호</S.LabelText>
                      <div className='pt-2'>
                        {errors?.password?.message && (
                          <S.ErrorWrapper data-testid='password-error'>
                            <S.ErrorIcon />
                            {errors?.password?.message}
                          </S.ErrorWrapper>
                        )}
                      </div>
                    </Label>
                  </S.LabelBox>
                  <div className='relative'>
                    <BasePasswordInput
                      classNames={{ input: 'h-[40px]', inputFocused: 'ring-2 ring-[#0050B3]' }}
                      value={password}
                      onValueChange={(value) => {
                        setValue('password', value.slice(0, 30));
                      }}
                      onFocus={() => {
                        console.log('비밀번호 입력창 포커스됨');
                        handlePasswordFocus();
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          await handleSubmit(async (data) => {
                            handleDebouncedLogin(data);
                          })();
                        }
                      }}
                    />
                    <div className='mt-[16px]'>
                      <input
                        type='checkbox'
                        onChange={handleRememberIdChange}
                        checked={rememberId}
                        className='h-[15px] w-[15px] rounded-[2px] border-[1.5px] border-[#E5E5E5] text-[#4577A4] focus:ring-[#4577A4]'
                      />
                      <label className='ml-[8px] text-[14px] font-normal text-[#888888]'>아이디 저장</label>
                    </div>
                    {/* <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    data-testid='password'
                    data-cy='passwordInput'
                    placeholder='password'
                    className={cn(errors?.password?.message && 'focus-visible:ring-red-500')}
                    {...register('password', {
                      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                        if (event.target.value.length > 31) {
                          setValue('password', event.target.value.slice(0, 30));
                        }
                      },
                      onBlur: () => clearErrors('password'),
                    })}
                    onKeyDown={async (event) => {
                      if (event.key === 'Enter') {
                        await handleSubmit(async (data) => {
                          handleDebouncedLogin(data);
                        })();
                      }
                    }}
                    style={{ height: '50px' }}
                  /> */}
                    {/* <div className='absolute right-10 top-3 cursor-pointer text-gray-500' onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                  </div> */}
                  </div>
                </S.LabelWrapper>
                <Button
                  disabled={isPending || !email || !password}
                  className={cn(
                    'mt-[8px] w-[98.5%] rounded-[8px] text-white',
                    email && password ? 'bg-[#004AA4] hover:bg-[#004AA4]/90' : 'bg-gray-400',
                    isPending && 'opacity-70',
                  )}
                  data-testid='login-button'
                  data-cy='loginButton'
                  ref={submitRef}
                  type='submit'
                  variant={isValid ? 'default' : 'secondary'}
                  onClick={async () => {
                    await handleSubmit(async (data) => {
                      handleDebouncedLogin(data);
                    })();
                  }}
                >
                  {isPending ? <Spinner size='sm' /> : '로그인'}
                </Button>
                <div className='mt-[10px] flex items-center justify-center 2xl:mt-[24px]'>
                  <div className='w-full border-b border-[#E5E5E5]'></div>
                  <div className='flex w-[100px] justify-center px-2 text-[14px] font-normal text-[#888888]'>또는</div>
                  <div className='w-full border-b border-[#E5E5E5]'></div>
                </div>
                <Button
                  className='mt-[10px] h-[40px] w-[98.5%] rounded-[8px] border border-[#E5E5E5] bg-white text-[#212121] hover:bg-[#004AA4] hover:text-white 2xl:mt-[24px]'
                  data-testid='join-button'
                  data-cy='joinButton'
                  type='button'
                  asChild
                >
                  <Link to='/register'>회원가입</Link>
                </Button>
              </S.LoginFormWrapper>
              <div className='mt-[18px] flex cursor-pointer justify-center text-[14px] text-[#888888] 2xl:mt-[32px]'>
                <Link to='/find_id'>아이디 찾기</Link>
                <p className='pl-[8px] pr-[8px] text-[#E5E5E5]'>|</p>
                <p onClick={handleTabClick}>비밀번호 재설정</p>
              </div>
            </div>
            <div className='mb-10 mt-8 text-[12px] text-[#999999] lg:mt-12'>
              <div className='flex text-[#888888]'>
                <a className='underline' href='/terms' target='_blank'>
                  이용약관
                </a>
                <a className='pl-4 underline' href='/policy' target='_blank'>
                  개인정보 처리방침
                </a>
              </div>
              <div className='mt-[16px] flex text-[10px] text-[#999999] xs:text-sm'>
                <p className='font-bold text-[#999999]'>A2D2 </p>

                <p className='pl-1 pr-1'>|</p>
                <p className='font-thin text-[#999999]'>대표이사 김윤우 </p>
              </div>
              <div className='flex text-[10px] text-[#999999] xs:text-sm'>
                <p className='font-thin text-[#999999]'>사업자 등록번호 242-88-03370 </p>

                <p className='pl-1 pr-1'>|</p>
                <p className='font-thin text-[#999999]'>통신판매신고 제2025-서울강남-06934호 </p>
              </div>
              <div className='text-[10px] xs:text-sm'>
                <p>서울 강남구 테헤란로83길 51 (삼성동,정목빌딩) 2층</p>
              </div>
              <div className='flex text-[10px] xs:text-sm'>
                <p>cs@ailex.co.kr</p>
                <p className='pl-1 pr-1'>|</p>
                <p>02-538-3337</p>
              </div>
              <p className='mt-[16px] text-[10px] xs:text-sm'>Copyright 2024 © A2D2 Inc. All rights reserved</p>
            </div>
          </S.ContentWrapper>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default LoginPage;
