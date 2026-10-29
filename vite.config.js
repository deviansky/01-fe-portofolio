import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backendTarget = process.env.VITE_BACKEND_PROXY_URL || 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/sanctum': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/storage': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
