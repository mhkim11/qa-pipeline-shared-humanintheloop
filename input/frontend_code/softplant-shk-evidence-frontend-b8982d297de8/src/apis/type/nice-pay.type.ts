import { AxiosError } from 'axios';

// ! NicePay API 응답 데이터 타입
export type TNicePayApiResponse = {
  data: {
    success: boolean;
    message: string | null;
    errors: string | Error | AxiosError | null;
    data: {
      isRegistered: boolean;
      email: string;
      office_nm: string;
      joindate: string;
      isResign: boolean;
      authtype: string;
      birthdate: string;
      di: string;
      enctime: string;
      gender: string;
      mobileno: string;
      name: string;
      phone: string;
      nationalinfo: string;
      receivedata: string;
      requestno: string;
      responseno: string;
      resultcode: string;
      sitecode: string;
      utf8_name: string;
    };
  };

  status: number;
  statusText: string;
  headers: { 'content-length': string; 'content-type': string };
  config: {
    transitional: { silentJSONParsing: boolean; forcedJSONParsing: boolean; clarifyTimeoutError: boolean };
    transformRequest: any[];
    transformResponse: any[];
    timeout: 0;
    xsrfCookieName: string;
    xsrfHeaderName: string;
    maxContentLength: number;
    maxBodyLength: number;
    env: { FormData: any };
    headers: { Accept: string; 'Content-Type': string };
    baseURL: string;
    method: string;
    url: string;
    data: string;
  };

  request: {
    onreadystatechange: any;
    readyState: number;
    timeout: number;
    withCredentials: boolean;
    upload: {
      onloadstart: any;
      onprogress: any;
      onabort: any;
      onerror: any;
      onload: any;
      ontimeout: any;
      onloadend: any;
    };

    responseURL: string;
    status: number;
    statusText: string;
    responseType: string;
    response: string;
    responseText: string;
    responseXML: any;
    UNSENT: number;
    OPENED: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    DONE: number;
    onloadstart: any;
    onprogress: any;
    onload: any;
  };
};

// ! NicePay 본인인증 복호화 input 데이터 타입
export type TNicePayDecryptDataInput = {
  encData: string;
  integrityValue: string;
  symmetricKey: string;
};

// ! NicePay 본인인증 복호화 output 데이터 타입
export type TNicePayDecryptDataOutput = {
  success: boolean;
  message: string;
  errors: string | Error | AxiosError | null;
  data: {
    isRegistered: boolean;
    email: string;
    office_nm: string;
    joindate: string;
    isResign: boolean;
    authtype: string; // 인증 유형 (예: M: 휴대폰 본인인증, C: 카드 인증)
    birthdate: string; // 생년월일 (YYYYMMDD)
    di: string; // 중복가입 확인값 (Unique User ID)
    enctime: string; // 암호화 시간
    gender: string; // 성별 (1: 남성, 2: 여성)
    mobileno: string; // 휴대폰 번호 (01012345678 형태)
    name: string; // 이름 (한글)
    utf8_name: string; // 이름 (UTF-8 인코딩)
    nationalinfo: string; // 내/외국인 여부 (0: 내국인, 1: 외국인)
    receivedata: string; // 요청 시 추가 입력한 데이터 (선택 사항)
    requestno: string; // 본인인증 요청번호 (클라이언트에서 전달한 값)
    responseno: string; // 본인인증 결과번호 (NICE에서 발급한 값)
    resultcode: string; // 결과 코드 (0000: 성공, 그 외: 실패)
    sitecode: string; // 사이트 코드 (NICE에서 발급)
  };
};
