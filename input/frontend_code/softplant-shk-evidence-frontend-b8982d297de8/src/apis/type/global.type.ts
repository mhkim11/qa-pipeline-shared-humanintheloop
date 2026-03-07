// ! 글로벌 output type
export type TOutput = {
  success: boolean;
  message: string | null;

  error?: string | Error | null;
};

// ! mutation output type
export type TMutationOutput<T = unknown> = {
  isSuccess: boolean;
  message: string;
  data?: T;
};
