export type TBookingTimeData = {
  time: string;
  duration: number;
  date: string;
  top: number;
  book_seq: string;
  book_seq_d: number;
  book_status: string;
  temp_cust_yn: string;
  service_nm: string;
  cust_cd: string;
  cust_nm: string | null;
  in_time: string;
  lead_time: string;
  direct_visit: string;
  vip_yn: string;
  tel_no_yn: string;
  color_gbn: string;
  memo: string;
};

// ! ---------------------------------------------------- reducer type 모음 [시작] ----------------------------------------------------
export type TSaleAddDialogOpenType = 'OPEN' | 'CLOSE';
export type TDetailedBoxDialogOpenType = 'OPEN' | 'CLOSE' | 'CLEAR';
export type TEmployeeDataType = 'ADD' | 'REMOVE';
export type TSameTimeButtonOpenType = 'OPEN' | 'CLOSE';
export type TSameTimeReservationDataType = 'ADD' | 'REMOVE';
export type TToShowPopoverEmployeeDataType = 'ADD' | 'REMOVE';
// ! ---------------------------------------------------- reducer type 타입모음 [끝] ----------------------------------------------------

// ! ---------------------------------------------------- reducer result 타입모음 [시작] ----------------------------------------------------
export type TSaleAddDialogPayload = Record<string, boolean>[];
export type TDetailedBoxDialogPayload = Record<string, boolean>[];
export type TEmployeeDataPayload = {
  time: string;
  duration: number;
  date: string;
  top: number;
  book_seq: string;
  book_seq_d: number;
  book_status: string;
  temp_cust_yn: string;
  cust_cd: string;
  cust_nm: string | null;
  in_time: string;
  lead_time: string;
  direct_visit: string;
  vip_yn: string;
  tel_no_yn: string;
  color_gbn: string;
  memo: string;
};
export type TSameTimeButtonPayload = Record<string, boolean>;
// export type TSameTimeReservationDataPayload = TBookingTimeData;
export type TToShowPopoverEmployeeDataPayload = Record<string, boolean>;
// ! ---------------------------------------------------- reducer result 타입모음 [끝] ----------------------------------------------------

// ! ---------------------------------------------------- reducer action-type 타입모음 [시작] ----------------------------------------------------
export type TSaleAddDialogOpenActionType = { type: TSaleAddDialogOpenType; payload?: TSaleAddDialogPayload };
export type TDetailedBoxDialogOpenActionType = { type: TDetailedBoxDialogOpenType; payload?: TDetailedBoxDialogPayload };
export type TEmployeeDataActionType = { type: TEmployeeDataType; payload?: TEmployeeDataPayload };
export type TSameTimeButtonOpenActionType = { type: TSameTimeButtonOpenType; payload?: TSameTimeButtonPayload };
export type TSameTimeReservationDataActionType = { type: TSameTimeReservationDataType; payload?: TBookingTimeData };
export type TToShowPopoverEmployeeDataActionType = { type: TToShowPopoverEmployeeDataType; payload?: TToShowPopoverEmployeeDataPayload };
// ! ---------------------------------------------------- reducer action-type 타입모음 [끝] ----------------------------------------------------
