import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchViewDocumentDemo } from '@/apis/demo-api';
import { TViewDemoDocumentInput } from '@/apis/type';

type TUseViewDocumentDemoOutput = {
  isPending: boolean;
  onViewDocument: (data: TViewDemoDocumentInput) => Promise<Blob | undefined>;
};

/**
 * * DEMO: 문서 조회 뮤테이션 (PDF/Text 보기)
 * @returns {TUseViewDocumentDemoOutput} 문서 조회 결과
 */
export const useViewDocumentDemo = (): TUseViewDocumentDemoOutput => {
  const { mutateAsync, isPending } = useMutation<Blob, AxiosError, TViewDemoDocumentInput>({
    mutationFn: fetchViewDocumentDemo,
  });

  const onViewDocument = async (input: TViewDemoDocumentInput): Promise<Blob | undefined> => {
    try {
      const response = await mutateAsync(input);
      return response;
    } catch (error: any) {
      console.error('DEMO 문서 조회 실패:', error.message);
      return undefined;
    }
  };

  return { isPending, onViewDocument };
};
