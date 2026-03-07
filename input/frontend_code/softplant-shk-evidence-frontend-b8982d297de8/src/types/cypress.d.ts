import { Cypress } from 'cypress';

declare global {
  interface Window {
    Cypress: Cypress;
    store: Store;
    queryClient: QueryClient;
  }
}
