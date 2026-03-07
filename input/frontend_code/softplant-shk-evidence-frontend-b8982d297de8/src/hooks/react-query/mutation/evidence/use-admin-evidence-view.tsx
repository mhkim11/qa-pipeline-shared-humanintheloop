import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchViewAdminEvidenceDocument } from '@/apis';
import { TViewAdmimEvidenceFileInput } from '@/apis/type/evidence-admin.type';

type TUseViewAdminDocumentOutput = {
  isPending: boolean;
  onAdminViewDocument: (data: TViewAdmimEvidenceFileInput) => Promise<Blob | undefined>;
};

/**
 * * 문서 조회 뮤테이션 (PDF 보기)
 * @returns {TUseViewDocumentOutput} 문서 조회 결과
 */
export const useAdminViewAdminDocument = (): TUseViewAdminDocumentOutput => {
  // - useMutation을 사용하여 PDF 조회 요청
  const { mutateAsync, isPending } = useMutation<Blob, AxiosError, TViewAdmimEvidenceFileInput>({
    mutationFn: fetchViewAdminEvidenceDocument,
  });

  /**
   * * 문서 조회 함수
   * @param {TViewAdminDocumentInput} input 문서 조회 입력 데이터
   * @returns {Promise<Blob | undefined>} 문서 데이터 (바이너리)
   */
  const onAdminViewDocument = async (input: TViewAdmimEvidenceFileInput): Promise<Blob | undefined> => {
    try {
      const response = await mutateAsync(input);
      return response;
    } catch (error: any) {
      console.error('문서 조회 실패:', error.message);
      return undefined;
    }
  };

  return { isPending, onAdminViewDocument };
};
