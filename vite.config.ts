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

  // O front chama a API por URL absoluta (api-client: `import.meta.env.VITE_API_BASE_URL`).
  // Num build de produção sem essa var a base vira '' e todo `fetch('/api/**')` cai no host
  // estático da Vercel → 405 no `POST /api/auth/login`. Falha o build antes de publicar isso.
  // (o modo `heroku` do dev NÃO cai aqui — lá a base vazia é de propósito, passa pelo proxy.)
  if (mode === 'production' && !env.VITE_API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL vazio no build de produção. Defina no step `vercel build --prod` do ' +
        '.github/workflows/deploy.yml, ou como Environment Variable de Production na Vercel.',
    )
  }

  // Tira o header `Origin` da requisição encaminhada: sem ele o back trata como
  // não-CORS e não exige a origem na allowlist (o navegador manda `Origin` em
  // POST/PUT/DELETE mesmo same-origin). Necessário pro modo `heroku`.
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
