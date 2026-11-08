import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendProxyUrl = process.env.VITE_BACKEND_PROXY_URL || env.VITE_BACKEND_PROXY_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // 모든 네트워크 인터페이스 허용
      port: 5173,
      proxy: {
        '/api': {
          target: backendProxyUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
