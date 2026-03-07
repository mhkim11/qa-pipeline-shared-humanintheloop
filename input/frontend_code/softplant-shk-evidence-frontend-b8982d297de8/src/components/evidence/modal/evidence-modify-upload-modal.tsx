import { useRef, useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';
// import { IoIosClose, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';

const PdfImg = new URL('/src/assets/images/PDF.svg', import.meta.url).href;
import { useFindUserInfo } from '@query/query';
import { fetchUploadFile, fetchSendEmailNotification } from '@apis/evidence-api';
import CustomSpinner from '@components/common/spiner';
import InfoInputFile from '@components/evidence/input/fileinput';
import ModalSelect from '@/components/common/modal/modal-select';
import { onMessageToast } from '@/components/utils';
interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project_nm?: string;
  client_nm?: string;
  project_id?: string;
  uploadedFiles?: Array<{
    file_nm: string;
    original_file_nm: string;
    file_size: number;
    page_count: number;
    extension: string;
    createdAt: string;
  }>;
}
type TForm = {
  Listfile: File[];
  title: string;
  client: string;
};

export const EvidenceModifyUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  project_nm = '',
  client_nm = '',
  project_id = '',
  uploadedFiles = [],
}: IEvidenceListUploadModalProps) => {
  const { register, handleSubmit, watch, setValue } = useForm<TForm>({
    defaultValues: {
      Listfile: [] as unknown as File[],
      title: project_nm,
      client: client_nm,
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 파일 이름 상태 관리
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedFileErrors, setFailedFileErrors] = useState<Record<string, string>>({});

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 유저정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

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
  // 동적 폰트 크기 조정
  const getAdjustedSize = (baseSize: number) => {
    return baseSize * (1 + fontSizeAdjustment / 100);
  };
  const allowedExtensions = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  const maxFileSize = 500 * 1024 * 1024; // 500MB
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    // 파일 객체 가져오기
    const droppedFiles = event.dataTransfer.files;

    if (!droppedFiles || droppedFiles.length === 0) return;

    // 파일을 처리할 배열
    const filesArray = Array.from(droppedFiles);
    const validFiles: File[] = [];
    const newFileNames: string[] = [];

    // 파일 유효성 확인
    for (const file of filesArray) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // 유효성 검사
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        onMessageToast({
          message: `${file.name}은(는) 지원되지 않는 파일 형식입니다. (지원 형식: PDF, Excel, Word, 이미지 파일)`,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        onMessageToast({
          message: `${file.name}은(는) 크기 제한(500MB)을 초과합니다.`,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        continue;
      }

      validFiles.push(file);
      newFileNames.push(file.name);
    }

    // 기존 파일과 병합
    const existingFiles = watch('Listfile') || [];
    const updatedFiles = [...existingFiles, ...validFiles];
    /*    console.log('최종 파일 수:', updatedFiles.length); */

    if (validFiles.length > 0) {
      // 폼 값 업데이트
      setValue('Listfile', updatedFiles);

      // 파일 이름 상태 업데이트
      setFileNames((prevNames) => {
        const merged = [...prevNames, ...newFileNames];
        /*  console.log('최종 파일명 목록:', merged.length); */
        return merged;
      });

      // 파일 상태 업데이트
      setFileStatuses((prev) => {
        const newStatuses = { ...prev };
        newFileNames.forEach((name) => {
          newStatuses[name] = 'pending';
        });
        return newStatuses;
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const isAnyFileUploading = () => {
    return Object.values(fileStatuses).some((status) => status === 'uploading');
  };
  const handleCloseModal = () => {
    // 파일이 업로드 중인 경우
    if (isAnyFileUploading()) {
      onMessageToast({
        message: '파일 업로드가 진행 중입니다. 완료될 때까지 기다려주세요.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // 제출 중인 경우
    if (isSubmitting) {
      onMessageToast({
        message: '사건 등록이 진행 중입니다. 완료될 때까지 기다려주세요.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    onClose();
  };
  const isUploadComplete = () => {
    // 파일이 없는 경우 업로드할 것이 없으므로 완료 상태로 처리
    if (fileNames.length === 0) return false; // 파일이 없으면 false 반환 (버튼 비활성화)

    // 파일 처리 중인지 확인 (업로드 중인 파일이 있으면 미완료 상태)
    const anyFileStillUploading = Object.values(fileStatuses).some((status) => status === 'uploading');
    if (anyFileStillUploading) return false;

    return true; // 파일이 있고 업로드 중인 파일이 없으면 완료 상태로 처리
  };
  const isUploadable = () => {
    // 파일이 없는 경우 업로드할 수 없음
    if (fileNames.length === 0) return false;

    // 업로드 중인 경우 업로드 불가
    if (isSubmitting) return false;

    // 크기 초과 파일이 있는지 확인
    const files = watch('Listfile') || [];
    const hasSizeExceededFiles = files.some((file: any) => file.sizeExceeded);

    console.log('Files:', files); // 디버깅용
    console.log(
      'Files with exceeded size:',
      files.filter((file: any) => file.sizeExceeded),
    ); // 디버깅용

    return !hasSizeExceededFiles; // 크기 초과 파일이 없으면 업로드 가능
  };
  const isButtonEnabled = () => {
    const isComplete = isUploadComplete();
    const isAble = isUploadable();
    const result = !isSubmitting && isComplete && isAble;

    return result;
  };

  const resetModalState = () => {
    setFileNames([]);
    setFileStatuses({});
    setIsDragging(false);
    setFailedFileErrors({});
    setErrorModalOpen(false);
    setErrorMessage('');

    // 폼 상태 초기화
    setValue('Listfile', []);
    setValue('title', '');
    setValue('client', '');

    // 입력 필드 참조 초기화
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  // 사건 등록 및 파일 업로드
  const onSubmit = async (data: TForm) => {
    setIsSubmitting(true);
    try {
      const uploadFiles = data.Listfile;
      const uploadedFileIds: string[] = [];

      if (!uploadFiles || uploadFiles.length === 0) {
        onMessageToast({
          message: '업로드할 파일이 없습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
        return;
      }

      // 파일 업로드 상태 초기화
      setFileStatuses(() => {
        const newStatuses: Record<string, 'success' | 'failure' | 'uploading' | 'pending'> = {};
        fileNames.forEach((name) => {
          newStatuses[name] = 'uploading';
        });
        return newStatuses;
      });

      // 새로운 실패 파일 추적
      const newFailedFiles: File[] = [];
      const newFailedErrors: Record<string, string> = {};

      // 파일 업로드 수행
      for (const file of uploadFiles) {
        try {
          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'uploading',
          }));

          const uploadResponse = await fetchUploadFile({
            project_id: project_id,
            file: [file],
            file_nm: file.name,
          });

          if (uploadResponse.success) {
            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'success',
            }));
            // 업로드 성공한 파일의 ID 저장
            if (uploadResponse.data?.file_id) {
              uploadedFileIds.push(uploadResponse.data.file_id);
            }
          } else {
            // 실패 정보 저장
            newFailedFiles.push(file);
            const errorMsg = uploadResponse.message || '업로드에 실패했습니다';
            newFailedErrors[file.name] = errorMsg;

            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'failure',
            }));
          }
        } catch (error) {
          // 에러 처리
          newFailedFiles.push(file);
          const errorMsg = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다';
          newFailedErrors[file.name] = errorMsg;

          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'failure',
          }));
        }
      }

      // 실패한 파일이 있는지 확인
      if (newFailedFiles.length > 0) {
        setErrorMessage(`${newFailedFiles.length}개 파일 업로드에 실패했습니다.`);
        setErrorModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // 모든 파일이 성공적으로 업로드되면 이메일 알림 전송
      if (uploadedFileIds.length > 0) {
        try {
          await fetchSendEmailNotification({
            project_id: project_id,
            file_ids: uploadedFileIds,
          });
        } catch (error) {
          console.error('이메일 알림 전송 실패:', error);
        }
      }

      // 모든 파일이 성공적으로 업로드된 경우
      onMessageToast({
        message: '증거문서가 성공적으로 등록되었습니다.',
        icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
      });

      // 모든 상태 초기화
      resetModalState();

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      onMessageToast({
        message: error instanceof Error ? error.message : '오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 기존 업로드된 파일들 상태
  const [existingFiles, setExistingFiles] = useState<
    Array<{ file_nm: string; original_file_nm: string; file_size: number; page_count: number; extension: string; createdAt: string }>
  >([]);

  const GoContact = () => {
    window.open('https://ailex.channel.io', '_blank');
  };
  useEffect(() => {
    // 모달이 열릴 때 항상 초기화
    if (isOpen) {
      resetModalState();
      // props로 받은 사건명과 의뢰인을 필드에 설정
      setValue('title', project_nm);
      setValue('client', client_nm);

      // props로 받은 업로드된 파일들을 설정
      setExistingFiles(uploadedFiles);
    } else {
      resetModalState();
    }
  }, [isOpen, project_nm, client_nm, project_id, uploadedFiles]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative max-h-[95vh] max-w-[500px] overflow-y-auto rounded-[16px] bg-[#fff] p-[32px]'>
        <div className='text-[24px] font-bold'>증거문서 추가</div>
        <div className=''>
          <div className='pt-[24px]'>
            <label
              className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              사건명
            </label>
            <input
              {...register('title')}
              name='title'
              type='text'
              className='mt-2 h-[56px] w-[361px] cursor-not-allowed rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] pl-[16px] text-[14px] font-bold text-[#666] placeholder:font-medium placeholder:text-[#BABABA] focus:outline-none'
              placeholder='사건명을 입력해주세요'
              maxLength={80}
              readOnly
              disabled
            />
          </div>
          <div className='pt-[24px]'>
            <label
              className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              의뢰인
            </label>
            <input
              {...register('client')}
              name='client'
              type='text'
              className='mt-2 h-[56px] w-[361px] cursor-not-allowed rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] pl-[16px] text-[14px] font-bold text-[#666] placeholder:font-medium placeholder:text-[#BABABA] focus:outline-none'
              placeholder='의뢰인을 입력해주세요'
              maxLength={50}
              readOnly
              disabled
            />
          </div>
          <div className='pt-[24px]'>
            <label
              className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              공소장
            </label>
            <div className='flex items-center justify-between'>
              <p className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
                파일을 업로드 해주세요.
              </p>
              <p className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
                예) 공소장.pdf
              </p>
            </div>
          </div>
          <div className=''>
            <div
              className={`mt-2 flex h-[56px] w-[361px] items-center justify-center rounded-lg border border-[#c2c2c2] bg-white ${
                isDragging ? 'bg-gray-200' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
            >
              <div className=''>
                <div className='flex items-center justify-center pt-1 text-center text-[14px] text-[#999]'>
                  <p className='text-[14px] font-medium text-[#8E8E8E]'>파일을 여기에 끌어다 놓기 or</p>
                  <div className='flex items-center justify-center pl-2'>
                    <InfoInputFile
                      inputFileRef={inputFileRef}
                      watch={watch}
                      setValue={setValue}
                      onFileSelect={(newFileNames) => setFileNames(newFileNames)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='pt-[24px]'>
            <label
              className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              증거기록
            </label>
            <div className='flex items-center justify-between'>
              <p className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
                <strong className='text-[#1890FF]'>증거목록</strong>이 포함된 파일을 업로드 해주세요
              </p>
              <p className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
                예) 01권.pdf
              </p>
            </div>
          </div>
          <div className=''>
            <div
              className={`mt-2 flex h-[56px] w-[361px] items-center justify-center rounded-lg border border-[#c2c2c2] bg-white ${
                isDragging ? 'bg-gray-200' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
            >
              <div className=''>
                <div className='flex items-center justify-center pt-1 text-center text-[14px] text-[#999]'>
                  <p className='text-[14px] font-medium text-[#8E8E8E]'>파일을 여기에 끌어다 놓기 or</p>
                  <div className='flex items-center justify-center pl-2'>
                    <InfoInputFile
                      inputFileRef={inputFileRef}
                      watch={watch}
                      setValue={setValue}
                      onFileSelect={(newFileNames) => setFileNames(newFileNames)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 업로드된 파일 갯수와 전체 삭제 버튼 */}
          <div className=''>
            {fileNames.length > 0 && (
              <div className='mt-4 flex w-full items-center justify-between'>
                <div className='w-full text-[14px] text-[#000]'>추가한 파일 {fileNames.length}개</div>
                <div
                  className='flex w-full cursor-pointer items-center justify-end'
                  onClick={() => {
                    setFileNames([]);
                    setValue('Listfile', []);
                    setFileStatuses({}); // 파일 상태도 초기화
                  }}
                >
                  <span className='text-[14px] text-[#000]'>전체 파일 삭제</span>
                </div>
              </div>
            )}
          </div>
          {/* 업로드된 파일 이름 표시 */}
          <div className='pt-[8px]'>
            {fileNames.length > 0 ? (
              fileNames.map((name, index) => {
                // 파일 객체 가져오기
                const fileObj = watch('Listfile')[index];
                // 파일 크기 초과 여부 확인
                const sizeExceeded = fileObj && (fileObj as any).sizeExceeded;

                return (
                  <div key={index} className='mb-1 flex flex-col'>
                    <div
                      className={`flex w-[361px] items-center rounded-[8px] ${
                        sizeExceeded
                          ? 'h-[80px] bg-[#FFF7F7]'
                          : fileStatuses[name] === 'failure'
                            ? 'min-h-[60px] bg-[#FFF7F7]'
                            : 'h-[45px] bg-[#EFFBFF]'
                      } p-1`}
                    >
                      <div className='flex items-center'>
                        <div>
                          <div className='flex min-w-[270px] max-w-[270px] items-center text-[14px] text-[#666]'>
                            <img src={PdfImg} alt='pdf' className='mr-2 h-[25px] w-[25px]' />
                            <p className='max-w-[240px] truncate'>{name || '파일명 없음'}</p>
                          </div>
                          {sizeExceeded && (
                            <div className='ml-2 min-w-[280px] max-w-[280px] whitespace-nowrap text-[14px] font-medium text-[#F5222D]'>
                              등록 가능한 파일 용량을 초과하였습니다 <br />
                              500MB 미만의 파일만 등록할 수 있습니다
                            </div>
                          )}
                          {/* 실패 메시지 표시 */}
                          {fileStatuses[name] === 'failure' && (
                            <div className='ml-2 min-w-[280px] max-w-[280px] text-[12px] font-medium text-[#F5222D]'>
                              {failedFileErrors[name] || '업로드에 실패했습니다'}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className='w-20 pr-2 text-right'>
                        {sizeExceeded ? (
                          <FaExclamationCircle className='text-xl text-red-500' />
                        ) : fileStatuses[name] === 'success' ? (
                          <IoMdCheckmarkCircle className='text-green-500' />
                        ) : fileStatuses[name] === 'failure' ? (
                          <FaExclamationCircle className='text-red-500' />
                        ) : fileStatuses[name] === 'uploading' ? (
                          <CustomSpinner size='sm' />
                        ) : fileStatuses[name] === 'pending' ? (
                          <span className='text-gray-400'></span>
                        ) : null}
                      </span>
                      <div
                        className='mr-2 flex w-20 cursor-pointer items-center justify-end text-[15px] text-[#35363A]'
                        onClick={() => {
                          setFileNames((prev) => prev.filter((_, i) => i !== index));
                          const updatedFiles = watch('Listfile').filter((_: any, i: number) => i !== index);
                          setValue('Listfile', updatedFiles);
                          // 상태에서도 제거
                          setFileStatuses((prev) => {
                            const newStatuses = { ...prev };
                            delete newStatuses[name];
                            return newStatuses;
                          });
                        }}
                      >
                        <IoIosCloseCircle className='text-2xl' />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='text-gray-500'></p>
            )}
          </div>
          {/* 기존 업로드된 파일 목록 */}
          <div className='pt-[24px]'>
            <label
              className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              업로드된 파일 {existingFiles.length}개
            </label>
            <div className='mt-2 max-h-[200px] overflow-y-auto'>
              {existingFiles.length > 0 ? (
                existingFiles.map((file, index) => (
                  <div key={index} className='mb-2 flex items-center rounded-[8px] bg-[#F8F9FA] p-2'>
                    <div className='flex items-center'>
                      <img src={PdfImg} alt='pdf' className='mr-2 h-[20px] w-[20px]' />
                      <div className='flex flex-col'>
                        <p className='text-[14px] text-[#5B5B5B]'>{file.file_nm}</p>
                        {/* <p className='text-[10px] text-[#999]'>
                          {file.page_count}페이지 • {Math.round((file.file_size / 1024 / 1024) * 100) / 100}MB
                        </p> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex items-center justify-center rounded-[8px] bg-[#F8F9FA] p-4'>
                  <p className='text-[12px] text-[#999]'>업로드된 파일이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='mt-[24px] flex items-center justify-between'>
          <p className='text-[14px] text-[#8E8E8E]'>민사사건을 담당하고 계신가요?</p>
          <p className='cursor-pointer text-[14px] font-bold text-[#004AA4] underline' onClick={GoContact}>
            별도 문의
          </p>
        </div>
        <div className='mt-[24px] flex items-center justify-center'>
          <button
            type='button'
            onClick={() => handleSubmit(onSubmit)()}
            disabled={!isButtonEnabled()}
            className={`mt-2 h-[46px] w-[130px] rounded-lg ${
              !isButtonEnabled() ? 'cursor-not-allowed bg-[#F5F5F5] text-[#C2C2C2]' : 'bg-[#4577A4] text-white'
            } `}
          >
            {isSubmitting ? '등록 중...' : '문서 등록'}
          </button>
          <button
            className={`ml-6 mt-2 h-[46px] w-[130px] rounded-lg border border-[#c2c2c2] bg-white px-4 py-1 text-[#252525] ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
      {errorModalOpen && (
        <ModalSelect
          sendMessage='파일 업로드 실패'
          storageMessage={errorMessage}
          handleSave={handleSubmit(onSubmit)}
          setIsModalOpen={() => setErrorModalOpen(false)}
          confirmButtonText='확인'
        />
      )}
    </div>
  );
};
