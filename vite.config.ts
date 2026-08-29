import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Alvo do proxy de /api e /public. Default = back local (:8080).
  // O modo `heroku` (`npm run dev:heroku`) aponta pro back publicado via
  // VITE_PROXY_TARGET (.env.heroku); como o navegador só fala com o dev server,
  // o encaminhamento é server-side e não há CORS.
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Isola as libs grandes num chunk `vendor` estável — casa com o
          // `Cache-Control: immutable` de /assets/* no vercel.json e tira o app
          // do warning de chunk > 500 kB.
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
        },
        '/public': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
