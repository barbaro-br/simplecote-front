import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'
  type ProxyReqLike = { removeHeader(name: string): void }
  type ProxyLike = { on(ev: 'proxyReq', cb: (r: ProxyReqLike) => void): void }
  const stripOrigin = (proxy: ProxyLike) => {
    proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (/[\\/](react|react-dom|scheduler|react-router|react-router-dom|@tanstack[\\/]react-query)[\\/]/.test(id)) {
                return 'vendor'
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          configure: stripOrigin,
        },
        '/public': {
          target: proxyTarget,
          changeOrigin: true,
          configure: stripOrigin,
        },
      },
    },
  }
})
