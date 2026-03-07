import React from 'react';

import { ThemeProvider, Theme as EmotionTheme } from '@emotion/react';
import { NextUIProvider } from '@nextui-org/system';
import { QueryClient } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import { globalStore } from '@atoms/default';
import { Toaster } from '@components/ui/sonner';
import App from '@/app';
import { Confirm, LoadingToast } from '@/components/common';
import { Toaster as BasicToast } from '@/components/ui/toaster';
import PreloadData from '@/components/utils/preload-data';
import Theme from '@/theme';

import '@/styles/tailwind.css';
import '@/styles/fonts.css';

const theme: EmotionTheme = {
  color: {
    white: '#fff',
    black: '#000',
  },
};

/**
 * * Mocking을 활성화합니다.
 * @returns {Promise<any>} any
 */
async function enableMocking(): Promise<any> {
  if (window.Cypress) {
    window.store = globalStore;
    window.queryClient = new QueryClient();
  }
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <JotaiProvider store={globalStore}>
        <HelmetProvider>
          <NextUIProvider>
            <ThemeProvider theme={theme}>
              <PreloadData />
              <Theme />
              <App />
              <Confirm />
              <LoadingToast />

              <>{createPortal(<BasicToast />, document.body)}</>
              <>{createPortal(<Toaster position='top-center' />, document.body)}</>
            </ThemeProvider>
          </NextUIProvider>
        </HelmetProvider>
      </JotaiProvider>
    </React.StrictMode>,
  );
});
