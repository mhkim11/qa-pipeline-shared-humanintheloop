import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
// import { Spinner } from '@nextui-org/spinner';
import { useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { JoinFormSchema } from '@apis/schema';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import useRegisterStore from '@/hooks/stores/use-register-store';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  email: string;
  password: string;
  Repassword: string;
};

/**
 * * 회원가입 페이지 2 (아이디, 비밀번호 입력)
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const RegisterPwPage = (): JSX.Element => {
  // ! jotai atom 모음
  const { setPassword } = useRegisterStore();

  // ! useRef 모음
  const submitRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  // ! react-hook-form 모음
  const {
    register,
    watch,
    setValue,

    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(JoinFormSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      Repassword: '',
    },
  });

  // const { onCreateEvidenceUser } = useCreateEvidenceUser();

  // 비밀번호 표시 상태 관리
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordsMismatch, setPasswordsMismatch] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [hasSpecialCharError, setHasSpecialCharError] = useState(false);
  const [hasAlphabetError, setHasAlphabetError] = useState(false);
  const [hasNumberError, setHasNumberError] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState(false);

  // 비밀번호 유효성 검사 함수들
  const hasSpecialChar = (password: string): boolean => {
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    return specialCharRegex.test(password);
  };

  const hasAlphabet = (password: string): boolean => {
    const alphabetRegex = /[a-zA-Z]/;
    return alphabetRegex.test(password);
  };

  const hasNumber = (password: string): boolean => {
    const numberRegex = /[0-9]/;
    return numberRegex.test(password);
  };

  const NextPage = async () => {
    const password = watch('password');
    const repassword = watch('Repassword');

    // 에러 상태 초기화
    setPasswordError(false);
    setHasSpecialCharError(false);
    setHasAlphabetError(false);
    setHasNumberError(false);
    setPasswordLengthError(false);
    setPasswordsMismatch(false);

    if (!password || password === '') {
      setPasswordError(true);
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setPasswordLengthError(true);
      return;
    }

    if (!hasSpecialChar(password)) {
      setHasSpecialCharError(true);
      return;
    }

    if (!hasAlphabet(password)) {
      setHasAlphabetError(true);
      return;
    }

    if (!hasNumber(password)) {
      setHasNumberError(true);
      return;
    }

    if (password !== repassword) {
      setPasswordsMismatch(true);
      return;
    }

    // 비밀번호만 세션 스토리지에 저장하고 로펌명 페이지로 이동
    const existingData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    sessionStorage.setItem(
      'registrationData',
      JSON.stringify({
        ...existingData,
        password: password,
        birthdate: existingData.birthdate || '',
        gender: existingData.gender || '',
      }),
    );

    setPassword(password);

    // 로펌명 입력 페이지로 이동
    navigate('/register_marketing');
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
                <div className='text-[25px] text-[#BEC1C6]'>
                  <strong className='text-[28px] text-[#212121]'>비밀번호 등록</strong>
                </div>
                <div className='pt-[10px] text-[14px] text-[#5B5B5B]'>
                  8자 이상 20자이하, 영문자,숫자,특수문자가 모두 포함되어야 합니다.
                </div>

                <S.FormWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='password' className='mt-[32px] flex items-center gap-x-2'>
                        <S.LabelText>신규 비밀번호</S.LabelText>
                      </Label>
                    </S.LabelBox>
                    <div className='relative'>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        data-testid='password'
                        data-cy='passwordInput'
                        placeholder='비밀번호를 입력해주세요'
                        className={cn(errors?.password?.message && 'focus-visible:ring-red-500')}
                        {...register('password', {
                          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                            if (event.target.value.length > 20) {
                              setValue('password', event.target.value.slice(0, 20));
                            }
                            // 입력 시 에러 상태 초기화
                            setPasswordError(false);
                            setHasSpecialCharError(false);
                            setHasAlphabetError(false);
                            setHasNumberError(false);
                            setPasswordLengthError(false);

                            // 비밀번호 일치 여부 체크
                            const passwordValue = event.target.value;
                            const rePasswordValue = watch('Repassword');

                            if (rePasswordValue === '') {
                              // 재입력 필드가 비어있으면 상태 초기화
                              setPasswordsMatch(false);
                              setPasswordsMismatch(false);
                            } else if (passwordValue === rePasswordValue) {
                              // 비밀번호가 일치하면
                              setPasswordsMatch(true);
                              setPasswordsMismatch(false);
                            } else {
                              // 비밀번호가 일치하지 않으면
                              setPasswordsMatch(false);
                              setPasswordsMismatch(true);
                            }
                          },
                        })}
                        style={{ height: '48px', marginTop: '8px', borderRadius: '8px' }}
                      />
                      <div className='absolute right-6 top-5 cursor-pointer text-gray-500' onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                    {errors?.password?.message && (
                      <S.ErrorWrapper data-testid='password-error'>
                        <S.ErrorIcon />
                        {errors?.password?.message}
                      </S.ErrorWrapper>
                    )}
                    {passwordError && (
                      <S.ErrorWrapper data-testid='password-error'>
                        <S.ErrorIcon />
                        비밀번호를 입력해주세요.
                      </S.ErrorWrapper>
                    )}
                    {hasSpecialCharError && (
                      <S.ErrorWrapper data-testid='special-char-error'>
                        <S.ErrorIcon />
                        비밀번호에는 특수문자가 포함되어야 합니다.
                      </S.ErrorWrapper>
                    )}
                    {hasAlphabetError && (
                      <S.ErrorWrapper data-testid='alphabet-error'>
                        <S.ErrorIcon />
                        비밀번호에는 영문자가 포함되어야 합니다.
                      </S.ErrorWrapper>
                    )}
                    {hasNumberError && (
                      <S.ErrorWrapper data-testid='number-error'>
                        <S.ErrorIcon />
                        비밀번호에는 숫자가 포함되어야 합니다.
                      </S.ErrorWrapper>
                    )}
                    {passwordLengthError && (
                      <S.ErrorWrapper data-testid='password-length-error'>
                        <S.ErrorIcon />
                        비밀번호는 8자 이상 20자 이하로 입력해주세요.
                      </S.ErrorWrapper>
                    )}
                  </S.LabelWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='Repassword' className='mt-2 flex items-center gap-x-2'>
                        <S.LabelText>비밀번호 재입력</S.LabelText>
                      </Label>
                    </S.LabelBox>
                    <div className='relative'>
                      <Input
                        id='Repassword'
                        type={showRePassword ? 'text' : 'password'}
                        data-testid='password'
                        data-cy='passwordInput'
                        placeholder='비밀번호를 다시 입력해주세요'
                        className={cn(errors?.password?.message && 'focus-visible:ring-red-500')}
                        {...register('Repassword', {
                          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                            if (event.target.value.length > 20) {
                              setValue('Repassword', event.target.value.slice(0, 20));
                            }
                            const currentPassword = watch('password');
                            const rePasswordValue = event.target.value;

                            if (rePasswordValue === '') {
                              // 재입력 필드가 비어있으면 모든 상태 초기화
                              setPasswordsMatch(false);
                              setPasswordsMismatch(false);
                            } else if (currentPassword === rePasswordValue) {
                              // 비밀번호가 일치하면
                              setPasswordsMatch(true);
                              setPasswordsMismatch(false);
                            } else {
                              // 비밀번호가 일치하지 않으면
                              setPasswordsMatch(false);
                              setPasswordsMismatch(true);
                            }
                          },
                        })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            submitRef.current?.focus();
                          }
                        }}
                        style={{ height: '48px', marginTop: '8px', borderRadius: '8px' }}
                      />
                      <div
                        className='absolute right-6 top-5 cursor-pointer text-gray-500'
                        onClick={() => setShowRePassword((prev) => !prev)}
                      >
                        {showRePassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                    {errors?.Repassword?.message ? (
                      <S.ErrorWrapper data-testid='password-error'>
                        <S.ErrorIcon />
                        {errors?.Repassword?.message}
                      </S.ErrorWrapper>
                    ) : passwordsMismatch ? (
                      <S.ErrorWrapper data-testid='password-mismatch-error'>
                        <S.ErrorIcon />
                        비밀번호가 일치하지 않습니다
                      </S.ErrorWrapper>
                    ) : (
                      !errors?.Repassword?.message &&
                      passwordsMatch && <div className='mt-1 text-sm font-medium text-[#5ec41a]'>비밀번호가 일치합니다</div>
                    )}
                  </S.LabelWrapper>
                </S.FormWrapper>

                <button
                  className={cn(
                    'mt-[16px] h-[40px] w-full rounded-[8px] bg-[#f3f3f3] text-[15px] text-[#5B5B5B]',
                    passwordsMatch ? 'bg-[#004AA4] text-white' : 'bg-[#f3f3f3] text-[#5B5B5B]',
                  )}
                  disabled={!passwordsMatch}
                  onClick={NextPage}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default RegisterPwPage;
