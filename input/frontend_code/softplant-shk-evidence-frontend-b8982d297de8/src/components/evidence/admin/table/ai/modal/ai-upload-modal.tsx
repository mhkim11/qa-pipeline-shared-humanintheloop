import { useRef, useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';

const PdfImg = new URL('/src/assets/images/HTML.svg', import.meta.url).href;

import CustomSpinner from '@components/common/spiner';
import InfoInputFile from '@components/evidence/input/ai-fileinput';
import { fetchAdminUploadAIProjectMenu } from '@/apis/admin-ai-api';
import { onMessageToast } from '@/components/utils';

interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project_id: string;
  menu_id: string;
  existingFile?: {
    fileName: string;
    filePath: string;
    fileType: string;
  };
}

type TForm = {
  Listfile: File | null;
  fileType: string;
};

export const AiUploadModal = ({ isOpen, onClose, onSuccess, project_id, menu_id, existingFile }: IEvidenceListUploadModalProps) => {
  const { handleSubmit, watch, setValue, reset } = useForm<TForm>({
    defaultValues: {
      Listfile: null,
      fileType: '',
    },
  });
  const inputFileRef = useRef<HTMLInputElement>(null);

  // 파일 상태 관리 (단일 파일)
  const [fileName, setFileName] = useState<string>('');
  const [fileStatus, setFileStatus] = useState<'success' | 'failure' | 'uploading' | 'pending' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const allowedExtensions = ['html', 'md'];
  const maxFileSize = 500 * 1024 * 1024; // 500MB

  // 모든 상태 초기화
  const resetAllStates = () => {
    setFileName('');
    setFileStatus('');
    setIsDragging(false);
    setIsSubmitting(false);
    setErrorMessage('');
    reset();
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  // 모달 열림/닫힘 처리
  useEffect(() => {
    if (isOpen) {
      resetAllStates();

      // 기존 파일 정보가 있는 경우 초기 설정
      if (existingFile && existingFile.fileName) {
        setFileName(existingFile.fileName);
        setFileStatus('success'); // 기존 파일은 이미 업로드된 상태
        setValue('fileType', existingFile.fileType);
        console.log('Existing file loaded:', existingFile);
      }
    }
  }, [isOpen, existingFile]); // eslint-disable-line react-hooks/exhaustive-deps

  // 단일 파일 처리 함수
  const processFile = (file: File) => {
    // 파일이 실제 File 객체인지 확인
    if (!(file instanceof File)) {
      console.error('Invalid file object:', file);
      onMessageToast({
        message: '유효하지 않은 파일입니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    if (file.size > maxFileSize) {
      onMessageToast({
        message: `${file.name}은(는) 크기 제한(500MB)을 초과합니다.`,
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    console.log('Valid file processed:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      constructor: file.constructor.name,
    });

    setFileName(file.name);
    setValue('Listfile', file);
    setFileStatus('pending');
  };

  // 파일 선택 핸들러 (InfoInputFile에서 string[] 형태로 받음)
  const handleFileSelect = (selectedFileNames: string[]) => {
    if (selectedFileNames.length > 0) {
      // 첫 번째 파일만 사용 (단일 파일 업로드)
      setFileName(selectedFileNames[0]);
      setFileStatus('pending');

      // InfoInputFile 컴포넌트가 이미 Listfile에 파일들을 설정했으므로
      // 첫 번째 파일만 가져와서 단일 파일로 설정
      const currentFiles = watch('Listfile');
      if (Array.isArray(currentFiles) && currentFiles.length > 0) {
        setValue('Listfile', currentFiles[0]);
      }
    } else {
      setFileName('');
      setFileStatus('');
      setValue('Listfile', null);
    }
  };

  // 파일 삭제
  const handleFileDelete = () => {
    setFileName('');
    setValue('Listfile', null);
    setFileStatus('');
    setErrorMessage('');

    // InfoInputFile 컴포넌트에도 변경사항 반영
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  // 전체 파일 삭제 (단일 파일이므로 handleFileDelete와 동일)
  const handleClearAllFiles = () => {
    handleFileDelete();
  };

  // 드래그 앤 드롭 핸들러 개선
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 드래그 영역을 완전히 벗어났을 때만 isDragging을 false로 설정
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const fileType = watch('fileType');

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // 첫 번째 파일만 처리 (단일 파일)
    const file = files[0];

    // 기존 파일 상태 초기화 후 새 파일 처리
    resetAllStates();
    setValue('fileType', fileType); // 파일 타입은 유지
    processFile(file);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    if (isSubmitting) {
      onMessageToast({
        message: '파일 업로드가 진행 중입니다. 완료될 때까지 기다려주세요.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    onClose();
  };

  // 업로드 가능 여부 확인
  const isUploadable = () => {
    return fileName && !isSubmitting;
  };

  // 파일 업로드 실행 (단일 파일)
  const onSubmit = async (data: TForm) => {
    if (!data.Listfile) {
      onMessageToast({
        message: '업로드할 파일이 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    setIsSubmitting(true);
    setFileStatus('uploading');

    try {
      console.log('=== 파일 업로드 시작 ===');

      // 파일 객체 검증
      if (!(data.Listfile instanceof File)) {
        throw new Error('유효하지 않은 파일 객체입니다.');
      }

      // 파일 크기 검증
      if (data.Listfile.size === 0) {
        throw new Error('빈 파일은 업로드할 수 없습니다.');
      }

      if (data.Listfile.size > maxFileSize) {
        throw new Error(`파일 크기가 너무 큽니다. 최대 ${Math.round(maxFileSize / 1024 / 1024)}MB까지 업로드 가능합니다.`);
      }

      // 파일 내용 미리보기 (첫 100바이트)
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer.slice(0, 100));
          const textDecoder = new TextDecoder('utf-8');
          const preview = textDecoder.decode(uint8Array);
          console.log('File content preview:', preview.substring(0, 200));
        };
        reader.readAsArrayBuffer(data.Listfile.slice(0, 100));
      } catch (previewError) {
        console.warn('파일 미리보기 실패:', previewError);
      }

      const uploadData = {
        project_id: project_id,
        menu_id: menu_id,
        file_nm: data.Listfile.name,
        file: data.Listfile,
      };

      console.log('Upload data prepared:', {
        project_id: uploadData.project_id,
        menu_id: uploadData.menu_id,
        file_nm: uploadData.file_nm,
        fileSize: uploadData.file.size,
        fileType: uploadData.file.type,
      });

      const response = await fetchAdminUploadAIProjectMenu(uploadData);

      console.log('Upload response:', response);

      if (response.status === 200) {
        setFileStatus('success');
        onMessageToast({
          message: '파일이 성공적으로 업로드되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        setTimeout(() => {
          resetAllStates();
          onSuccess();
          onClose();
        }, 1000);
      } else {
        console.error('Upload failed:', response);
        setFileStatus('failure');
        setErrorMessage(response.data.message || '업로드에 실패했습니다');
      }
    } catch (error: any) {
      console.error('=== 파일 업로드 실패 ===');
      console.error('Upload error details:', error);

      setFileStatus('failure');

      let errorMsg = '업로드에 실패했습니다';

      if (error?.response?.status === 500) {
        errorMsg = `서버 오류: ${error?.response?.data?.message || error?.message || '내부 서버 오류'}`;
      } else if (error?.response?.status === 400) {
        errorMsg = `잘못된 요청: ${error?.response?.data?.message || error?.message || '요청 형식 오류'}`;
      } else if (error?.response?.status === 413) {
        errorMsg = '파일 크기가 너무 큽니다';
      } else if (error?.response?.status === 415) {
        errorMsg = '지원하지 않는 파일 형식입니다';
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      console.error(`파일 업로드 실패 - ${data.Listfile.name}: ${errorMsg}`);
    }

    setIsSubmitting(false);
  };

  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative max-h-[95vh] max-w-[500px] overflow-y-auto rounded-[16px] bg-[#fff] p-[32px]'>
        <div className='text-[24px] font-bold'>{existingFile && existingFile.fileName ? 'AI분석 데이터 수정' : 'AI분석 데이터 등록'}</div>
        <div className=''>
          {/* <div className='pt-[24px]'>
            <label className='block text-[14px] text-[#5B5B5B]'>
              파일유형 <span className='text-[#1890FF]'>*</span>
            </label>
            <Select onValueChange={(value) => setValue('fileType', value)} value={watch('fileType')}>
              <SelectTrigger className='mt-2 h-[56px] w-[361px] rounded-lg border border-[#E5E5E5] pl-[16px] text-[16px] placeholder:font-medium placeholder:text-[#BABABA]'>
                <SelectValue placeholder='파일유형을 선택해주세요' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='html'>HTML</SelectItem>
                <SelectItem value='md'>MD</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className='pt-[24px]'>
            <label className='block text-[14px] text-[#5B5B5B]'>
              파일업로드 <span className='text-[#1890FF]'>*</span>
            </label>
          </div>

          <div
            className={`mt-2 flex h-[56px] w-[361px] items-center justify-center rounded-lg border border-[#c2c2c2] bg-white ${
              isDragging ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className=''>
              <div className='flex items-center justify-center pt-1 text-center text-[14px] text-[#999]'>
                <p className='text-[14px] font-medium text-[#8E8E8E]'>파일을 여기에 끌어다 놓기 or</p>
                <div className='flex items-center justify-center pl-2'>
                  <InfoInputFile
                    key={`${fileName}-${watch('fileType')}`}
                    inputFileRef={inputFileRef}
                    watch={watch}
                    setValue={setValue}
                    onFileSelect={handleFileSelect}
                    allowedExtensions={allowedExtensions}
                    fileType={watch('fileType')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 업로드된 파일 개수와 전체 삭제 버튼 */}
          {fileName && (
            <div className='mt-4 flex w-full items-center justify-between'>
              <div className='text-[14px] text-[#000]'>업로드된 파일 1개</div>
              <div className='cursor-pointer text-[14px] text-[#000] hover:text-red-500' onClick={handleClearAllFiles}>
                전체 파일 삭제
              </div>
            </div>
          )}

          {/* 업로드된 파일 목록 */}
          <div className='mt-[24px]'>
            {fileName ? (
              <div
                className={`flex w-[361px] items-center rounded-[8px] ${
                  fileStatus === 'failure' ? 'min-h-[60px] bg-[#FFF7F7]' : 'h-[45px] bg-[#EFFBFF]'
                } p-1`}
              >
                <div className='flex items-center'>
                  <div>
                    <div className='flex min-w-[270px] max-w-[270px] items-center text-[14px] text-[#666]'>
                      <img src={PdfImg} alt='file' className='mr-2 h-[25px] w-[25px]' />
                      <p className='max-w-[240px] truncate'>{fileName || '파일명 없음'}</p>
                    </div>
                    {fileStatus === 'failure' && (
                      <div className='ml-2 min-w-[280px] max-w-[280px] text-[12px] font-medium text-[#F5222D]'>
                        {errorMessage || '업로드에 실패했습니다'}
                      </div>
                    )}
                  </div>
                </div>
                <span className='w-20 pr-2 text-right'>
                  {fileStatus === 'success' ? (
                    <IoMdCheckmarkCircle className='text-green-500' />
                  ) : fileStatus === 'failure' ? (
                    <FaExclamationCircle className='text-red-500' />
                  ) : fileStatus === 'uploading' ? (
                    <CustomSpinner size='sm' />
                  ) : (
                    <span className='text-gray-400'></span>
                  )}
                </span>
                <div
                  className='mr-2 flex w-20 cursor-pointer items-center justify-end text-[15px] text-[#35363A] hover:text-red-500'
                  onClick={handleFileDelete}
                >
                  <IoIosCloseCircle className='text-2xl' />
                </div>
              </div>
            ) : (
              <p className='text-gray-500'></p>
            )}
          </div>
        </div>

        <div className='mt-[24px] flex items-center justify-center'>
          <button
            type='button'
            onClick={() => handleSubmit(onSubmit)()}
            disabled={!isUploadable()}
            className={`mt-2 h-[46px] w-[130px] rounded-lg ${
              !isUploadable() ? 'cursor-not-allowed bg-[#F5F5F5] text-[#C2C2C2]' : 'bg-[#4577A4] text-white hover:bg-[#3a6690]'
            }`}
          >
            {isSubmitting
              ? existingFile && existingFile.fileName
                ? '수정 중...'
                : '등록 중...'
              : existingFile && existingFile.fileName
                ? '수정'
                : '등록'}
          </button>
          <button
            className={`ml-6 mt-2 h-[46px] w-[130px] rounded-lg border border-[#c2c2c2] bg-white px-4 py-1 text-[#252525] hover:bg-gray-50 ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>

      {/* errorModalOpen 제거 */}
    </div>
  );
};
