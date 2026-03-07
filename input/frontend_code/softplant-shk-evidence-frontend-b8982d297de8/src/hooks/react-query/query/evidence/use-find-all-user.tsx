import { useRef, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindAllUser, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindAllUserInput, TFindAllUserOutput } from '@/apis/type';

type TUseFindAllUserInput = TFindAllUserInput & {
  enabled?: boolean;
  // NOTE: 일부 호출부에서 검색 파라미터를 확장해서 넘기고 있어 optional로 허용
  keyword?: string;
  office_nm?: string;
  project_nm?: string;
};

type TUseFindAllUserOutput = {
  response?: TFindAllUserOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 전체 사용자 조회 react-query query hook
 * @param input - 전체 사용자 조회 입력 파라미터
 * @returns {TUseFindAllUserOutput} 전체 사용자 조회 결과
 */
export const useFindAllUser = (input: TUseFindAllUserInput): TUseFindAllUserOutput => {
  console.log('useFindAllUser called with input:', input);

  // enabled 상태를 명시적으로 추출 (false일 때만 비활성화)
  const isEnabled = input.enabled !== false;

  // input을 ref에 저장하여 queryFn에서 항상 최신 값 사용
  const inputRef = useRef(input);
  // NOTE: refetch가 "렌더 직후(effect 전)" 타이밍에 호출되면 이전 input이 남아있을 수 있어,
  // enabled를 제외한 input을 렌더 단계에서 즉시 ref에 반영해 최신 값을 보장합니다.
  const { enabled: _enabled, ...inputWithoutEnabled } = input;
  inputRef.current = { ...(inputRef.current as any), ...(inputWithoutEnabled as any) };

  // input이 변경될 때만 ref 업데이트 (enabled는 제외)
  const {
    email,
    tel,
    name,
    role,
    phone,
    isActive,
    registrationStatus,
    office_id,
    page_no,
    block_cnt,
    certify_status,
    keyword,
    office_nm,
    project_nm,
    filters,
  } = input;
  useEffect(() => {
    // NOTE: effect 내부에서 input 객체를 직접 참조하면 exhaustive-deps가 'input'을 dependency로 요구함.
    // 구조분해된 필드만 사용해 ref를 갱신해서 dependency 경고를 제거.
    inputRef.current = {
      ...(inputRef.current as any),
      email,
      tel,
      name,
      role,
      phone,
      isActive,
      registrationStatus,
      office_id,
      page_no,
      block_cnt,
      certify_status,
      keyword,
      office_nm,
      project_nm,
      filters,
    };
  }, [
    email,
    tel,
    name,
    role,
    phone,
    isActive,
    registrationStatus,
    office_id,
    page_no,
    block_cnt,
    certify_status,
    keyword,
    office_nm,
    project_nm,
    filters,
  ]);

  // queryKey를 완전히 고정하여 리렌더링 시 쿼리 재생성 방지
  // 실제 파라미터는 queryFn 내부에서 ref를 통해 사용
  const {
    data: allUserData,
    error,
    isFetching,
    refetch: originalRefetch,
    isLoading,
  } = useQuery<TFindAllUserOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_ALL_USER, 'fixed'], // 고정된 queryKey 사용
    queryFn: () => {
      console.log('useQuery queryFn executing with input:', inputRef.current);
      return fetchFindAllUser(inputRef.current);
    },
    enabled: isEnabled, // enabled 상태 직접 사용
    staleTime: Infinity, // 무한대로 설정하여 자동 refetch 완전 차단
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnMount: false, // 마운트 시 자동 refetch 방지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnReconnect: false, // 재연결 시 자동 refetch 방지
  });

  // refetch 함수를 래핑하여 항상 최신 inputRef.current 사용
  const refetch = () => {
    console.log('refetch called with input:', inputRef.current);
    return originalRefetch();
  };

  if (error) {
    console.error('Query Error:', error);
  }

  console.log('useFindAllUser returning data:', allUserData);
  return { response: allUserData, error, isFetching, refetch, isLoading };
};
