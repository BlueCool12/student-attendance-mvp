import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['@student-attendance/shared']
  },
  build: {
    commonjsOptions: {
      include: [/@student-attendance\/shared/, /node_modules/]
    }
  }
})
