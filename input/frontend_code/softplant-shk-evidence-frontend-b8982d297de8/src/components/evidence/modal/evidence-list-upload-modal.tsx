import { useRef, useState, useEffect } from 'react';

import { File as FileIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaExclamationCircle } from 'react-icons/fa';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';
// import { IoIosClose, IoIosWarning, IoMdCheckmarkCircle } from 'react-icons/io';

const PdfImg = new URL('/src/assets/images/PDF.svg', import.meta.url).href;
import { useFindUserInfo } from '@query/query';
import { fetchCreateProject, fetchUploadFile, fetchRequestA2D2 } from '@apis/evidence-api';
import CustomSpinner from '@components/common/spiner';
import { fetchCreateCivilCase, fetchCreateDocument } from '@/apis/case-api/civil-case-api';
import ModalSelect from '@/components/common/modal/modal-select';
import { onMessageToast } from '@/components/utils';
interface IEvidenceListUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectName?: string, projectId?: string) => void;
}
type TForm = {
  Listfile: File[];
  title: string;
  client: string;
};

export const EvidenceListUploadModal = ({ isOpen, onClose, onSuccess }: IEvidenceListUploadModalProps) => {
  const { register, handleSubmit, watch, setValue } = useForm<TForm>({
    defaultValues: {
      Listfile: [] as unknown as File[],
      title: '',
      client: '',
    },
  });
  // 탭별 input file을 분리 (민사 탭에서 "파일 선택하기"가 안 뜨는 문제 방지)
  const civilInputFileRef = useRef<HTMLInputElement>(null);
  const criminalIndictmentInputFileRef = useRef<HTMLInputElement>(null);
  const criminalEvidenceInputFileRef = useRef<HTMLInputElement>(null);

  // 파일 이름 상태 관리
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, 'success' | 'failure' | 'uploading' | 'pending'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [failedFileErrors, setFailedFileErrors] = useState<Record<string, string>>({});
  const [projectCreated, setProjectCreated] = useState<string>('');
  const [civilCaseCreatedId, setCivilCaseCreatedId] = useState<string>('');
  const [civilProjectCreatedId, setCivilProjectCreatedId] = useState<string>('');
  const [caseTypeTab, setCaseTypeTab] = useState<'criminal' | 'civil'>('criminal');

  const [trialLevel, setTrialLevel] = useState<1 | 2 | 3>(1);
  const [isPlaintiff, setIsPlaintiff] = useState<boolean>(true);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 유저정보 가져오기
  const { response: findEvidenceUserInfo } = useFindUserInfo();
  const fontSizeAdjustment = findEvidenceUserInfo?.data?.font_size_rate || 0;

  // office_id: 우선 userInfo에서, 없으면 localStorage fallback
  const officeId =
    findEvidenceUserInfo?.data?.office_id ||
    (() => {
      try {
        const getID = localStorage.getItem('evidence-frontend-login') || '{}';
        return JSON.parse(getID)?.user?.office_id;
      } catch {
        return undefined;
      }
    })();

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
  const maxFileSize = 500 * 1024 * 1024; // 500MB

  const appendFilesToForm = (incomingFiles: File[]) => {
    const currentFiles: File[] = watch('Listfile') || [];
    const validFiles: File[] = [];

    for (const uploadedFile of incomingFiles) {
      const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      const fileExtensionArray = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'csv'];

      // 파일 확장자 체크
      if (!fileExtensionArray.includes(fileExtension)) {
        onMessageToast({
          message: `${uploadedFile.name}은(는) 지원되지 않는 파일 형식입니다. (지원 형식: PDF, Excel, Word, 이미지 파일, CSV)`,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        continue;
      }

      // 파일 크기 체크 (500MB 제한)
      if (uploadedFile.size > maxFileSize) {
        onMessageToast({
          message: `${uploadedFile.name}은(는) 크기 제한(500MB)을 초과합니다.`,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        continue;
      }

      validFiles.push(uploadedFile);
    }

    if (validFiles.length === 0) return;

    const updatedFiles = [...currentFiles, ...validFiles];
    setValue('Listfile', updatedFiles);

    const updatedFileNames = updatedFiles.map((fileItem) =>
      fileItem instanceof File ? fileItem.name : (fileItem as any)?.[0]?.name || '이름 없음',
    );
    setFileNames(updatedFileNames);

    setFileStatuses((prev) => {
      const next: Record<string, 'success' | 'failure' | 'uploading' | 'pending'> = { ...prev };
      // 새로 추가된 파일명은 pending으로 초기화
      updatedFileNames.forEach((name) => {
        if (!next[name]) next[name] = 'pending';
      });
      // 삭제된 파일 상태 제거
      Object.keys(next).forEach((name) => {
        if (!updatedFileNames.includes(name)) delete next[name];
      });
      return next;
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      appendFilesToForm(Array.from(e.target.files));
    }
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = '';
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    // 파일 객체 가져오기
    const droppedFiles = event.dataTransfer.files;

    if (!droppedFiles || droppedFiles.length === 0) return;

    appendFilesToForm(Array.from(droppedFiles));
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

  const onSubmit = async (data: TForm) => {
    setIsSubmitting(true);
    setErrorModalOpen(false);
    // 사건명과 의뢰인 필드가 비어있는지 확인
    if (!data.title || !data.client) {
      onMessageToast({
        message: '사건명과 의뢰인 필드는 필수입니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadFiles = data.Listfile;

      if (!uploadFiles || uploadFiles.length === 0) {
        onMessageToast({
          message: '업로드할 파일이 없습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
        return;
      }

      // 1) 사건 생성 (형사: project 생성 / 민사: civil-case 생성)
      let currentProjectId = projectCreated;
      let currentCivilCaseId = civilCaseCreatedId;

      if (caseTypeTab === 'civil') {
        if (!officeId) {
          onMessageToast({
            message: 'office_id를 찾을 수 없습니다. 다시 로그인 후 시도해주세요.',
            icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
          });
          setIsSubmitting(false);
          return;
        }

        if (!currentCivilCaseId || !civilProjectCreatedId) {
          try {
            const createCivilResponse = await fetchCreateCivilCase({
              project_nm: data.title,
              client_nm: data.client,
              case_number: '',
              trial_level: trialLevel,
              description: `의뢰인: ${data.client}`,
              is_plaintiff: isPlaintiff,
            });

            if (!createCivilResponse.success) {
              throw new Error(createCivilResponse.message || '민사 사건 등록 실패');
            }

            currentCivilCaseId = createCivilResponse.data.civil_case_id;
            currentProjectId = createCivilResponse.data.project_id;
            setCivilCaseCreatedId(currentCivilCaseId);
            setCivilProjectCreatedId(currentProjectId);
          } catch (error) {
            console.error('민사 사건 생성 오류:', error);
            onMessageToast({
              message: error instanceof Error ? error.message : '민사 사건 등록에 실패했습니다.',
              icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
            });
            setIsSubmitting(false);
            return;
          }
        } else {
          currentProjectId = civilProjectCreatedId;
        }
      } else {
        if (!currentProjectId) {
          try {
            const createProjectResponse = await fetchCreateProject({
              project_nm: data.title,
              description: `의뢰인: ${data.client}`,
              client_nm: data.client,
              isPublic: 'N',
            });

            if (!createProjectResponse.success) {
              throw new Error(createProjectResponse.message || '사건 등록 실패');
            }

            currentProjectId = createProjectResponse.data.project_id;
            setProjectCreated(currentProjectId);
          } catch (error) {
            console.error('사건 생성 오류:', error);
            onMessageToast({
              message: error instanceof Error ? error.message : '사건 등록에 실패했습니다.',
              icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // 2. 파일 업로드 상태 초기화
      setFileStatuses(() => {
        const newStatuses: Record<string, 'success' | 'failure' | 'uploading' | 'pending'> = {};

        // 첫 시도일 경우 모든 파일을 'uploading'으로 설정
        if (failedFiles.length === 0) {
          fileNames.forEach((name) => {
            newStatuses[name] = 'uploading';
          });
        }
        // 재시도인 경우 실패 파일만 'uploading'으로 설정
        else {
          failedFiles.forEach((file) => {
            newStatuses[file.name] = 'uploading';
          });
          // 이미 성공한 파일은 그대로 유지
          fileNames.forEach((name) => {
            if (!newStatuses[name]) {
              newStatuses[name] = 'success';
            }
          });
        }

        return newStatuses;
      });

      // 3. 업로드할 파일 선택
      const filesToUpload = failedFiles.length > 0 ? failedFiles : Array.from(uploadFiles);

      // 새로운 실패 파일 추적
      const newFailedFiles: File[] = [];
      const newFailedErrors: Record<string, string> = {};

      // 4. 파일 업로드 수행
      for (const file of filesToUpload) {
        try {
          setFileStatuses((prev) => ({
            ...prev,
            [file.name]: 'uploading',
          }));

          const uploadResponse =
            caseTypeTab === 'civil'
              ? await fetchCreateDocument({
                  civil_case_id: currentCivilCaseId,
                  file,
                  title: file.name,
                  document_type: 'OTHER',
                  is_plaintiff: isPlaintiff,
                })
              : await fetchUploadFile({
                  project_id: currentProjectId,
                  file: [file],
                  file_nm: file.name,
                });

          if (uploadResponse.success) {
            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'success',
            }));
          } else {
            // 실패 정보 저장
            newFailedFiles.push(file);
            const errorMsg = uploadResponse.message || '업로드에 실패했습니다';
            newFailedErrors[file.name] = errorMsg;

            setFileStatuses((prev) => ({
              ...prev,
              [file.name]: 'failure',
            }));

            console.error(`Upload failed for ${file.name}: ${errorMsg}`);
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

          console.error(`Upload error for ${file.name}:`, error);
        }
      }

      // 5. 실패한 파일 상태 업데이트
      setFailedFiles(newFailedFiles);
      setFailedFileErrors(newFailedErrors);

      // 6. 실패한 파일이 있는지 확인
      if (newFailedFiles.length > 0) {
        // 토스트 메시지 대신 모달 표시
        setErrorMessage(`${newFailedFiles.length}개 파일 업로드에 실패했습니다. 다시 시도해주세요.`);
        setErrorModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // 7. 후처리
      if (caseTypeTab === 'civil') {
        onMessageToast({
          message: '민사 사건이 성공적으로 등록되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });
        onSuccess(data.title, currentProjectId); // 사건명과 프로젝트 ID를 전달
        onClose();
        return;
      }

      // 형사: 모든 파일 업로드 성공 시 A2D2 요청
      try {
        const a2d2Response = await fetchRequestA2D2({
          project_id: currentProjectId,
          office_id: officeId,
        });

        if (!a2d2Response.success) {
          throw new Error(a2d2Response.message || 'A2D2 요청 실패');
        }

        onMessageToast({
          message: '사건이 성공적으로 등록되었습니다.',
          icon: <IoMdCheckmarkCircle className='h-5 w-5 text-green-500' />,
        });

        onSuccess(data.title, currentProjectId); // 사건명과 프로젝트 ID를 전달
        onClose();
      } catch (error) {
        console.error('A2D2 request error:', error);
        onMessageToast({
          message: error instanceof Error ? error.message : 'A2D2 처리 중 오류가 발생했습니다',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      onMessageToast({
        message: error instanceof Error ? error.message : '오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      setIsSubmitting(false);
    }
  };
  const resetModalState = () => {
    setFileNames([]);
    setFileStatuses({});
    setIsDragging(false);
    setValue('Listfile', [] as unknown as File[]);
    setValue('title', '');
    setValue('client', '');
    setIsSubmitting(false);
    setFailedFiles([]);
    setFailedFileErrors({});
    setProjectCreated(''); // 프로젝트 ID 초기화
    setCivilCaseCreatedId('');
    setCivilProjectCreatedId('');
    setTrialLevel(1);
    setIsPlaintiff(true);
    setErrorModalOpen(false);
    setErrorMessage('');
  };

  useEffect(() => {
    // 모달이 열릴 때 항상 초기화
    if (isOpen) {
      resetModalState();
    } else {
      resetModalState();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`fixed inset-0 z-[99] flex items-center justify-center bg-[#999] bg-opacity-80 ${isOpen ? '' : 'hidden'}`}>
      <div className='relative max-h-[95vh] overflow-y-auto rounded-[16px] bg-[#fff] p-[32px] lg:max-w-[500px]'>
        <div className='flex items-center justify-between'>
          <div className='text-[24px] font-bold'>신규사건 등록</div>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setCaseTypeTab('criminal')}
              className={`h-[32px] rounded-full px-3 text-[13px] font-medium ${
                caseTypeTab === 'criminal' ? 'bg-[#004AA4] text-white' : 'bg-[#F4F4F5] text-[#3F3F46]'
              }`}
            >
              형사
            </button>
            <button
              type='button'
              onClick={() => setCaseTypeTab('civil')}
              className={`h-[32px] rounded-full px-3 text-[13px] font-medium ${
                caseTypeTab === 'civil' ? 'bg-[#004AA4] text-white' : 'bg-[#F4F4F5] text-[#3F3F46]'
              }`}
            >
              민사
            </button>
          </div>
        </div>
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
              className='mt-2 h-[56px] w-[361px] rounded-lg border border-[#E5E5E5] pl-[16px] text-[14px] font-bold placeholder:font-medium placeholder:text-[#BABABA]'
              placeholder='사건명을 입력해주세요'
              maxLength={80}
            />
            {caseTypeTab === 'civil' && (
              <div className='mt-3 flex gap-2'>
                {([1, 2, 3] as const).map((level) => (
                  <button
                    key={level}
                    type='button'
                    onClick={() => setTrialLevel(level)}
                    className={`h-[34px] w-[109px] rounded-[8px] border text-[13px] font-medium transition-colors ${
                      trialLevel === level
                        ? 'border-[#004AA4] bg-[#004AA4] text-white'
                        : 'border-[#E5E5E5] bg-white text-[#3F3F46] hover:border-[#004AA4] hover:text-[#004AA4]'
                    }`}
                  >
                    {level}심
                  </button>
                ))}
              </div>
            )}
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
              className='mt-2 h-[56px] w-[361px] rounded-lg border border-[#E5E5E5] pl-[16px] text-[14px] font-bold placeholder:font-medium placeholder:text-[#BABABA]'
              placeholder='의뢰인을 입력해주세요'
              maxLength={50}
            />
            {caseTypeTab === 'civil' && (
              <div className='mt-3 flex gap-2'>
                <button
                  type='button'
                  onClick={() => setIsPlaintiff(true)}
                  className={`h-[34px] w-[174px] rounded-[8px] border text-[13px] font-medium transition-colors ${
                    isPlaintiff
                      ? 'border-[#004AA4] bg-[#004AA4] text-white'
                      : 'border-[#E5E5E5] bg-white text-[#3F3F46] hover:border-[#004AA4] hover:text-[#004AA4]'
                  }`}
                >
                  원고
                </button>
                <button
                  type='button'
                  onClick={() => setIsPlaintiff(false)}
                  className={`h-[34px] w-[174px] rounded-[8px] border text-[13px] font-medium transition-colors ${
                    !isPlaintiff
                      ? 'border-[#004AA4] bg-[#004AA4] text-white'
                      : 'border-[#E5E5E5] bg-white text-[#3F3F46] hover:border-[#004AA4] hover:text-[#004AA4]'
                  }`}
                >
                  피고
                </button>
              </div>
            )}
          </div>
          {caseTypeTab === 'civil' && (
            <>
              <div className='pt-[24px]'>
                <label
                  className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  민사 파일
                </label>
                <div className='flex items-center justify-between'>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
                    파일을 업로드 해주세요.
                  </p>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
                    예) 민사파일.pdf
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
                        <button
                          type='button'
                          className='cursor-pointer text-[14px] text-[#0050B3] underline'
                          onClick={() => civilInputFileRef.current?.click()}
                        >
                          파일 선택하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={civilInputFileRef}
                type='file'
                multiple
                accept='.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.csv'
                className='sr-only'
                onChange={handleFileInputChange}
              />
              {/* 업로드된 파일 갯수와 전체 삭제 버튼 */}
              <div className=''>
                {fileNames.length > 0 && (
                  <div className='mt-4 flex w-full items-center justify-between'>
                    <div className='w-full text-[14px] text-[#000]'>업로드된 파일 {fileNames.length}개</div>
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
              <div className='mt-[24px]'>
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
                                {String(name ?? '')
                                  .toLowerCase()
                                  .endsWith('.pdf') ? (
                                  <img src={PdfImg} alt='pdf' className='mr-2 h-[25px] w-[25px]' />
                                ) : (
                                  <FileIcon className='mr-2 h-[25px] w-[25px] flex-shrink-0 text-[#666]' />
                                )}
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
            </>
          )}

          {caseTypeTab === 'criminal' && (
            <>
              <div className='pt-[24px]'>
                <label
                  className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  공소장
                </label>
                <div className='flex items-center justify-between'>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
                    파일을 업로드 해주세요.
                  </p>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
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
                        <button
                          type='button'
                          className='cursor-pointer text-[14px] text-[#0050B3] underline'
                          onClick={() => criminalIndictmentInputFileRef.current?.click()}
                        >
                          파일 선택하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={criminalIndictmentInputFileRef}
                type='file'
                multiple
                accept='.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.csv'
                className='sr-only'
                onChange={handleFileInputChange}
              />
              <div className='pt-[24px]'>
                <label
                  className={`block text-[#5B5B5B] ${getFontSizeClass(14, fontSizeAdjustment)}`}
                  style={{ fontSize: `${getAdjustedSize(14)}px` }}
                >
                  증거기록
                </label>
                <div className='flex items-center justify-between'>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
                    <strong className='text-[#1890FF]'>증거목록</strong>이 포함된 파일을 업로드 해주세요
                  </p>
                  <p
                    className={`text-[#8E8E8E] ${getFontSizeClass(12, fontSizeAdjustment)}`}
                    style={{ fontSize: `${getAdjustedSize(12)}px` }}
                  >
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
                        <button
                          type='button'
                          className='cursor-pointer text-[14px] text-[#0050B3] underline'
                          onClick={() => criminalEvidenceInputFileRef.current?.click()}
                        >
                          파일 선택하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={criminalEvidenceInputFileRef}
                type='file'
                multiple
                accept='.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.csv'
                className='sr-only'
                onChange={handleFileInputChange}
              />
              {/* 업로드된 파일 갯수와 전체 삭제 버튼 */}
              <div className=''>
                {fileNames.length > 0 && (
                  <div className='mt-4 flex w-full items-center justify-between'>
                    <div className='w-full text-[14px] text-[#000]'>업로드된 파일 {fileNames.length}개</div>
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
              <div className='mt-[24px]'>
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
                                {String(name ?? '')
                                  .toLowerCase()
                                  .endsWith('.pdf') ? (
                                  <img src={PdfImg} alt='pdf' className='mr-2 h-[25px] w-[25px]' />
                                ) : (
                                  <FileIcon className='mr-2 h-[25px] w-[25px] flex-shrink-0 text-[#666]' />
                                )}
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
            </>
          )}
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
            {isSubmitting ? '등록 중...' : caseTypeTab === 'civil' ? '민사 등록' : '사건 등록'}
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
