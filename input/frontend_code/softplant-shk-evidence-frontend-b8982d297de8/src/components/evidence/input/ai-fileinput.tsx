import { useState } from 'react';

import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { onMessageToast } from '@/components/utils';

type TFileType = 'html' | 'md' | 'pdf';

type TInputFileProps = {
  inputFileRef: React.RefObject<HTMLInputElement>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  onFileSelect: (fileNames: string[]) => void;
  allowedExtensions?: string[];
  fileType?: string;
};

interface IFileInfo {
  name: string;
  type: TFileType;
}

const InfoInputFile = ({ inputFileRef, watch, setValue, onFileSelect }: TInputFileProps): JSX.Element => {
  const [selectedFileType] = useState<TFileType>('html');
  const [fileList, setFileList] = useState<IFileInfo[]>([]);

  const fileTypeExtensions: Record<TFileType, string[]> = {
    html: ['html', 'htm'],
    md: ['md', 'markdown'],
    pdf: ['pdf'],
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const currentFiles = watch('Listfile') || [];
    const newFiles: File[] = [];
    const newFileInfos: IFileInfo[] = [];

    Array.from(e.target.files).forEach((uploadedFile) => {
      const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      const allowedExtensions = fileTypeExtensions[selectedFileType];

      if (!allowedExtensions.includes(fileExtension)) {
        onMessageToast({
          message: `${selectedFileType.toUpperCase()} 파일만 업로드 가능합니다. (${allowedExtensions.join(', ')})`,
        });
        return;
      }

      // 20MB size limit
      if (uploadedFile.size > 20 * 1024 * 1024) {
        onMessageToast({
          message: '파일 크기는 20MB를 초과할 수 없습니다.',
        });
        return;
      }

      console.log('Original uploaded file:', {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        lastModified: uploadedFile.lastModified,
        instanceof: uploadedFile instanceof File,
        constructor: uploadedFile.constructor.name,
      });

      // 원본 파일 객체를 그대로 사용 (변환하지 않음)
      newFiles.push(uploadedFile);
      newFileInfos.push({
        name: uploadedFile.name,
        type: selectedFileType,
      });
    });

    if (newFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...newFiles];
      setValue('Listfile', updatedFiles);

      const updatedFileInfos = [...fileList, ...newFileInfos];
      setFileList(updatedFileInfos);

      const fileNames = updatedFileInfos.map((fileInfo) => fileInfo.name);
      onFileSelect(fileNames);
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <button className='text-[14px] text-[#0050B3] underline' onClick={() => inputFileRef.current?.click()}>
          파일 선택하기
        </button>
      </div>

      <input
        className='hidden'
        ref={inputFileRef}
        type='file'
        onChange={handleFileChange}
        accept={fileTypeExtensions[selectedFileType].map((ext) => `.${ext}`).join(',')}
        multiple
      />

      {/*  {fileList.length > 0 && (
        <div className='mt-4 space-y-2'>
          {fileList.map((file, index) => (
            <div key={index} className='flex items-center justify-between rounded-md border border-gray-200 p-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>{file.name}</span>
                <span className='rounded bg-gray-100 px-2 py-1 text-xs uppercase'>{file.type}</span>
              </div>
              <button className='text-red-500 hover:text-red-700' onClick={() => handleFileDelete(index)} title='파일 삭제'>
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default InfoInputFile;
