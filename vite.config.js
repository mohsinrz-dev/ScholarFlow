import { env } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: env.GITHUB_ACTIONS ? '/ScholarFlow/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
