import { useState } from 'react';

import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isLast?: boolean;
  onFileSelect: (fileNames: string[]) => void;
};

const OriginalInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const [originalName, setOriginalName] = useState<string[]>([]);
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
                    if (originalName?.length >= maxFileCount) {
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
          accept='.pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png'
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const filesArray = Array.from(e.target.files);
              const validFiles: File[] = [];
              const invalidFiles: string[] = [];

              // 모든 파일을 검증
              for (const file of filesArray) {
                const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
                const fileExtensionArray = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

                if (!fileExtensionArray.includes(fileExtension)) {
                  invalidFiles.push(`${file.name} (지원하지 않는 파일 형식)`);
                  continue;
                }

                if (file.size > 500 * 1024 * 1024) {
                  invalidFiles.push(`${file.name} (500MB 초과)`);
                  continue;
                }

                validFiles.push(file);
              }

              // 유효하지 않은 파일이 있으면 알림
              if (invalidFiles.length > 0) {
                alert(`다음 파일은 업로드할 수 없습니다:\n${invalidFiles.join('\n')}`);
              }

              if (validFiles.length === 0) return;

              // 현재 파일 목록에 새 파일 추가
              const existingFiles = watch('originalfile') || [];
              const updatedFiles = [...existingFiles, ...validFiles];

              // 상위 컴포넌트에 파일 이름 목록 전달
              const fileNames = updatedFiles.map((file) => (file instanceof File ? file.name : file[0]?.name || '이름 없음'));

              // 상태 업데이트
              setValue('originalfile', updatedFiles);
              onFileSelect(fileNames);
            }
          }}
          multiple
        />
        <div>
          <div>
            {originalName && originalName.length > 0 && (
              <div className='truncate... ml-2 mt-2 flex w-[300px] flex-col pl-4'>
                {originalName.map((name, index) => (
                  <div key={index} className=''>
                    <div
                      className='cursor-pointer pl-1 pt-1 text-lg'
                      onClick={() => {
                        setValue(
                          'originalfile',
                          watch('originalfile').filter((_: any, i: number) => i !== index),
                        );
                        setOriginalName(originalName.filter((_, i) => i !== index));
                      }}
                    />
                    <div className='hidden'>
                      {name}
                      <button
                        className='ml-2 rounded bg-red-500 px-2 py-1 text-white'
                        onClick={() => {
                          // 파일 이름과 파일 리스트에서 삭제
                          setValue(
                            'originalfile',
                            watch('originalfile').filter((_: any, i: number) => i !== index),
                          );
                          setOriginalName(originalName.filter((_, i) => i !== index));
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

export default OriginalInputFile;
