import React from 'react';

import { Spinner } from '@nextui-org/spinner';
import axios, { AxiosError, AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { flow, has, head, size } from 'lodash-es';
import { IoIosWarning } from 'react-icons/io';
import { toast } from 'sonner';

import { to, getCachedDataByKey, setCachedDataByKey, clearDataDB } from '@/components/utils';
import { PAGE_SIZE_GROUP } from '@/shared/constants';

interface IOnDataSlice {
  <T>(data: T[], pageNumber: number, type: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP]): T[];
}

type TMessageToast = {
  message: string;
  isLoader?: boolean;
  isClose?: boolean;
  icon?: JSX.Element;
  classNames?: {
    title?: string;
    toast?: string;
  };
};

type TTimerToast = {
  message: string;
  timer: any;
  setTimer: React.Dispatch<React.SetStateAction<any>>;
};

/**
 * * 이전 달 부족한 날짜 채우는 함수
 * @description 현재 달에서 모든 데이터를 넣고 이전 달에서 부족한 날짜를 채워주는 함수
 * @param {dayjs.Dayjs} prevMonthLast - 이전 달 마지막 날짜
 * @param {{ fullDate: string; date: string; currentMonth: boolean }[]} monthDays - 날짜 배열
 * @param {number} count - 이전 달에서 빼야할 날짜 수
 */
export const subtractMonth = (
  prevMonthLast: dayjs.Dayjs,
  monthDays: { fullDate: string; date: string; currentMonth: boolean }[],
  count: number,
): void => {
  monthDays.unshift({
    fullDate: prevMonthLast.format('YYYYMMDD'),
    date: prevMonthLast.format('DD'),
    currentMonth: false,
  });
  for (let i = 0; i < count; i++) {
    const prevDay = prevMonthLast.subtract(i + 1, 'day');
    monthDays.unshift({
      fullDate: prevDay.format('YYYYMMDD'),
      date: prevDay.format('DD'),
      currentMonth: false,
    });
  }
};

/**
 * * 숫자를 콤마를 포함한 문자열로 만드는 함수
 * @description 숫자를 콤마를 포함한 문자열로 만들어주는 함수입니다.
 * @param {number} num - 숫자
 * @returns {string} result - 숫자를 콤마를 포함한 문자열로 반환합니다.
 */
export const numberFormat = (num: number): string => {
  return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(num);
};

/**
 * * 메시지 토스트 함수
 * @param {TMessageToast} input 메시지
 * @returns {void}
 */
export const onMessageToast = ({ message, classNames, isLoader, isClose = true, icon }: TMessageToast): void => {
  toast(message, {
    classNames: {
      title: 'text-base pretendard-semibold leading-none tracking-tight',
      ...classNames,
    },
    position: 'top-center',
    closeButton: isClose ? true : false,
    icon: flow(() => {
      if (isLoader) return <Spinner size='sm' color='primary' />;
      if (icon) return icon;
      return undefined;
    })(),
  });
};

/**
 * * 에러 토스트 함수
 * @param {string} message 메시지
 * @returns {void}
 */
export const onErrorToast = (message: string): void => {
  toast(message, {
    duration: 6_000_000_000, // 100분
    classNames: {
      title: 'text-base pretendard-semibold leading-none tracking-tight',
      toast: 'md:w-[1000px] md:ml-[calc(50%-500px)]',
      content: 'md:w-[1000px]',
    },
    icon: <IoIosWarning className='h-5 w-5 text-red-500' />,
    position: 'top-center',
    closeButton: true,
  });
};

/**
 * * 메시지 시간 토스트 함수
 * @param {TTimerToast} input 메시지
 * @returns {void}
 */
export const onTimerToast = ({ message, timer, setTimer }: TTimerToast): void => {
  clearTimeout(timer); // 기존 타이머를 클리어합니다.
  const newTimer = setTimeout(() => {
    onMessageToast({
      message,
      isLoader: false,
      icon: <IoIosWarning className='h-5 w-5 text-amber-500' />,
    });
  }, 500);

  setTimer(newTimer);
};

/**
 * * 실패 체크 토스트 함수
 * @param {Error | AxiosError} error 에러
 * @param {string} message 메시지
 * @returns {void}
 */
export const errorValidation = async (error: Error | AxiosError, message: string): Promise<void> => {
  if (axios.isAxiosError(error)) {
    const typedError = error as AxiosError;
    let resultText = '';

    if (has(typedError, 'response.data.message')) {
      const { data } = typedError.response as AxiosResponse;
      resultText = data?.message;
    }

    resultText = `에러현상::: ${resultText || 'EMPTY'} | 에러메시지::: ${message}`;

    onErrorToast(process.env.NODE_ENV === 'production' ? '문제가 생겼습니다. 다시 시도 해 주세요.' : '에러 ' + resultText);
  } else {
    const typedError = error as Error;
    console.log(`에러현상::: ${typedError?.message} | 에러메시지::: ${message}`);
    onErrorToast(
      process.env.NODE_ENV === 'production'
        ? '문제가 생겼습니다. 다시 시도 해 주세요.'
        : `에러현상::: ${typedError.message} | 에러메시지::: ${message}`,
    );
  }
};

/**
 * * 전화번호를 010-0000-0000 형식으로 변환하는 함수
 * @description 전화번호를 010-0000-0000 형식으로 변환하는 함수입니다.
 * @param {string} phone - 전화번호
 * @returns {string} result - 010-0000-0000 형식의 전화번호
 */
export const phoneNumberFormat = (phone: string): string => {
  if (!size(phone)) return phone;

  if (size(phone) === 11) {
    const phone1 = phone.slice(0, 3);
    const phone2 = phone.slice(3, 7);
    const phone3 = phone.slice(7, 11);
    return `${phone1}-${phone2}-${phone3}`;
  }

  if (size(phone) === 10) {
    const koreanLocalNumber = [
      '032', // 인천
      '042', // 대전
      '051', // 부산
      '052', // 울산
      '053', // 대구
      '062', // 광주
      '064', // 제주
      '031', // 경이
      '033', // 강원
      '041', // 충남
      '043', // 충북
      '054', // 경북
      '055', // 경남
      '061', // 전남
      '063', // 전북
    ];

    if (koreanLocalNumber.includes(phone.slice(0, 3))) {
      const phone1 = phone.slice(0, 3);
      const phone2 = phone.slice(3, 6);
      const phone3 = phone.slice(6, 10);
      return `${phone1}-${phone2}-${phone3}`;
    }
  }
  const phone1 = phone.slice(0, 2);
  const phone2 = phone.slice(2, 5);
  const phone3 = phone.slice(5, 9);
  return `${phone1}-${phone2}-${phone3}`;
};

/**
 * * 전체 페이지 수를 배열로 만드는 함수
 * @description 전체 페이지 수를 배열로 만들어주는 함수입니다.
 * @param {number} totalPage - 전체 페이지 수
 * @param {number} type - 테이블 구분
 * @returns {number[]} result - 전체 페이지 수를 배열로 반환합니다.
 */
export const totalPageArrayMaker = (totalPage: number, type?: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP]): number[] => {
  const pageSize = type ? type : PAGE_SIZE_GROUP.PAGE_SIZE_TEN;
  return Array.from(
    {
      length: totalPage % pageSize === 0 ? totalPage / pageSize : totalPage / pageSize + 1,
    },
    (_, index) => index + 1,
  );
};

/**
 * * 지정된 시간만큼 지연시키는 함수
 * @param {number} ms 지연시킬 시간
 * @returns {Promise<void>} void
 */
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * * 데이터 슬라이스 함수
 * @template T
 * @param {T[]} data - 데이터
 * @param {number} pageNumber - 페이지 번호
 * @param {number} type - 타입
 * @returns  {T[]} result - 데이터 슬라이스 결과
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/generics.html}
 * @see {@link https://stackoverflow.com/questions/32308370/what-is-the-syntax-for-typescript-arrow-functions-with-generics}
 */
export const onDataSlice: IOnDataSlice = <T,>(
  data: T[],
  pageNumber: number,
  type: (typeof PAGE_SIZE_GROUP)[keyof typeof PAGE_SIZE_GROUP],
): T[] => {
  return (data ?? []).slice((pageNumber - 1) * type, pageNumber * type);
};

/**
 * * 이미지를 가져오는 함수
 * @param {string} url - 이미지 URL
 * @param {function} onSetImageSrc - 이미지 소스를 설정하는 함수
 * @returns {Promise<void>} void
 */
export const fetchImage = async (url: string, onSetImageSrc: (imageSrc: string) => void): Promise<void> => {
  const [error, response] = await to(fetch(`${window.location.origin}/${url}`));

  if (error instanceof Error) return;
  if (!response) return;

  const blob = await response.blob();
  const lastModified = response.headers.get('Last-Modified');

  const cachedImage = sessionStorage.getItem(url);
  const cachedLastModified = sessionStorage.getItem(`${url}-lastModified`);

  if (cachedImage && dayjs(cachedLastModified).isSame(dayjs(lastModified))) {
    onSetImageSrc(cachedImage);
    return;
  }

  // 이미지 데이터를 Base64로 변환
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result as string;

    if (base64data) {
      const base64Image = `data:image/png;base64,${base64data.split(',')[1]}`;
      // sessionStorage에 저장

      sessionStorage.setItem(url, base64Image);
      sessionStorage.setItem(`${url}-lastModified`, lastModified ?? '');
      onSetImageSrc(base64data as string);
    }
  };
  reader.readAsDataURL(blob);
};

/**
 * * 이미지를 가져오는 함수
 * @param {string} url - 이미지 URL
 * @param {function} onSetImageSrc - 이미지 소스를 설정하는 함수
 * @returns {Promise<void>} void
 */
export const indexedFetchImage = async (url: string, onSetImageSrc: (imageSrc: string) => void): Promise<void> => {
  const [error, response] = await to(fetch(`${window.location.origin}/${url}`));

  if (error instanceof Error) return;
  if (!response) return;

  const blob = await response.blob();
  const lastModified = response.headers.get('Last-Modified');

  const cachedImage = await getCachedDataByKey(url);
  const cachedLastModified = await getCachedDataByKey(`${url}-lastModified`);
  const cachedLastModifiedValue = head(cachedLastModified)?.[`${url}-lastModified`] ?? '';

  if (size(cachedImage) === 0 && dayjs(cachedLastModifiedValue).isSame(dayjs(lastModified))) {
    onSetImageSrc(head(cachedImage)?.[url] ?? '');
    return;
  }

  // 이미지 데이터를 Base64로 변환
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result as string;

    if (base64data) {
      const base64Image = `data:image/png;base64,${base64data?.split(',')?.[1]}`;
      // sessionStorage에 저장
      await setCachedDataByKey(url, [{ [url]: base64Image }]);
      await setCachedDataByKey(`${url}-lastModified`, [{ [`${url}-lastModified`]: lastModified ?? '' }]);

      onSetImageSrc(base64data as string);
    }
  };
  reader.readAsDataURL(blob);
};

/**
 * * 캐시된 데이터를 가져오는 함수
 * @param {string} imageUrl - 이미지 URL
 * @param {(imageSrc: string) => void} onSetImageSrc - 이미지 소스를 설정하는 함수
 */
export const onCachedImageData = async (imageUrl: string, onSetImageSrc: (imageSrc: string) => void) => {
  const image = await getCachedDataByKey(imageUrl);

  if (size(image) !== 0 && size(head(image)?.[imageUrl]) !== 0) {
    onSetImageSrc(head(image)?.[imageUrl] ?? '');
  } else {
    await indexedFetchImage(imageUrl, onSetImageSrc);
  }
};

export const onClearCachedImageDataAll = async () => {
  await clearDataDB();
};

export const delayUtil = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
