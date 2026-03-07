import { useAtom } from 'jotai';

import {
  registerEmailAtom,
  registerNameAtom,
  registerPasswordAtom,
  registerOfficeNmAtom,
  registerInHouseAtom,
  registerPhoneAtom,
} from '@/atoms/default/register-atom';

const useRegisterStore = () => {
  const [email, setEmail] = useAtom(registerEmailAtom);
  const [name, setName] = useAtom(registerNameAtom);
  const [password, setPassword] = useAtom(registerPasswordAtom);
  const [officeNm, setOfficeNm] = useAtom(registerOfficeNmAtom);
  const [inHouse, setInHouse] = useAtom(registerInHouseAtom);
  const [phone, setPhone] = useAtom(registerPhoneAtom); // phone 추가

  const resetRegister = () => {
    setEmail('');
    setName('');
    setPassword('');
    setOfficeNm('');
    setInHouse(false);
    setPhone(''); // phone 리셋 추가
  };

  return {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    officeNm,
    setOfficeNm,
    inHouse,
    setInHouse,
    phone,
    setPhone, // phone 관련 함수 export
    resetRegister,
  };
};

export default useRegisterStore;
