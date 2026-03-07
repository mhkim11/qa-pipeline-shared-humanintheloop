import { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';

import { fetchAddEvidenceOriginal } from '@apis/evidence-admin-api';
import CustomSpinner from '@components/common/spiner';
import InfoInputFile from '@components/evidence/admin/input/original-input';
import { onMessageToast } from '@/components/utils';
interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  officeId: string;
}
type TForm = {
  originalfile: File[];
  title: string;
  client: string;
};

export const OriginalUploadModal = ({ isOpen, onClose, onSuccess, projectId, officeId }: IEvidenceListUploadModalProps) => {
  const { handleSubmit, watch, setValue, reset } = useForm<TForm>({
    defaultValues: {
      originalfile: [] as unknown as File[],
      title: '',
      client: '',
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);
  // console.log('🚀 projectId', projectId);
  // console.log('🚀 officeId', officeId);
  // 파일 이름 상태 관리
  const [originalFileNames, setOriginalFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const allowedExtensions = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  const maxFileSize = 500 * 1024 * 1024; // 500MB
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    // 파일 객체 가져오기
    const droppedFiles = event.dataTransfer.files;
    // console.log('총 드래그된 파일:', droppedFiles.length);

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
        // console.log(`${file.name}: 확장자 문제로 제외됨`);
        onMessageToast({
          message: `${file.name}은(는) 지원되지 않는 파일 형식입니다. (지원 형식: PDF, Excel, Word, 이미지 파일)`,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        // console.log(`${file.name}: 크기 문제로 제외됨 (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
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
    const existingFiles = watch('originalfile') || [];
    const updatedFiles = [...existingFiles, ...validFiles];
    /*  console.log('최종 파일 수:', updatedFiles.length); */

    if (validFiles.length > 0) {
      // 폼 값 업데이트
      setValue('originalfile', updatedFiles);

      // 파일 이름 상태 업데이트
      setOriginalFileNames((prevNames) => {
        const merged = [...prevNames, ...newFileNames];
        // console.log('최종 파일명 목록:', merged.length);
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

    // 파일 상태 초기화
    setOriginalFileNames([]);
    setFileStatuses({});
    setIsDragging(false);
    // 폼 상태 초기화
    reset({
      originalfile: [] as unknown as File[],
      title: '',
      client: '',
    });
    // 입력 필드 참조 초기화
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
    // 모달 닫기
    onClose();
  };

  const onSubmit = async (data: TForm) => {
    setIsSubmitting(true);
    try {
      const uploadFiles = data.originalfile;

      if (!uploadFiles || uploadFiles.length === 0) {
        onMessageToast({
          message: '업로드할 파일이 없습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
        return;
      }

      // 상태 업데이트 전에 기존 파일명 배열 복사
      const currentFileNames = [...originalFileNames];

      setFileStatuses(() => {
        const newStatuses: Record<string, 'success' | 'failure' | 'uploading' | 'pending'> = {};
        currentFileNames.forEach((name) => {
          newStatuses[name] = 'uploading';
        });
        return newStatuses;
      });

      // 파일 업로드 API 호출
      for (const file of Array.from(uploadFiles)) {
        try {
          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'uploading',
          }));

          // fetchAddEvidenceOriginal 함수 사용
          const uploadResponse = await fetchAddEvidenceOriginal({
            project_id: projectId,
            office_id: officeId,
            file_nm: file.name,
            file: file,
          });

          if (uploadResponse.success) {
            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'success',
            }));
          } else {
            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'failure',
            }));
            throw new Error(`파일 업로드 실패: ${file.name}`);
          }
        } catch (error) {
          console.error(`파일 업로드 오류 (${file.name}):`, error);
          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'failure',
          }));
        }
      }

      onMessageToast({
        message: '증거문서가 성공적으로 등록되었습니다.',
        icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
      });
      onSuccess();
      handleClose(); // onClose 대신 handleClose 호출
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

  return (
    <div className={`fixed inset-0 z-20 flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative min-h-[550px] min-w-[425px] rounded-[16px] bg-[#fff]'>
        <div className='pl-[32px] pt-[32px] text-[24px] font-bold'>증거문서 추가</div>
        <div className='overflow-y-scroll lg:max-h-[500px] 2xl:max-h-[600px]'>
          <div className='pl-[32px] pt-[24px]'>
            <label className='text-[14px] text-[#000]'>증거문서</label>
          </div>
          <div className='pl-[32px]'>
            <div
              className={`mt-2 flex h-[250px] w-[361px] items-center justify-center rounded-lg border border-[#4577A4] bg-white ${
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
                  <br />
                  <span className='text-[12px] text-[#666]'>
                    (지원 형식: PDF, Excel(.xlsx, .xls), Word(.doc, .docx), 이미지(.jpg, .png, 등))
                  </span>
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
                    onFileSelect={(newFileNames) => setOriginalFileNames(newFileNames)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* 업로드된 파일 이름 표시 */}
          <div className='pl-[32px]'>
            {originalFileNames.length > 0 && (
              <div className='mt-4 flex w-full items-center justify-between'>
                <div className='w-full text-[14px] text-[#000]'>업로드된 파일 {originalFileNames.length}개</div>
                <div
                  className='mr-[24px] flex w-full cursor-pointer items-center justify-end'
                  onClick={() => {
                    setOriginalFileNames([]);
                    setFileStatuses({});
                    setValue('originalfile', []);

                    if (inputFileRef.current) {
                      inputFileRef.current.value = '';
                    }
                  }}
                >
                  <span className='text-[14px] text-[#000]'>전체 파일 삭제</span>
                </div>
              </div>
            )}

            <div className='mt-4'>
              {originalFileNames.length > 0 ? (
                originalFileNames.map((name, index) => (
                  <>
                    <div key={index} className='mb-1 mr-6 flex h-[45px] w-[361px] items-center rounded-[8px] bg-[#EFFBFF] p-1'>
                      <span className='min-w-[270px] max-w-[270px] truncate pl-2 text-[14px] text-[#999]'>{name || '파일명 없음'}</span>
                      <span className='w-20 pr-2 text-right'>
                        {fileStatuses[name] === 'success' ? (
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
                          setOriginalFileNames((prev) => prev.filter((_, i) => i !== index));
                          const updatedFiles = watch('originalfile').filter((_: any, i: number) => i !== index);
                          setValue('originalfile', updatedFiles);
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
                  </>
                ))
              ) : (
                <p className='text-gray-500'></p>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center pb-[24px]'>
          <button
            type='button'
            onClick={() => {
              try {
                handleSubmit((data) => {
                  onSubmit(data);
                })();
              } catch (error) {
                console.error('버튼 클릭 오류:', error);
              }
            }}
            disabled={isSubmitting}
            className={`mt-2 h-[46px] w-[130px] rounded-lg bg-[#4577A4] text-white ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isSubmitting ? '등록 중...' : '문서 등록'}
          </button>
          <button
            className={`ml-6 mt-2 h-[46px] w-[130px] rounded-lg border border-[#4577A4] bg-white px-4 py-1 text-[#4577A4] ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={isSubmitting ? undefined : handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
