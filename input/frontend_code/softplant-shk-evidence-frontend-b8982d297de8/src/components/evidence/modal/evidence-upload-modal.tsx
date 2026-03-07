import { useRef, useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';
// import { IoIosClose, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';

const PdfImg = new URL('/src/assets/images/PDF.svg', import.meta.url).href;
import { useFindUserInfo } from '@query/query';
import { fetchUploadFile, fetchSendEmailNotification } from '@apis/evidence-api';
import ModalSelect from '@components/common/modal/modal-select';
import CustomSpinner from '@components/common/spiner';
import InfoInputFile from '@components/evidence/input/evidence-fileinput';
import { onMessageToast } from '@/components/utils';
interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}
type TForm = {
  EvidenceAddFile: File[];
  title: string;
  client: string;
};

export const UploadModal = ({ isOpen, onClose, onSuccess, projectId }: IEvidenceListUploadModalProps) => {
  const { handleSubmit, watch, setValue, reset } = useForm<TForm>({
    defaultValues: {
      EvidenceAddFile: [] as unknown as File[],
      title: '',
      client: '',
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 파일 이름 상태 관리
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [failedFileErrors, setFailedFileErrors] = useState<Record<string, string>>({});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  // 유저정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  // 모든 상태를 초기화하는 함수
  const resetAllState = () => {
    setFileNames([]);
    setFileStatuses({});
    setIsDragging(false);
    setFailedFiles([]);
    setFailedFileErrors({});
    setErrorModalOpen(false);
    setErrorMessage('');
    setRetryCount(0);
    setIsSubmitting(false);

    // 폼 상태 초기화
    reset({
      EvidenceAddFile: [] as unknown as File[],
      title: '',
      client: '',
    });

    // 입력 필드 참조 초기화
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      resetAllState();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const allowedExtensions = ['pdf'];
  const maxFileSize = 500 * 1024 * 1024; // 500MB
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    // 파일 객체 가져오기
    const droppedFiles = event.dataTransfer.files;
    /* console.log('총 드래그된 파일:', droppedFiles.length); */

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
          message: `${file.name}은(는) PDF 파일만 업로드 가능합니다.`,
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
    const existingFiles = watch('EvidenceAddFile') || [];
    const updatedFiles = [...existingFiles, ...validFiles];

    if (validFiles.length > 0) {
      // 폼 값 업데이트
      setValue('EvidenceAddFile', updatedFiles);

      // 파일 이름 상태 업데이트
      setFileNames((prevNames) => {
        const merged = [...prevNames, ...newFileNames];

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

  const handleClose = () => {
    // 파일 업로드 중인지 확인
    const isUploading = Object.values(fileStatuses).some((status) => status === 'uploading');

    // 업로드 중이면 닫기 방지
    if (isSubmitting || isUploading) {
      onMessageToast({
        message: '파일 업로드가 진행 중입니다. 완료 후 닫을 수 있습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // 모든 상태 초기화
    resetAllState();

    // 모달 닫기
    onClose();
  };
  const isUploadComplete = () => {
    // 파일이 없는 경우 업로드할 것이 없으므로 완료 상태로 처리
    if (fileNames.length === 0) return false; // 파일이 없으면 false 반환 (버튼 비활성화)

    // 파일 처리 중인지 확인 (업로드 중인 파일이 있으면 미완료 상태)
    const isAnyFileUploading = Object.values(fileStatuses).some((status) => status === 'uploading');
    if (isAnyFileUploading) return false;

    return true; // 파일이 있고 업로드 중인 파일이 없으면 완료 상태로 처리
  };
  const isUploadable = () => {
    // 파일이 없는 경우 업로드할 수 없음
    if (fileNames.length === 0) return false;

    // 업로드 중인 경우 업로드 불가
    if (isSubmitting) return false;

    // 크기 초과 파일이 있는지 확인
    const files = watch('EvidenceAddFile') || [];
    const hasSizeExceededFiles = files.some((file: any) => file.sizeExceeded);

    return !hasSizeExceededFiles; // 크기 초과 파일이 없으면 업로드 가능
  };
  const isButtonEnabled = () => {
    const isComplete = isUploadComplete();
    const isAble = isUploadable();
    const result = !isSubmitting && isComplete && isAble;

    return result;
  };
  // 사건 등록 및 파일 업로드
  const onSubmit = async (data: TForm) => {
    setIsSubmitting(true);
    try {
      const uploadFiles = data.EvidenceAddFile;
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
        if (failedFiles.length === 0) {
          fileNames.forEach((name) => {
            newStatuses[name] = 'uploading';
          });
        } else {
          failedFiles.forEach((file) => {
            newStatuses[file.name] = 'uploading';
          });
          fileNames.forEach((name) => {
            if (!newStatuses[name]) {
              newStatuses[name] = 'success';
            }
          });
        }
        return newStatuses;
      });

      const filesToUpload = failedFiles.length > 0 ? failedFiles : Array.from(uploadFiles);
      const newFailedFiles: File[] = [];
      const newFailedErrors: Record<string, string> = {};

      // 파일 업로드 수행
      for (const file of filesToUpload) {
        try {
          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'uploading',
          }));

          const uploadResponse = await fetchUploadFile({
            project_id: projectId,
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
            newFailedFiles.push(file);
            const errorMsg = uploadResponse.message || '업로드에 실패했습니다';
            newFailedErrors[file.name] = errorMsg;

            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'failure',
            }));
          }
        } catch (error) {
          newFailedFiles.push(file);
          const errorMsg = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다';
          newFailedErrors[file.name] = errorMsg;

          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'failure',
          }));
        }
      }

      setFailedFiles(newFailedFiles);
      setFailedFileErrors(newFailedErrors);

      if (newFailedFiles.length > 0) {
        setErrorMessage(
          `${newFailedFiles.length}개 파일 업로드에 실패했습니다. ${retryCount === 0 ? '다시 시도해주세요.' : '파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.'}`,
        );
        setErrorModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // 모든 파일이 성공적으로 업로드되면 이메일 알림 전송
      if (uploadedFileIds.length > 0) {
        try {
          await fetchSendEmailNotification({
            project_id: projectId,
            file_ids: uploadedFileIds,
          });
        } catch (error) {
          console.error('이메일 알림 전송 실패:', error);
        }
      }

      onMessageToast({
        message: '증거문서가 성공적으로 등록되었습니다.',
        icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
      });

      resetAllState();
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

  // 재시도 핸들러 추가
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    handleSubmit(onSubmit)();
  };

  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative max-h-[90vh] overflow-y-auto rounded-[16px] bg-[#fff] p-[32px] lg:max-w-[500px]'>
        <div className='text-[24px] font-bold'>증거문서 추가</div>
        <div className=''>
          <div className='pt-[24px]'>
            <label
              className={`block text-[#000] ${getFontSizeClass(14, fontSizeAdjustment)}`}
              style={{ fontSize: `${getAdjustedSize(14)}px` }}
            >
              증거문서
            </label>
            <p className={`text-[#1890FF] ${getFontSizeClass(12, fontSizeAdjustment)}`} style={{ fontSize: `${getAdjustedSize(12)}px` }}>
              PDF형식의 증거문서 원본 파일을 업로드해주세요. (예 001권.pdf)
            </p>
          </div>
          <div className=''>
            <div
              className={`mt-2 flex h-[250px] w-full items-center justify-center rounded-lg border border-[#c2c2c2] bg-white ${
                isDragging ? 'bg-gray-200' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
            >
              <div className='p-[24px]'>
                <div className='flex items-center justify-center'>
                  <IoCloudUploadOutline className='text-[30px] text-[#999]' />
                </div>
                <div className='pt-1 text-center text-[14px] text-[#999]'>
                  파일 또는 폴더를 여기에 끌어다 놓거나,
                  <br />
                  파일 선택 버튼을 눌러 파일을 직접 선택해주세요
                </div>
                <div className='flex w-full items-center justify-center'>
                  <div className='flex w-[80%] items-center justify-center pb-2 pt-1'>
                    <div className='h-0 w-full border border-dashed'></div>
                    <div className='flex w-full justify-center text-[14px] text-[#999]'>or</div>
                    <div className='h-0 w-full border border-dashed'></div>
                  </div>
                </div>
                <div className='flex items-center justify-center'>
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
          {/* 업로드된 파일 갯수와 전체 삭제 버튼 */}
          <div className=''>
            {fileNames.length > 0 && (
              <div className='mt-4 flex w-full items-center justify-between'>
                <div className='w-full text-[14px] text-[#000]'>업로드된 파일 {fileNames.length}개</div>
                <div
                  className='flex w-full cursor-pointer items-center justify-end'
                  onClick={() => {
                    setFileNames([]);
                    setValue('EvidenceAddFile', []);
                    setFileStatuses({});
                    setFailedFiles([]);
                    setFailedFileErrors({});
                    setRetryCount(0);
                    if (inputFileRef.current) {
                      inputFileRef.current.value = '';
                    }
                  }}
                >
                  <span className='text-[14px] text-[#000]'>전체 파일 삭제</span>
                </div>
              </div>
            )}
          </div>
          {/* 업로드된 파일 이름 표시 */}
          <div className='mt-[24px]'>
            {fileNames.length > 0 ? (
              fileNames.map((name, index) => {
                // 파일 객체 가져오기
                const fileObj = watch('EvidenceAddFile')[index];
                // 파일 크기 초과 여부 확인
                const sizeExceeded = fileObj && (fileObj as any).sizeExceeded;

                return (
                  <div key={index} className='mb-1 flex flex-col'>
                    <div
                      className={`flex w-[361px] items-center rounded-[8px] ${sizeExceeded ? 'h-[80px] bg-[#FFF7F7]' : 'h-[45px] bg-[#EFFBFF]'} p-1`}
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
                          const updatedFiles = watch('EvidenceAddFile').filter((_: any, i: number) => i !== index);
                          setValue('EvidenceAddFile', updatedFiles);
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
        </div>
        <div className='mt-[24px] border-b border-[#E5E5E5]'></div>
        <div className='mt-[24px] flex items-center justify-center'>
          <button
            type='button'
            onClick={() => handleSubmit(onSubmit)()}
            disabled={!isButtonEnabled()}
            className={`mt-2 h-[46px] w-[130px] rounded-lg ${
              !isButtonEnabled() ? 'cursor-not-allowed bg-[#F5F5F5] text-[#999]' : 'bg-[#4577A4] text-white'
            } `}
          >
            {isSubmitting ? '등록 중...' : '문서 등록'}
          </button>
          <button
            className={`ml-6 mt-2 h-[46px] w-[130px] rounded-lg border border-[#c2c2c2] bg-white px-4 py-1 text-[#252525] ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={isSubmitting ? undefined : handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
        {errorModalOpen && (
          <ModalSelect
            sendMessage='파일 업로드 실패'
            storageMessage={errorMessage}
            handleSave={retryCount === 0 ? handleRetry : () => setErrorModalOpen(false)}
            setIsModalOpen={() => {
              setErrorModalOpen(false);
              if (retryCount > 0) {
                // 재시도 후 실패한 경우 모든 상태 초기화
                resetAllState();
              }
            }}
            confirmButtonText={retryCount === 0 ? '재시도' : '확인'}
          />
        )}
      </div>
    </div>
  );
};
