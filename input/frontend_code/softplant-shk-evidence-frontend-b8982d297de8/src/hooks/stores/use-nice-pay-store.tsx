import { useAtom } from 'jotai';

import { nicePayPhoneCertificationAtom, nicePayPhoneResponseResultAtom } from '@/atoms/default/nice-pay-atom';

const useNicePayStore = () => {
  const [nicePayPhoneCertification, setNicePayPhoneCertification] = useAtom(nicePayPhoneCertificationAtom);
  const [nicePayPhoneResponseResult, setNicePayPhoneResponseResult] = useAtom(nicePayPhoneResponseResultAtom);

  return {
    nicePayPhoneCertification,
    setNicePayPhoneCertification,
    nicePayPhoneResponseResult,
    setNicePayPhoneResponseResult,
  };
};

export default useNicePayStore;
