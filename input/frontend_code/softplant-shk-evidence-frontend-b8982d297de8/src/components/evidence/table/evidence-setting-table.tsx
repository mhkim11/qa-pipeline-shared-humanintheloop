import { useEffect, useState, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import { useForm } from 'react-hook-form';
import { IoIosCamera, IoIosArrowForward } from 'react-icons/io';

import { useFindUserInfo } from '@query/query';
import { fetchUpdateUserPhoto } from '@apis/evidence-api';
import { JoinFormSchema } from '@apis/schema';
// import { CTALine } from '@components/common';
import { LawyerVerificationModal } from '@/components/evidence/modal/lawyer-verification-modal';
import { SettingResetPwModal } from '@/components/evidence/modal/setting-reset-pw-modal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';
import { useUpdateUserInfo, useInitUserPhoto } from '@/hooks/react-query/mutation';
// import { useLoginStore } from '@/hooks/stores';
interface ISettingTableProps {
  fontSizeAdjustment?: number;
}
type TForm = {
  password: string;
  Repassword: string;
};

export const SettingTableInner = ({ fontSizeAdjustment = 0 }: ISettingTableProps): JSX.Element => {
  console.log(Check);

  // 프로필 이미지
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [thumnail, setThumnail] = useState<string>('');
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // 직급
  const [position, setPosition] = useState<string>('');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [isCustomPosition, setIsCustomPosition] = useState<boolean>(false);
  // 이름
  const [nickname, setNickname] = useState<string>('');
  // 컬러
  const [userColor, setUserColor] = useState<string>('');
  // 주소
  const { onUpdateUserInfo, isPending } = useUpdateUserInfo();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  // 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  const [fontSizeRate, setFontSizeRate] = useState<string>('0');
  const [evidenceDisplayCount, setEvidenceDisplayCount] = useState<string>('50');

  // 비밀번호 재설정
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  // 변호사 인증 모달
  const [isLawyerVerificationModalOpen, setIsLawyerVerificationModalOpen] = useState<boolean>(false);
  const [verificationFailureMessage, setVerificationFailureMessage] = useState<string>('');

  // const { login, dispatchLogin } = useLoginStore();
  console.log('isUploading', isUploading);
  const { watch } = useForm<TForm>({
    resolver: zodResolver(JoinFormSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      Repassword: '',
    },
  });

  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };

  // 폰트 크기 조정 옵션
  const fontSizeClasses = {
    18: ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    16: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    14: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    12: ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  } as const;

  //  폰크크기 조정 클래스 선택
  const getFontSizeClass = (baseSize: keyof typeof fontSizeClasses, adjustment: number) => {
    const steps = [-30, -20, -10, 0, 10, 20, 30];
    const index = steps.indexOf(adjustment);
    return fontSizeClasses[baseSize][index !== -1 ? index : 3]; // 기본값(0%)은 index 3
  };
  // 유저정보 가져오기
  const { response: findEvidenceUserInfo, refetch } = useFindUserInfo();

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setAddress(fullAddress);
    setIsAddressModalOpen(false);
  };

  // 기본 직급 옵션 목록
  const defaultPositions = ['Associate', 'partner', 'ceo'];

  // ! 이미지 초기화 api
  const { onInitUserPhoto } = useInitUserPhoto();

  // 사용자 정보가 로드되면 직급 상태 설정
  useEffect(() => {
    if (findEvidenceUserInfo?.data) {
      const userPosition = findEvidenceUserInfo.data.position || '';

      // 기본 직급 옵션에 없는 경우 커스텀 직급으로 처리
      if (!defaultPositions.includes(userPosition) && userPosition) {
        setIsCustomPosition(true);
        setCustomPosition(userPosition);
        setPosition(userPosition);
      } else {
        setIsCustomPosition(false);
        setPosition(userPosition);
        setCustomPosition('');
      }
    }
  }, [findEvidenceUserInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 미리보기 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      setIsUploading(true);
      const response = await fetchUpdateUserPhoto({ file });

      if (response.success) {
        setThumnail(response.data.thumbnail);
      } else {
        console.log('이미지 업로드 실패:', response.message);
        setPreviewImage(null); // 실패시 미리보기 제거
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
      setPreviewImage(null); // 실패시 미리보기 제거
      onMessageToast({
        message: '이미지 업로드에 실패했습니다.',
      });
    } finally {
      setIsUploading(false);
      setIsImageMenuOpen(false);
    }
  };

  // 사용자 컬러 팔레트
  const colorPalette = {
    green: '#406CFF',
    brown: '#B6753F',
    orange: '#FF6B1B',
    yellow: '#F3AA00',
    lightgreen: '#3BBC07',
    darkgreen: '#799C19',
    skyblue: '#43A5FF',
    purple: '#AC58FF',
    pink: '#E739D5',
  };
  // 직급 선택 핸들러
  const handlePositionChange = (value: string) => {
    if (value === 'self') {
      setIsCustomPosition(true);
      setPosition('');
    } else {
      setIsCustomPosition(false);
      setPosition(value);
      setCustomPosition('');
    }
  };

  // 직접 입력 핸들러
  const handleCustomPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPosition(e.target.value);
    setPosition(e.target.value);
  };

  // 초기 데이터 설정
  useEffect(() => {
    if (findEvidenceUserInfo?.data) {
      setPosition(findEvidenceUserInfo.data.position || '');
      setNickname(findEvidenceUserInfo.data.nickname || '');
      if (!userColor) {
        setUserColor(findEvidenceUserInfo.data.user_color || '');
      }
      setAddress(findEvidenceUserInfo.data.addr || '');
      setDetailAddress(findEvidenceUserInfo.data.addr_detail || '');
      setThumnail(findEvidenceUserInfo.data.thumbnail_url || '');

      // font_size_rate 설정 시 fontSizeAdjustment도 같이 설정
      const fontRate = findEvidenceUserInfo.data.font_size_rate || 0;
      setFontSizeRate(fontRate.toString());

      setEvidenceDisplayCount(findEvidenceUserInfo.data.evi_display_cnt?.toString() || '50');
    }
  }, [findEvidenceUserInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ! 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    try {
      // 이미지 관련 로직 수정
      let thumbnailToUse = thumnail;

      // Case 1: 의도적인 이미지 초기화
      if (previewImage === null && thumnail === '' && findEvidenceUserInfo?.data?.thumbnail_url) {
        const resetResult = await onInitUserPhoto();
        if (!resetResult?.isSuccess) {
          onMessageToast({
            message: '프로필 이미지 초기화에 실패했습니다.',
          });
          return;
        }
        thumbnailToUse = ''; // 초기화 성공 시에만 빈 문자열로 설정
      }
      // Case 2: 새 이미지 업로드가 없고 기존 이미지 유지하는 경우
      else if (findEvidenceUserInfo?.data?.thumbnail_url && !previewImage) {
        thumbnailToUse = findEvidenceUserInfo.data.thumbnail_url;
      }
      // Case 3: 새 이미지가 업로드된 경우
      else if (thumnail) {
        thumbnailToUse = thumnail;
      }

      console.log('Saving with thumbnail:', thumbnailToUse); // 디버깅용

      // 사용자 정보 업데이트
      const updateData: any = {
        position: isCustomPosition ? customPosition : position,
        nickname,
        thumbnail: thumbnailToUse,
        user_color: userColor,
        font_size_rate: parseInt(fontSizeRate),
        evi_display_cnt: parseInt(evidenceDisplayCount),
        addr: address,
        addr_detail: detailAddress,

        licenseNumber: String(findEvidenceUserInfo?.data?.licenseNumber ?? ''),
        issueNumber: String(findEvidenceUserInfo?.data?.issueNumber ?? ''),
      };

      // 인증 상태는 "저장"만 눌러도 현재 상태를 유지해야 한다.
      const currentCertifyStatus = String(findEvidenceUserInfo?.data?.certify_status ?? '').trim();
      if (currentCertifyStatus) updateData.certify_status = currentCertifyStatus;

      // thumbnail이 있는 경우에만 포함
      if (thumbnailToUse !== undefined) {
        updateData.thumbnail = thumbnailToUse;
      }

      // NOTE: 이 화면은 인증 필드를 변경하지 않는다. 인증 상태는 항상 현재 값을 유지한다.

      const result = await onUpdateUserInfo(updateData);

      if (result?.isSuccess) {
        onMessageToast({
          message: '저장되었습니다.',
        });
      } else {
        onMessageToast({
          message: '저장에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      onMessageToast({
        message: '저장 중 오류가 발생했습니다.',
      });
    }
  };

  // ! 이미지 초기화
  const handleResetImage = async () => {
    setIsImageMenuOpen(false);
    setPreviewImage(null);
    setThumnail('');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  console.log(watch());
  return (
    <div className='flex w-full justify-center overflow-auto pt-[100px]'>
      <div className='flex w-full justify-center overflow-auto'>
        <div className='max-w-[440px]'>
          <div className=''>
            <h1 className='text-[24px] font-bold'>사용자 정보</h1>
            <p className={`text-[#A4B2BD] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
              가입일시 : {findEvidenceUserInfo?.data?.createdAt ? formatDateTime(findEvidenceUserInfo?.data?.createdAt) : ''}
            </p>
          </div>

          {/* 프로필 이미지 */}
          <div className='mt-[24px] flex items-center justify-center'>
            <div className='relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#DFEAEF]'>
              {previewImage ? (
                <div className='relative h-[88px] w-[88px]'>
                  <img src={previewImage} alt='프로필 이미지' className='h-full w-full rounded-full object-cover' />
                  <div
                    className='absolute top-0 h-[88px] w-[88px] rounded-full border-3'
                    style={{ borderColor: findEvidenceUserInfo?.data?.user_color as keyof typeof colorPalette }}
                  ></div>
                </div>
              ) : thumnail ? (
                // thumnail이 있을 때만 이미지 표시
                <div className='relative h-[88px] w-[88px]'>
                  <img src={thumnail} alt='프로필 이미지' className='h-full w-full rounded-full object-cover' />
                  <div
                    className='absolute top-0 h-[88px] w-[88px] rounded-full border-3'
                    style={{ borderColor: findEvidenceUserInfo?.data?.user_color as keyof typeof colorPalette }}
                  ></div>
                </div>
              ) : (
                // 기본 이미지 (이니셜)
                <div
                  className='flex h-full w-full items-center justify-center rounded-full text-[#fff]'
                  style={{
                    backgroundColor: findEvidenceUserInfo?.data?.user_color
                      ? colorPalette[findEvidenceUserInfo?.data?.user_color as keyof typeof colorPalette]
                      : '#DFEAEF',
                  }}
                >
                  <span className='text-[24px] font-bold'>
                    {' '}
                    {
                      findEvidenceUserInfo?.data?.nickname
                        ? findEvidenceUserInfo.data.nickname.charAt(0) // 닉네임 있으면 첫번째 글자
                        : findEvidenceUserInfo?.data?.name?.slice(1, 2) || '' // 닉네임 없으면 이름의 두번째 글자
                    }
                  </span>
                </div>
              )}
              <Popover open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
                <PopoverTrigger asChild>
                  <div className='absolute bottom-0 right-0 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-white'>
                    <IoIosCamera className='cursor-pointer text-[30px]' />
                  </div>
                </PopoverTrigger>
                <PopoverContent className='absolute right-[-150px] top-[-10px] w-48 p-0' align='end'>
                  <div className='flex flex-col'>
                    <button
                      className='flex items-center px-4 py-4 hover:bg-gray-100'
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsImageMenuOpen(false);
                      }}
                    >
                      <span>다른 사진으로 변경하기</span>
                    </button>
                    <button
                      className='flex items-center px-4 py-4 hover:bg-gray-100'
                      onClick={() => {
                        handleResetImage();
                        setIsImageMenuOpen(false);
                      }}
                    >
                      <span>기본 이미지로 변경하기</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <input type='file' ref={fileInputRef} className='hidden' accept='image/*' onChange={handleImageChange} />
            </div>
          </div>

          {/* 사용자 필드 */}
          <div className='flex flex-col'>
            <label
              className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(16)}px` }}
            >
              이름
            </label>
            <input
              type='text'
              className={`mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] bg-[#F5F5F5] text-[#B3BEC8] ${getFontSizeClass(16, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(16)}px` }}
              value={findEvidenceUserInfo?.data?.name}
              disabled
            />
            <div className='mt-[24px]'>
              <div className='flex items-center'>
                <label
                  className={`flex text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  이메일(아이디)
                </label>
                <span className='ml-2 inline-block h-[5px] w-[5px] rounded-full bg-[#FF0000]' />
              </div>

              <input
                type='text'
                value={findEvidenceUserInfo?.data?.email}
                disabled
                className={`mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] text-[#B3BEC8] focus:ring-1 focus:ring-[#0050B3] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              />
            </div>
          </div>

          <div className='mt-[24px] flex min-h-[19px] w-full items-center'>
            <div className='flex w-full items-center'>
              <label
                className={`text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                비밀번호
              </label>
              <span className='ml-2 inline-block h-[5px] w-[5px] rounded-full bg-[#FF0000]' />
            </div>
            <div className='flex w-full cursor-pointer items-center justify-end' onClick={() => setIsPasswordModalOpen(true)}>
              <p
                className={`text-[#6A6A6A] underline ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                비밀번호 재설정
              </p>
              <IoIosArrowForward />
            </div>
          </div>
          <div className='mt-[64px]'>
            <h1 className='text-[24px] font-bold'>변호사 인증</h1>
            {findEvidenceUserInfo?.data?.certify_status === '인증완료' ? (
              <>
                <h3 className='mt-[6px] text-[14px] text-[#8E8E8E]'>변호사 인증 절차가 정상적으로 완료되었습니다.</h3>
                <div className='mt-[24px]'>
                  <label className='mb-[8px] text-[14px] font-medium text-[#5B5B5B]'>인증 정보</label>
                  <div className='flex h-[56px] w-full items-center rounded-[8px] border border-[#E5E5E5] bg-[#F7F8F8] px-[16px]'>
                    <span className='pr-2 text-[16px] text-[#BABABA]'>등록번호</span>
                    <span className='text-[16px] text-[#BABABA]'>{findEvidenceUserInfo?.data?.licenseNumber || '-'}</span>
                    <span className='pl-2 pr-2 text-[16px] text-[#BABABA]'>·</span>
                    <span className='pr-2 text-[16px] text-[#BABABA]'>발급번호</span>
                    <span className='text-[16px] text-[#BABABA]'>{findEvidenceUserInfo?.data?.issueNumber || '-'}</span>
                  </div>
                </div>
              </>
            ) : findEvidenceUserInfo?.data?.certify_status === '대기' || findEvidenceUserInfo?.data?.certify_status === '인증대기' ? (
              <>
                <h3 className='mt-[6px] text-[14px] text-[#8E8E8E]'>인증을 진행중입니다. 최대 며칠이 소요될 수 있습니다.</h3>
                <div className='mt-[24px] flex'>
                  <div
                    className='flex h-[48px] w-full flex-col items-center justify-center rounded-[8px] border border-[#F3F3F3] px-4 py-3'
                    style={{
                      display: 'flex',
                      height: '48px',
                      padding: '12px 16px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'stretch',
                      borderRadius: '8px',
                      border: '1px solid #F3F3F3',
                    }}
                  >
                    <span className='text-[16px] font-medium text-[#BABABA]'>인증 대기중</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {findEvidenceUserInfo?.data?.certify_status === '인증실패' || findEvidenceUserInfo?.data?.certify_status === '실패' ? (
                  <h3
                    className='mt-[6px]'
                    style={{
                      color: '#F5222D',
                      fontFamily: 'Pretendard',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '20px',
                    }}
                  >
                    변호사 인증이 실패하였습니다. 다시 인증해주세요.
                  </h3>
                ) : verificationFailureMessage ? (
                  <h3 className='mt-[6px] text-[14px] text-[#FF0000]'>{verificationFailureMessage}</h3>
                ) : (
                  <h3 className='mt-[6px] text-[14px] text-[#8E8E8E]'>서비스 이용을 위해 변호사 인증을 먼저 진행해 주세요.</h3>
                )}
                <div className='mt-[24px] flex'>
                  <button
                    onClick={() => {
                      setVerificationFailureMessage(''); // 버튼 클릭 시 실패 메시지 초기화
                      setIsLawyerVerificationModalOpen(true);
                    }}
                    className='h-[48px] w-full rounded-[8px] border border-[#004AA4] text-[16px] font-medium text-[#004AA4] hover:bg-[#004AA4] hover:text-white'
                  >
                    변호사 정보 입력하기
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 회사 정보 */}
          <div className='mt-[60px]'>
            <h1 className='text-[24px] font-bold'>회사 정보</h1>
            <div className='flex flex-col'>
              <label
                className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                소속로펌
              </label>
              <input
                type='text'
                className={`mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] bg-[#F5F5F5] text-[#B3BEC8] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
                value={findEvidenceUserInfo?.data?.office_nm}
                disabled
              />
              <label
                className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                직급
              </label>
              <Select value={isCustomPosition ? 'self' : position} onValueChange={handlePositionChange}>
                <SelectTrigger className='mt-[8px] h-[56px] w-[360px] font-bold focus:ring-2 focus:ring-[#0050B3] [&>svg]:h-6 [&>svg]:w-6'>
                  <SelectValue placeholder='직급선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Associate'>Associate</SelectItem>
                  <SelectItem value='partner'>파트너</SelectItem>
                  <SelectItem value='ceo'>대표</SelectItem>
                  <SelectItem value='self'>직접입력</SelectItem>
                </SelectContent>
              </Select>
              {/* 직접 입력 필드 */}
              {isCustomPosition && (
                <input
                  type='text'
                  className='mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2]'
                  value={customPosition}
                  onChange={handleCustomPositionChange}
                  placeholder='직급을 입력해주세요'
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  maxLength={10}
                />
              )}
              <label
                className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
              >
                로펌주소
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className={`mt-[8px h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] bg-[#F5F5F5] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  value={address || findEvidenceUserInfo?.data?.addr || ''}
                />
                <div
                  onClick={() => setIsAddressModalOpen(true)}
                  className={`absolute right-2 top-[50%] flex h-[40px] w-[84px] -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-[8px] border bg-white ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  주소검색
                </div>
              </div>

              <input
                type='text'
                className={`mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] focus:ring-1 focus:ring-[#0050B3] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                style={{ fontSize: `${getAdjustedSize(16)}px` }}
                placeholder='상세주소를 입력해주세요'
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className='mt-[60px]'>
              <h1 className='text-[24px] font-bold'>개인설정</h1>
              <div className='flex flex-col'>
                <label
                  className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  닉네임
                </label>
                <input
                  type='text'
                  className={`mt-[8px] h-[56px] w-[360px] rounded-[8px] border-[#C2C2C2] placeholder:text-[16px] placeholder:text-[#B3BEC8] focus:ring-1 focus:ring-[#0050B3] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  value={nickname}
                  placeholder='‘고변’을 입력 시, 프로필 아이콘에 ‘고’로 표기됩니다'
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={10}
                />
                <label
                  className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  사용자 컬러
                </label>
                <Select value={userColor} onValueChange={setUserColor}>
                  <SelectTrigger className='mt-[8px] h-[56px] w-[360px] focus:ring-2 focus:ring-[#0050B3] [&>svg]:h-6 [&>svg]:w-6'>
                    <SelectValue placeholder='사용자 컬러 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='blue'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#406CFF]'></div>
                        {userColor === 'blue' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='brown'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#B6753F]'></div>
                        {userColor === 'brown' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='orange'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#FF6B1B]'></div>
                        {userColor === 'orange' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='yellow'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#FFB200]'></div>
                        {userColor === 'yellow' && <span className=''>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='lightgreen'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#42CC0C]'></div>
                        {userColor === 'lightgreen' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='darkgreen'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#799C19]'></div>
                        {userColor === 'darkgreen' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='skyblue'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#43A5FF]'></div>
                        {userColor === 'skyblue' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='purple'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#AC58FF]'></div>
                        {userColor === 'purple' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                    <SelectItem value='pink'>
                      <div className='flex w-full items-center justify-between'>
                        <div className='mr-3 h-[24px] w-[24px] rounded-full bg-[#E739D5]'></div>
                        {userColor === 'pink' && <span>현재 선택 컬러</span>}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <label
                  className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  증거목록 화면당 표시 개수
                </label>
                <Select value={evidenceDisplayCount} onValueChange={setEvidenceDisplayCount}>
                  <SelectTrigger
                    className={`mt-[8px] h-[56px] w-[360px] focus:ring-2 focus:ring-[#0050B3] [&>svg]:h-6 [&>svg]:w-6 ${getFontSizeClass(16, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  >
                    <SelectValue placeholder='증거목록 개수 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='50'>50개</SelectItem>
                    <SelectItem value='100'>100개</SelectItem>
                    <SelectItem value='150'>150개</SelectItem>
                    <SelectItem value='200'>200개</SelectItem>
                  </SelectContent>
                </Select>
                <label
                  className={`mt-[24px] text-[#6A6A6A] ${getFontSizeClass(16, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(16)}px` }}
                >
                  폰트크기
                </label>
                <Select value={fontSizeRate} onValueChange={setFontSizeRate}>
                  <SelectTrigger
                    className={`mt-[8px] h-[56px] w-[360px] focus:ring-2 focus:ring-[#0050B3] [&>svg]:h-6 [&>svg]:w-6 ${getFontSizeClass(16, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(16)}px` }}
                  >
                    <SelectValue placeholder='폰트크기 옵션 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='30'>브라우저보다 30% 크게</SelectItem>
                    <SelectItem value='20'>브라우저보다 20% 크게</SelectItem>
                    <SelectItem value='10'>브라우저보다 10% 크게</SelectItem>
                    <SelectItem value='0'>브라우저와 동일</SelectItem>
                    <SelectItem value='-10'>브라우저보다 10% 작게</SelectItem>
                    <SelectItem value='-20'>브라우저보다 20% 작게</SelectItem>
                    <SelectItem value='-30'>브라우저보다 30% 작게</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='mb-20 mt-[60px] flex justify-center'>
                <button className='h-[56px] w-[360px] rounded-[8px] bg-[#323232] text-white' onClick={handleSave} disabled={isPending}>
                  {isPending ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className='relative max-w-[600px] rounded p-5'>
            <DaumPostcode onComplete={handleComplete} autoClose={true} style={{ height: 450 }} />
          </DialogContent>
        </Dialog>
        {isPasswordModalOpen && <SettingResetPwModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />}
        <LawyerVerificationModal
          isOpen={isLawyerVerificationModalOpen}
          onClose={() => setIsLawyerVerificationModalOpen(false)}
          onVerificationSuccess={() => {
            setVerificationFailureMessage(''); // 실패 메시지 초기화
            refetch(); // 유저 정보 다시 가져오기
          }}
          onVerificationFailure={(message) => {
            setVerificationFailureMessage(message); // 실패 메시지 설정
          }}
        />
      </div>
    </div>
  );
};
export const SettingTable = (): JSX.Element => {
  return <SettingTableInner />;
};
