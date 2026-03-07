import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

import {
  fetchGetCommonCategory,
  fetchCreateCommonCategory,
  fetchEditCommonCategory,
  fetchCreateCommonSubMenu,
  fetchEditCommonSubMenu,
  fetchGetCommonSubMenu,
  fetchChangeCommonCategoryOrder,
  fetchChangeCommonSubMenuOrder,
  ADMIN_AI_QUERY_KEY,
  fetchCreateSubMenu,
  fetchGetAIAnalysisMenu,
  fetchGetUserAnalysisMenu,
  fetchEditProjectSubMenu,
  fetchGetSettings,
  fetchGetProjectCategory,
} from '@apis/admin-ai-api';
import type {
  TGetCommonCategoryOutput,
  TCreateCommonCategoryInput,
  TCreateCommonCategoryOutput,
  TEditCommonCategoryInput,
  TEditCommonCategoryOutput,
  TCreateCommonSubMenuInput,
  TCreateCommonSubMenuOutput,
  TEditCommonSubMenuInput,
  TEditCommonSubMenuOutput,
  TGetCommonSubMenuOutput,
  TChangeCommonCategoryOrderInput,
  TChangeCommonCategoryOrderOutput,
  TChangeCommonSubMenuOrderInput,
  TChangeCommonSubMenuOrderOutput,
  ICreateSubMenuInput,
  TEditProjectSubMenuInput,
  IGetSettingsOutput,
  TGetProjectCategoryOutput,
} from '@apis/type/admin-ai.type';
import { onMessageToast } from '@/components/utils';

/**
 * * 공통 카테고리 조회 Query
 * @description 공통 카테고리 목록을 조회하는 Query Hook
 * @returns {UseQueryResult<TGetCommonCategoryOutput>} 공통 카테고리 조회 결과
 */
export const useGetCommonCategoryQuery = (): UseQueryResult<TGetCommonCategoryOutput> => {
  return useQuery<TGetCommonCategoryOutput>({
    queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
    queryFn: fetchGetCommonCategory,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * * 사건별 카테고리 조회 Query
 * @description 프로젝트별 AI 카테고리를 조회하는 Query Hook (중복 호출 방지)
 */
export const useGetProjectCategoryQuery = (projectId: string): UseQueryResult<TGetProjectCategoryOutput> => {
  return useQuery<TGetProjectCategoryOutput>({
    queryKey: [ADMIN_AI_QUERY_KEY.GET_PROJECT_CATEGORY, projectId],
    queryFn: () => fetchGetProjectCategory(projectId),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
};

/**
 * * 공통 카테고리 생성 Mutation
 * @description 새로운 공통 카테고리를 생성하는 Mutation Hook
 * @returns {UseMutationResult<TCreateCommonCategoryOutput, Error, TCreateCommonCategoryInput>} 공통 카테고리 생성 결과
 */
export const useCreateCommonCategoryMutation = (): UseMutationResult<TCreateCommonCategoryOutput, Error, TCreateCommonCategoryInput> => {
  const queryClient = useQueryClient();

  return useMutation<TCreateCommonCategoryOutput, Error, TCreateCommonCategoryInput>({
    mutationFn: fetchCreateCommonCategory,
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
    },
    onError: (error) => {
      console.error('공통 카테고리 생성 실패:', error);
    },
  });
};

/**
 * * 공통 카테고리 수정 Mutation
 * @description 공통 카테고리를 수정하는 Mutation Hook
 * @returns {UseMutationResult<TEditCommonCategoryOutput, Error, TEditCommonCategoryInput>} 공통 카테고리 수정 결과
 */
export const useEditCommonCategoryMutation = (): UseMutationResult<TEditCommonCategoryOutput, Error, TEditCommonCategoryInput> => {
  const queryClient = useQueryClient();

  return useMutation<TEditCommonCategoryOutput, Error, TEditCommonCategoryInput>({
    mutationFn: fetchEditCommonCategory,
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
    },
    onError: (error) => {
      console.error('공통 카테고리 수정 실패:', error);
    },
  });
};

/**
 * * 공통 하위메뉴 생성 Mutation
 * @description 새로운 공통 하위메뉴를 생성하는 Mutation Hook
 * @returns {UseMutationResult<TCreateCommonSubMenuOutput, Error, TCreateCommonSubMenuInput>} 공통 하위메뉴 생성 결과
 */
export const useCreateCommonSubMenuMutation = (): UseMutationResult<TCreateCommonSubMenuOutput, Error, TCreateCommonSubMenuInput> => {
  const queryClient = useQueryClient();

  return useMutation<TCreateCommonSubMenuOutput, Error, TCreateCommonSubMenuInput>({
    mutationFn: fetchCreateCommonSubMenu,
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회 (하위메뉴가 포함된 데이터)
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
    },
    onError: (error) => {
      console.error('공통 하위메뉴 생성 실패:', error);
    },
  });
};

/**
 * * 공통 하위메뉴 수정 Mutation
 * @description 공통 하위메뉴를 수정하는 Mutation Hook
 * @returns {UseMutationResult<TEditCommonSubMenuOutput, Error, TEditCommonSubMenuInput>} 공통 하위메뉴 수정 결과
 */
export const useEditCommonSubMenuMutation = (): UseMutationResult<TEditCommonSubMenuOutput, Error, TEditCommonSubMenuInput> => {
  const queryClient = useQueryClient();

  return useMutation<TEditCommonSubMenuOutput, Error, TEditCommonSubMenuInput>({
    mutationFn: fetchEditCommonSubMenu,
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회 (하위메뉴가 포함된 데이터)
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
    },
    onError: (error) => {
      console.error('공통 하위메뉴 수정 실패:', error);
    },
  });
};

/**
 * * 공통 카테고리 순서 변경 Mutation
 * @description 공통 카테고리 순서를 변경하는 Mutation Hook
 * @returns {UseMutationResult<TChangeCommonCategoryOrderOutput, Error, TChangeCommonCategoryOrderInput>} 공통 카테고리 순서 변경 결과
 */
export const useChangeCommonCategoryOrderMutation = (): UseMutationResult<
  TChangeCommonCategoryOrderOutput,
  Error,
  TChangeCommonCategoryOrderInput
> => {
  const queryClient = useQueryClient();

  return useMutation<TChangeCommonCategoryOrderOutput, Error, TChangeCommonCategoryOrderInput>({
    mutationFn: fetchChangeCommonCategoryOrder,
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
    },
    onError: (error) => {
      console.error('공통 카테고리 순서 변경 실패:', error);
    },
  });
};

/**
 * * 공통 하위메뉴 순서 변경 Mutation
 * @description 공통 하위메뉴 순서를 변경하는 Mutation Hook
 * @returns {UseMutationResult<TChangeCommonSubMenuOrderOutput, Error, { category_template_id: string; input: TChangeCommonSubMenuOrderInput }>} 공통 하위메뉴 순서 변경 결과
 */
export const useChangeCommonSubMenuOrderMutation = (): UseMutationResult<
  TChangeCommonSubMenuOrderOutput,
  Error,
  { category_template_id: string; input: TChangeCommonSubMenuOrderInput }
> => {
  const queryClient = useQueryClient();

  return useMutation<TChangeCommonSubMenuOrderOutput, Error, { category_template_id: string; input: TChangeCommonSubMenuOrderInput }>({
    mutationFn: ({ category_template_id, input }) => fetchChangeCommonSubMenuOrder(category_template_id, input),
    onSuccess: () => {
      // 성공시 공통 카테고리 목록 재조회
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_CATEGORY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_SUB_MENU],
      });
    },
    onError: (error) => {
      console.error('공통 하위메뉴 순서 변경 실패:', error);
    },
  });
};

/**
 * * 특정 카테고리의 하위메뉴 조회 Query
 * @description 특정 카테고리 ID에 해당하는 하위메뉴를 조회하는 Query Hook
 * @param {string} categoryId - 조회할 카테고리 ID
 * @returns {UseQueryResult<TGetCommonSubMenuOutput>} 하위메뉴 조회 결과
 */
export const useGetSubMenuByCategoryQuery = (categoryId: string): UseQueryResult<TGetCommonSubMenuOutput> => {
  return useQuery<TGetCommonSubMenuOutput>({
    queryKey: [ADMIN_AI_QUERY_KEY.GET_COMMON_SUB_MENU, categoryId],
    queryFn: () => fetchGetCommonSubMenu(categoryId),
    enabled: !!categoryId, // categoryId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * AI 분석 하위메뉴 등록 뮤테이션 훅
 */
export const useCreateSubMenuMutation = () => {
  return useMutation({
    mutationFn: (input: ICreateSubMenuInput) => fetchCreateSubMenu(input),
    onSuccess: () => {
      onMessageToast({
        message: '하위메뉴가 등록되었습니다.',
      });
    },
    onError: (error) => {
      console.error('하위메뉴 등록 중 오류 발생:', error);
      onMessageToast({
        message: '하위메뉴 등록에 실패했습니다.',
      });
    },
  });
};

/**
 * AI 분석메뉴 조회 쿼리 키
 */
export const AI_ANALYSIS_MENU_QUERY_KEY = {
  GET_MENU: 'getAIAnalysisMenu',
} as const;

/**
 * AI 분석메뉴 조회 쿼리 훅
 */
export const useGetAIAnalysisMenuQuery = (project_id: string) => {
  return useQuery({
    queryKey: [AI_ANALYSIS_MENU_QUERY_KEY.GET_MENU, project_id],
    queryFn: () => fetchGetAIAnalysisMenu(project_id),
    enabled: !!project_id,
  });
};

/**
 * 사용자 분석메뉴 조회 쿼리 키
 */
export const USER_ANALYSIS_MENU_QUERY_KEY = {
  GET_MENU: 'getUserAnalysisMenu',
} as const;

/**
 * 사용자 분석메뉴 조회 쿼리 훅
 */
export const useGetUserAnalysisMenuQuery = (project_id: string) => {
  return useQuery({
    queryKey: [USER_ANALYSIS_MENU_QUERY_KEY.GET_MENU, project_id],
    queryFn: () => fetchGetUserAnalysisMenu(project_id),
    enabled: !!project_id,
  });
};

/**
 * * 프로젝트 하위메뉴 수정 Mutation (사건별 메뉴 수정용)
 * @description 프로젝트 하위메뉴를 수정하는 Mutation Hook
 * @returns {UseMutationResult<TEditCommonSubMenuOutput, Error, TEditProjectSubMenuInput>} 프로젝트 하위메뉴 수정 결과
 */
export const useEditProjectSubMenuMutation = (): UseMutationResult<TEditCommonSubMenuOutput, Error, TEditProjectSubMenuInput> => {
  return useMutation<TEditCommonSubMenuOutput, Error, TEditProjectSubMenuInput>({
    mutationFn: fetchEditProjectSubMenu,

    onError: (error) => {
      console.error('프로젝트 하위메뉴 수정 실패:', error);
      onMessageToast({
        message: '메뉴 수정에 실패했습니다.',
      });
    },
  });
};

/**
 * 설정 조회 쿼리 키
 */
export const SETTINGS_QUERY_KEY = {
  GET_SETTINGS: 'getSettings',
} as const;

/**
 * 설정 조회 쿼리 훅
 */
export const useGetSettingsQuery = (): UseQueryResult<IGetSettingsOutput> => {
  return useQuery<IGetSettingsOutput>({
    queryKey: [SETTINGS_QUERY_KEY.GET_SETTINGS],
    queryFn: fetchGetSettings,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
