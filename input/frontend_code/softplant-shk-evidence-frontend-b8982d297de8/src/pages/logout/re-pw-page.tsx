import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
// import { Spinner } from '@nextui-org/spinner';
import { useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { JoinFormSchema } from '@apis/schema';
import { fetchResetPassword } from '@/apis/evidence-api';
import { TResetPasswordInput } from '@/apis/type';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
// import useRegisterStore from '@/hooks/stores/use-register-store';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  email: string;
  password: string;
  Repassword: string;
};

/**
 * * 비밀번호 재설정 페이지
 * @returns {JSX.Element} 로그인 페이지 컴포넌트
 */
const RePwPage = (): JSX.Element => {
  // ! jotai atom 모음
  // const { setPassword } = useRegisterStore();

  // ! useRef 모음
  const submitRef = useRef<HTMLButtonElement>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  console.log('token', token);
  // const email = decodeURIComponent(urlParams.get('email') || '');
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

  // ! react-query 모음
  // - useQueryClient hook 모음
  // const { isPending, onAuthLogin } = useAuthLogin();
  // 비밀번호 표시 상태 관리
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const handlePasswordReset = async () => {
    const password = watch('password');
    const newPassword = watch('Repassword');

    if (!password || password === '') {
      onMessageToast({ message: '비밀번호를 입력해주세요.' });
      return;
    }

    if (password !== newPassword) {
      onMessageToast({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (password.length < 8) {
      onMessageToast({ message: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    try {
      const input: TResetPasswordInput = {
        newPassword,
        token,
      };
      console.log('input', input);

      const response = await fetchResetPassword(input);

      if (response.success) {
        onMessageToast({ message: '비밀번호가 성공적으로 변경되었습니다.' });
        navigate('/');
      } else {
        onMessageToast({ message: '비밀번호 변경에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      onMessageToast({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
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
            <div className=''>
              <div className='lg:min-w-[580px]'>
                <div className='pt-[5px] text-[#87CEEB]'> 비밀번호 재설정</div>
                <div className='pt-[10px] text-[18px] text-[#656565]'>
                  <p>신규 비밀번호를 입력해주세요</p>
                </div>

                <S.FormWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='password' className='mt-10 flex items-center gap-x-2'>
                        <S.LabelText>비밀번호</S.LabelText>
                      </Label>
                    </S.LabelBox>
                    <div className='relative'>
                      <Input
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
                        })}
                        style={{ height: '50px' }}
                      />
                      <div className='absolute right-6 top-3 cursor-pointer text-gray-500' onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                    {errors?.password?.message && (
                      <S.ErrorWrapper data-testid='password-error'>
                        <S.ErrorIcon />
                        {errors?.password?.message}
                      </S.ErrorWrapper>
                    )}
                  </S.LabelWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='Repassword' className='mt-2 flex items-center gap-x-2'>
                        <S.LabelText>비밀번호 확인</S.LabelText>
                      </Label>
                    </S.LabelBox>
                    <div className='relative'>
                      <Input
                        id='Repassword'
                        type={showRePassword ? 'text' : 'password'}
                        data-testid='password'
                        data-cy='passwordInput'
                        placeholder='password'
                        className={cn(errors?.password?.message && 'focus-visible:ring-red-500')}
                        {...register('Repassword', {
                          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                            if (event.target.value.length > 31) {
                              setValue('Repassword', event.target.value.slice(0, 30));
                            }
                          },
                        })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            submitRef.current?.focus();
                          }
                        }}
                        style={{ height: '50px' }}
                      />
                      <div
                        className='absolute right-6 top-3 cursor-pointer text-gray-500'
                        onClick={() => setShowRePassword((prev) => !prev)}
                      >
                        {showRePassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                    {errors?.Repassword?.message && (
                      <S.ErrorWrapper data-testid='password-error'>
                        <S.ErrorIcon />
                        {errors?.Repassword?.message}
                      </S.ErrorWrapper>
                    )}
                  </S.LabelWrapper>
                </S.FormWrapper>

                <button className='mt-[50px] h-[50px] w-full rounded-md bg-[#87CEEB] text-[15px] text-white' onClick={handlePasswordReset}>
                  비밀번호 재설정
                </button>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default RePwPage;
