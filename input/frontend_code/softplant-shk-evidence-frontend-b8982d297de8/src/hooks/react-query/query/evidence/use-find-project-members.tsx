import { useQuery } from '@tanstack/react-query';

import { fetchListProjectMember } from '@/apis/evidence-api';
import type { TListProjectMemberOutput } from '@/apis/type';

type TUseFindProjectMembersInput = {
  projectId: string;
  enabled?: boolean;
};

export const useFindProjectMembers = ({
  projectId,
  enabled = true,
}: TUseFindProjectMembersInput): {
  response: TListProjectMemberOutput | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const { data, isLoading, error, refetch } = useQuery<TListProjectMemberOutput>({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchListProjectMember(projectId),
    enabled: enabled && !!projectId, // enabled가 true이고 projectId가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지 (불필요한 refetch 방지)
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 refetch 방지 (캐시된 데이터가 있으면)
    refetchOnReconnect: false, // 네트워크 재연결 시 refetch 방지
  });

  return {
    response: data,
    isLoading,
    error,
    refetch,
  };
};
