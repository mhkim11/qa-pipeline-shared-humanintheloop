import { useState } from 'react';

import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { onMessageToast } from '@/components/utils';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isLast?: boolean;
  onFileSelect: (fileNames: string[]) => void;
};

const InfoInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const [fileNameList, setFileNameInfoList] = useState<string[]>([]);
  const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'heic'];
  const blockedExtensions = ['hwp', 'hwpx'];

  return (
    <>
      <div>
        <div className='flex items-center justify-center'>
          <div className=''>
            <div
            /* onClick={(): void => {
              if (fileNameInfo?.length >= 4) {
                return;
              }
              inputFileRef.current?.click();
            }} */
            >
              <div className='cursor-pointer text-[14px] text-[#0050B3] underline'>
                <div
                  className=''
                  onClick={(): void => {
                    inputFileRef.current?.click();
                  }}
                >
                  파일 선택하기
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          className='hidden'
          ref={inputFileRef}
          type='file'
          accept='.pdf,.doc,.docx,image/*'
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              // 현재 파일 배열 가져오기
              const currentFiles = watch('EvidenceAddFile') || [];
              const newFiles = [];
              const newFileNames = [];

              // 모든 선택된 파일을 처리
              for (let i = 0; i < e.target.files.length; i++) {
                const uploadedFile = e.target.files[i];
                const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase() || '';

                // 파일 확장자 체크
                if (fileExtension && blockedExtensions.includes(fileExtension)) {
                  onMessageToast({ message: '한글(HWP/HWPX) 파일 업로드를 지원하지 않습니다.' });
                  continue;
                }

                if (!allowedExtensions.includes(fileExtension)) {
                  onMessageToast({ message: '지원하지 않는 파일 형식입니다. (PDF/DOC/DOCX/이미지)' });
                  continue;
                }

                // 파일 크기 체크 (500MB 제한)
                if (uploadedFile.size > 500 * 1024 * 1024) {
                  onMessageToast({ message: `${uploadedFile.name}은(는) 크기 제한(500MB)을 초과합니다.` });
                  continue;
                }

                newFiles.push(uploadedFile);
                newFileNames.push(uploadedFile.name);
              }

              // 업데이트된 파일 배열 설정
              const updatedFiles = [...currentFiles, ...newFiles];
              setValue('EvidenceAddFile', updatedFiles);

              // 파일명 배열 생성
              const fileNames = updatedFiles.map((fileItem) =>
                fileItem instanceof File ? fileItem.name : fileItem[0]?.name || '이름 없음',
              );

              // 상위 컴포넌트에 업데이트된 파일명 배열 전달
              onFileSelect(fileNames);
            }

            // 파일 입력 필드 초기화 (같은 파일 다시 선택 가능하도록)
            e.target.value = '';
          }}
          multiple
        />
        <div>
          <div>
            {fileNameList && fileNameList.length > 0 && (
              <div className='truncate... ml-2 mt-2 flex w-[300px] flex-col pl-4'>
                {fileNameList.map((name, index) => (
                  <div key={index} className=''>
                    <div
                      className='cursor-pointer pl-1 pt-1 text-lg'
                      onClick={() => {
                        setValue(
                          'EvidenceAddFile',
                          watch('EvidenceAddFile').filter((_: any, i: number) => i !== index),
                        );
                        setFileNameInfoList(fileNameList.filter((_, i) => i !== index));
                      }}
                    />
                    <div className='hidden'>
                      {name}
                      <button
                        className='ml-2 rounded bg-red-500 px-2 py-1 text-white'
                        onClick={() => {
                          // 파일 이름과 파일 리스트에서 삭제
                          setValue(
                            'EvidenceAddFile',
                            watch('EvidenceAddFile').filter((_: any, i: number) => i !== index),
                          );
                          setFileNameInfoList(fileNameList.filter((_, i) => i !== index));
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoInputFile;
