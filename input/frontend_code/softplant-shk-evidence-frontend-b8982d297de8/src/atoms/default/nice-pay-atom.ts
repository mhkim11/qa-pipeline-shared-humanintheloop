import { atomWithStorage } from 'jotai/utils';

import { TNicePayApiResponse } from '@/apis/type/nice-pay.type';

type TNicePayAtom = 'nicePayPhoneCertification' | 'nicePayPhoneResponseResult';

type TNicePayPhoneCertification = {
  symmetricKey: string;
  encData: string;
  integrityValue: string;
};

const DEBUG_LABEL_KEY = {
  nicePayPhoneCertification: 'nicePayPhoneCertification',
  nicePayPhoneResponseResult: 'nicePayPhoneResponseResult',
} as Record<TNicePayAtom, TNicePayAtom>;

export const initialNicePayPhoneCertificationAtom: TNicePayPhoneCertification = {
  symmetricKey: '',
  encData: '',
  integrityValue: '',
};

/**
 * * 나이스페이 휴대폰 번호 인증 정보를 저장하는 atom
 * @description 나이스페이 휴대폰 번호 인증 정보를 저장하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.nicePayPhoneCertification}
 */
export const nicePayPhoneCertificationAtom = atomWithStorage<TNicePayPhoneCertification>(
  'nicePayPhoneCertification',
  JSON.parse(localStorage.getItem('nicePayPhoneCertification') || JSON.stringify(initialNicePayPhoneCertificationAtom)),
);
// - [nicePayPhoneCertificationAtom] 디버그 라벨 키
nicePayPhoneCertificationAtom.debugLabel = DEBUG_LABEL_KEY.nicePayPhoneCertification;

/**
 * * 나이스페이 휴대폰 번호 인증 결과를 저장하는 atom
 * @description 나이스페이 휴대폰 번호 인증 결과를 저장하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.nicePayPhoneResponseResult}
 */
export const nicePayPhoneResponseResultAtom = atomWithStorage<TNicePayApiResponse>(
  'nicePayPhoneResponseResult',
  JSON.parse(localStorage.getItem('nicePayPhoneResponseResult') || '{}'),
);
// - [nicePayPhoneResponseResultAtom] 디버그 라벨 키
nicePayPhoneResponseResultAtom.debugLabel = DEBUG_LABEL_KEY.nicePayPhoneResponseResult;
