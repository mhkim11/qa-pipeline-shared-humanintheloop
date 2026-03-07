import { Loader2, X } from 'lucide-react';

import { useLoadingToastStore } from '@hooks/stores';
import type { TLoadingToast } from '@atoms/default/loading-toast-atom';

export function LoadingToast() {
  const { toasts, hideLoading } = useLoadingToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className='fixed left-1/2 top-4 z-[10000] flex -translate-x-1/2 flex-col gap-3'>
      {toasts.map((toast: TLoadingToast) => (
        <div
          key={toast.id}
          className='flex min-w-[320px] items-start justify-between gap-2 rounded-lg bg-white px-5 py-4 shadow-xl ring-1 ring-gray-200 duration-300 animate-in fade-in slide-in-from-top-2'
        >
          <div className='flex flex-row items-start justify-center gap-2'>
            <Loader2 className='size-6 animate-spin text-primary-500' />
            <p className='flex-1 text-base font-semibold text-primary-900'>{toast.message}</p>
          </div>
          <button onClick={() => hideLoading(toast.id)} className='flex-shrink-0' aria-label='Close loading toast'>
            <X className='size-5' />
          </button>
        </div>
      ))}
    </div>
  );
}
