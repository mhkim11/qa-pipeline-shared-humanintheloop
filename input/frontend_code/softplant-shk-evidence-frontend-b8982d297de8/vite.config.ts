import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command: _command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(Date.now()),
      'process.env': env,
    },
    plugins: [
      compression({ algorithm: 'gzip', exclude: [/\.(br)$ /, /\.(gz)$/] }),
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$ /, /\.(gz)$/],
        deleteOriginalAssets: false,
      }),
      react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh, 'babel-plugin-macros'], presets: ['jotai/babel/preset'] } }),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true, // for me this fix the problem
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"', // for example, lint .ts & .tsx
        },
      }),
      tsconfigPaths(),
      visualizer({
        template: 'treemap', // or sunburst
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'analyse.html', // will be saved in project's root
      }),
      optimizeLodashImports({
        useLodashEs: true,
      }),
      svgr({
        svgrOptions: { exportType: 'named', ref: true, svgo: false, titleProp: true },
        include: '**/*.svg',
      }),
    ],
    build: {
      cssMinify: 'lightningcss' as const,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'jotai', '@tanstack/react-query'],
            axios: ['axios'],
            reactRouter: ['react-router-dom'],
            reactIcon: ['react-icons', 'lucide-react'],
            reactHookForm: ['react-hook-form'],
            reactHelmet: ['react-helmet-async', 'react-helmet'],
            nextui: [
              '@nextui-org/accordion',
              '@nextui-org/card',
              '@nextui-org/image',
              '@nextui-org/modal',
              '@nextui-org/progress',
              '@nextui-org/scroll-shadow',
              '@nextui-org/spinner',
              '@nextui-org/system',
              '@nextui-org/theme',
            ],
            shadcn: [
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-icons',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              'korean-business-day',
              'react-day-picker',
              'sonner',
            ],
            day: ['dayjs', 'date-fns'],
            styled: ['@emotion/styled'],
            tailwind: ['@heroicons/react', '@tailwindcss/forms', 'tailwind-merge', 'tailwindcss-animate'],
            lodash: ['lodash-es'],
            animations: ['framer-motion'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
