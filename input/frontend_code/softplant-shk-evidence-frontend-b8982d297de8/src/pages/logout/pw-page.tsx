import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
// import { Spinner } from '@nextui-org/spinner';
import { useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
// import { useLoginStore } from '@stores/index';
import { useNavigate } from 'react-router-dom';

import { JoinFormSchema } from '@apis/schema';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateEvidenceUser } from '@/hooks/react-query/mutation/evidence/use-create-evidence-user';
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
const JoinPage2 = (): JSX.Element => {
  // ! jotai atom 모음
  // const { dispatchLogin } = useLoginStore();

  // ! useRef 모음
  const submitRef = useRef<HTMLButtonElement>(null);
  const { onCreateEvidenceUser } = useCreateEvidenceUser();
  const navigate = useNavigate();
  // ! react-hook-form 모음
  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(JoinFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
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
                <div className='text-[25px] text-[#BEC1C6]'>
                  <strong className='pr-1 text-[#87CEEB]'>2</strong>/ 3
                </div>
                <div className='pt-[5px] text-[#87CEEB]'>회원가입 - 계정설정</div>
                <div className='pt-[10px] text-[18px] text-[#656565]'>
                  아이디는 로펌 또는 법률사무소 이메일을 기입하고,
                  <br /> 비밀번호는 조건에 맞게 설정해주세요.
                </div>

                <S.FormWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='email' className='mt-[30px] flex w-full items-center gap-x-2'>
                        <S.LabelText>아이디</S.LabelText>
                        {errors?.email?.message && (
                          <S.ErrorWrapper data-testid='user-id-error'>
                            <S.ErrorIcon />
                            {errors?.email?.message}
                          </S.ErrorWrapper>
                        )}
                      </Label>
                    </S.LabelBox>
                    <Input
                      id='email'
                      type='text'
                      placeholder='hgd@hgdlaw.co.kr'
                      style={{ height: '50px' }}
                      className={cn(errors?.email?.message && 'focus-visible:ring-red-500')}
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
                  </S.LabelWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='password' className='flex items-center gap-x-2'>
                        <S.LabelText>비밀번호</S.LabelText>
                        {errors?.password?.message && (
                          <S.ErrorWrapper data-testid='password-error'>
                            <S.ErrorIcon />
                            {errors?.password?.message}
                          </S.ErrorWrapper>
                        )}
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
                          onBlur: () => clearErrors('password'),
                        })}
                        style={{ height: '50px' }}
                      />
                      <div className='absolute right-4 top-3 cursor-pointer text-gray-500' onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                  </S.LabelWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='Repassword' className='flex items-center gap-x-2'>
                        <S.LabelText>비밀번호 확인</S.LabelText>
                        {errors?.Repassword?.message && (
                          <S.ErrorWrapper data-testid='password-error'>
                            <S.ErrorIcon />
                            {errors?.Repassword?.message}
                          </S.ErrorWrapper>
                        )}
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
                          onBlur: () => clearErrors('Repassword'),
                        })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            submitRef.current?.focus();
                          }
                        }}
                        style={{ height: '50px' }}
                      />
                      <div
                        className='absolute right-4 top-3 cursor-pointer text-gray-500'
                        onClick={() => setShowRePassword((prev) => !prev)}
                      >
                        {showRePassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                      </div>
                    </div>
                  </S.LabelWrapper>
                </S.FormWrapper>

                <button
                  className='mt-[50px] h-[50px] w-full rounded-md bg-[#87CEEB] text-[15px] text-white'
                  onClick={async () => {
                    await handleSubmit(async (data) => {
                      const response = await onCreateEvidenceUser({
                        email: data.email,
                        password: data.password,
                        name: '',
                        phone: '',
                        office_nm: '',
                        marketing_agree: false,
                        birthdate: '',
                        gender: '',
                        registration_source: '',
                        registration_source_other: '',
                      });
                      console.log('response', response);
                      if (!response) {
                        onMessageToast({ message: '가입정보를 다시 한 번 확인해주세요.' });
                        return;
                      }

                      if (response.isSuccess) {
                        onMessageToast({ message: response.message });
                        navigate('/join_3');
                        // history.push('/login');
                      } else {
                        onMessageToast({ message: response.message });
                      }
                    })();
                  }}
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

export default JoinPage2;
