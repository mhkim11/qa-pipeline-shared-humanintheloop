import { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosClose, IoMdCheckmarkCircle } from 'react-icons/io';
// import { IoIosClose, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';

import MatchingInput from '@components/evidence/admin/input/matching-input';
import { fetchAdminUploadMatching } from '@/apis';
import { onMessageToast } from '@/components/utils';
interface IEvidenceMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId: string;
  selectedOfficeId: string;
  uploadVersion?: string | null;
  onSuccess?: () => void;
}
type TForm = {
  MatchingFile: File[];
};

export const AdminMatchingModal = ({
  isOpen,
  onClose,
  selectedProjectId,
  selectedOfficeId,
  uploadVersion,
  onSuccess,
}: IEvidenceMatchingModalProps) => {
  const { handleSubmit, watch, setValue } = useForm<TForm>({
    defaultValues: {
      MatchingFile: [] as unknown as File[],
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 파일 이름 상태 관리
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending' | 'idle'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const allowedExtensions = ['xlsx', 'xls'];
  const maxFileSize = 500 * 1024 * 1024; // 500MB
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    // 파일 객체 가져오기
    const droppedFiles = event.dataTransfer.files;
    /*  console.log('총 드래그된 파일:', droppedFiles.length); */

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
        /*     console.log(`${file.name}: 확장자 문제로 제외됨`); */
        onMessageToast({
          message: `${file.name}은(는) 엑셀 파일만 업로드 가능합니다.`,
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

    // 매칭 테이블은 1개 파일만 업로드 가능하므로 첫 번째 파일만 사용
    if (validFiles.length > 0) {
      const selectedFile = validFiles[0];
      const selectedFileName = newFileNames[0];

      // 폼 값 업데이트 (기존 파일 대체)
      setValue('MatchingFile', [selectedFile]);

      // 파일 이름 상태 업데이트 (기존 파일명 대체)
      setFileNames([selectedFileName]);

      // 파일 상태 업데이트
      setFileStatuses({ [selectedFileName]: 'pending' });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const onSubmit = async () => {
    const files = watch('MatchingFile');

    /* console.log('🚀 watch("MatchingFile") 값:', files); */

    if (!files || files.length === 0) {
      alert('파일을 선택해주세요.');
      return;
    }

    let selectedFile: File | null = null;
    if (files instanceof FileList) {
      selectedFile = files[0];
    } else if (Array.isArray(files) && files.length > 0) {
      selectedFile = files[0] instanceof FileList ? files[0][0] : files[0];
    }

    if (!selectedFile) {
      onMessageToast({ message: '파일을 선택해주세요.' });
      return;
    }

    setIsSubmitting(true);
    setFileStatuses((prev) => ({
      ...prev,
      ...(selectedFile ? { [selectedFile.name]: 'uploading' } : {}),
    }));

    try {
      const uploadInput = {
        project_id: selectedProjectId,
        office_id: selectedOfficeId,
        file: selectedFile,
        upload_version: uploadVersion ?? null, // 기존 매칭목록(null)이면 null, 새 버전이면 해당 버전 전달
      };

      const response = await fetchAdminUploadMatching(uploadInput);

      if (response.success) {
        onMessageToast({
          message: '파일 업로드 성공',
        });

        setFileStatuses({ [selectedFile.name]: 'success' });

        setFileNames([]);
        setValue('MatchingFile', []);
        onClose();
        onSuccess?.();
      } else {
        onMessageToast({
          message: '파일 업로드 실패',
        });

        setFileStatuses({ [selectedFile.name]: 'failure' });
      }
    } catch (error) {
      console.error('❌ 업로드 오류:', error);
      setFileStatuses({ [selectedFile.name]: 'failure' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={`fixed inset-0 z-20 flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='gl:max-h-[700px] relative overflow-scroll rounded-lg border-3 border-[#2B7994] bg-[#fff] shadow-lg lg:max-h-[700px] lg:min-w-[800px] 2xl:max-h-[800px] 2xl:max-w-[900px]'>
        <div className='pl-5 pt-2 2xl:pt-6'>
          <h1 className='font-bold'>매칭테이블 업로드</h1>
          <p>엑셀 파일을 업로드해주세요</p>
          <p>1개의 파일만 등록할 수 있습니다.</p>
        </div>
        <div className='mt-2 flex items-center justify-center pb-[20px]'>
          <div
            className={`mt-2 flex items-center justify-center rounded-lg border border-[#4577A4] bg-white lg:min-h-[200px] lg:w-[752px] 2xl:min-h-[250px] ${
              isDragging ? 'bg-gray-200' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <div className='mt-2 2xl:mt-4'>
              <div className='flex items-center justify-center'>
                <IoCloudUploadOutline className='text-[40px]' />
              </div>
              <div className='mt-2 text-center'>
                파일 또는 폴더를 여기에 끌어다 놓거나,
                <br />
                파일 선택 버튼을 눌러 파일을 직접 선택해주세요
              </div>
              <div className='mb-5 flex w-full items-center justify-center 2xl:mt-4'>
                <div className='h-0 w-full border border-dashed'></div>
                <div className='flex w-full justify-center'>또는</div>
                <div className='h-0 w-full border border-dashed'></div>
              </div>
              <div className='flex items-center justify-center'>
                <MatchingInput
                  inputFileRef={inputFileRef}
                  watch={watch}
                  setValue={setValue}
                  onFileSelect={(newFileNames) => {
                    setFileNames(newFileNames);
                    // 파일 상태 초기화 및 새 파일 상태 설정
                    setFileStatuses((prev) => {
                      const newStatuses: Record<string, 'success' | 'failure' | 'uploading' | 'pending' | 'idle'> = {};
                      newFileNames.forEach((name) => {
                        newStatuses[name] = prev[name] || 'pending';
                      });
                      return newStatuses;
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* 업로드된 파일 이름 표시 */}
        <div className='pl-5'>
          <div className='flex w-full items-center'>
            <h2 className='w-full text-[25px] font-bold'>업로드된 파일</h2>
            {fileNames.length > 0 && (
              <div
                className='mr-6 flex w-full cursor-pointer justify-end'
                onClick={() => {
                  setFileNames([]);
                  setValue('MatchingFile', []);
                  setFileStatuses({}); // 상태 초기화 추가
                  // input 파일 요소 초기화
                  if (inputFileRef.current) {
                    inputFileRef.current.value = '';
                  }
                }}
              >
                <IoIosClose className='text-2xl' />
                <span>전체 파일 삭제</span>
              </div>
            )}
          </div>
          <div className='mt-4'>
            {fileNames.length > 0 ? (
              fileNames.map((name, index) => (
                <>
                  <div key={index} className='mb-1 mr-6 flex h-[45px] items-center rounded border border-gray-300 bg-[#EFFBFF] p-1'>
                    <span className='w-full pl-2'>{name}</span>
                    <span className='w-20 pr-2 text-right'>
                      {fileStatuses[name] === 'success' ? (
                        <IoMdCheckmarkCircle className='text-green-500' />
                      ) : fileStatuses[name] === 'failure' ? (
                        <FaExclamationCircle className='text-red-500' />
                      ) : fileStatuses[name] === 'uploading' ? (
                        <svg
                          className='mr-2 h-5 w-5 animate-spin text-indigo-500'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'></path>
                        </svg>
                      ) : null}
                    </span>
                    <div
                      className='flex w-20 cursor-pointer items-center text-[15px] text-[#35363A]'
                      onClick={() => {
                        // 파일 이름과 파일 리스트에서 삭제
                        const updatedNames = fileNames.filter((_, i) => i !== index);
                        const updatedFiles = watch('MatchingFile').filter((_: any, i: number) => i !== index);
                        const removedFileName = fileNames[index];

                        setFileNames(updatedNames);
                        setValue('MatchingFile', updatedFiles);

                        // 파일 상태에서도 제거
                        setFileStatuses((prev) => {
                          const newStatuses = { ...prev };
                          delete newStatuses[removedFileName];
                          return newStatuses;
                        });

                        // input 파일 요소 초기화 (같은 파일을 다시 선택할 수 있도록)
                        if (inputFileRef.current) {
                          inputFileRef.current.value = '';
                        }
                      }}
                    >
                      <IoIosClose className='text-2xl' />
                      삭제
                    </div>
                  </div>
                </>
              ))
            ) : (
              <p className='text-gray-500'></p>
            )}
          </div>
        </div>

        <div className='mt-4 flex items-center justify-center pb-[24px]'>
          <button
            type='button'
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className='mt-2 h-[46px] w-[130px] rounded-lg bg-[#4577A4] text-white'
          >
            등록
          </button>
          <button
            className={`ml-6 mt-2 h-[46px] w-[130px] rounded-lg border border-[#4577A4] bg-white px-4 py-1 text-[#4577A4] ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={isSubmitting ? undefined : onClose} // 제출 중일 때 동작하지 않음
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
