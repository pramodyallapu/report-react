import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars so we can configure the dev server proxy based on VITE_API_BASE_URL
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE = env.VITE_API_BASE_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy common backend endpoints to avoid CORS in development.
        // Adjust the keys below to match your API paths.
        '/api': {
          target: API_BASE,
          changeOrigin: true,
          secure: false,
        },
        '/login': {
          target: API_BASE,
          changeOrigin: true,
          secure: false,
        },
        '/logout': {
          target: API_BASE,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
