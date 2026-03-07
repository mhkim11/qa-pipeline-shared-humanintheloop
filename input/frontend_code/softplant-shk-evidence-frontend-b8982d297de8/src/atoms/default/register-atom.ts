import { atomWithStorage } from 'jotai/utils';

// localStorage를 사용하여 데이터 유지
export const registerEmailAtom = atomWithStorage<string>('register_email', '');
export const registerNameAtom = atomWithStorage<string>('register_name', '');
export const registerPasswordAtom = atomWithStorage<string>('register_password', '');
export const registerOfficeNmAtom = atomWithStorage<string>('register_office_nm', '');
export const registerInHouseAtom = atomWithStorage<boolean>('register_in_house', false);
export const registerPhoneAtom = atomWithStorage<string>('register_phone', '');
