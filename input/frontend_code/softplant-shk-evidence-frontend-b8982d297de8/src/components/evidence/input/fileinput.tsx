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
  const [ListInfo, setListInfo] = useState<string[]>([]);

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
          accept='.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png'
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              // 현재 파일 배열 가져오기
              const currentFiles = watch('Listfile') || [];
              const newFiles = [];
              const newFileNames = [];

              // 모든 선택된 파일을 처리
              for (let i = 0; i < e.target.files.length; i++) {
                const uploadedFile = e.target.files[i];
                const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
                const fileExtensionArray = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

                // 파일 확장자 체크
                if (!fileExtensionArray.includes(fileExtension)) {
                  onMessageToast({
                    message: `${uploadedFile.name}은(는) 지원되지 않는 파일 형식입니다. (지원 형식: PDF, Excel, Word, 이미지 파일)`,
                  });
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

              // 업데이트된 파일 배열 설정 (메타데이터가 추가된 파일 사용)
              const updatedFiles = [...currentFiles, ...newFiles];
              setValue('Listfile', updatedFiles);

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
            {ListInfo && ListInfo.length > 0 && (
              <div className='truncate... ml-2 mt-2 flex w-[300px] flex-col pl-4'>
                {ListInfo.map((name, index) => (
                  <div key={index} className=''>
                    <div
                      className='cursor-pointer pl-1 pt-1 text-lg'
                      onClick={() => {
                        setValue(
                          'Listfile',
                          watch('Listfile').filter((_: any, i: number) => i !== index),
                        );
                        setListInfo(ListInfo.filter((_, i) => i !== index));
                      }}
                    />
                    <div className='hidden'>
                      {name}
                      <button
                        className='ml-2 rounded bg-red-500 px-2 py-1 text-white'
                        onClick={() => {
                          // 파일 이름과 파일 리스트에서 삭제
                          setValue(
                            'Listfile',
                            watch('Listfile').filter((_: any, i: number) => i !== index),
                          );
                          setListInfo(ListInfo.filter((_, i) => i !== index));
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
