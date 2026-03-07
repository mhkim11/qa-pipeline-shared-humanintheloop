import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaExclamationCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

import { useModifyOriginalFileName, useDownloadOriginalFile, useDownloadSplitFile } from '@hooks/react-query/mutation/evidence';
import { useSplitAndOcrRequest } from '@hooks/react-query/mutation/evidence/use-split-evidence-ocr';
import { globalStore, loginAtom } from '@atoms/default';
import { useFindOriginalEvidence, useSplitOcrEvidence } from '@query/query';
import { BACKEND_URL } from '@constants/index';
import { fetchGetEvidenceOriginalName } from '@/apis/evidence-admin-api';
import ModalSelect from '@/components/common/modal/modal-select';
import { OriginalUploadModal } from '@/components/evidence/admin/modal/admin-original-upload-modal';
import { EvidencePagination } from '@/components/evidence/pagination/evidence-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onMessageToast } from '@/components/utils';

interface IEvidenceUploadTableProps {
  selectedProjectId: string;
  selectedOfficeId: string;
  officeName?: string;
  projectName?: string;
  projectDate?: string;
}

// 파일명과 확장자 분리 함수 추가
const splitFileName = (fullName: string) => {
  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex === -1) return { name: fullName, extension: '' };
  return {
    name: fullName.substring(0, lastDotIndex),
    extension: fullName.substring(lastDotIndex),
  };
};

export const EvidenceUploadTable = ({
  selectedProjectId,
  selectedOfficeId,
  officeName,
  projectName,
  projectDate,
}: IEvidenceUploadTableProps): JSX.Element => {
  const [editFileNameRow, setEditFileNameRow] = useState<string | null>(null); // 수정 중인 행의 ID
  const [updatedFileName, setUpdatedFileName] = useState<string>(''); // 업데이트할 파일명

  const [selectedSplitFileIds, setSelectedSplitFileIds] = useState<string[]>([]);
  const [isOriginalUploadModalOpen, setIsOriginalUploadModalOpen] = useState(false);

  const [isPolling, setIsPolling] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<{ fileId: string; projectId: string }[]>([]);
  const [originalFileNames, setOriginalFileNames] = useState<Array<{ file_id: string; file_nm: string }>>([]);
  const [selectedOriginalFile, setSelectedOriginalFile] = useState<string>('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloadProgress, setZipDownloadProgress] = useState<{ loaded: number; total?: number; done?: boolean } | null>(null);
  const zipProgressLastUpdateMsRef = useRef(0);

  // `/admin/project/original/filename/:project_id` 과도 호출 방지:
  // - 프로젝트당 1회 로딩 후 캐시
  // - 파일명 변경/OCR 완료 등 “실제 변경 이벤트”에서만 강제 리프레시
  const originalNamesInFlightRef = useRef(false);
  const lastOriginalNamesProjectIdRef = useRef<string>('');

  const refreshOriginalFileNames = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!selectedProjectId) return;
      if (!force && lastOriginalNamesProjectIdRef.current === selectedProjectId && originalFileNames.length > 0) return;
      if (originalNamesInFlightRef.current) return;

      originalNamesInFlightRef.current = true;
      try {
        const response = await fetchGetEvidenceOriginalName(selectedProjectId);
        if (response?.success) {
          setOriginalFileNames(response.data);
          lastOriginalNamesProjectIdRef.current = selectedProjectId;
        }
      } catch (error) {
        console.error('파일 이름 가져오기 에러:', error);
      } finally {
        originalNamesInFlightRef.current = false;
      }
    },
    [selectedProjectId, originalFileNames.length],
  );

  // ! 페이지네이션 관련상태
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const itemsPerPageOptions = [50, 100, 150, 200];

  // ZIP 파일명 생성 함수
  const generateZipFileName = () => {
    if (!projectDate || !officeName || !projectName) {
      return `[${new Date().toISOString().split('T')[0]}] ${officeName}_${projectName}.zip`;
    }

    // 사건 생성일에서 월일 추출 (mmdd 형식)
    const date = new Date(projectDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const mmdd = `${month}${day}`;

    // [mmdd업로드] 로펌명_사건명.zip 형식
    return `[${mmdd}업로드] ${officeName}_${projectName}.zip`;
  };

  // 초기 리스트 API
  const { response: OriginallistEvidenceOutput, refetch } = useFindOriginalEvidence({
    office_id: selectedOfficeId,
    project_id: selectedProjectId,
    page_no: 1,
    block_cnt: 1000,
  });
  const selectedOriginalFileName = useMemo(() => {
    if (!selectedOriginalFile) return '';
    return originalFileNames.find((f) => f.file_id === selectedOriginalFile)?.file_nm || '';
  }, [selectedOriginalFile, originalFileNames]);

  // OCR 결과 API (split-files)
  const { response: SplitOcrEvidenceOutput, refetch: refetchSplitOcrEvidence } = useSplitOcrEvidence({
    office_id: selectedOfficeId,
    project_id: selectedProjectId,
    file_nm: selectedOriginalFile ? selectedOriginalFileName : '',
    page_no: selectedPage,
    block_cnt: itemsPerPage,
  });

  const { onModifyOriginalFileName, isPending } = useModifyOriginalFileName(); // 파일명 수정 Hook
  const { onDownloadOriginalFile, isPending: isDownloading } = useDownloadOriginalFile(); // 다운로드 Hook
  const { onSplitAndOcrRequest, isPending: isSplitting } = useSplitAndOcrRequest(); // 분할 및 OCR 요청 Hook
  const { onDownloadSplitFile, isPending: isDownloadingSplit } = useDownloadSplitFile();

  // 선택된 파일들의 총 용량 계산 (UI 표시용)

  const selectedFilesInfo = useMemo(() => {
    if (!OriginallistEvidenceOutput?.data?.files || selectedFiles.length === 0) {
      return { count: 0, totalSize: 0, totalSizeMB: 0 };
    }

    const toBytes = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const totalSize = selectedFiles.reduce((sum, selected) => {
      const fileData = OriginallistEvidenceOutput.data.files.find((file) => file.file_id === selected.fileId);
      return sum + toBytes(fileData?.file_size);
    }, 0);

    const totalSizeMB = totalSize / (1024 * 1024);

    return {
      count: selectedFiles.length,
      totalSize,
      totalSizeMB,
    };
  }, [selectedFiles, OriginallistEvidenceOutput?.data?.files]);

  useEffect(() => {
    if (SplitOcrEvidenceOutput) {
      /* console.log('SplitOcrEvidenceOutput:', SplitOcrEvidenceOutput);
      console.log('Files available:', SplitOcrEvidenceOutput?.data?.files?.length); */
      if (SplitOcrEvidenceOutput?.data?.files) {
        /*      console.log('First file name:', SplitOcrEvidenceOutput.data.files[0]?.file_nm); */
      }
    }
  }, [SplitOcrEvidenceOutput]);

  const handleFileNameSave = async (fileId: string, projectId: string, oldFileName: string) => {
    // 파일명이 변경되지 않았으면 편집 모드 종료
    if (!updatedFileName || updatedFileName === oldFileName) {
      setEditFileNameRow(null);
      setUpdatedFileName('');
      return;
    }

    try {
      const response = await onModifyOriginalFileName({
        file_id: fileId,
        project_id: projectId,
        new_file_nm: updatedFileName,
      });

      if (response?.isSuccess) {
        onMessageToast({
          message: '파일명이 성공적으로 수정되었습니다.',
        });

        setOriginalFileNames((prev) => prev.map((file) => (file.file_id === fileId ? { ...file, file_nm: updatedFileName } : file)));

        // 파일명 목록 최신화 (중복 호출 방지 로직 포함)
        refreshOriginalFileNames({ force: true });
        refetch(); // 테이블 데이터 새로고침
        // split-files는 queryKey(선택 파일/페이지) 변경으로 자동 갱신되며,
        // 파일명 변경 직후 즉시 반영이 필요할 때만 수동 refetch
        refetchSplitOcrEvidence();
      } else {
        onMessageToast({
          message: '파일명 수정에 실패했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('파일명 수정 중 오류:', error);
      onMessageToast({
        message: '파일명 수정 중 오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    } finally {
      // 편집 상태 초기화
      setEditFileNameRow(null);
      setUpdatedFileName('');
    }
  };
  // 파일명 수정 버튼 클릭 핸들러 수정
  const handleEditClick = (fileId: string, fullFileName: string) => {
    const { name } = splitFileName(fullFileName);
    setEditFileNameRow(fileId);
    setUpdatedFileName(name); // 확장자를 제외한 파일명만 설정
  };
  // 체크박스 변경 핸들러
  const handleCheckboxChange = (fileId: string, projectId: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      const exists = prevSelectedFiles.some((file) => file.fileId === fileId);
      if (exists) {
        return prevSelectedFiles.filter((file) => file.fileId !== fileId); // 선택 해제
      }
      return [...prevSelectedFiles, { fileId, projectId }]; // 선택 추가
    });
  };
  const handlePageChange = (page: number) => {
    setSelectedPage(page);
    // page_no 변경으로 split-files query가 자동 갱신됨 (불필요한 수동 refetch 제거)
  };
  const handlePageMove = () => {
    const totalPages = SplitOcrEvidenceOutput?.data?.pagination?.total_pages || 1;
    if (selectedPage < 1 || selectedPage > totalPages) {
      onMessageToast({
        message: `1 ~ ${totalPages} 사이의 숫자를 입력해주세요.`,
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    refetchSplitOcrEvidence();
  };

  const handleDownloadFiles = async () => {
    if (selectedFiles.length === 0) {
      onMessageToast({
        message: '선택된 파일이 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    const fileIds = selectedFiles.map((file) => file.fileId).filter((id) => id && id.length > 0);

    if (fileIds.length === 0) {
      onMessageToast({
        message: '유효한 파일 ID가 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    try {
      // 1개 파일: 기존 API 사용
      if (selectedFiles.length === 1) {
        console.log('1개 파일 다운로드 - 기존 API 사용');
        const data = await onDownloadOriginalFile({
          file_ids: fileIds,
          project_id: selectedFiles[0].projectId,
        });

        if (data?.success) {
          const files = data.data;

          for (const file of files) {
            if (file.url) {
              const link = document.createElement('a');
              link.href = file.url;

              let downloadFileName = file.file_nm || '';
              const extension = 'pdf';
              if (!downloadFileName.toLowerCase().endsWith(`.${extension}`)) {
                downloadFileName = `${downloadFileName}.${extension}`;
              }

              link.setAttribute('download', downloadFileName);
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener noreferrer');

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
              console.error('다운로드 URL이 없습니다:', file);
            }
          }

          onMessageToast({
            message: '파일이 성공적으로 다운로드되었습니다.',
          });
        } else {
          onMessageToast({
            message: '파일 다운로드에 실패했습니다.',
            icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
          });
        }
      } else {
        // 2개 이상 파일: 압축파일 다운로드
        setIsDownloadingZip(true);
        // UI 퍼센트는 "선택된 원본 파일 용량 합" 기준으로 표시한다.
        const expectedTotalBytes = (() => {
          const files = OriginallistEvidenceOutput?.data?.files ?? [];
          if (!files.length) return 0;
          const selectedIds = new Set(selectedFiles.map((x) => x.fileId));
          return files.reduce((sum, f: any) => {
            if (!selectedIds.has(f.file_id)) return sum;
            const n = Number(f.file_size);
            return sum + (Number.isFinite(n) ? n : 0);
          }, 0);
        })();
        setZipDownloadProgress({ loaded: 0, total: expectedTotalBytes || undefined, done: false });
        try {
          const isAllSelected =
            (OriginallistEvidenceOutput?.data?.files?.length ?? 0) > 0 &&
            selectedFiles.length === (OriginallistEvidenceOutput?.data?.files?.length ?? 0);

          const downloadParams = {
            office_id: selectedOfficeId,
            project_id: selectedProjectId,

            file_ids: isAllSelected ? [] : fileIds,
            is_all: isAllSelected ? 'Y' : 'N',
          };

          const login = globalStore.get(loginAtom);
          const accessToken = login?.data?.accessToken ?? '';
          if (!accessToken) throw new Error('인증 토큰이 없습니다.');

          const apiUrl = `${BACKEND_URL}/admin/project/file/original/download/zip/stream`;
          const res = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
              Accept: 'application/zip, application/octet-stream',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(downloadParams),
          });

          if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(txt || `ZIP 다운로드 실패 (status: ${res.status})`);
          }

          const reader = res.body?.getReader();
          if (!reader) {
            // fallback: body reader가 없으면 blob으로 처리(진행률은 갱신 불가)
            const blob = await res.blob();
            const urlObj = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlObj;
            link.setAttribute('download', generateZipFileName());
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlObj);

            onMessageToast({
              message: isAllSelected ? '전체 파일이 압축파일로 다운로드되었습니다.' : '선택된 파일들이 압축파일로 다운로드되었습니다.',
            });
            return;
          }

          let loaded = 0;
          // Netlify(TS/lib.dom) 환경에서 BlobPart 타입 호환을 위해 ArrayBuffer로 축적
          const chunks: ArrayBuffer[] = [];
          // throttle state updates (avoid too many re-renders)
          const shouldUpdate = () => {
            const now = Date.now();
            if (now - zipProgressLastUpdateMsRef.current < 120) return false;
            zipProgressLastUpdateMsRef.current = now;
            return true;
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              // slice()는 복사본(=ArrayBuffer 기반)을 만들어 SharedArrayBuffer/ArrayBufferLike 이슈를 회피
              const copied = value.slice();
              chunks.push(copied.buffer as ArrayBuffer);
              loaded += value.byteLength;
              if (shouldUpdate()) {
                setZipDownloadProgress((prev) => ({
                  loaded,
                  total: prev?.total,
                  done: false,
                }));
              }
            }
          }

          // final update
          setZipDownloadProgress((prev) => ({
            loaded,
            total: prev?.total,
            done: true,
          }));

          const blob = new Blob(chunks, { type: 'application/zip' });
          const urlObj = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = urlObj;
          link.setAttribute('download', generateZipFileName());
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(urlObj);

          onMessageToast({
            message: isAllSelected ? '전체 파일이 압축파일로 다운로드되었습니다.' : '선택된 파일들이 압축파일로 다운로드되었습니다.',
          });
        } catch (zipError) {
          console.error('압축 파일 다운로드 오류:', zipError);
          onMessageToast({
            message: '압축 파일 다운로드 중 오류가 발생했습니다.',
            icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
          });
        } finally {
          setIsDownloadingZip(false);
          setZipDownloadProgress(null);
        }
      }
    } catch (error) {
      console.error('파일 다운로드 오류 상세:', error);
      onMessageToast({
        message: '파일 다운로드 중 오류가 발생했습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    }
  };
  const handleSplitAndOcr = async () => {
    console.log('handleSplitAndOcr 함수 시작');
    try {
      setIsPolling(false); // 기존 폴링 중지
      console.log('폴링 중지됨');

      const result = await onSplitAndOcrRequest({
        office_id: selectedOfficeId,
        project_id: selectedProjectId,
      });

      console.log('OCR 요청 결과:', result);

      if (result?.isSuccess) {
        onMessageToast({
          message: '페이지 분리 및 OCR 처리가 시작되었습니다.',
        });

        setIsPolling(true); // 폴링 시작

        // 즉시 데이터 새로고침하여 상태 업데이트
        await refetch();
      } else {
        // API 응답에서 에러 메시지 추출
        const errorMessage = result?.message || '페이지 분리 및 OCR 요청에 실패했습니다.';
        console.log('OCR 요청 실패:', errorMessage);

        onMessageToast({
          message: errorMessage,
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    } catch (error) {
      console.error('페이지 분리 및 OCR 오류:', error);

      // 에러 메시지 추출
      let errorMessage = '페이지 분리 및 OCR 요청 중 오류가 발생했습니다.';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }

      onMessageToast({
        message: errorMessage,
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
    }
  };

  // OCR 실패 상태 확인 함수 - 오직 job_status만 확인
  const isOcrFailed = useCallback(() => {
    if (!OriginallistEvidenceOutput?.data.files || OriginallistEvidenceOutput.data.files.length === 0) {
      return false;
    }

    // 모든 파일이 완료되었는지 확인
    const allCompleted = OriginallistEvidenceOutput.data.files.every(
      (file) => file.job_status === 'COMPLETED' && Number(file.ocr_completed_count) === Number(file.page_count),
    );

    // 모든 파일이 완료되었으면 실패 상태가 아님
    if (allCompleted) {
      return false;
    }

    // 그렇지 않으면 FAILED 상태인 파일이 있는지 확인
    const hasOriginalFileFailed = OriginallistEvidenceOutput.data.files.some((file) => file.job_status === 'FAILED');
    return hasOriginalFileFailed;
  }, [OriginallistEvidenceOutput?.data.files]);

  // 현재 파일들의 상태를 직접 체크하여 진행 중인지 확인
  const hasActiveOcrFiles = () => {
    return (
      OriginallistEvidenceOutput?.data.files.some((file) => {
        // FAILED 상태가 아니고 진행 중인 상태들
        if (file.job_status === 'FAILED') {
          return false;
        }

        // PROCESSING 상태이면 진행 중
        if (file.job_status === 'PROCESSING') {
          return true;
        }

        // COMPLETED 상태이지만 아직 완료되지 않은 경우
        if (file.job_status === 'COMPLETED' && Number(file.ocr_completed_count) < Number(file.page_count)) {
          return true;
        }

        return false;
      }) || false
    );
  };

  // OCR 상태에 따른 텍스트와 스타일 반환 함수 - 오직 job_status만 확인
  const getOcrStatusDisplay = (
    jobStatus: string | undefined,
    ocrRequested: boolean,
    completedCount: number,
    totalCount: number,
    fileId?: string,
  ) => {
    console.log('fileId', fileId);
    console.log('ocrRequested:', ocrRequested);
    // job_status에 따른 상태 표시
    switch (jobStatus) {
      case 'FAILED':
        return { text: '실패', className: 'text-red-500' };
      case 'PENDING':
        return { text: '대기', className: 'text-yellow-500' };
      case 'PROCESSING':
        return { text: '진행중', className: 'text-blue-500' };
      case 'COMPLETED':
        // 모든 페이지가 처리되었는지 확인
        return completedCount === totalCount
          ? { text: '완료', className: 'text-green-500' }
          : { text: '진행중', className: 'text-blue-500' };
      default:
        return { text: '대기', className: 'text-gray-500' };
    }
  };

  const convertBytesToMB = (bytes: number): string => {
    return (bytes / 1048576).toFixed(2); // 소수점 둘째 자리까지 변환
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = SplitOcrEvidenceOutput?.data?.files?.map((file) => file.split_file_id) || [];
      setSelectedSplitFileIds(allIds);
    } else {
      setSelectedSplitFileIds([]);
    }
  };

  // 개별 항목 선택 핸들러
  const handleSelectItem = (splitFileId: string) => {
    setSelectedSplitFileIds((prev) => {
      if (prev.includes(splitFileId)) {
        return prev.filter((id) => id !== splitFileId);
      } else {
        return [...prev, splitFileId];
      }
    });
  };
  // PDF 보기 함수 추가
  const handleViewPDF = (split_file_id: string) => {
    if (!split_file_id) {
      onMessageToast({
        message: 'PDF 파일 정보가 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }
    window.open(`/admin/evidence/pdf/${split_file_id}?projectId=${selectedProjectId}&officeId=${selectedOfficeId}`, '_blank');
  };

  const handleFileSelectChange = (newValue: string) => {
    // 'all' 값인 경우 빈 문자열로 변환
    const fileId = newValue === 'all' ? '' : newValue;

    const selectedFile = originalFileNames.find((f) => f.file_id === fileId);
    console.log('Found selected file in handleFileSelect:', selectedFile);

    if (selectedFile) {
      // console.log('Setting file name for API:', selectedFile.file_nm);
      setSelectedOriginalFile(fileId);
      setSelectedPage(1);
    } else {
      setSelectedOriginalFile('');
      setSelectedPage(1);
    }
  };

  // selectedOriginalFile / selectedPage / itemsPerPage 변경 시 useSplitOcrEvidence가 자동으로 재조회하므로
  // 여기서의 수동 refetch는 제거 (split-files 과도 호출 방지)

  // 파일명 목록은 아래 polling/프로젝트 변경 effect에서 관리 (중복 effect 제거)

  const displayedFiles = useMemo(() => {
    const files = SplitOcrEvidenceOutput?.data?.files || [];

    if (!selectedOriginalFile) {
      return files;
    }

    const selectedFile = originalFileNames.find((f) => f.file_id === selectedOriginalFile);

    if (!selectedFile) {
      return files;
    }

    const filteredFiles = files.filter((file) => {
      const isMatch = file.file_nm === selectedFile.file_nm;
      /*  console.log('Comparing:', {
        file_nm: file.file_nm,
        selectedFileName: selectedFile.file_nm,
        isMatch,
      }); */
      return isMatch;
    });

    /*    console.log('Filtered files:', filteredFiles); */
    return filteredFiles;
  }, [SplitOcrEvidenceOutput?.data?.files, selectedOriginalFile, originalFileNames]);
  // OCR 보기 함수 추가
  const handleViewOCR = (split_file_id: string) => {
    if (!split_file_id) {
      onMessageToast({
        message: 'OCR 결과가 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // OCR 텍스트 뷰어 페이지로 이동
    window.open(`/admin/evidence/text/${split_file_id}?projectId=${selectedProjectId}&officeId=${selectedOfficeId}`, '_blank');
  };
  const handleDownloadSplitFiles = async () => {
    if (selectedSplitFileIds.length === 0) {
      onMessageToast({
        message: '다운로드할 파일을 선택해주세요.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    // 전체 선택 케이스 처리 추가
    const fileIdsToDownload = selectedOriginalFile
      ? selectedSplitFileIds.filter((splitFileId) => {
          const splitFile = SplitOcrEvidenceOutput?.data?.files?.find((file) => file.split_file_id === splitFileId);
          // 선택된 원본 파일에 해당하는 분할 파일만 필터링
          return splitFile?.file_nm === originalFileNames.find((f) => f.file_id === selectedOriginalFile)?.file_nm;
        })
      : selectedSplitFileIds; // 전체 선택일 경우 모든 선택된 ID 사용

    if (fileIdsToDownload.length === 0) {
      onMessageToast({
        message: '다운로드할 파일이 없습니다.',
        icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
      });
      return;
    }

    for (const splitFileId of fileIdsToDownload) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const result = await onDownloadSplitFile({
          office_id: selectedOfficeId,
          project_id: selectedProjectId,
          split_file_ids: [splitFileId],
        });

        if (!result.success) {
          onMessageToast({
            message: `파일 다운로드 실패: ${splitFileId}`,
            icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
          });
        }
      } catch (error) {
        console.error('Download error:', error);
        onMessageToast({
          message: '파일 다운로드 중 오류가 발생했습니다.',
          icon: <FaExclamationCircle className='h-5 w-5 text-yellow-500' />,
        });
      }
    }

    onMessageToast({
      message: '모든 파일 다운로드가 완료되었습니다.',
    });
  };
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(() => {
        refetch(); // 데이터 새로고침

        // 모든 파일의 OCR이 완료되었는지 확인
        const allCompleted = OriginallistEvidenceOutput?.data.files.every(
          (file) => file.job_status === 'COMPLETED' && Number(file.ocr_completed_count) === Number(file.page_count),
        );

        if (allCompleted) {
          setIsPolling(false); // 모든 작업이 완료되면 폴링 중지
          setSuccessMessage('OCR 작업이 완료되었습니다.');
          setSuccessModalOpen(true);
          refetchSplitOcrEvidence();
          // OCR 완료 후 파일 이름 목록 새로고침 (중복 호출 방지 로직 포함)
          refreshOriginalFileNames({ force: true });
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, OriginallistEvidenceOutput?.data.files, refetch, refetchSplitOcrEvidence, refreshOriginalFileNames, selectedProjectId]);

  // 프로젝트 선택 시 원본 파일명 목록은 1회만 로딩 (폴링 상태 변화로 재호출하지 않음)
  useEffect(() => {
    if (!selectedProjectId) return;
    refreshOriginalFileNames({ force: true });
  }, [selectedProjectId, refreshOriginalFileNames]);

  // (removed) hasCompletedFiles: "추가업로드" 표시가 is_new만 보도록 변경되어 더 이상 사용하지 않음

  const isOcrInProgress = () => {
    // 원본 파일의 job_status만 체크
    return (
      OriginallistEvidenceOutput?.data.files.some((file) => {
        return (
          file.job_status === 'PROCESSING' ||
          (file.job_status === 'COMPLETED' && Number(file.ocr_completed_count) < Number(file.page_count))
        );
      }) || false
    );
  };
  useEffect(() => {
    const checkOcrStatusAndStartPolling = () => {
      if (OriginallistEvidenceOutput?.data?.files) {
        // 원본 파일의 job_status만 체크
        const isInProgress = OriginallistEvidenceOutput.data.files.some((file) => {
          return (
            file.job_status === 'PROCESSING' ||
            (file.job_status === 'COMPLETED' && Number(file.ocr_completed_count) < Number(file.page_count))
          );
        });

        if (isInProgress && !isPolling) {
          setIsPolling(true);
        }
      }
    };

    checkOcrStatusAndStartPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
        checkOcrStatusAndStartPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [OriginallistEvidenceOutput?.data?.files, isPolling, refetch]);

  useEffect(() => {
    if (SplitOcrEvidenceOutput?.data?.files) {
      console.log('SplitOcrEvidenceOutput changed:', {
        totalFiles: SplitOcrEvidenceOutput.data.files.length,
        selectedFile: selectedOriginalFile,
        displayedFiles: displayedFiles.length,
        firstFile: SplitOcrEvidenceOutput.data.files[0]?.file_nm,
      });
    }
  }, [SplitOcrEvidenceOutput, selectedOriginalFile, displayedFiles]);

  useEffect(() => {
    if (selectedOriginalFile) {
      const selectedFile = originalFileNames.find((f) => f.file_id === selectedOriginalFile);
      console.log('Current selected file:', selectedFile);
    }
  }, [originalFileNames, selectedOriginalFile]);

  return (
    <div className='max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide'>
      <Tooltip
        id='admin-upload-filename-tooltip'
        place='top'
        delayShow={0}
        offset={8}
        style={{
          backgroundColor: '#111827',
          color: '#FFFFFF',
          fontSize: '12px',
          padding: '6px 8px',
          borderRadius: '6px',
          zIndex: 99999,
          maxWidth: '520px',
          wordBreak: 'break-word',
        }}
      />
      <div className='mt-10'>
        <div className='mt-6 flex items-center justify-between'>
          <div className='flex text-[20px] font-bold'>
            사용자가 업로드한 원본파일
            <p>(총 </p>
            <p className='pl-1 font-bold text-blue-500'> {OriginallistEvidenceOutput?.data.files.length}</p>
            <p>개 파일)</p>
          </div>

          <div className='flex items-center justify-between'>
            <div className='mr-4 flex'>
              {selectedFilesInfo.count > 0 && (
                <div className='text-md text-gray-600'>
                  선택된 파일: <span className='font-semibold text-blue-500'>{selectedFilesInfo.count}개</span>
                </div>
              )}
              {selectedFilesInfo.count > 0 && (
                <div className='text-md ml-2 text-gray-600'>용량: {selectedFilesInfo.totalSizeMB.toFixed(2)}MB</div>
              )}
            </div>
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={handleDownloadFiles}
                disabled={isDownloading || isDownloadingZip}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isDownloadingZip ? 'cursor-not-allowed bg-gray-300' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {isDownloading || isDownloadingZip ? '다운로드 중...' : '다운로드'}
              </button>

              <button
                type='button'
                onClick={() => {
                  handleSplitAndOcr();
                }}
                disabled={isSplitting || (hasActiveOcrFiles() && !isOcrFailed())}
                className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isOcrFailed() ? 'bg-[#F5222D] hover:bg-red-600' : 'bg-sky-400 hover:bg-sky-500'
                }`}
              >
                {isSplitting
                  ? '진행 중...'
                  : isOcrFailed()
                    ? '페이지 분리 및 OCR 재진행'
                    : isOcrInProgress() || isPolling || hasActiveOcrFiles()
                      ? 'OCR 진행 중...'
                      : '페이지 분리 및 OCR 진행'}
              </button>
              <button
                type='button'
                onClick={() => setIsOriginalUploadModalOpen(true)}
                disabled={(isOcrInProgress() || isPolling || hasActiveOcrFiles()) && !isOcrFailed()}
                className={`block rounded-md border px-3 py-2 text-center text-sm font-semibold ${
                  (isOcrInProgress() || isPolling || hasActiveOcrFiles()) && !isOcrFailed()
                    ? 'cursor-not-allowed border-gray-300 text-gray-300'
                    : 'border-sky-400 text-sky-400 hover:bg-sky-500 hover:text-white'
                }`}
              >
                원본 파일 업로드
              </button>
            </div>
          </div>
        </div>

        <div className='mt-4 flow-root'>
          <div className='-mx-4 -my-2 sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
              <div className='max-h-[400px] overflow-auto ring-1 ring-black/5 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead className='sticky top-0 z-10 bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='min-w-[50px] max-w-[50px] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                      >
                        <input
                          type='checkbox'
                          className='form-checkbox h-4 w-4 text-sky-600'
                          onChange={(e) => {
                            // 모든 체크박스 선택/해제
                            if (e.target.checked) {
                              // 체크된 상태로 전체 추가
                              setSelectedFiles(
                                OriginallistEvidenceOutput?.data.files.map((file) => ({
                                  fileId: file.file_id,
                                  projectId: file.project_id,
                                })) || [],
                              );
                            } else {
                              // 전체 해제
                              setSelectedFiles([]);
                            }
                          }}
                          checked={selectedFiles.length === OriginallistEvidenceOutput?.data.files.length && selectedFiles.length > 0}
                        />
                      </th>
                      <th
                        scope='col'
                        className='min-w-[720px] max-w-[980px] px-3 py-3.5 text-left text-center text-sm font-semibold text-gray-900'
                      >
                        원본 파일명
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-center text-sm font-semibold text-gray-900'>
                        페이지 수
                      </th>
                      <th scope='col' className='px-3 py-3.5 text-left text-center text-sm font-semibold text-gray-900'>
                        용량
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {OriginallistEvidenceOutput?.data.files.map((list) => (
                      <tr key={list.file_id}>
                        <td className='min-w-[50px] max-w-[50px] whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                          <input
                            type='checkbox'
                            className='form-checkbox h-4 w-4 text-sky-600'
                            onChange={() => handleCheckboxChange(list.file_id, list.project_id)}
                            checked={selectedFiles.some((selected) => selected.fileId === list.file_id)}
                          />
                        </td>
                        {editFileNameRow === list.file_id ? (
                          <td className='w-full whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                            <input
                              type='text'
                              value={updatedFileName}
                              onChange={(e) => setUpdatedFileName(e.target.value)}
                              className='w-[90%] rounded-md border border-gray-300 p-1'
                              placeholder='새 파일명 입력'
                            />
                            <button
                              type='button'
                              onClick={() => handleFileNameSave(list.file_id, list.project_id, list.file_nm)}
                              className='ml-2 rounded-md bg-sky-500 px-2 py-1 text-xs text-white'
                              disabled={isPending}
                            >
                              {isPending ? '저장 중...' : '저장'}
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                setEditFileNameRow(null);
                                setUpdatedFileName('');
                              }}
                              className='ml-2 rounded-md bg-gray-500 px-2 py-1 text-xs text-white'
                            >
                              취소
                            </button>
                          </td>
                        ) : (
                          <td className='min-w-[720px] max-w-[980px] whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                            <div className='flex items-center justify-center'>
                              <div className='ml-3 flex w-full items-center justify-center'>
                                <span
                                  data-tooltip-id='admin-upload-filename-tooltip'
                                  data-tooltip-content={list.file_nm}
                                  className='block max-w-[860px] truncate'
                                >
                                  {splitFileName(list.file_nm).name}
                                </span>
                                {(() => {
                                  const isNew = (list as any)?.is_new;
                                  return isNew === true || isNew === 'true' || isNew === 1 || isNew === '1';
                                })() && (
                                  <>
                                    <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700'>
                                      추가업로드
                                    </span>
                                    {list.createdAt && (
                                      <span className='ml-2 text-xs font-medium text-blue-700'>
                                        ({new Date(list.createdAt).toLocaleDateString()})
                                      </span>
                                    )}
                                  </>
                                )}
                                <button
                                  type='button'
                                  onClick={() => handleEditClick(list.file_id, list.file_nm)}
                                  className='ml-[5%] block rounded-md bg-gray-500 px-3 py-2 text-center text-sm text-xs font-semibold text-white shadow-sm hover:bg-gray-600'
                                >
                                  파일명 수정
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className='min-w-[200px] max-w-[200px] whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                          {list.page_count}
                        </td>
                        <td className='min-w-[200px] max-w-[200px] whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                          {convertBytesToMB(list.file_size)} MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-10 flex items-center'>
        <h1 className='text-[20px] font-bold'>페이지 분리 및 OCR현황</h1>
      </div>

      <div className='mt-4 flow-root'>
        <div className='-mx-4 -my-2 sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
            <div className='max-h-[400px] overflow-auto ring-1 ring-black/5 sm:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='sticky top-0 z-10 bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='min-w-[720px] max-w-[980px] py-3.5 pl-4 pr-3 text-left text-center text-sm font-semibold text-gray-900 sm:pl-6'
                    >
                      원본 파일명
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-center text-sm font-semibold text-gray-900'>
                      작업페이지
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-center text-sm font-semibold text-gray-900'>
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {OriginallistEvidenceOutput?.data.files.map((list) => (
                    <tr key={list.file_id}>
                      <td className='min-w-[720px] max-w-[980px] py-3.5 pl-4 pr-3 text-left text-center text-sm font-semibold text-gray-900 sm:pl-6'>
                        <span
                          data-tooltip-id='admin-upload-filename-tooltip'
                          data-tooltip-content={list.file_nm}
                          className='block max-w-[860px] truncate'
                        >
                          {splitFileName(list.file_nm).name}
                        </span>
                      </td>
                      <td className='min-w-[200px] max-w-[200px] whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                        {list.ocr_completed_count}/{list.page_count}
                      </td>

                      <td className='min-w-[200px] max-w-[200px] whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500'>
                        <span
                          className={
                            getOcrStatusDisplay(
                              list.job_status,
                              list.ocrRequested,
                              Number(list.ocr_completed_count) || 0,
                              Number(list.page_count) || 0,
                              list.file_id,
                            ).className
                          }
                        >
                          {
                            getOcrStatusDisplay(
                              list.job_status,
                              list.ocrRequested,
                              Number(list.ocr_completed_count) || 0,
                              Number(list.page_count) || 0,
                              list.file_id,
                            ).text
                          }
                        </span>
                        {/*    {list.job_status === 'FAILED' && <div className='mt-1 text-xs text-red-500'>사유: {list.error_message}</div>} */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-10 flex w-full items-center justify-between'>
        <div className='flex w-full'>
          <h1 className='mr-4 text-[20px] font-bold'>페이지 분리 및 OCR결과</h1>
          <div className=''>
            <Select value={selectedOriginalFile || 'all'} onValueChange={handleFileSelectChange}>
              <SelectTrigger className='ml-3 h-[42px] min-w-[200px]'>
                <SelectValue placeholder='전체' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {originalFileNames &&
                  originalFileNames.length > 0 &&
                  originalFileNames.map((file) => (
                    <SelectItem key={file.file_id} value={file.file_id}>
                      {splitFileName(file.file_nm).name} {/* UI에는 확장자 없이 표시 */}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='mr-4 flex w-full items-center justify-end'>
          <button
            className={`rounded px-4 py-2 text-white ${isDownloadingSplit ? 'cursor-not-allowed bg-gray-400' : 'bg-[#0D99FFB2] hover:bg-[#0D99FF]'}`}
            onClick={handleDownloadSplitFiles}
            disabled={isDownloadingSplit}
          >
            {isDownloadingSplit ? '다운로드 중...' : '다운로드'}
          </button>
        </div>
      </div>

      <div className='mt-4 flow-root'>
        <div className='-mx-4 -my-2 sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
            <div className='max-h-[400px] overflow-auto shadow ring-1 ring-black/5 sm:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='sticky top-0 z-10 bg-gray-50'>
                  <tr>
                    <th scope='col' className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                      <input
                        type='checkbox'
                        className='form-checkbox h-4 w-4 text-sky-600'
                        onChange={handleSelectAll}
                        checked={
                          (SplitOcrEvidenceOutput?.data?.files?.length ?? 0) > 0 &&
                          selectedSplitFileIds.length === (SplitOcrEvidenceOutput?.data?.files?.length ?? 0)
                        }
                      />
                    </th>
                    <th scope='col' className='min-w-[720px] max-w-[980px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      원본 파일명
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      페이지 번호
                    </th>

                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      PDF
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      OCR
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {displayedFiles && displayedFiles.length > 0 ? (
                    displayedFiles.map((list: any) => (
                      <tr key={list.split_file_id}>
                        <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                          <input
                            type='checkbox'
                            className='form-checkbox h-4 w-4 text-sky-600'
                            checked={selectedSplitFileIds.includes(list.split_file_id)}
                            onChange={() => handleSelectItem(list.split_file_id)}
                          />
                        </td>
                        <td className='min-w-[720px] max-w-[980px] whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                          <div className='flex items-center'>
                            <span
                              data-tooltip-id='admin-upload-filename-tooltip'
                              data-tooltip-content={list.file_nm}
                              className='block max-w-[860px] truncate'
                            >
                              {splitFileName(list.file_nm).name}
                            </span>
                          </div>
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>{list.page_no}</td>

                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500 underline'>
                          <button
                            type='button'
                            onClick={() => handleViewPDF(list.split_file_id)}
                            disabled={!list.pdf_path}
                            className={`${list.pdf_path ? 'cursor-pointer underline' : 'cursor-not-allowed opacity-50'}`}
                          >
                            PDF보기
                          </button>
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500 underline'>
                          <button
                            type='button'
                            onClick={() => handleViewOCR(list.split_file_id)}
                            disabled={list.ocrStatus !== 'COMPLETED'}
                            className={`${list.ocrStatus == 'COMPLETED' ? 'cursor-pointer underline' : 'cursor-not-allowed opacity-50'}`}
                          >
                            OCR보기
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className='text-center text-gray-500'>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className='flex h-[78px] w-full items-center justify-center bg-white shadow-inner'>
        <div className='flex items-center justify-between'>
          <div className='ml-[56px] mr-[26px] text-sm'>전체 {SplitOcrEvidenceOutput?.data?.pagination?.total || 0}건</div>

          <div className='ml-[26px] flex items-center justify-center'>
            <input
              type='text'
              value={selectedPage}
              onChange={(e) => setSelectedPage(Number(e.target.value))}
              placeholder='페이지 번호 입력'
              className='h-[32px] w-[50px] rounded border border-[#C0D5DE] border-gray-400 p-2 text-center text-[14px] focus:border-[#2B7994] focus:outline-none focus:ring-0'
              min={1}
            />
            <span className='pl-[8px] pr-2 text-[14px]'>/</span>
            <span className='text-[14px]'>{SplitOcrEvidenceOutput?.data?.pagination?.total_pages || 1}</span>
            <button onClick={handlePageMove} className='ml-2 h-[32px] w-[50px] rounded border text-[14px] text-[#313131]'>
              이동
            </button>
          </div>

          <div className=''>
            <EvidencePagination
              currentPage={selectedPage}
              totalPages={SplitOcrEvidenceOutput?.data?.pagination?.total_pages || 1}
              onPageChange={handlePageChange}
            />
          </div>

          <div className='ml-[26px] flex items-center'>
            <Select
              value={itemsPerPage?.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setSelectedPage(1);
                // itemsPerPage/page_no 변경으로 split-files query가 자동 갱신됨
              }}
            >
              <SelectTrigger className='h-[32px] w-[120px]'>
                <SelectValue placeholder='페이지당 개수' />
              </SelectTrigger>
              <SelectContent className='w-[200px]'>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    <p className='text-[12px]'>{option}개씩 보기</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <OriginalUploadModal
        isOpen={isOriginalUploadModalOpen}
        onClose={() => setIsOriginalUploadModalOpen(false)}
        onSuccess={() => {
          setIsOriginalUploadModalOpen(false);
          refetch();
        }}
        projectId={selectedProjectId}
        officeId={selectedOfficeId}
      />
      {successModalOpen && (
        <ModalSelect
          sendMessage='작업 성공'
          storageMessage={successMessage}
          handleSave={() => setSuccessModalOpen(false)}
          setIsModalOpen={() => setSuccessModalOpen(false)}
          confirmButtonText='확인'
        />
      )}
      {/* 다운로드 중 로딩 모달 */}
      {isDownloadingZip && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75'>
          <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-[32px]'>
            <AiOutlineLoading3Quarters className='h-8 w-8 animate-spin text-[#004AA4]' />
            <p className='text-[16px] font-medium text-[#252525]'>다운로드 중입니다</p>
            <p className='text-center text-[14px] text-[#666666]'>
              압축파일 후 다운로드 되어
              <br />
              시간이 소요됩니다
            </p>
            {zipDownloadProgress ? (
              <div className='w-[320px]'>
                {(() => {
                  const totalBytes = zipDownloadProgress.total;
                  const pctRaw =
                    totalBytes && Number.isFinite(totalBytes) && totalBytes > 0 ? (zipDownloadProgress.loaded / totalBytes) * 100 : 0;
                  const pct = zipDownloadProgress.done ? 100 : Math.min(99, Math.max(0, pctRaw));
                  const pctText = `${pct.toFixed(0)}%`;
                  return (
                    <div className='h-[24px] w-full overflow-hidden rounded-[999px] bg-[#E4E4E7]'>
                      <div
                        className='relative flex h-full items-center justify-center bg-[#69C0FF] transition-[width] duration-100'
                        style={{ width: `${pct}%` }}
                        aria-label='download-progress'
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Number(pct.toFixed(0))}
                        role='progressbar'
                      >
                        <span className='whitespace-nowrap text-[12px] font-semibold text-white'>{pctText}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
