import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'forks',
    setupFiles: './src/setupTests.ts',
    testTimeout: 15000,
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
