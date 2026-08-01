import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
<<<<<<< HEAD
  plugins: [react()],
=======
  plugins: [react(), tailwindcss()],
>>>>>>> dcc57df32a52b92dd6d69c2e9df329c4a799a36c
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
=======
  plugins: [react(), tailwindcss()],
>>>>>>> 62509eb (admin-view)
})
