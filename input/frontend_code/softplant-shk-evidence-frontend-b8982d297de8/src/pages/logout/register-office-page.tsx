import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { IoIosAddCircle, IoIosCloseCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

import { OfficeNmFormSchema } from '@apis/schema';
import { fetchSearchOfficeNm, fetchCreateEvidenceUserDomain } from '@/apis/evidence-api';
import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateEvidenceUser } from '@/hooks/react-query/mutation/evidence/use-create-evidence-user';
import useRegisterStore from '@/hooks/stores/use-register-store';
import { cn } from '@/lib/utils';
import { loginPageStyle as S } from '@/shared/styled';

type TForm = {
  officeNm: string;
};

/**
 * * 로펌명 입력 페이지
 * @returns {JSX.Element}
 */
const OfficeNamePage = (): JSX.Element => {
  const [registrationData] = useState(() => {
    const data = sessionStorage.getItem('registrationData');
    return data ? JSON.parse(data) : {};
  });

  const { setName, setPhone } = useRegisterStore();
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirectAdd, setIsDirectAdd] = useState(false);
  const [existingOfficeError, setExistingOfficeError] = useState(false);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false); // 드롭다운에서 선택했는지 추적
  const { onCreateEvidenceUser } = useCreateEvidenceUser();
  console.log('existingOfficeError', existingOfficeError);
  // 이메일 인증에서 받은 로펌명이 있는지 확인 (있으면 고정값으로 표시)
  const existingOfficeName = registrationData.office_nm || '';
  const hasExistingOffice = !!existingOfficeName;

  // sessionStorage에서 개인 도메인 여부 확인
  const isPersonalDomain = registrationData.isPersonalDomain || false;
  const isInHouseLawyer = registrationData.inHouse || false;

  // ! react-hook-form 모음
  const navigate = useNavigate();

  const {
    register,
    setValue,
    clearErrors,
    watch,
    trigger,
    formState: { errors },
  } = useForm<TForm>({
    resolver: zodResolver(OfficeNmFormSchema),
    mode: 'onChange',
    defaultValues: {
      officeNm: existingOfficeName,
    },
  });

  useEffect(() => {
    if (registrationData.name) {
      setName(registrationData.name);
    }
    if (registrationData.phone) {
      setPhone(registrationData.phone);
    }
  }, [registrationData, setName, setPhone]);

  // 세션스토리지에서 office_nm이 업데이트되면 form 값도 업데이트
  useEffect(() => {
    const data = sessionStorage.getItem('registrationData');
    const sessionData = data ? JSON.parse(data) : {};

    if (sessionData.office_nm && sessionData.office_nm !== watch('officeNm')) {
      setValue('officeNm', sessionData.office_nm, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: false,
      });
    }
  }, [setValue, watch]);

  // 로펌명 검색 함수
  const searchOfficeNames = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      setExistingOfficeError(false);
      return;
    }

    // 기존 로펌명이 있는 경우(이미 확정된 로펌)는 검색하지 않음
    if (hasExistingOffice) {
      return;
    }

    try {
      const response = await fetchSearchOfficeNm({ office_nm: searchTerm });
      if (response.success && response.data) {
        setSearchResults(response.data);

        // 검색 결과와 정확히 일치하는 경우 체크
        const isExactMatch = response.data.some((result: string) => result.toLowerCase() === searchTerm.toLowerCase());

        if (isPersonalDomain) {
          // 개인 도메인: 드롭다운 표시
          setShowDropdown(true);
          setExistingOfficeError(false);
        } else {
          // 로펌 도메인: 드롭다운 표시하지 않고, 기존 로펌명과 일치하면 에러
          setShowDropdown(false);
          setExistingOfficeError(isExactMatch);
        }
      }
    } catch (error) {
      console.error('로펌명 검색 오류:', error);
      setSearchResults([]);
      setExistingOfficeError(false);
    }
  };

  // 현재 입력값이 검색 결과에 정확히 일치하는지 확인
  const currentOfficeValue = watch('officeNm') || '';
  const isExactMatch = currentOfficeValue && searchResults.some((result) => result.toLowerCase() === currentOfficeValue.toLowerCase());

  // 실시간으로 기존 로펌명 에러 체크 (로펌 도메인인 경우에만)
  const shouldShowExistingOfficeError = !isPersonalDomain && !hasExistingOffice && isExactMatch;

  // 버튼 비활성화 조건을 실시간으로 계산
  const isButtonDisabled = isSubmitting || shouldShowExistingOfficeError || !currentOfficeValue.trim();

  // 직접 추가 옵션을 표시할지 결정 (개인 도메인인 경우에만)
  const shouldShowDirectAdd = isPersonalDomain && currentOfficeValue && currentOfficeValue.length > 0 && !isExactMatch;

  // 검색 결과 선택 핸들러 (개인 도메인인 경우에만 사용)
  const handleSelectOffice = (officeName: string) => {
    if (hasExistingOffice || !isPersonalDomain) return; // 기존 로펌명이 있거나 로펌 도메인이면 선택 불가

    console.log('선택된 로펌명:', officeName);

    // 직접 추가인지 확인 (검색 결과에 없는 경우)
    const isDirectAddition = !searchResults.some((result) => result.toLowerCase() === officeName.toLowerCase());
    setIsDirectAdd(isDirectAddition);
    setExistingOfficeError(false); // 에러 상태 초기화
    setSelectedFromDropdown(true); // 드롭다운에서 선택했음을 표시

    setValue('officeNm', officeName, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
    trigger('officeNm'); // form re-render 강제 실행
    clearErrors('officeNm');
    setShowDropdown(false);
    setSearchResults([]);

    // 값이 제대로 설정되었는지 확인
    setTimeout(() => {
      console.log('설정된 값:', watch('officeNm'));
    }, 100);
  };

  // 회원가입 완료 핸들러
  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const currentOfficeNm = watch('officeNm');

    if (!currentOfficeNm) {
      onMessageToast({ message: '로펌명을 입력해주세요.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // sessionStorage에서 등록 데이터 가져오기
      const sessionData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
      const marketingAgree = localStorage.getItem('marketingConsent');

      console.log('sessionData 전체:', sessionData);
      console.log('registration_source:', sessionData.registration_source);
      console.log('registration_source_other:', sessionData.registration_source_other);
      console.log('birthdate:', sessionData.birthdate);
      console.log('gender:', sessionData.gender);

      if (!sessionData.email || !sessionData.name || !sessionData.password) {
        onMessageToast({ message: '필수 정보가 누락되었습니다. 처음부터 다시 진행해주세요.' });
        return;
      }

      // 개인 도메인 여부에 따라 다른 API 호출
      console.log('개인 도메인 여부:', isPersonalDomain);

      let response;
      let isSuccess = false;

      if (isPersonalDomain) {
        // 개인 도메인: 개인 도메인 API 사용
        // 현재 입력된 로펌명이 검색 결과에 있는지 확인 (기존 로펌인지 판단)
        const isExistingOffice = searchResults.some((result) => result.toLowerCase() === currentOfficeNm.toLowerCase());
        const isDirectlyAddedOffice: boolean = selectedFromDropdown ? isDirectAdd : !isExistingOffice;

        const personalSignupData = {
          email: sessionData.email,
          password: sessionData.password,
          name: sessionData.name,
          phone: sessionData.phone || '',
          marketing_agree: marketingAgree === 'true',
          office_nm: currentOfficeNm,
          is_new_office: isDirectlyAddedOffice, // 신규 로펌 추가 시에만 true
          is_internal: !!sessionData.inHouse, // sessionStorage에서 사내변호사 여부 가져오기
          birthdate: sessionData.birthdate || '',
          gender: sessionData.gender || '',
          registration_source: sessionData.registration_source || '',
          registration_source_other: sessionData.registration_source_other || '',
        };

        console.log('개인 도메인 API 호출: fetchCreateEvidenceUserDomain');
        console.log('개인 도메인 회원가입 요청 데이터:', personalSignupData);
        const domainResponse = await fetchCreateEvidenceUserDomain(personalSignupData);
        console.log('개인 도메인 회원가입 응답:', domainResponse);
        response = domainResponse;
        isSuccess = domainResponse?.success || false;
      } else {
        // 로펌 도메인: 로펌 가입 API 사용 (기존 로펌명 유무와 관계없이)
        const companySignupData = {
          email: sessionData.email,
          password: sessionData.password,
          name: sessionData.name,
          phone: sessionData.phone || '',
          marketing_agree: marketingAgree === 'true',
          office_nm: currentOfficeNm,
          birthdate: sessionData.birthdate || '',
          gender: sessionData.gender || '',
          registration_source: sessionData.registration_source || '',
          registration_source_other: sessionData.registration_source_other || '',
        };

        console.log('로펌 도메인 API 호출: onCreateEvidenceUser');
        console.log('로펌 도메인 회원가입 요청 데이터:', companySignupData);
        console.log('companySignupData.birthdate:', companySignupData.birthdate);
        console.log('companySignupData.gender:', companySignupData.gender);
        const userResponse = await onCreateEvidenceUser(companySignupData);
        console.log('로펌 도메인 회원가입 응답:', userResponse);
        console.log('userResponse:', userResponse);
        console.log('userResponse.isSuccess:', userResponse?.isSuccess);
        response = userResponse;
        isSuccess = userResponse?.isSuccess || false;
      }

      if (isSuccess) {
        // 자동 로그인을 위해 필요한 정보 저장
        sessionStorage.setItem(
          'registrationData',
          JSON.stringify({
            email: sessionData.email,
            password: sessionData.password,
          }),
        );

        onMessageToast({ message: '회원가입이 완료되었습니다.' });

        // 완료 페이지로 이동
        // NOTE: 앱은 accessToken 유무에 따라 RouterProvider가 login/logout 라우터로 스위칭됩니다.
        // 회원가입 직후 라우터가 스위칭되거나 렌더 타이밍 이슈가 있으면 navigate가 "먹히지 않는" 것처럼 보일 수 있어
        // replace + location fallback으로 확실하게 이동시킵니다.
        navigate('/register_complete', { replace: true });
        setTimeout(() => {
          if (window.location.pathname !== '/register_complete') {
            window.location.assign('/register_complete');
          }
        }, 0);
      } else {
        let errorMessage = '회원가입에 실패했습니다.';

        if (isPersonalDomain) {
          // 개인 도메인 API 응답 에러 처리 (TCreateEvidenceUserOutput)
          const domainResponse = response as any; // 타입 단언
          if (domainResponse?.message?.includes('400')) {
            errorMessage = '이미 가입된 사용자입니다.';
          } else {
            errorMessage = domainResponse?.message || '회원가입에 실패했습니다.';
          }
        } else {
          // 로펌 도메인 API 응답 에러 처리 (TMutationOutput)
          if (response?.message?.includes('400')) {
            errorMessage = '이미 가입된 사용자입니다.';
          } else {
            errorMessage = response?.message || '회원가입에 실패했습니다.';
          }
        }

        onMessageToast({ message: errorMessage });
      }
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '회원가입 중 오류가 발생했습니다.';

      if (error.response?.status === 400) {
        onMessageToast({ message: '이미 가입된 사용자입니다.' });
      } else {
        onMessageToast({ message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
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
              <div className='min-w-[340px] lg:min-w-[480px]'>
                <div className='text-[25px] text-[#BEC1C6]'>
                  <strong className='text-[28px] text-[#212121]'>로펌명 등록</strong>
                </div>

                <div className='mb-[32px] pt-[5px] text-[14px] text-[#5B5B5B]'>
                  {hasExistingOffice
                    ? '이메일 인증을 통해 확인된 로펌명입니다.'
                    : isPersonalDomain
                      ? '띄어쓰기를 포함해 로펌명을 정확히 입력해주세요.'
                      : '띄어쓰기를 포함해 로펌명을 정확히 입력해주세요. (기존 로펌명과 중복될 수 없습니다)'}
                </div>
                <Label>
                  <S.LabelText>로펌명</S.LabelText>
                </Label>
                <div className='relative'>
                  <Input
                    id='officeNm'
                    type='text'
                    value={watch('officeNm') || ''}
                    placeholder={isInHouseLawyer ? '소속조직명을 입력해주세요.' : '로펌명을 입력해주세요.'}
                    style={{ height: '48px', marginTop: '8px', borderRadius: '8px' }}
                    className={cn(
                      errors?.officeNm?.message && 'focus-visible:ring-red-500',
                      hasExistingOffice && 'bg-gray-100', // 기존 로펌명이 있으면 회색 배경
                    )}
                    autoComplete='off'
                    readOnly={hasExistingOffice} // 기존 로펌명이 있으면 읽기 전용
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (!hasExistingOffice) {
                        const inputValue = event.target.value;
                        if (inputValue.length > 30) {
                          setValue('officeNm', inputValue.slice(0, 30));
                          return;
                        }
                        setValue('officeNm', inputValue);

                        // 검색 실행
                        searchOfficeNames(inputValue);

                        // 입력 중에는 직접 추가 상태 초기화
                        setIsDirectAdd(false);
                        setSelectedFromDropdown(false); // 입력 중에는 드롭다운에서 선택한 것이 아님
                      }
                    }}
                    onBlur={() => {
                      if (errors?.officeNm?.message) {
                        setValue('officeNm', '');
                      }
                      clearErrors('officeNm');
                      // 드롭다운 닫기 (약간의 지연을 두어 클릭 이벤트가 처리되도록)
                      setTimeout(() => setShowDropdown(false), 100);
                    }}
                  />

                  {/* Hidden input for form validation */}
                  <input type='hidden' {...register('officeNm')} value={watch('officeNm') || ''} />

                  {watch('officeNm') && watch('officeNm')?.length > 0 && !hasExistingOffice && (
                    <button
                      type='button'
                      className='absolute right-6 top-1/2 -translate-y-1/2'
                      onClick={() => {
                        setValue('officeNm', '');
                        setSearchResults([]);
                      }}
                    >
                      <IoIosCloseCircle className='h-5 w-5 text-[#5B5B5B]' />
                    </button>
                  )}

                  {/* 검색 결과 드롭다운 - 개인 도메인인 경우에만 표시 */}
                  {showDropdown && (searchResults.length > 0 || shouldShowDirectAdd) && !hasExistingOffice && isPersonalDomain && (
                    <div className='absolute left-0 right-0 top-full z-10 mt-[10px] max-h-48 overflow-y-auto rounded-[8px] rounded-md border border-gray-200 bg-white shadow-lg'>
                      {/* 직접 추가 옵션 */}
                      {shouldShowDirectAdd && (
                        <div
                          className='flex h-[42px] cursor-pointer items-center border-b border-gray-100 px-4 py-[12px] text-[14px] text-[#1890FF] hover:bg-[#F5F9FB]'
                          onClick={() => handleSelectOffice(currentOfficeValue)}
                        >
                          <IoIosAddCircle className='mr-2 h-4 w-4' />"{currentOfficeValue}" 직접추가
                        </div>
                      )}
                      {/* 검색 결과 목록 */}
                      {searchResults.map((officeName, index) => (
                        <div
                          key={index}
                          className='flex h-[42px] cursor-pointer items-center px-4 py-[12px] text-[14px] hover:bg-[#F5F9FB]'
                          onClick={() => handleSelectOffice(officeName)}
                        >
                          {officeName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors?.officeNm?.message && (
                  <S.ErrorWrapper data-testid='user-id-error'>
                    <S.ErrorIcon />
                    {errors?.officeNm?.message}
                  </S.ErrorWrapper>
                )}
                {shouldShowExistingOfficeError && (
                  <S.ErrorWrapper data-testid='existing-office-error' className='mt-2'>
                    <S.ErrorIcon />
                    이미 사용중인 로펌명입니다.
                  </S.ErrorWrapper>
                )}
                {watch('officeNm') && watch('officeNm').length > 0 && !shouldShowExistingOfficeError && (
                  <div className='mt-2 text-[14px] text-[#1890FF]'>
                    {hasExistingOffice
                      ? `'${watch('officeNm')}' 로펌 소속으로 회원가입이 됩니다.`
                      : isPersonalDomain
                        ? // 개인 도메인: 직접 추가되었거나 검색 결과에 없는 경우 신규로 판단
                          isDirectAdd || (currentOfficeValue && searchResults.length > 0 && !isExactMatch)
                          ? `'${watch('officeNm')}' 신규 로펌으로 회원가입이 됩니다.`
                          : `'${watch('officeNm')}' 로펌 소속으로 회원가입이 됩니다.`
                        : // 로펌 도메인(office_nm 미확정 상태): 항상 신규 로펌
                          `'${watch('officeNm')}' 신규 로펌으로 회원가입이 됩니다.`}
                  </div>
                )}
                <div className='flex'>
                  <button
                    type='button'
                    className={`mt-[32px] h-[40px] w-full rounded-md text-[15px] lg:h-[50px] ${
                      isButtonDisabled ? 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]' : 'bg-[#004AA4] text-white hover:bg-blue-600'
                    }`}
                    onClick={handleNext}
                    disabled={isButtonDisabled}
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center'>
                        <svg className='mr-2 h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        회원가입 중...
                      </span>
                    ) : (
                      '회원가입 완료'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default OfficeNamePage;
