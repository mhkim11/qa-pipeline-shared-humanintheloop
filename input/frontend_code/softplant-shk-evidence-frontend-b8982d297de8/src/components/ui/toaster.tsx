import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle } from '@/components/ui/toast';
import { ToastViewport } from '@/components/utils/toast-provider';
import { useToast } from '@/hooks/default/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className='grid gap-1'>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        })}
      </ToastViewport>
    </ToastProvider>
  );
}
