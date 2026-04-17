import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ecourtsProxy = {
  '/api/partner': {
    target: 'https://webapi.ecourtsindia.com',
    changeOrigin: true,
    secure: true,
  },
  '/api/CauseList': {
    target: 'https://webapi.ecourtsindia.com',
    changeOrigin: true,
    secure: true,
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: ecourtsProxy,
  },
  preview: {
    proxy: ecourtsProxy,
  },
});
