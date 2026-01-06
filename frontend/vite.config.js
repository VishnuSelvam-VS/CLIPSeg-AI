import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/capabilities': 'http://127.0.0.1:8000',
      '/segment': 'http://127.0.0.1:8000',
      '/batch-segment': 'http://127.0.0.1:8000',
      '/remove-bg': 'http://127.0.0.1:8000',
      '/inpaint': 'http://127.0.0.1:8000',
      '/generative-fill': 'http://127.0.0.1:8000',
      '/gallery': 'http://127.0.0.1:8000',
      '/processed': 'http://127.0.0.1:8000',
    }
  }
})
