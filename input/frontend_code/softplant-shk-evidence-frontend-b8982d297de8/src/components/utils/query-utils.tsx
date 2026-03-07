import { size, omitBy } from 'lodash-es';

import { DELETE, INSERT, UPDATE } from '@constants/index';

type TQueryKeyMaker = {
  queryKeyName: string;
};

type TOtherQueryParams = {
  [key: string]: string;
};

// ! 페이지 네이션 쿼리 키 생성기
// - 페이지 네이션 input type
type TPaginationQueryKeyMakerInput = {
  queryKeyName: string;
  pageSize: string;
  otherQueryParams?: {
    [key: string]: string;
  };
};
// - 페이지 네이션 output type
type TPaginationOnlyQueryKeyMakerOutput = {
  pageSize: string;
};
// - 페이지 네이션 output type
type TPaginationQueryKeyMakerOutput = (string | TPaginationOnlyQueryKeyMakerOutput | TOtherQueryParams)[];

// ! id 쿼리 키 생성기
// - 아이디 input type
type TIdQueryKeyMakerInput = {
  queryKeyName: string;
  id: string;
  otherQueryParams?: {
    [key: string]: string;
  };
};
// - 아이디 output type
type TIdOnlyQueryKeyMakerOutput = {
  id: string;
};
// - 아이디 output type
type TIdQueryKeyMakerOutput = (string | TIdOnlyQueryKeyMakerOutput | TOtherQueryParams)[];

// ! 날짜 쿼리 키 생성기
// - 날짜 input type
type TDateQueryKeyMakerInput = {
  queryKeyName: string;
  date: string;
  otherQueryParams?: {
    [key: string]: string;
  };
};
// - 날짜 output type
type TDateOnlyQueryKeyMakerOutput = {
  date: string;
};
// - 날짜 output type
type TDateQueryKeyMakerOutput = (string | TDateOnlyQueryKeyMakerOutput | TOtherQueryParams)[];

// ! 커스텀 쿼리 키 생성기
// - 커스텀 input type
type TQueryKeyCustomMakerInput = {
  queryKeyName: string;
  otherQueryParams?: {
    [key: string]: string;
  };
};

// - 커스텀 output type
type TQueryKeyCustomMakerOutput = (string | TOtherQueryParams)[];

// ! 뮤테이션 키 생성기
// - 뮤테이션 input type
type TMutationKeyMakerInput = {
  mutationKeyName: string;
  status: typeof INSERT | typeof UPDATE | typeof DELETE;
  otherQueryParams?: {
    [key: string]: string;
  };
};
// - 뮤테이션 output type
type TStatusOnlyMutationKeyMakerOutput = {
  status: typeof INSERT | typeof UPDATE | typeof DELETE;
};
// - 뮤테이션 output type
type TMutationKeyMakerOutput = (string | TStatusOnlyMutationKeyMakerOutput | TOtherQueryParams)[];

/**
 * * 쿼리 키 생성기 [우선 순위 1]
 * @description 쿼리 키를 생성하는 함수 입니다. 쿼리 키는 쿼리 키 이름으로만 구성됩니다. 우선 순위 1 입니다. refetch가 필요없는 상황에서 사용합니다.
 * @param {TQueryKeyMaker} input - queryKeyName: 쿼리 키 이름
 * @returns {string[]} queryKey - 쿼리 키
 */
export const queryKeyMaker = ({ queryKeyName }: TQueryKeyMaker): string[] => {
  return [`${queryKeyName}`];
};

/**
 * * 페이지네이션 쿼리 키 생성기 [우선 순위 2]
 * @description 페이지네이션 쿼리 키를 생성하는 함수 입니다. 쿼리 키는 쿼리 키 이름과 id로 구성됩니다. 우선 순위 2 입니다. 페이지네이션 refetch가 필요한 상황에서 사용합니다.
 * @param {TPaginationQueryKeyMakerInput} input - queryKeyName: 쿼리 키 이름, pageSize: 페이지 사이즈, otherQueryParams: 기타 쿼리 파라미터
 * @returns {TPaginationQueryKeyMakerOutput} queryKey - 쿼리 키
 * @see {@link https://react-query.tanstack.com/guides/query-keys}
 */
export const paginationQueryKeyMaker = ({
  queryKeyName,
  pageSize,
  otherQueryParams,
}: TPaginationQueryKeyMakerInput): TPaginationQueryKeyMakerOutput => {
  const result = [queryKeyName, { pageSize }, { ...(otherQueryParams ? otherQueryParams : {}) }];

  const filteredResultKey = [
    result[0],
    omitBy(result[1] as TPaginationOnlyQueryKeyMakerOutput, (value) => size(value) === 0),
    omitBy(result[2] as TOtherQueryParams, (value) => size(value) === 0),
  ].filter((obj) => size(obj) !== 0);

  return filteredResultKey;
};

/**
 * * 날짜 쿼리 키 생성기 [우선 순위 3]
 * @description 날짜 쿼리 키를 생성하는 함수 입니다. 쿼리 키는 쿼리 키 이름과 날짜로 구성됩니다. 우선 순위 3 입니다. 날짜 refetch가 필요한 상황에서 사용합니다.
 * @param {TDateQueryKeyMakerInput} input - queryKeyName: 쿼리 키 이름, date: 날짜, otherQueryParams: 기타 쿼리 파라미터
 * @returns {TDateQueryKeyMakerOutput} queryKey - 쿼리 키
 * @see {@link https://react-query.tanstack.com/guides/query-keys}
 */
export const dateQueryKeyMaker = ({ queryKeyName, date, otherQueryParams }: TDateQueryKeyMakerInput): TDateQueryKeyMakerOutput => {
  const result = [queryKeyName, { date }, { ...(otherQueryParams ? otherQueryParams : {}) }];

  const filteredResultKey = [
    result[0],
    omitBy(result[1] as TDateOnlyQueryKeyMakerOutput, (value) => size(value) === 0),
    omitBy(result[2] as TOtherQueryParams, (value) => size(value) === 0),
  ].filter((obj) => size(obj) !== 0);

  return filteredResultKey;
};

/**
 * * id 쿼리 키 생성기 [우선 순위 4]
 * @description id 쿼리 키를 생성하는 함수 입니다. 쿼리 키는 쿼리 키 이름과 id로 구성됩니다. 우선 순위 4 입니다. id refetch가 필요한 상황에서 사용합니다.
 * @param {TIdQueryKeyMakerInput} input - queryKeyName: 쿼리 키 이름, id: id, otherQueryParams: 기타 쿼리 파라미터
 * @returns {TIdQueryKeyMakerOutput} queryKey - 쿼리 키
 * @see {@link https://react-query.tanstack.com/guides/query-keys}
 */
export const idQueryKeyMaker = ({ queryKeyName, id, otherQueryParams }: TIdQueryKeyMakerInput): TIdQueryKeyMakerOutput => {
  const result = [queryKeyName, { id }, { ...(otherQueryParams ? otherQueryParams : {}) }];

  const filteredResultKey = [
    result[0],
    omitBy(result[1] as TIdOnlyQueryKeyMakerOutput, (value) => size(value) === 0),
    omitBy(result[2] as TOtherQueryParams, (value) => size(value) === 0),
  ].filter((obj) => size(obj) !== 0);

  return filteredResultKey;
};

/**
 * * 커스텀 쿼리 키 생성기 [우선 순위 6]
 * @description 커스텀 쿼리 키를 생성하는 함수 입니다. 쿼리 키는 쿼리 키 이름과 type으로 구성됩니다. 우선 순위 6 입니다.
 * 웬만하면 사용하지 않는것을 권장합니다. 왜냐면 커스텀을 남용한다면 향후 쿼리 키를 관리하기가 어려워질 수 있기 때문입니다.
 * @param {TQueryKeyCustomMakerInput} input - queryKeyName: 쿼리 키 이름, type: type, otherQueryParams: 기타 쿼리 파라미터
 * @returns {TQueryKeyCustomMakerOutput} queryKey - 쿼리 키
 * @see {@link https://react-query.tanstack.com/guides/query-keys}
 */
export const queryKeyCustomMaker = ({ queryKeyName, otherQueryParams }: TQueryKeyCustomMakerInput): TQueryKeyCustomMakerOutput => {
  const result = [queryKeyName, { ...(otherQueryParams ? otherQueryParams : {}) }];

  const filteredResultKey = [result[0], omitBy(result[1] as TOtherQueryParams, (value) => size(value) === 0)].filter(
    (obj) => size(obj) !== 0,
  );

  return filteredResultKey;
};

/**
 * * 뮤테이션 키 생성기
 * @description 뮤테이션 키를 생성하는 함수 입니다. 뮤테이션 키는 뮤테이션 키 이름과 status로 구성됩니다.
 * @param {TMutationKeyMakerInput} input - mutationKeyName: 뮤테이션 키 이름, status: status
 * @returns {TMutationKeyMakerOutput} mutationKey - 뮤테이션 키
 * @see {@link https://react-query.tanstack.com/guides/query-keys}
 */
export const mutationKeyMaker = ({ mutationKeyName, status, otherQueryParams }: TMutationKeyMakerInput): TMutationKeyMakerOutput => {
  const result = [mutationKeyName, { status }, { ...(otherQueryParams ? otherQueryParams : {}) }];

  const filteredResultKey = [
    result[0],
    omitBy(result[1] as TStatusOnlyMutationKeyMakerOutput, (value) => size(value) === 0),
    omitBy(result[2] as TOtherQueryParams, (value) => size(value) === 0),
  ].filter((obj) => size(obj) !== 0);

  return filteredResultKey;
};
