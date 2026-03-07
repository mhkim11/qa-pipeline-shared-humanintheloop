import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isLast?: boolean;
  onFileSelect: (fileNames: string[]) => void;
};

const MatchingInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const maxFileCount = 1; // 매칭 테이블은 1개 파일만 업로드 가능
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
                    const currentFiles = watch('MatchingFile') || [];
                    if (Array.isArray(currentFiles) && currentFiles.length >= maxFileCount) {
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
          accept='.xlsx, .xls'
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const fileExtension = e.target.files[0].name.split('.').pop()?.toLowerCase() || '';
              const fileExtensionArray = ['xlsx', 'xls'];

              if (!fileExtensionArray.includes(fileExtension)) {
                alert('지원하지 않는 파일 형식입니다');
                // 같은 파일을 다시 선택할 수 있도록 input 초기화
                if (inputFileRef.current) {
                  inputFileRef.current.value = '';
                }
                return;
              }

              if (e.target.files[0].size > 500 * 1024 * 1024) {
                alert('파일 크기는 500MB 이하여야 합니다');
                // 같은 파일을 다시 선택할 수 있도록 input 초기화
                if (inputFileRef.current) {
                  inputFileRef.current.value = '';
                }
                return;
              }

              // 매칭 테이블은 1개 파일만 업로드 가능하므로 기존 파일을 대체
              const newFile = e.target.files[0];
              const updatedFiles = [newFile]; // 새 파일로 대체

              // 상위 컴포넌트에 파일 이름 목록 전달
              const fileNames = [newFile.name];

              // 상태 업데이트
              setValue('MatchingFile', updatedFiles);
              onFileSelect(fileNames); // 상위 컴포넌트에 파일 이름 전달

              // 같은 파일을 다시 선택할 수 있도록 input 초기화
              if (inputFileRef.current) {
                inputFileRef.current.value = '';
              }
            }
          }}
          // multiple 제거 - 매칭 테이블은 1개 파일만 업로드 가능
        />
      </div>
    </>
  );
};

export default MatchingInputFile;
