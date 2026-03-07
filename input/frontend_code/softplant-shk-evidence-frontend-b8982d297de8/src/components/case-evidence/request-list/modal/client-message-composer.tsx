import { useEffect, useRef, useState } from 'react';

import { FileText, Image, Loader2, Plus, Send, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { onMessageToast } from '@/components/utils/global-utils';
import { useCreateClientRequestMessage } from '@/hooks/react-query/mutation/case/use-create-client-request-message';
import { useGetRequestMessagesClient } from '@/hooks/react-query/mutation/case/use-get-request-messages-client';

type TClientMessageComposerProps = {
  requestId: string | null | undefined;
  onMessagesRefresh?: (messages: any[]) => void;
  onHeightChange?: (heightPx: number) => void;
};

export default function ClientMessageComposer({
  requestId,
  onMessagesRefresh,
  onHeightChange,
}: TClientMessageComposerProps): JSX.Element | null {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isPending: isCreatingMessage, onCreateClientRequestMessage } = useCreateClientRequestMessage();
  const { onGetRequestMessagesClient } = useGetRequestMessagesClient();

  const canSubmit = Boolean(String(message ?? '').trim()) || attachedFiles.length > 0;

  // ! 컴포저 높이 변경 감지 및 전달
  useEffect(() => {
    if (!onHeightChange) return;
    if (!requestId) {
      onHeightChange(0);
      return;
    }

    const el = rootRef.current;
    if (!el) return;

    const emit = () => onHeightChange(Math.ceil(el.getBoundingClientRect().height));
    emit();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', emit);
      return () => window.removeEventListener('resize', emit);
    }

    const ro = new ResizeObserver(() => emit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, requestId]);

  if (!requestId) return null;

  return (
    <div ref={rootRef} className='pointer-events-none absolute bottom-0 left-0 right-0 z-10 px-6 pb-4 pt-2'>
      <div className='pointer-events-auto mx-auto w-full max-w-[760px] rounded-[14px] border border-[#E4E4E7] bg-white p-3 shadow-lg'>
        {/* 첨부파일 목록 (상단) */}
        {attachedFiles.length > 0 ? (
          <div className='mb-2 flex flex-col gap-2 px-1'>
            {attachedFiles.map((f, fIdx) => {
              const isImage = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(f.name);
              return (
                <>
                  <div
                    key={`${f.name}:${f.size}:${f.lastModified}`}
                    className='flex h-[32px] items-center rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] px-3'
                  >
                    {isImage ? (
                      <Image className='h-5 w-5 shrink-0 text-[#8A8A8E]' />
                    ) : (
                      <FileText className='h-5 w-5 shrink-0 text-[#8A8A8E]' />
                    )}
                    <span className='ml-2 min-w-0 flex-1 truncate text-[13px] text-[#8A8A8E]'>{f.name}</span>
                    <button
                      type='button'
                      className='ml-2 shrink-0 rounded-[4px] p-[2px] text-[#8A8A8E] hover:bg-[#F4F4F5]'
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== fIdx))}
                      aria-label={`remove-${f.name}`}
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>

                  {attachedFiles.length > 0 ? (
                    <div className='px-1v flex items-center gap-1 text-[12px] text-[#0991EE]'>
                      <span className='flex items-center'>
                        <Info className='w-4' />
                      </span>{' '}
                      카카오톡·문자·메일·음성기록처럼 발화자가 있는 자료는 누가 말한 내용인지 작성해 주세요.
                    </div>
                  ) : null}
                </>
              );
            })}
          </div>
        ) : null}

        <div className='flex min-h-0 flex-1 flex-col'>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='이 자료가 사건과 어떤 관련이 있는지 설명해주세요.'
            disabled={!requestId}
            className='max-h-[100px] min-h-[44px] w-full resize-none border-none bg-transparent px-1 text-[13px] text-[#18181B] outline-none ring-0 placeholder:text-[#A1A1AA] focus:border-none focus:outline-none focus:ring-0'
          />
        </div>

        <div className='mt-2 flex items-center justify-between'>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept='.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.hwp,.hwpx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.webp,.heic,.mp3,.wav,.m4a,.aac,.ogg,.wma,.flac'
            className='hidden'
            onChange={(e) => {
              const blockedExtensions = [
                'html',
                'htm',
                'js',
                'ts',
                'exe',
                'bat',
                'cmd',
                'sh',
                'mp4',
                'avi',
                'mov',
                'mkv',
                'wmv',
                'flv',
                'webm',
                'zip',
                'rar',
                '7z',
                'tar',
                'gz',
              ];
              const list = Array.from(e.target.files ?? []).filter((file) => {
                const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
                if (blockedExtensions.includes(ext)) {
                  onMessageToast({ message: `${file.name}: HTML, 동영상, 압축 파일은 첨부할 수 없습니다.` });
                  return false;
                }
                return true;
              });
              if (list.length > 0) setAttachedFiles((prev) => [...prev, ...list]);
              e.currentTarget.value = '';
            }}
          />
          <button
            type='button'
            disabled={!requestId}
            className='flex h-[36px] items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-3 text-[13px] font-semibold text-[#18181B] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-60'
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className='h-4 w-4 text-[#18181B]' />
            첨부파일 추가
          </button>

          <button
            type='button'
            disabled={!requestId || !canSubmit || isCreatingMessage || isSubmitting}
            className='flex h-[36px] items-center gap-2 rounded-[10px] bg-[#69C0FF] px-4 text-[13px] font-semibold text-white hover:bg-[#43A5FF] disabled:cursor-not-allowed disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
            onClick={async () => {
              const id = String(requestId ?? '').trim();
              if (!id) return;

              const msgText = String(message ?? '').trim();
              if (!msgText && attachedFiles.length === 0) return;

              setIsSubmitting(true);
              try {
                const res = await onCreateClientRequestMessage({
                  requestId: id,
                  input: {
                    message_text: msgText,
                    linked_image_url: '',
                    files: attachedFiles,
                  },
                });

                if (!res) {
                  onMessageToast({ message: '메시지 전송에 실패했습니다.' });
                  return;
                }

                const refreshRes = await onGetRequestMessagesClient({
                  requestId: id,
                  page: 1,
                  limit: 50,
                });
                if (refreshRes) {
                  const next = Array.isArray((refreshRes as any)?.results) ? ((refreshRes as any).results as any[]) : [];
                  if (onMessagesRefresh) onMessagesRefresh(next);
                }

                setMessage('');
                setAttachedFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';

                onMessageToast({ message: '메시지가 전송되었습니다.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <Send className='h-4 w-4' />
            제출하기
          </button>
        </div>
      </div>

      {isSubmitting
        ? createPortal(
            <div className='fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50'>
              <div className='flex w-[320px] flex-col items-center gap-5 rounded-[16px] bg-white px-8 py-8 shadow-xl'>
                <Loader2 className='h-10 w-10 animate-spin text-[#69C0FF]' />
                <div className='text-center'>
                  <div className='text-[16px] font-semibold text-[#18181B]'>
                    {attachedFiles.length > 0 ? '파일이 제출중입니다' : '메세지가 전송중입니다'}
                  </div>
                  <div className='mt-1 text-[14px] text-[#71717A]'>잠시만 기다려 주세요</div>
                </div>
                <div className='h-[6px] w-full overflow-hidden rounded-full bg-[#E4E4E7]'>
                  <div
                    className='h-full animate-pulse rounded-full bg-[#69C0FF]'
                    style={{ width: '70%', animation: 'progressIndeterminate 1.5s ease-in-out infinite' }}
                  />
                </div>
                <style>{`
                  @keyframes progressIndeterminate {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 70%; margin-left: 15%; }
                    100% { width: 0%; margin-left: 100%; }
                  }
                `}</style>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
