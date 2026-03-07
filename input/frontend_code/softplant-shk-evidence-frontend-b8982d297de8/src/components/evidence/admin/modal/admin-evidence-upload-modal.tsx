import { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosClose, IoMdCheckmarkCircle } from 'react-icons/io';
// import { IoIosClose, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';

import CustomSpinner from '@components/common/spiner';
import InfoInputFile from '@components/evidence/admin/input/fileinput';
import { fetchAdminUploadEvidence } from '@/apis';
import { onMessageToast } from '@/components/utils';
interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId: string;
  selectedOfficeId: string;
  uploadVersion?: string | null;
  onSuccess?: () => void;
}
type TForm = {
  EvidenceFile: File[];
};

export const AdminEvidenceUploadModal = ({
  isOpen,
  onClose,
  selectedProjectId,
  selectedOfficeId,
  uploadVersion,
  onSuccess,
}: IEvidenceListUploadModalProps) => {
  const { handleSubmit, watch, setValue } = useForm<TForm>({
    defaultValues: {
      EvidenceFile: [] as unknown as File[],
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 파일 이름 상태 관리
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending'>>({});
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

    // 기존 파일과 병합
    const existingFiles = watch('EvidenceFile') || [];
    const updatedFiles = [...existingFiles, ...validFiles];
    // console.log('최종 파일 수:', updatedFiles.length);

    if (validFiles.length > 0) {
      // 폼 값 업데이트
      setValue('EvidenceFile', updatedFiles);

      // 파일 이름 상태 업데이트
      setFileNames((prevNames) => {
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
  const onSubmit = async () => {
    const files = watch('EvidenceFile'); // 현재 EvidenceFile 상태 확인

    console.log('🚀 watch("EvidenceFile") 값:', files);

    if (!files || files.length === 0) {
      alert('파일을 선택해주세요.');
      return;
    }

    // 🚨 `FileList[]` 내부에서 첫 번째 `File` 하나만 선택
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
        file: selectedFile, // 단일 파일 전달
        upload_version: uploadVersion === null || uploadVersion === undefined ? null : uploadVersion, // 기존 증거목록(null)이면 null, 새 버전이면 해당 버전 전달
      };

      const response = await fetchAdminUploadEvidence(uploadInput);

      if (response.success) {
        onMessageToast({
          message: '파일 업로드 성공',
        });

        setFileStatuses({ [selectedFile.name]: 'success' });

        setFileNames([]);
        setValue('EvidenceFile', []);
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
          <h1 className='font-bold'>증거목록</h1>
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
        {/* 업로드된 파일 이름 표시 */}
        <div className='pl-5'>
          <div className='flex w-full items-center'>
            <h2 className='w-full text-[25px] font-bold'>업로드된 파일</h2>
            {fileNames.length > 0 && (
              <div
                className='mr-6 flex w-full cursor-pointer justify-end'
                onClick={() => {
                  setFileNames([]);
                  setValue('EvidenceFile', []);
                  setFileStatuses({}); // 상태 객체 초기화
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
                        <CustomSpinner size='sm' />
                      ) : fileStatuses[name] === 'pending' ? (
                        <span className='text-gray-400'></span>
                      ) : null}
                    </span>
                    <div
                      className='flex w-20 cursor-pointer items-center text-[15px] text-[#35363A]'
                      onClick={() => {
                        // 파일 이름과 파일 리스트에서 삭제
                        setFileNames((prev) => prev.filter((_, i) => i !== index));
                        const updatedFiles = watch('EvidenceFile').filter((_: any, i: number) => i !== index);
                        setValue('EvidenceFile', updatedFiles);

                        // 파일 입력이 비었으면 input 요소도 초기화
                        if (updatedFiles.length === 0 && inputFileRef.current) {
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
