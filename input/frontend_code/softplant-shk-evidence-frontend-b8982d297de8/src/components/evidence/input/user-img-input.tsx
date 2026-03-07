import { useState } from 'react';

import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isLast?: boolean;
  onFileSelect: (fileNames: string[]) => void;
};

const UserImgInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const [fileNameInfo, setFileNameInfo] = useState<string[]>([]);
  const maxFileCount = 20; // 파일 개수 제한
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
              <div className=''>
                <div
                  className='cursor-pointer rounded-lg border border-[#4577A4] px-4 py-2 text-[#4577A4]'
                  onClick={(): void => {
                    if (fileNameInfo?.length >= maxFileCount) {
                      alert('파일은 20개까지 첨부할 수 있습니다.');
                      return;
                    }
                    inputFileRef.current?.click();
                  }}
                >
                  파일선택
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          className='hidden'
          ref={inputFileRef}
          type='file'
          onChange={(e) => {
            if (e.target.files) {
              const fileExtension = e.target.files[0].name.split('.').pop()?.toLowerCase() || '';
              const fileExtensionArray = ['jpg', 'jpeg', 'png', 'pdf', 'xlsx', 'docx', 'pptx', 'txt', 'hwp'];
              if (!fileExtensionArray.includes(fileExtension)) {
                return;
              }
              if (e.target.files[0].size > 10 * 1024 * 1024) {
                return;
              }
              if (e.target.files) {
                const newFileName = e.target.files[0].name;
                setFileNameInfo([...fileNameInfo, newFileName]);
                setValue('Infofile', [...watch('Infofile'), e.target.files]);
                onFileSelect([...fileNameInfo, newFileName]); // 상위로 전달
              }

              setValue('Infofile', [...watch('Infofile'), e.target.files]);
            }
          }}
          multiple
        />
        <div>
          <div>
            {fileNameInfo && fileNameInfo.length > 0 && (
              <div className='truncate... ml-2 mt-2 flex w-[300px] flex-col pl-4'>
                {fileNameInfo.map((name, index) => (
                  <div key={index} className=''>
                    <div
                      className='cursor-pointer pl-1 pt-1 text-lg'
                      onClick={() => {
                        setValue(
                          'Infofile',
                          watch('Infofile').filter((_: any, i: number) => i !== index),
                        );
                        setFileNameInfo(fileNameInfo.filter((_, i) => i !== index));
                      }}
                    />
                    <div className='hidden'>
                      {name}
                      <button
                        className='ml-2 rounded bg-red-500 px-2 py-1 text-white'
                        onClick={() => {
                          // 파일 이름과 파일 리스트에서 삭제
                          setValue(
                            'Infofile',
                            watch('Infofile').filter((_: any, i: number) => i !== index),
                          );
                          setFileNameInfo(fileNameInfo.filter((_, i) => i !== index));
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

export default UserImgInputFile;
