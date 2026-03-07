import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
  env: {
    HOST: process.env.NODE_ENV === 'development' ? 'http://172.30.1.32:5173/' : 'https://busan--spa-crm.netlify.app/',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
