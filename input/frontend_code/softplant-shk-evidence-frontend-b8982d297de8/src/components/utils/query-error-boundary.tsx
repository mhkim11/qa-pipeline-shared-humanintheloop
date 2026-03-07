import { JSX, Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

interface IQueryBoundaryComponent {
  fallback: React.ReactNode;
  fallbackRender?: (props: { error: any; resetErrorBoundary: () => void }) => React.ReactNode;
  children: React.ReactNode;
  suspense?: boolean;
}

/**
 * * QueryErrorBoundary
 * @param {IQueryBoundaryComponent} props QueryErrorBoundary props
 * @returns {JSX.Element} QueryErrorBoundary Component
 */
export const QueryErrorBoundary = ({ fallback, fallbackRender, children, suspense = false }: IQueryBoundaryComponent): JSX.Element => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) =>
            fallbackRender ? (
              fallbackRender({ error, resetErrorBoundary })
            ) : (
              <div>
                로딩중에 오류가 발생했습니다.
                <button onClick={() => resetErrorBoundary()}>다시 시도하기</button>
              </div>
            )
          }
        >
          {suspense ? <Suspense fallback={fallback}>{children}</Suspense> : children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
