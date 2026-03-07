import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { LoginSidebar } from '@/components/common/sidebar/login-sidebar';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { onMessageToast } from '@/components/utils/global-utils';
import { loginPageStyle as S } from '@/shared/styled';

type TOption = {
  value: string;
  placeholder: string;
};

const readRegistrationData = (): Record<string, any> => {
  try {
    return JSON.parse(sessionStorage.getItem('registrationData') || '{}');
  } catch {
    return {};
  }
};

const writeRegistrationData = (patch: Record<string, any>) => {
  const prev = readRegistrationData();
  sessionStorage.setItem('registrationData', JSON.stringify({ ...prev, ...patch }));
};

/**
 * * 유입경로 페이지
 * @returns {JSX.Element} 유입경로 페이지 컴포넌트
 */
const RegisterMarketingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const initial = useMemo(() => readRegistrationData(), []);

  const OPTIONS = useMemo<TOption[]>(
    () => [
      { value: '법률신문', placeholder: '법률신문의 담당자분 성함을 입력해주세요.' },
      { value: '지인 추천', placeholder: '추천해 주신 분의 성함이나 이메일을 입력해주세요.' },
      { value: '소셜 미디어', placeholder: '소셜 미디어 이름과 인플루언서 이름을 입력해주세요.' },
      { value: '검색 엔진', placeholder: '구글, 네이버 검색엔진 이름과 검색어를 입력해주세요' },
      { value: '온라인 광고', placeholder: '온라인 플랫폼 이름을 입력해주세요' },
      { value: '오프라인 행사', placeholder: '오프라인 행사 이름을 입력해주세요' },
      { value: '기타', placeholder: '어떻게 알게 되었는지 자유롭게 입력해주세요' },
    ],
    [],
  );

  const [registrationSource, setRegistrationSource] = useState<string>(() => initial.registration_source || '');
  const [registrationSourceOther, setRegistrationSourceOther] = useState<string>(() => initial.registration_source_other || '');

  const selectedOption = useMemo(() => OPTIONS.find((o) => o.value === registrationSource) ?? null, [OPTIONS, registrationSource]);

  const onClickPrev = () => navigate('/register_pw');

  const onClickConfirm = () => {
    if (!registrationSource) {
      onMessageToast({ message: '유입 경로를 선택해주세요.' });
      return;
    }
    console.log('[register] registration_source:', registrationSource);
    console.log('[register] registration_source_other:', registrationSourceOther);
    console.log('[register] sessionStorage.registrationData(before navigate):', readRegistrationData());
    writeRegistrationData({
      registration_source: registrationSource,
      registration_source_other: registrationSourceOther || '',
    });
    console.log('[register] sessionStorage.registrationData(after write):', readRegistrationData());
    navigate('/register_office');
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
                  <strong className='text-[28px] text-[#212121]'>AiLex 서비스 유입 경로</strong>
                </div>
                <div className='pt-[10px] text-[14px] text-[#5B5B5B]'>AiLex 서비스를 어떻게 알게 되었는지 선택해주세요.</div>

                <S.FormWrapper>
                  <S.LabelWrapper>
                    <S.LabelBox>
                      <Label htmlFor='registration_source' className='mt-[32px] flex items-center gap-x-2'>
                        <S.LabelText>AiLex 서비스 유입 경로</S.LabelText>
                      </Label>
                    </S.LabelBox>
                    <div className='mt-[8px]'>
                      <Select
                        value={registrationSource}
                        onValueChange={(value) => {
                          setRegistrationSource(value);
                          setRegistrationSourceOther('');
                          writeRegistrationData({ registration_source: value, registration_source_other: '' });
                          console.log('[register] selected registration_source:', value);
                          console.log('[register] sessionStorage.registrationData(after select):', readRegistrationData());
                        }}
                      >
                        <SelectTrigger id='registration_source'>
                          <SelectValue placeholder='선택' />
                        </SelectTrigger>
                        <SelectContent>
                          {OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </S.LabelWrapper>
                </S.FormWrapper>

                {selectedOption ? (
                  <div className='mt-[16px]'>
                    <Input
                      id='registration_source_other'
                      value={registrationSourceOther}
                      onChange={(e) => {
                        setRegistrationSourceOther(e.target.value);
                        writeRegistrationData({ registration_source_other: e.target.value });
                        console.log('[register] updated registration_source_other:', e.target.value);
                        console.log('[register] sessionStorage.registrationData(after typing):', readRegistrationData());
                      }}
                      placeholder={selectedOption.placeholder}
                      style={{ height: '48px', marginTop: '8px', borderRadius: '8px' }}
                    />
                  </div>
                ) : null}

                <button
                  type='button'
                  className={`mt-[24px] h-[50px] w-full rounded-md text-[15px] ${
                    !registrationSource ? 'cursor-not-allowed bg-[#F3F3F3] text-[#BABABA]' : 'bg-[#004AA4] text-white hover:bg-blue-600'
                  }`}
                  onClick={onClickConfirm}
                  disabled={!registrationSource}
                >
                  확인
                </button>
                <button
                  type='button'
                  className='mt-[12px] h-[50px] w-full rounded-md border border-[#E4E4E7] bg-white text-[15px] text-[#212121] hover:bg-[#F4F4F5]'
                  onClick={onClickPrev}
                >
                  이전
                </button>
              </div>
            </div>
          </div>
        </S.FormTotalWrapper>
      </S.Container>
    </S.SContainer>
  );
};

export default RegisterMarketingPage;
