import { useState } from 'react';

import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isLast?: boolean;
  onFileSelect: (fileNames: string[]) => void;
};

const SummaryInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const [SummaryName, setSummaryName] = useState<string[]>([]);
  const maxFileCount = 1; // 파일 개수 제한
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
                    if (SummaryName?.length >= maxFileCount) {
                      alert('파일은 1개까지 첨부할 수 있습니다.');
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
            if (e.target.files && e.target.files.length > 0) {
              const fileExtension = e.target.files[0].name.split('.').pop()?.toLowerCase() || '';
              const fileExtensionArray = ['zip'];

              if (!fileExtensionArray.includes(fileExtension)) {
                alert('지원하지 않는 파일 형식입니다');
                return;
              }

              if (e.target.files[0].size > 500 * 1024 * 1024) {
                alert('파일 크기는 500MB 이하여야 합니다');
                return;
              }

              // 현재 파일 목록에 새 파일 추가
              const existingFiles = watch('SummaryFile') || [];
              const updatedFiles = [...existingFiles, e.target.files[0]];

              // 상위 컴포넌트에 파일 이름 목록 전달
              const fileNames = updatedFiles.map((file) => (file instanceof File ? file.name : file[0]?.name || '이름 없음'));

              // 상태 업데이트
              setValue('SummaryFile', updatedFiles);
              onFileSelect(fileNames);
            }
          }}
          multiple
        />
        <div>
          <div>
            {SummaryName && SummaryName.length > 0 && (
              <div className='truncate... ml-2 mt-2 flex w-[300px] flex-col pl-4'>
                {SummaryName.map((name, index) => (
                  <div key={index} className=''>
                    <div
                      className='cursor-pointer pl-1 pt-1 text-lg'
                      onClick={() => {
                        setValue(
                          'SummaryFile',
                          watch('SummaryFile').filter((_: any, i: number) => i !== index),
                        );
                        setSummaryName(SummaryName.filter((_, i) => i !== index));
                      }}
                    />
                    <div className='hidden'>
                      {name}
                      <button
                        className='ml-2 rounded bg-red-500 px-2 py-1 text-white'
                        onClick={() => {
                          // 파일 이름과 파일 리스트에서 삭제
                          setValue(
                            'SummaryFile',
                            watch('SummaryFile').filter((_: any, i: number) => i !== index),
                          );
                          setSummaryName(SummaryName.filter((_, i) => i !== index));
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

export default SummaryInputFile;
