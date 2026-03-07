import { atom } from 'jotai';

/**
 * 컨펌 다이얼로그 설정 타입
 */
export type TConfirmDialogConfig = {
  id: string;
  title: string | React.ReactNode;
  message: string | React.ReactNode;
  onConfirm: (() => void) | null;
  onCancel?: (() => void) | null;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'error' | 'info' | 'success' | 'warning';
};

/**
 * 컨펌 스토어 상태 타입
 */
export type TConfirmStoreState = {
  isOpen: boolean;
  queue: TConfirmDialogConfig[];
  current: TConfirmDialogConfig | null;
};

// - confirm-atom atom type
type TConfirmAtom = 'confirmAtom';

// ! 디버그 라벨 키
const DEBUG_LABEL_KEY: Record<TConfirmAtom, TConfirmAtom> = {
  confirmAtom: 'confirmAtom',
};

/**
 * * 컨펌 atom
 * @description 컨펌 다이얼로그 상태를 관리하는 atom 입니다.
 * @see {@link DEBUG_LABEL_KEY.confirmAtom}
 */
export const confirmAtom = atom<TConfirmStoreState>({
  isOpen: false,
  queue: [],
  current: null,
});
// - [confirmAtom] 디버그 라벨 키
confirmAtom.debugLabel = DEBUG_LABEL_KEY.confirmAtom;
