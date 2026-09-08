import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import { App } from './App.tsx'
import { iniciarSentry } from './shared/observability/sentry'
import { FallbackErro } from './shared/observability/FallbackErro'

iniciarSentry()

// Aba aberta antes de um deploy tenta importar um chunk de rota cujo hash
// mudou; ele não existe mais e o import falha ("Failed to fetch dynamically
// imported module"). Recarrega uma vez para pegar o `index.html` novo — o
// guard de 10s evita loop se o problema persistir (rede, chunk realmente
// quebrado).
window.addEventListener('vite:preloadError', (evento) => {
  evento.preventDefault()
  const CHAVE = 'preload-error-reload-at'
  const ultimo = Number(sessionStorage.getItem(CHAVE) ?? 0)
  if (Date.now() - ultimo < 10_000) return
  sessionStorage.setItem(CHAVE, String(Date.now()))
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackErro />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
