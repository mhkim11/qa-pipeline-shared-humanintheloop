interface IUseAddressInput {
  writeData: any;
  onSetWriteData: (value: any) => void;
  onSetIsPostCodeModalOpen: (value: boolean) => void;
  onSetAddress: (address: string) => void;
  onSetZipNo: (zipNo: string) => void;
}

export const useAddressInput = ({ writeData, onSetWriteData, onSetAddress, onSetIsPostCodeModalOpen, onSetZipNo }: IUseAddressInput) => {
  // ! 기본 함수 | 주소 검색 후 주소를 writeData state에 저장하는 함수
  const handleComplete = (data: any) => {
    let fullAddress = data?.address;
    let extraAddress = '';

    if (data?.addressType === 'R') {
      if (data?.bname !== '') {
        extraAddress += data?.bname;
      }
      if (data?.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data?.buildingName}` : data?.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }
    onSetWriteData({ ...writeData, address: fullAddress });
    onSetAddress(fullAddress);
    onSetIsPostCodeModalOpen(false);
    onSetZipNo(data?.zonecode ?? '');
  };

  return { handleComplete };
};
